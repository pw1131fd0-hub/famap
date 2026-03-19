from fastapi import APIRouter, HTTPException, Query
from typing import List
from datetime import datetime, timezone
import uuid
from ..schemas import Review, ReviewCreate
from ..data.seed_data import mock_reviews, mock_locations

router = APIRouter()

@router.get("/{location_id}", response_model=List[Review])
async def get_reviews(location_id: str):
    return [r for r in mock_reviews if r["locationId"] == location_id]

@router.post("/", response_model=Review)
async def create_review(review: ReviewCreate):
    # In a real app, userId and userName would come from current_user
    new_review = review.model_dump()
    new_review["id"] = str(uuid.uuid4())
    new_review["userId"] = "u1"
    new_review["userName"] = "Anonymous"
    new_review["createdAt"] = datetime.now(timezone.utc).isoformat()
    
    mock_reviews.append(new_review)
    return new_review
