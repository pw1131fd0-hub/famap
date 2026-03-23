"""
Tests for location quality scoring and recommendation engine.
"""

import pytest
from datetime import datetime, timedelta, UTC
from quality_scoring import QualityScorer, RecommendationEngine


@pytest.fixture
def quality_scorer():
    """Fixture for quality scorer."""
    return QualityScorer()


@pytest.fixture
def recommendation_engine():
    """Fixture for recommendation engine."""
    return RecommendationEngine()


class TestQualityScorer:
    """Test suite for QualityScorer class."""

    def test_calculate_location_quality_perfect_score(self, quality_scorer):
        """Test quality calculation for perfect location."""
        quality = quality_scorer.calculate_location_quality(
            location_id="loc1",
            average_rating=5.0,
            review_count=50,
            last_update=datetime.now(UTC),
            is_verified=True,
            recent_positive_reviews=40,
        )

        assert quality["overallScore"] >= 95
        assert quality["trustLevel"] == "high"
        assert quality["locationId"] == "loc1"
        assert quality["isVerified"] is True

    def test_calculate_location_quality_no_reviews(self, quality_scorer):
        """Test quality calculation for location with no reviews."""
        quality = quality_scorer.calculate_location_quality(
            location_id="loc2",
            average_rating=0,
            review_count=0,
            last_update=None,
            is_verified=False,
            recent_positive_reviews=0,
        )

        assert quality["overallScore"] < 60
        assert quality["trustLevel"] == "low"

    def test_rating_score_calculation(self, quality_scorer):
        """Test individual rating score calculation."""
        # 4.5 star rating with 30 reviews should have high score
        rating_score = quality_scorer._calculate_rating_score(4.5, 30)
        assert rating_score >= 85

        # 3.0 star rating with 10 reviews should have medium score
        rating_score = quality_scorer._calculate_rating_score(3.0, 10)
        assert 50 <= rating_score < 70

        # No reviews should have neutral score
        rating_score = quality_scorer._calculate_rating_score(0, 0)
        assert rating_score == 50

    def test_recency_score_calculation(self, quality_scorer):
        """Test recency score based on update time."""
        # Recent update (1 day old)
        recent_score = quality_scorer._calculate_recency_score(
            datetime.now(UTC) - timedelta(days=1)
        )
        assert recent_score >= 90

        # Old update (6 months old)
        old_score = quality_scorer._calculate_recency_score(
            datetime.now(UTC) - timedelta(days=180)
        )
        assert 40 <= old_score <= 60

        # No update time
        no_update_score = quality_scorer._calculate_recency_score(None)
        assert no_update_score == 50

    def test_community_trust_score_calculation(self, quality_scorer):
        """Test community trust score calculation."""
        # Many reviews with positive consensus
        trust_score = quality_scorer._calculate_community_trust_score(
            review_count=50, recent_positive_reviews=45
        )
        assert trust_score >= 90

        # Few reviews
        trust_score = quality_scorer._calculate_community_trust_score(
            review_count=3, recent_positive_reviews=2
        )
        assert 40 <= trust_score <= 60

        # No reviews
        trust_score = quality_scorer._calculate_community_trust_score(
            review_count=0, recent_positive_reviews=0
        )
        assert trust_score == 40

    def test_trust_level_determination(self, quality_scorer):
        """Test trust level determination logic."""
        # High trust: good score and sufficient reviews
        assert (
            quality_scorer._determine_trust_level(85, 10) == "high"
        )

        # Medium trust: decent score and some reviews
        assert (
            quality_scorer._determine_trust_level(65, 5) == "medium"
        )

        # Low trust: low score or few reviews
        assert (
            quality_scorer._determine_trust_level(55, 2) == "low"
        )

    def test_recommendation_reason_generation(self, quality_scorer):
        """Test recommendation reason generation."""
        # Excellent location
        reason = quality_scorer._generate_recommendation_reason(85, "high", 20)
        assert "Highly rated" in reason or "excellent" in reason

        # Good location
        reason = quality_scorer._generate_recommendation_reason(70, "medium", 15)
        assert "Well-reviewed" in reason or "solid reputation" in reason

        # Newer location
        reason = quality_scorer._generate_recommendation_reason(60, "medium", 3)
        assert "early reviews" in reason or "promising" in reason


