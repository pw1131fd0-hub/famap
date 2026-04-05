"""
Tests for recommendations router endpoints.
Covers quality scoring, nearby recommendations, trending, and top-rated locations.
"""

from fastapi.testclient import TestClient
import pytest
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from main import app
    from data.seed_data import mock_locations
except ImportError:
    from server.main import app
    from server.data.seed_data import mock_locations

client = TestClient(app)


class TestQualityScore:
    """Tests for /api/recommendations/quality/{location_id}"""

    def test_get_quality_for_valid_location(self):
        """Should return quality score for valid location ID"""
        if not mock_locations:
            pytest.skip("No mock locations available")
        loc_id = mock_locations[0]["id"]
        response = client.get(f"/api/recommendations/quality/{loc_id}")
        assert response.status_code == 200
        data = response.json()
        assert "overallScore" in data
        assert "ratingScore" in data
        assert "recencyScore" in data
        assert "credibilityScore" in data
        assert 0 <= data["overallScore"] <= 100

    def test_get_quality_for_invalid_location(self):
        """Should return 404 for non-existent location"""
        response = client.get("/api/recommendations/quality/nonexistent_id_99999")
        assert response.status_code == 404

    def test_quality_score_structure(self):
        """Quality score response should have proper structure"""
        if not mock_locations:
            pytest.skip("No mock locations available")
        loc_id = mock_locations[0]["id"]
        response = client.get(f"/api/recommendations/quality/{loc_id}")
        assert response.status_code == 200
        data = response.json()
        # All scores should be numeric
        for key in ["overallScore", "ratingScore", "recencyScore", "credibilityScore"]:
            assert isinstance(data[key], (int, float))
            assert 0 <= data[key] <= 100

    def test_quality_score_for_verified_location(self):
        """Verified locations should tend to have higher credibility"""
        verified_locs = [loc for loc in mock_locations if loc.get("isVerified")]
        if not verified_locs:
            pytest.skip("No verified locations in mock data")
        loc_id = verified_locs[0]["id"]
        response = client.get(f"/api/recommendations/quality/{loc_id}")
        assert response.status_code == 200
        data = response.json()
        # Verified location should have meaningful credibility
        assert data["credibilityScore"] >= 0


