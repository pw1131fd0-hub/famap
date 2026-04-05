from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
import math
import sys
import uuid
from datetime import datetime, UTC
sys.path.append('..')
from schemas import Location, SearchParams, Category, LocationCreate, Event, EventCreate, PaginatedLocationsResponse
from data.seed_data import mock_locations
from data.auto_collect import fetch_osm_data, save_locations
from routers.auth import get_current_user_dep

router = APIRouter()

# Keep track of areas that have already been fetched from OSM in this session
# to avoid redundant calls within a short time.
fetched_areas = []

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371e3  # Earth radius in meters
    phi1 = (lat1 * math.pi) / 180
    phi2 = (lat2 * math.pi) / 180
    delta_phi = ((lat2 - lat1) * math.pi) / 180
    delta_lambda = ((lon2 - lon1) * math.pi) / 180

    a = (math.sin(delta_phi / 2) * math.sin(delta_phi / 2) +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) * math.sin(delta_lambda / 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c  # Distance in meters


def _matches_query(loc: dict, q: str) -> bool:
    """Check if a location matches a text search query (bilingual)."""
    q_lower = q.lower()
    name_zh = loc.get("name", {}).get("zh", "").lower()
    name_en = loc.get("name", {}).get("en", "").lower()
    desc_zh = loc.get("description", {}).get("zh", "").lower()
    desc_en = loc.get("description", {}).get("en", "").lower()
    addr_zh = loc.get("address", {}).get("zh", "").lower()
    addr_en = loc.get("address", {}).get("en", "").lower()
    return (q_lower in name_zh or q_lower in name_en or
            q_lower in desc_zh or q_lower in desc_en or
            q_lower in addr_zh or q_lower in addr_en)


@router.get("/featured", response_model=List[Location])
async def get_featured_locations(
    limit: int = Query(default=10, ge=1, le=50)
):
    """Return top-rated, curated locations across all categories."""
    # Sort by averageRating descending; use review count as tiebreaker
    def score(loc: dict) -> float:
        rating = float(loc.get("averageRating", 0) or 0)
        reviews = loc.get("data", {}).get("reviewCount", 0) if isinstance(loc.get("data"), dict) else 0
        # Bayesian average-style boost for well-reviewed venues
        return rating + min(reviews, 50) * 0.01

    sorted_locs = sorted(mock_locations, key=score, reverse=True)
    return sorted_locs[:limit]


@router.get("/search", response_model=PaginatedLocationsResponse)
async def search_locations(
    q: str = Query(..., min_length=1, max_length=100, description="Search query (bilingual)"),
    category: Optional[Category] = Query(None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    """Full-text search across location names, descriptions, and addresses (zh + en)."""
    # Sanitize query
    q = q.strip()
    results = [loc for loc in mock_locations if _matches_query(loc, q)]

    if category:
        results = [loc for loc in results if loc.get("category") == category]

    # Sort by rating descending
    results.sort(key=lambda l: float(l.get("averageRating", 0) or 0), reverse=True)

    total = len(results)
    offset = (page - 1) * page_size
    page_items = results[offset: offset + page_size]

    return PaginatedLocationsResponse(
        items=page_items,
        total=total,
        page=page,
        page_size=page_size,
        has_next=(offset + page_size) < total,
        has_prev=page > 1,
    )


@router.get("/", response_model=List[Location])
async def get_locations(
    lat: float = Query(...),
    lng: float = Query(...),
    radius: float = Query(...),
    category: Optional[Category] = Query(None),
    stroller_accessible: Optional[bool] = Query(None),
    q: Optional[str] = Query(None, max_length=100, description="Optional text filter"),
    limit: int = Query(default=50, ge=1, le=2000)
):
    results = []
    for loc in mock_locations:
        dist = calculate_distance(lat, lng, loc["coordinates"]["lat"], loc["coordinates"]["lng"])

        within_radius = dist <= radius
        match_category = category is None or loc["category"] == category
        match_stroller = stroller_accessible is None or not stroller_accessible or "stroller_accessible" in loc["facilities"]
        match_query = q is None or _matches_query(loc, q.strip())

        if within_radius and match_category and match_stroller and match_query:
            results.append(loc)

    # If we have very few results (e.g., < 5), or if we haven't fetched this area from OSM yet,
    # try to fetch more from OSM.
    already_fetched = any(calculate_distance(lat, lng, f_lat, f_lng) < radius/2 for f_lat, f_lng in fetched_areas)

    if len(results) < 5 and not already_fetched and q is None:
        print(f"Low results ({len(results)}) for {lat}, {lng}. Fetching from OSM...")
        new_locations = await fetch_osm_data(lat, lng, radius)

        if new_locations:
            # Check if these are real or fallback
            is_fallback = any('模擬' in loc['name']['zh'] for loc in new_locations)

            # De-duplicate before adding
            existing_ids = {loc["id"] for loc in mock_locations}
            added_count = 0
            for loc in new_locations:
                if loc["id"] not in existing_ids:
                    mock_locations.append(loc)
                    existing_ids.add(loc["id"])
                    added_count += 1

                    # Also check if it matches current filters to add to results
                    dist = calculate_distance(lat, lng, loc["coordinates"]["lat"], loc["coordinates"]["lng"])
                    within_radius = dist <= radius
                    match_category = category is None or loc["category"] == category
                    match_stroller = stroller_accessible is None or not stroller_accessible or "stroller_accessible" in loc["facilities"]
                    if within_radius and match_category and match_stroller:
                        if all(r["id"] != loc["id"] for r in results):
                            results.append(loc)

            if not is_fallback:
                # Save real OSM data to JSON file for persistence
                save_locations([loc for loc in new_locations if '親子點' not in loc['name']['zh']])
                # Record that we successfully fetched this area to avoid spamming OSM
                fetched_areas.append((lat, lng))
                print(f"Fetched and saved {added_count} real locations from OSM.")
            else:
                print(f"OSM fetch failed, using {len(new_locations)} fallback locations.")

    return results[:limit]


@router.get("/{location_id}", response_model=Location)
async def get_location(location_id: str):
    for loc in mock_locations:
        if loc["id"] == location_id:
            return loc
    raise HTTPException(status_code=404, detail="Location not found")

@router.post("/", response_model=Location)
async def create_location(location: LocationCreate, current_user: dict = Depends(get_current_user_dep)):
    new_loc = location.model_dump()
    new_loc["id"] = str(len(mock_locations) + 1)
    new_loc["averageRating"] = 0.0
    mock_locations.append(new_loc)
    return new_loc

@router.patch("/{location_id}", response_model=Location)
async def update_location(location_id: str, location_update: dict, current_user: dict = Depends(get_current_user_dep)):
    for loc in mock_locations:
        if loc["id"] == location_id:
            loc.update(location_update)
            return loc
    raise HTTPException(status_code=404, detail="Location not found")

@router.get("/{location_id}/events", response_model=List[Event])
async def get_events(location_id: str):
    """Get all events for a specific location"""
    for loc in mock_locations:
        if loc["id"] == location_id:
            # Initialize events if they don't exist
            if "events" not in loc:
                loc["events"] = []
            return loc["events"]
    raise HTTPException(status_code=404, detail="Location not found")

@router.post("/{location_id}/events", response_model=Event)
async def create_event(location_id: str, event: EventCreate):
    """Create a new event for a location"""
    for loc in mock_locations:
        if loc["id"] == location_id:
            # Initialize events if they don't exist
            if "events" not in loc:
                loc["events"] = []

            new_event = event.model_dump()
            new_event["id"] = str(uuid.uuid4())
            new_event["locationId"] = location_id
            new_event["createdAt"] = str(datetime.now(UTC).isoformat())
            new_event["updatedAt"] = str(datetime.now(UTC).isoformat())

            loc["events"].append(new_event)
            return new_event
    raise HTTPException(status_code=404, detail="Location not found")


@router.get("/{location_id}/stats", tags=["locations"])
async def get_location_stats(location_id: str):
    """
    Aggregate statistics for a location: review breakdown, event count,
    facility list, and category info useful for venue cards and dashboards.
    """
    loc = next((l for l in mock_locations if l["id"] == location_id), None)
    if loc is None:
        raise HTTPException(status_code=404, detail="Location not found")

    from data.seed_data import mock_reviews
    reviews = [r for r in mock_reviews if r["locationId"] == location_id]

    # Rating distribution
    rating_dist: dict[int, int] = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for r in reviews:
        rating = int(r.get("rating", 0))
        if rating in rating_dist:
            rating_dist[rating] += 1

    avg_rating = (
        sum(r.get("rating", 0) for r in reviews) / len(reviews) if reviews else 0.0
    )

    events = loc.get("events", [])
    now_iso = datetime.now(UTC).isoformat()
    upcoming_events = [e for e in events if e.get("startDate", "") >= now_iso]

    return {
        "locationId": location_id,
        "name": loc.get("name"),
        "category": loc.get("category"),
        "averageRating": round(avg_rating, 2),
        "reviewCount": len(reviews),
        "ratingDistribution": rating_dist,
        "facilityCount": len(loc.get("facilities", [])),
        "facilities": loc.get("facilities", []),
        "upcomingEventCount": len(upcoming_events),
        "totalEventCount": len(events),
        "hasNursingRoom": "nursing_room" in loc.get("facilities", []),
        "isStrollerAccessible": "stroller_accessible" in loc.get("facilities", []),
        "hasHighChair": "high_chair" in loc.get("facilities", []),
        "isIndoor": loc.get("weatherCoverage", {}).get("isIndoor", False),
        "isFree": loc.get("pricing", {}).get("isFree", True) if loc.get("pricing") else True,
    }
