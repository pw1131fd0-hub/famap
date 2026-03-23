"""
Location Quality Scoring and Recommendation Engine

Provides algorithms for calculating location quality scores and
generating personalized recommendations based on community feedback,
verification status, and review recency.
"""

from typing import List, Dict, Optional
from datetime import datetime, timedelta, UTC
import math
import logging

logger = logging.getLogger(__name__)


class QualityScorer:
    """Calculates comprehensive quality scores for family-friendly locations."""

    # Configuration weights for quality scoring
    RATING_WEIGHT = 0.35  # Review ratings (most important)
    RECENCY_WEIGHT = 0.25  # How recently updated
    VERIFICATION_WEIGHT = 0.20  # Data verification status
    COMMUNITY_TRUST_WEIGHT = 0.20  # Community consensus and review count

    # Score decay for old reviews (months)
    RECENCY_DECAY_MONTHS = 6
    FULL_DECAY_MONTHS = 24

    def __init__(self):
        """Initialize the quality scorer."""
        pass

    def calculate_location_quality(
        self,
        location_id: str,
        average_rating: float,
        review_count: int,
        last_update: Optional[datetime] = None,
        is_verified: bool = False,
        recent_positive_reviews: int = 0,
    ) -> Dict:
        """
        Calculate comprehensive quality score for a location.

        Args:
            location_id: Location identifier
            average_rating: Average rating from reviews (1-5)
            review_count: Total number of reviews
            last_update: Last time location was updated
            is_verified: Whether location data has been verified
            recent_positive_reviews: Reviews with 4+ stars in last 3 months

        Returns:
            Dictionary with quality metrics and overall score
        """

        # Calculate individual component scores
        rating_score = self._calculate_rating_score(average_rating, review_count)
        recency_score = self._calculate_recency_score(last_update)
        verification_score = 80 if is_verified else 40  # Verified get higher score
        community_trust_score = self._calculate_community_trust_score(
            review_count, recent_positive_reviews
        )

        # Calculate weighted overall score
        overall_score = (
            (rating_score * self.RATING_WEIGHT)
            + (recency_score * self.RECENCY_WEIGHT)
            + (verification_score * self.VERIFICATION_WEIGHT)
            + (community_trust_score * self.COMMUNITY_TRUST_WEIGHT)
        )

        # Determine trust level based on overall score
        trust_level = self._determine_trust_level(overall_score, review_count)

        return {
            "locationId": location_id,
            "overallScore": round(overall_score, 1),
            "ratingScore": round(rating_score, 1),
            "recencyScore": round(recency_score, 1),
            "verificationScore": round(verification_score, 1),
            "communityTrustScore": round(community_trust_score, 1),
            "trustLevel": trust_level,
            "reviewCount": review_count,
            "isVerified": is_verified,
            "recommendationReason": self._generate_recommendation_reason(
                overall_score, trust_level, review_count
            ),
        }

    def _calculate_rating_score(self, average_rating: float, review_count: int) -> float:
        """
        Calculate score based on average rating.
        Requires minimum reviews for full credit.
        """
        if review_count == 0:
            return 50  # Neutral score for unreviewed locations

        # Convert 1-5 star rating to 0-100 scale
        rating_score = (average_rating / 5.0) * 100

        # Apply confidence boost for higher review counts
        # Locations with many consistent reviews are more trustworthy
        if review_count >= 50:
            confidence_boost = 5
        elif review_count >= 20:
            confidence_boost = 3
        elif review_count >= 10:
            confidence_boost = 1
        else:
            confidence_boost = 0

        return min(100, rating_score + confidence_boost)

    def _calculate_recency_score(self, last_update: Optional[datetime]) -> float:
        """
        Calculate score based on how recently the location was updated.
        Recent updates indicate active community engagement.
        """
        if last_update is None:
            return 50  # Neutral for unknown update time

        now = datetime.now(UTC)
        days_old = (now - last_update).days

        # Full score for very recent updates
        if days_old <= 7:
            return 100
        elif days_old <= 30:
            return 90
        elif days_old <= self.RECENCY_DECAY_MONTHS * 30:
            # Linear decay from 80 to 50 over RECENCY_DECAY_MONTHS
            decay_days = self.RECENCY_DECAY_MONTHS * 30
            score = 80 - ((days_old / decay_days) * 30)
            return max(50, score)
        elif days_old <= self.FULL_DECAY_MONTHS * 30:
            # Further decay to 30 over next FULL_DECAY_MONTHS
            decay_start = self.RECENCY_DECAY_MONTHS * 30
            decay_duration = (self.FULL_DECAY_MONTHS - self.RECENCY_DECAY_MONTHS) * 30
            score = 50 - (((days_old - decay_start) / decay_duration) * 20)
            return max(30, score)
        else:
            return 30  # Old locations get lower score

    def _calculate_community_trust_score(
        self, review_count: int, recent_positive_reviews: int
    ) -> float:
        """
        Calculate community trust based on review volume and consensus.
        More reviews indicate better community validation.
        """
        if review_count == 0:
            return 40  # Unreviewed locations

        # Base score increases with review count
        if review_count >= 50:
            base_score = 90
        elif review_count >= 20:
            base_score = 75
        elif review_count >= 10:
            base_score = 60
        elif review_count >= 5:
            base_score = 50
        else:
            base_score = 40

        # Positive consensus boost
        positive_ratio = (
            (recent_positive_reviews / review_count) if review_count > 0 else 0
        )
        consensus_boost = positive_ratio * 10

        return min(100, base_score + consensus_boost)

    def _determine_trust_level(self, score: float, review_count: int) -> str:
        """Determine trust level based on quality score and review count."""
        if score >= 80 and review_count >= 5:
            return "high"
        elif score >= 60 and review_count >= 2:
            return "medium"
        else:
            return "low"

    def _generate_recommendation_reason(
        self, overall_score: float, trust_level: str, review_count: int
    ) -> str:
        """Generate human-readable recommendation reason."""
        if overall_score >= 85:
            return "Highly rated by families - excellent choice!"
        elif overall_score >= 70:
            return "Well-reviewed location with solid reputation"
        elif overall_score >= 55:
            if review_count >= 10:
                return "Decent choice with community feedback"
            else:
                return "Newer location with promising early reviews"
        else:
            return "Limited reviews - help others by sharing your experience!"


