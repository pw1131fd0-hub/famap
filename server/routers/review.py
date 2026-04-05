from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List
from datetime import datetime, timezone
import uuid
import re
import sys
sys.path.append('..')
from schemas import Review, ReviewCreate
from data.seed_data import mock_reviews, mock_locations
from routers.auth import get_current_user_dep

router = APIRouter()

# Tracks helpful votes: review_id -> set of user_ids who voted
_helpful_votes: dict[str, set[str]] = {}


@router.get("/{location_id}", response_model=List[Review])
async def get_reviews(
    location_id: str,
    sort: str = Query(default="newest", description="newest | highest | most_helpful"),
    limit: int = Query(default=20, ge=1, le=100),
):
    reviews = [r for r in mock_reviews if r["locationId"] == location_id]

    # Attach helpful count
    for r in reviews:
        r["helpfulCount"] = len(_helpful_votes.get(r["id"], set()))

    if sort == "highest":
        reviews.sort(key=lambda r: r.get("rating", 0), reverse=True)
    elif sort == "most_helpful":
        reviews.sort(key=lambda r: r.get("helpfulCount", 0), reverse=True)
    else:  # newest
        reviews.sort(key=lambda r: r.get("createdAt", ""), reverse=True)

    return reviews[:limit]


@router.post("/", response_model=Review)
async def create_review(review: ReviewCreate, current_user: dict = Depends(get_current_user_dep)):
    # Ensure location exists
    loc_ids = {loc["id"] for loc in mock_locations}
    if review.locationId not in loc_ids:
        raise HTTPException(status_code=404, detail="Location not found")

    new_review = review.model_dump()
    new_review["id"] = str(uuid.uuid4())
    new_review["userId"] = current_user["id"]
    new_review["userName"] = current_user.get("displayName", "Anonymous")
    new_review["createdAt"] = datetime.now(timezone.utc).isoformat()
    new_review["helpfulCount"] = 0

    mock_reviews.append(new_review)
    return new_review


@router.post("/{review_id}/helpful", tags=["reviews"])
async def mark_review_helpful(
    review_id: str,
    current_user: dict = Depends(get_current_user_dep),
):
    """
    Toggle a 'helpful' vote on a review.  Returns the updated helpful count.
    A user can vote once; voting again removes the vote (toggle).
    """
    review = next((r for r in mock_reviews if r["id"] == review_id), None)
    if review is None:
        raise HTTPException(status_code=404, detail="Review not found")

    user_id = current_user["id"]
    if review_id not in _helpful_votes:
        _helpful_votes[review_id] = set()

    voters = _helpful_votes[review_id]
    if user_id in voters:
        voters.discard(user_id)
        voted = False
    else:
        voters.add(user_id)
        voted = True

    return {
        "reviewId": review_id,
        "helpfulCount": len(voters),
        "userVoted": voted,
    }


@router.get("/{review_id}/helpful", tags=["reviews"])
async def get_review_helpful_count(review_id: str):
    """Get the helpful vote count for a review."""
    review = next((r for r in mock_reviews if r["id"] == review_id), None)
    if review is None:
        raise HTTPException(status_code=404, detail="Review not found")

    return {
        "reviewId": review_id,
        "helpfulCount": len(_helpful_votes.get(review_id, set())),
    }