class TestNearbyRecommendations:
    """Tests for /api/recommendations/nearby"""

    def test_get_nearby_basic(self):
        """Should return list of recommendations near given coordinates"""
        response = client.get(
            "/api/recommendations/nearby",
            params={"lat": 25.0330, "lng": 121.5654, "radius": 50000}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_nearby_missing_required_params(self):
        """Should fail without required lat/lng params"""
        response = client.get("/api/recommendations/nearby")
        assert response.status_code == 422  # Unprocessable Entity

    def test_nearby_with_category_filter(self):
        """Should filter by category when specified"""
        response = client.get(
            "/api/recommendations/nearby",
            params={"lat": 25.0330, "lng": 121.5654, "radius": 50000, "category": "park"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All returned locations should be parks
        for rec in data:
            assert rec["location"]["category"] == "park"

    def test_nearby_with_quality_score_filter(self):
        """Should filter by minimum quality score when specified"""
        response = client.get(
            "/api/recommendations/nearby",
            params={"lat": 25.0330, "lng": 121.5654, "radius": 50000, "min_quality_score": 50}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for rec in data:
            assert rec["qualityScore"]["overallScore"] >= 50

    def test_nearby_structure(self):
        """Each recommendation should have proper structure"""
        response = client.get(
            "/api/recommendations/nearby",
            params={"lat": 25.0330, "lng": 121.5654, "radius": 50000}
        )
        assert response.status_code == 200
        data = response.json()
        if data:
            rec = data[0]
            assert "location" in rec
            assert "qualityScore" in rec
            assert "recommendationScore" in rec
            assert "matchReason" in rec

    def test_nearby_with_limit(self):
        """Should respect limit parameter"""
        response = client.get(
            "/api/recommendations/nearby",
            params={"lat": 25.0330, "lng": 121.5654, "radius": 50000, "limit": 3}
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 3

    def test_nearby_small_radius(self):
        """Should return empty list for very small radius"""
        response = client.get(
            "/api/recommendations/nearby",
            params={"lat": 0.0, "lng": 0.0, "radius": 1}
        )
        assert response.status_code == 200
        data = response.json()
        assert data == []

    def test_nearby_invalid_limit(self):
        """Should reject invalid limit values"""
        response = client.get(
            "/api/recommendations/nearby",
            params={"lat": 25.0330, "lng": 121.5654, "limit": 100}
        )
        assert response.status_code == 422

    def test_nearby_high_quality_filter_no_results(self):
        """Very high quality score filter should return few or no results"""
        response = client.get(
            "/api/recommendations/nearby",
            params={"lat": 25.0330, "lng": 121.5654, "radius": 50000, "min_quality_score": 99}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All returned items should meet the threshold
        for rec in data:
            assert rec["qualityScore"]["overallScore"] >= 99


class TestTrendingLocations:
    """Tests for /api/recommendations/trending"""

    def test_get_trending_basic(self):
        """Should return list of trending locations"""
        response = client.get("/api/recommendations/trending")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0

    def test_trending_structure(self):
        """Each trending item should have required fields"""
        response = client.get("/api/recommendations/trending")
        assert response.status_code == 200
        data = response.json()
        if data:
            item = data[0]
            assert "location" in item
            assert "trendingScore" in item
            assert "qualityScore" in item
            assert "reason" in item

    def test_trending_with_limit(self):
        """Should respect limit parameter"""
        response = client.get("/api/recommendations/trending", params={"limit": 5})
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 5

    def test_trending_sorted_by_score(self):
        """Trending results should be sorted by trending score descending"""
        response = client.get("/api/recommendations/trending", params={"limit": 20})
        assert response.status_code == 200
        data = response.json()
        if len(data) > 1:
            scores = [item["trendingScore"] for item in data]
            assert scores == sorted(scores, reverse=True)

    def test_trending_invalid_limit(self):
        """Should reject invalid limit"""
        response = client.get("/api/recommendations/trending", params={"limit": 0})
        assert response.status_code == 422

    def test_trending_max_limit(self):
        """Should return up to 50 results"""
        response = client.get("/api/recommendations/trending", params={"limit": 50})
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 50


class TestTopRatedLocations:
    """Tests for /api/recommendations/top-rated"""

    def test_get_top_rated_basic(self):
        """Should return list of top-rated locations"""
        response = client.get("/api/recommendations/top-rated")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0

    def test_top_rated_structure(self):
        """Each top-rated item should have required fields"""
        response = client.get("/api/recommendations/top-rated")
        assert response.status_code == 200
        data = response.json()
        if data:
            item = data[0]
            assert "location" in item
            assert "qualityScore" in item
            assert "position" in item

    def test_top_rated_with_category(self):
        """Should filter by category when specified"""
        response = client.get("/api/recommendations/top-rated", params={"category": "park"})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for item in data:
            assert item["location"]["category"] == "park"

    def test_top_rated_position_order(self):
        """Positions should be sequential starting from 1"""
        response = client.get("/api/recommendations/top-rated", params={"limit": 10})
        assert response.status_code == 200
        data = response.json()
        for i, item in enumerate(data, 1):
            assert item["position"] == i

    def test_top_rated_sorted_by_score(self):
        """Top-rated results should be sorted by quality score descending"""
        response = client.get("/api/recommendations/top-rated", params={"limit": 20})
        assert response.status_code == 200
        data = response.json()
        if len(data) > 1:
            scores = [item["qualityScore"]["overallScore"] for item in data]
            assert scores == sorted(scores, reverse=True)

    def test_top_rated_with_limit(self):
        """Should respect limit parameter"""
        response = client.get("/api/recommendations/top-rated", params={"limit": 3})
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 3

    def test_top_rated_nonexistent_category(self):
        """Should return empty list for nonexistent category"""
        response = client.get(
            "/api/recommendations/top-rated",
            params={"category": "nonexistent_category_xyz"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data == []

    def test_top_rated_different_categories(self):
        """Should work for different valid categories"""
        categories = ["park", "restaurant", "nursing_room", "medical"]
        for category in categories:
            response = client.get("/api/recommendations/top-rated", params={"category": category})
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)
