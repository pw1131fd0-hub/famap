"""
Smart suggestions router for 'Go Now' recommendations.
Provides context-aware venue suggestions based on current time, weather, crowds, and events.
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from datetime import datetime, timedelta
from schemas import Location, LocationQualityScore
from quality_scoring import QualityScorer
from data.seed_data import mock_locations
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
quality_scorer = QualityScorer()


def get_hour_crowdedness_estimate(location: dict, hour: int) -> float:
    """
    Estimate crowdedness for a location at a specific hour.
    Returns a value from 0-100 representing expected crowd level.
    """
    # Peak hours typically 10-12 and 14-17 on weekends
    # Off-peak early morning and evening
    day_of_week = datetime.now().weekday()
    is_weekend = day_of_week >= 5

    base_crowdedness = location.get("baselineCrowdedness", 50)

    if is_weekend:
        # Weekend peak hours
        if hour in [10, 11, 12, 14, 15, 16]:
            return min(100, base_crowdedness * 1.5)
        elif hour in [7, 8, 9, 17, 18, 19]:
            return base_crowdedness * 0.8
        else:
            return base_crowdedness * 0.6
    else:
        # Weekday hours
        if hour in [10, 11, 15, 16]:
            return base_crowdedness * 1.2
        elif hour in [7, 8, 9, 17, 18, 19]:
            return base_crowdedness * 0.7
        else:
            return base_crowdedness * 0.5


def calculate_go_now_score(location: dict, current_hour: int) -> float:
    """
    Calculate a 'Go Now' score (0-100) based on:
    - Current crowd level
    - Quality rating
    - Upcoming events
    - Weather suitability
    """
    score = 0.0

    # Quality component (40%)
    quality_score = quality_scorer.calculate_location_quality(
        location_id=location.get("id", ""),
        average_rating=location.get("averageRating", 0),
        review_count=location.get("reviewCount", 0),
        last_update=location.get("lastUpdate"),
        is_verified=location.get("isVerified", False),
        recent_positive_reviews=location.get("recentPositiveReviews", 0),
    )
    score += quality_score["overallScore"] * 0.4

    # Crowd component (35%) - lower crowds = better
    crowdedness = get_hour_crowdedness_estimate(location, current_hour)
    crowd_score = max(0, 100 - crowdedness)
    score += crowd_score * 0.35

    # Category diversity bonus (15%)
    category = location.get("category", "")
    variety_bonus = {
        "park": 15,
        "restaurant": 12,
        "nursing_room": 8,
        "medical": 5,
        "attraction": 18,
        "other": 10,
    }
    score += variety_bonus.get(category, 10) * 0.15

    # Outdoor vs Weather bonus (10%)
    is_outdoor = category in ["park", "attraction"]
    if is_outdoor:
        # During good weather hours (9-18), outdoor gets bonus
        if 9 <= current_hour <= 18:
            score += 10

    return min(100, max(0, score))


@router.get("/go-now")
async def get_go_now_recommendations(
    lat: float = Query(..., description="Current latitude"),
    lng: float = Query(..., description="Current longitude"),
    radius: float = Query(5000, description="Search radius in meters"),
    limit: int = Query(5, ge=1, le=10),
    category: Optional[str] = None,
):
    """
    Get smart 'Go Now' recommendations for families.
    Shows top venues to visit RIGHT NOW based on:
    - Current time and crowd predictions
    - Quality scores and ratings
    - Venue type diversity
    - Real-time availability

    Perfect for families making quick outing decisions.
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

    current_hour = datetime.now().hour

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
                    nearby_locations.append({
                        "location": loc,
                        "distance": distance
                    })

    # Calculate Go Now scores
    scored_locations = []
    for item in nearby_locations:
        loc = item["location"]
        go_now_score = calculate_go_now_score(loc, current_hour)

        # Calculate estimated crowd level
        crowd_level = get_hour_crowdedness_estimate(loc, current_hour)
        crowd_status = "low" if crowd_level < 40 else "moderate" if crowd_level < 70 else "high"

        quality_score = quality_scorer.calculate_location_quality(
            location_id=loc.get("id", ""),
            average_rating=loc.get("averageRating", 0),
            review_count=loc.get("reviewCount", 0),
            last_update=loc.get("lastUpdate"),
            is_verified=loc.get("isVerified", False),
            recent_positive_reviews=loc.get("recentPositiveReviews", 0),
        )

        # Generate reason for recommendation
        reasons = []
        if crowd_level < 50:
            reasons.append(f"{crowd_status} crowds right now")
        if quality_score["overallScore"] >= 80:
            reasons.append("highly rated by families")
        if len(loc.get("events", [])) > 0:
            reasons.append(f"{len(loc.get('events', []))} events today")

        reason = " • ".join(reasons) if reasons else "Good family spot"

        scored_locations.append({
            "location": loc,
            "goNowScore": go_now_score,
            "crowdLevel": crowd_status,
            "estimatedCrowdPercentage": round(crowd_level, 0),
            "distance": round(item["distance"], 0),
            "reason": reason,
            "qualityScore": quality_score,
            "bestTimeUntil": f"{(current_hour + 2) % 24}:00",  # 2 hours from now
        })

    # Sort by Go Now score
    scored_locations.sort(key=lambda x: x["goNowScore"], reverse=True)

    return scored_locations[:limit]


@router.get("/best-visit-time")
async def get_best_visit_times(
    location_id: str = Query(..., description="Location ID"),
):
    """
    Get recommended visit times for a location based on crowd patterns.
    Helps families plan the best time to visit for a less crowded experience.
    """
    # Find location
    location = next((loc for loc in mock_locations if loc["id"] == location_id), None)

    if not location:
        raise HTTPException(status_code=404, detail="Location not found")

    # Calculate crowd scores for each hour
    hour_scores = []
    current_hour = datetime.now().hour

    for hour in range(24):
        crowd = get_hour_crowdedness_estimate(location, hour)
        score = max(0, 100 - crowd)
        hour_scores.append({
            "hour": hour,
            "crowdLevel": round(crowd, 0),
            "score": round(score, 0),
            "timeLabel": f"{hour:02d}:00",
            "isPeakHour": 70 <= crowd <= 100,
            "isOffPeak": crowd < 40,
            "isCurrentHour": hour == current_hour,
        })

    # Sort by score to get best times
    best_times = sorted(hour_scores, key=lambda x: x["score"], reverse=True)[:5]

    return {
        "locationId": location_id,
        "locationName": location.get("name", {}),
        "bestTimes": best_times,
        "peakHours": [h for h in hour_scores if h["isPeakHour"]],
        "offPeakHours": [h for h in hour_scores if h["isOffPeak"]],
        "recommendation": f"Best time to visit: {best_times[0]['timeLabel']} (Low crowds)",
    }
