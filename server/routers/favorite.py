from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime
import uuid
from ..schemas import Favorite, FavoriteBase
from ..data.seed_data import mock_favorites

router = APIRouter()

@router.get("/", response_model=List[Favorite])
async def get_favorites():
    # In a real app, this would filter by current_user
    return mock_favorites

@router.post("/", response_model=Favorite)
async def add_favorite(fav: FavoriteBase):
    # Check if already exists
    for f in mock_favorites:
        if f["locationId"] == fav.locationId and f["userId"] == "u1":
            return f
            
    new_fav = {
        "id": str(uuid.uuid4()),
        "locationId": fav.locationId,
        "userId": "u1",
        "createdAt": datetime.utcnow().isoformat() + "Z"
    }
    mock_favorites.append(new_fav)
    return new_fav

@router.delete("/{location_id}")
async def remove_favorite(location_id: str):
    global mock_favorites
    mock_favorites = [f for f in mock_favorites if not (f["locationId"] == location_id and f["userId"] == "u1")]
    return {"status": "success"}
