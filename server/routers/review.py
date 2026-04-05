from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List
from datetime import datetime, timezone
import uuid
import sys
sys.path.append('..')
from schemas import Review, ReviewCreate
from data.seed_data import mock_reviews, mock_locations
from routers.auth import get_current_user_dep

router = APIRouter()

@router.get("/{location_id}", response_model=List[Review])
async def get_reviews(location_id: str):
    return [r for r in mock_reviews if r["locationId"] == location_id]

@router.post("/", response_model=Review)
async def create_review(review: ReviewCreate, current_user: dict = Depends(get_current_user_dep)):
    new_review = review.model_dump()
    new_review["id"] = str(uuid.uuid4())
    new_review["userId"] = current_user["id"]
    new_review["userName"] = current_user.get("displayName", "Anonymous")
    new_review["createdAt"] = datetime.now(timezone.utc).isoformat()

    mock_reviews.append(new_review)
    return new_review
