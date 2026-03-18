from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import math
from ..schemas import Location, SearchParams, Category, LocationCreate
from ..data.seed_data import mock_locations

router = APIRouter()

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

@router.get("/", response_model=List[Location])
async def get_locations(
    lat: float = Query(...),
    lng: float = Query(...),
    radius: float = Query(...),
    category: Optional[Category] = Query(None),
    stroller_accessible: Optional[bool] = Query(None)
):
    results = []
    for loc in mock_locations:
        dist = calculate_distance(lat, lng, loc["coordinates"]["lat"], loc["coordinates"]["lng"])
        
        within_radius = dist <= radius
        match_category = category is None or loc["category"] == category
        match_stroller = stroller_accessible is None or not stroller_accessible or "stroller_accessible" in loc["facilities"]
        
        if within_radius and match_category and match_stroller:
            results.append(loc)
            
    return results

@router.get("/{location_id}", response_model=Location)
async def get_location(location_id: str):
    for loc in mock_locations:
        if loc["id"] == location_id:
            return loc
    raise HTTPException(status_code=404, detail="Location not found")

@router.post("/", response_model=Location)
async def create_location(location: LocationCreate):
    new_loc = location.model_dump()
    new_loc["id"] = str(len(mock_locations) + 1)
    new_loc["averageRating"] = 0.0
    mock_locations.append(new_loc)
    return new_loc

@router.patch("/{location_id}", response_model=Location)
async def update_location(location_id: str, location_update: dict):
    for loc in mock_locations:
        if loc["id"] == location_id:
            loc.update(location_update)
            return loc
    raise HTTPException(status_code=404, detail="Location not found")
