"""
Route planning for multi-location family visits.
Optimizes travel routes for families visiting multiple kid-friendly locations.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime, UTC
from data.seed_data import mock_locations
import math

router = APIRouter(prefix="/api/route-planner", tags=["Route Planner"])


class LocationStop:
    """Represents a location stop in a route"""
    def __init__(self, location_id: str, lat: float, lng: float, name: str):
        self.location_id = location_id
        self.lat = lat
        self.lng = lng
        self.name = name

    def distance_to(self, other: "LocationStop") -> float:
        """Calculate distance in km using Haversine formula"""
        R = 6371  # Earth radius in km
        lat1, lon1, lat2, lon2 = map(math.radians, [self.lat, self.lng, other.lat, other.lng])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        return R * c


class RouteStop(BaseModel):
    """A stop in the optimized route"""
    location_id: str
    name: str
    order: int
    lat: float
    lng: float
    distance_from_previous: float  # in km
    estimated_travel_time: int  # in minutes (assuming avg 30 km/h)
    category: str


class OptimizedRoute(BaseModel):
    """An optimized route for visiting multiple locations"""
    route_id: str
    stops: List[RouteStop]
    total_distance: float  # in km
    total_travel_time: int  # in minutes
    total_locations: int
    created_at: str


class RouteRequest(BaseModel):
    """Request to plan a route"""
    location_ids: List[str]
    start_lat: float
    start_lng: float


def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance between two coordinates using Haversine formula"""
    R = 6371  # Earth radius in km
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lng1, lat2, lng2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c


def estimate_travel_time(distance_km: float) -> int:
    """Estimate travel time in minutes (assuming average 30 km/h in urban areas)"""
    avg_speed_kmh = 30
    return max(5, int((distance_km / avg_speed_kmh) * 60))


def nearest_neighbor_tsp(start: LocationStop, locations: List[LocationStop]) -> List[LocationStop]:
    """
    Simple nearest neighbor heuristic for TSP.
    Not optimal but fast and good enough for user-facing route planning.
    """
    if not locations:
        return []

    unvisited = locations.copy()
    route = [start]
    current = start

    while unvisited:
        nearest = min(unvisited, key=lambda loc: current.distance_to(loc))
        route.append(nearest)
        unvisited.remove(nearest)
        current = nearest

    return route


@router.post("/optimize", response_model=OptimizedRoute)
async def optimize_route(request: RouteRequest):
    """
    Optimize a route for visiting multiple family-friendly locations.
    Uses nearest neighbor heuristic to minimize travel distance.
    """
    if not request.location_ids:
        raise HTTPException(status_code=400, detail="No locations provided")

    if len(request.location_ids) > 15:
        raise HTTPException(status_code=400, detail="Maximum 15 locations per route")

    # Find locations
    locations_map = {loc.get("id"): loc for loc in mock_locations}
    stops = []

    for loc_id in request.location_ids:
        if loc_id not in locations_map:
            raise HTTPException(status_code=404, detail=f"Location {loc_id} not found")

        loc = locations_map[loc_id]
        stop = LocationStop(
            location_id=loc_id,
            lat=loc.get("coordinates", {}).get("lat", 0),
            lng=loc.get("coordinates", {}).get("lng", 0),
            name=loc.get("name_en", "Unknown")
        )
        stops.append(stop)

    # Create starting point
    start = LocationStop("start", request.start_lat, request.start_lng, "Start")

    # Optimize route using nearest neighbor
    optimized = nearest_neighbor_tsp(start, stops)

    # Build response with distances and times
    route_stops = []
    total_distance = 0
    total_time = 0

    for i, stop in enumerate(optimized):
        if i == 0:  # Skip the start point in results
            continue

        prev_stop = optimized[i - 1]
        distance = haversine_distance(prev_stop.lat, prev_stop.lng, stop.lat, stop.lng)
        travel_time = estimate_travel_time(distance)
        total_distance += distance
        total_time += travel_time

        loc_data = locations_map.get(stop.location_id, {})

        route_stops.append(RouteStop(
            location_id=stop.location_id,
            name=stop.name,
            order=i,
            lat=stop.lat,
            lng=stop.lng,
            distance_from_previous=round(distance, 2),
            estimated_travel_time=travel_time,
            category=loc_data.get("category", "other")
        ))

    return OptimizedRoute(
        route_id=f"route_{datetime.now(UTC).timestamp()}",
        stops=route_stops,
        total_distance=round(total_distance, 2),
        total_travel_time=total_time,
        total_locations=len(route_stops),
        created_at=datetime.now(UTC).isoformat()
    )


@router.get("/estimate-distance")
async def estimate_distance(
    start_lat: float = Query(...),
    start_lng: float = Query(...),
    end_lat: float = Query(...),
    end_lng: float = Query(...),
):
    """Estimate distance and travel time between two coordinates"""
    distance = haversine_distance(start_lat, start_lng, end_lat, end_lng)
    travel_time = estimate_travel_time(distance)

    return {
        "distance_km": round(distance, 2),
        "travel_time_minutes": travel_time,
        "start": {"lat": start_lat, "lng": start_lng},
        "end": {"lat": end_lat, "lng": end_lng}
    }