class TestRecommendationEngine:
    """Test suite for RecommendationEngine class."""

    def test_rank_recommendations_basic(self, recommendation_engine):
        """Test basic recommendation ranking."""
        locations = [
            {
                "id": "loc1",
                "name": {"en": "Park A", "zh": "公園A"},
                "category": "park",
                "averageRating": 4.5,
                "reviewCount": 50,
                "isVerified": True,
                "recentPositiveReviews": 45,
            },
            {
                "id": "loc2",
                "name": {"en": "Park B", "zh": "公園B"},
                "category": "park",
                "averageRating": 3.0,
                "reviewCount": 10,
                "isVerified": False,
                "recentPositiveReviews": 5,
            },
        ]

        recommendations = recommendation_engine.rank_recommendations(locations, limit=10)

        assert len(recommendations) == 2
        # Higher quality location should be ranked first
        assert (
            recommendations[0]["qualityScore"]["overallScore"]
            > recommendations[1]["qualityScore"]["overallScore"]
        )

    def test_rank_recommendations_with_limit(self, recommendation_engine):
        """Test recommendation limit functionality."""
        locations = [
            {"id": f"loc{i}", "name": {"en": f"Place {i}", "zh": f"地點{i}"},
             "category": "park", "averageRating": 4.0, "reviewCount": 10 + i,
             "isVerified": False, "recentPositiveReviews": 5}
            for i in range(15)
        ]

        recommendations = recommendation_engine.rank_recommendations(locations, limit=5)

        assert len(recommendations) == 5

    def test_matches_age_range(self, recommendation_engine):
        """Test age range matching."""
        # Child age 5 with location for ages 2-8
        assert (
            recommendation_engine._matches_age_range([5], {"minAge": 2, "maxAge": 8})
            is True
        )

        # Child age 10 with location for ages 2-8
        assert (
            recommendation_engine._matches_age_range([10], {"minAge": 2, "maxAge": 8})
            is False
        )

        # No age range specified
        assert (
            recommendation_engine._matches_age_range([5], {}) is True
        )

    def test_has_required_facilities(self, recommendation_engine):
        """Test required facilities matching."""
        location_facilities = ["stroller_accessible", "high_chair", "changing_table"]

        # All required facilities present
        assert (
            recommendation_engine._has_required_facilities(
                location_facilities,
                ["stroller_accessible", "high_chair"],
            )
            is True
        )

        # Some required facilities missing
        assert (
            recommendation_engine._has_required_facilities(
                location_facilities,
                ["stroller_accessible", "playground"],
            )
            is False
        )

    def test_calculate_recommendation_score_basic(self, recommendation_engine):
        """Test recommendation score calculation."""
        quality_score = {
            "overallScore": 80,
            "ratingScore": 85,
            "recencyScore": 75,
            "verificationScore": 80,
            "communityTrustScore": 80,
        }

        location = {
            "id": "loc1",
            "category": "park",
            "ageRange": {"minAge": 2, "maxAge": 10},
            "facilities": ["stroller_accessible", "playground"],
        }

        # Without preferences
        score = recommendation_engine._calculate_recommendation_score(
            quality_score, location, None
        )
        assert score == 80

        # With matching preferences
        preferences = {
            "preferredCategories": ["park"],
            "childAges": [5],
            "requiredFacilities": ["stroller_accessible"],
        }
        score = recommendation_engine._calculate_recommendation_score(
            quality_score, location, preferences
        )
        assert score > 80  # Should have bonuses

    def test_generate_match_reason_without_preferences(self, recommendation_engine):
        """Test match reason generation without user preferences."""
        location = {"id": "loc1", "name": {"en": "Park"}}
        reason = recommendation_engine._generate_match_reason(location, None)
        assert reason == "Popular with families in your area"

    def test_generate_match_reason_with_preferences(self, recommendation_engine):
        """Test match reason generation with matching preferences."""
        location = {
            "id": "loc1",
            "category": "park",
            "ageRange": {"minAge": 2, "maxAge": 10},
            "facilities": ["stroller_accessible"],
        }

        preferences = {
            "preferredCategories": ["park"],
            "childAges": [5],
            "requiredFacilities": ["stroller_accessible"],
        }

        reason = recommendation_engine._generate_match_reason(location, preferences)
        assert len(reason) > 0
        # Reason should contain at least one match reason
        assert "•" in reason or "favorite" in reason or "Great" in reason or "need" in reason
