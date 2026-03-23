"""
Recommendations router for smart location discovery.
Provides quality scores and personalized recommendations.
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from schemas import LocationQualityScore, RecommendedLocation, Location
from quality_scoring import QualityScorer, RecommendationEngine
from data.seed_data import mock_locations
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
quality_scorer = QualityScorer()
recommendation_engine = RecommendationEngine()


@router.get("/quality/{location_id}", response_model=LocationQualityScore)
async def get_location_quality(location_id: str):
    """
    Get comprehensive quality score for a specific location.
    Helps families understand location trustworthiness and reputation.
    """
    # Find location
    location = next((loc for loc in mock_locations if loc["id"] == location_id), None)

    if not location:
        raise HTTPException(status_code=404, detail="Location not found")

    # Calculate quality score
    quality_score = quality_scorer.calculate_location_quality(
        location_id=location_id,
        average_rating=location.get("averageRating", 0),
        review_count=location.get("reviewCount", 0),
        last_update=location.get("lastUpdate"),
        is_verified=location.get("isVerified", False),
        recent_positive_reviews=location.get("recentPositiveReviews", 0),
    )

    return quality_score


@router.get("/nearby", response_model=List[RecommendedLocation])
async def get_nearby_recommendations(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radius: float = Query(1000, description="Search radius in meters"),
    limit: int = Query(10, ge=1, le=50),
    category: Optional[str] = None,
    min_quality_score: Optional[float] = Query(
        None, ge=0, le=100, description="Minimum quality score filter"
    ),
):
    """
    Get recommended nearby locations sorted by quality score.
    Great for families looking for trusted venues in their area.
    """
    from math import radians, cos, sin, asin, sqrt

    def haversine(lon1: float, lat1: float, lon2: float, lat2: float) -> float:
        """Calculate distance between two points in meters."""
        lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
        c = 2 * asin(sqrt(a))
        r = 6371000  # Radius of earth in meters
        return c * r

    # Filter locations by distance
    nearby_locations = []
    for loc in mock_locations:
        coords = loc.get("coordinates", {})
        if coords:
            distance = haversine(
                lng,
                lat,
                coords.get("lng", 0),
                coords.get("lat", 0),
            )
            if distance <= radius:
                if category is None or loc.get("category") == category:
                    nearby_locations.append(loc)

    # Get recommendations
    recommendations = recommendation_engine.rank_recommendations(nearby_locations, limit=limit)

    # Apply quality score filter
    if min_quality_score is not None:
        recommendations = [
            rec
            for rec in recommendations
            if rec["qualityScore"]["overallScore"] >= min_quality_score
        ]

    # Convert to response model
    result = []
    for rec in recommendations:
        result.append(
            RecommendedLocation(
                location=Location(**rec["location"]),
                qualityScore=LocationQualityScore(**rec["qualityScore"]),
                recommendationScore=rec["recommendationScore"],
                matchReason=rec["matchReason"],
            )
        )

    return result


@router.get("/trending")
async def get_trending_locations(limit: int = Query(10, ge=1, le=50)):
    """
    Get trending locations based on recent activity and positive reviews.
    Discover what other families are loving right now.
    """
    # Sort by combination of recent reviews and rating
    scored_locations = []

    for loc in mock_locations:
        quality_score = quality_scorer.calculate_location_quality(
            location_id=loc.get("id", ""),
            average_rating=loc.get("averageRating", 0),
            review_count=loc.get("reviewCount", 0),
            last_update=loc.get("lastUpdate"),
            is_verified=loc.get("isVerified", False),
            recent_positive_reviews=loc.get("recentPositiveReviews", 0),
        )

        # Trending score emphasizes recent activity
        recency_score = quality_score["recencyScore"]
        rating_score = quality_score["ratingScore"]
        review_boost = min(20, loc.get("reviewCount", 0) * 2)
        trending_score = (recency_score * 0.5) + (rating_score * 0.3) + review_boost

        scored_locations.append(
            {
                "location": loc,
                "trendingScore": trending_score,
                "qualityScore": quality_score,
            }
        )

    # Sort by trending score
    sorted_locations = sorted(
        scored_locations, key=lambda x: x["trendingScore"], reverse=True
    )

    return [
        {
            "location": loc["location"],
            "trendingScore": loc["trendingScore"],
            "qualityScore": loc["qualityScore"],
            "reason": f"Trending with {loc['location'].get('reviewCount', 0)} recent reviews",
        }
        for loc in sorted_locations[:limit]
    ]


@router.get("/top-rated")
async def get_top_rated_locations(
    category: Optional[str] = None, limit: int = Query(10, ge=1, le=50)
):
    """
    Get the highest-rated family-friendly locations.
    Find the best-loved venues in your area.
    """
    # Filter by category if specified
    filtered_locations = mock_locations
    if category:
        filtered_locations = [loc for loc in mock_locations if loc.get("category") == category]

    # Score and sort
    scored_locations = []
    for loc in filtered_locations:
        quality_score = quality_scorer.calculate_location_quality(
            location_id=loc.get("id", ""),
            average_rating=loc.get("averageRating", 0),
            review_count=loc.get("reviewCount", 0),
            last_update=loc.get("lastUpdate"),
            is_verified=loc.get("isVerified", False),
            recent_positive_reviews=loc.get("recentPositiveReviews", 0),
        )

        scored_locations.append(
            {
                "location": loc,
                "qualityScore": quality_score,
                "overallScore": quality_score["overallScore"],
            }
        )

    # Sort by rating
    sorted_locations = sorted(
        scored_locations, key=lambda x: x["overallScore"], reverse=True
    )

    return [
        {
            "location": loc["location"],
            "qualityScore": loc["qualityScore"],
            "position": i + 1,
        }
        for i, loc in enumerate(sorted_locations[:limit])
    ]