class RecommendationEngine:
    """Generates personalized location recommendations."""

    def __init__(self):
        """Initialize the recommendation engine."""
        self.quality_scorer = QualityScorer()

    def rank_recommendations(
        self,
        locations: List[Dict],
        user_preferences: Optional[Dict] = None,
        limit: int = 10,
    ) -> List[Dict]:
        """
        Rank and return top recommended locations.

        Args:
            locations: List of location dictionaries
            user_preferences: Optional user preferences for personalization
            limit: Maximum number of recommendations to return

        Returns:
            List of ranked recommended locations with scores
        """
        recommendations = []

        for location in locations:
            # Calculate quality score
            quality_score = self.quality_scorer.calculate_location_quality(
                location_id=location.get("id", ""),
                average_rating=location.get("averageRating", 0),
                review_count=location.get("reviewCount", 0),
                last_update=location.get("lastUpdate"),
                is_verified=location.get("isVerified", False),
                recent_positive_reviews=location.get("recentPositiveReviews", 0),
            )

            # Calculate recommendation score (quality + personalization bonus)
            recommendation_score = self._calculate_recommendation_score(
                quality_score, location, user_preferences
            )

            match_reason = self._generate_match_reason(location, user_preferences)

            recommendations.append(
                {
                    "location": location,
                    "qualityScore": quality_score,
                    "recommendationScore": recommendation_score,
                    "matchReason": match_reason,
                }
            )

        # Sort by recommendation score (descending)
        sorted_recs = sorted(
            recommendations, key=lambda x: x["recommendationScore"], reverse=True
        )

        return sorted_recs[:limit]

    def _calculate_recommendation_score(
        self,
        quality_score: Dict,
        location: Dict,
        user_preferences: Optional[Dict] = None,
    ) -> float:
        """Calculate personalized recommendation score."""
        base_score = quality_score["overallScore"]

        if not user_preferences:
            return base_score

        # Apply personalization bonuses
        personalization_bonus = 0

        # Bonus for matching category preference
        if user_preferences.get("preferredCategories"):
            if location.get("category") in user_preferences["preferredCategories"]:
                personalization_bonus += 5

        # Bonus for matching age range
        if user_preferences.get("childAges"):
            location_age_range = location.get("ageRange", {})
            if self._matches_age_range(
                user_preferences["childAges"], location_age_range
            ):
                personalization_bonus += 5

        # Bonus for having specific facilities
        if user_preferences.get("requiredFacilities"):
            if self._has_required_facilities(
                location.get("facilities", []),
                user_preferences["requiredFacilities"],
            ):
                personalization_bonus += 3

        return min(100, base_score + personalization_bonus)

    def _matches_age_range(self, child_ages: List[int], location_age_range: Dict) -> bool:
        """Check if location's age range matches user's children."""
        if not location_age_range:
            return True

        min_age = location_age_range.get("minAge")
        max_age = location_age_range.get("maxAge")

        for age in child_ages:
            if min_age is None and max_age is None:
                return True
            if min_age is not None and age < min_age:
                continue
            if max_age is not None and age > max_age:
                continue
            return True

        return False

    def _has_required_facilities(
        self, location_facilities: List[str], required_facilities: List[str]
    ) -> bool:
        """Check if location has required facilities."""
        facility_set = set(location_facilities)
        return all(facility in facility_set for facility in required_facilities)

    def _generate_match_reason(
        self, location: Dict, user_preferences: Optional[Dict] = None
    ) -> str:
        """Generate reason why location is recommended."""
        if not user_preferences:
            return "Popular with families in your area"

        reasons = []

        if user_preferences.get("preferredCategories"):
            if location.get("category") in user_preferences["preferredCategories"]:
                reasons.append("Matches your favorite type")

        if user_preferences.get("childAges"):
            if self._matches_age_range(
                user_preferences["childAges"], location.get("ageRange", {})
            ):
                reasons.append("Great for your kids' ages")

        if user_preferences.get("requiredFacilities"):
            if self._has_required_facilities(
                location.get("facilities", []),
                user_preferences["requiredFacilities"],
            ):
                reasons.append("Has the facilities you need")

        if not reasons:
            return "Popular choice nearby"

        return " • ".join(reasons)
