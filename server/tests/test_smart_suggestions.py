"""
Tests for smart suggestions router.
Tests the 'Go Now' recommendations and best visit time predictions.
"""

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class TestGoNowSuggestions:
    """Test cases for Go Now recommendations endpoint."""

    def test_go_now_basic_request(self):
        """Test basic Go Now recommendation request."""
        response = client.get(
            "/api/suggestions/go-now?lat=25.0330&lng=121.5654&radius=5000&limit=5"
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 5
        if len(data) > 0:
            first = data[0]
            assert "location" in first
            assert "goNowScore" in first
            assert "crowdLevel" in first
            assert "distance" in first
            assert "reason" in first

    def test_go_now_with_limit(self):
        """Test Go Now request with different limits."""
        response = client.get(
            "/api/suggestions/go-now?lat=25.0330&lng=121.5654&radius=5000&limit=3"
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 3

    def test_go_now_with_category_filter(self):
        """Test Go Now request with category filter."""
        response = client.get(
            "/api/suggestions/go-now?lat=25.0330&lng=121.5654&radius=5000&limit=10&category=park"
        )
        assert response.status_code == 200
        data = response.json()
        # All results should be parks if filtered
        for location in data:
            assert location["location"]["category"] == "park"

    def test_go_now_score_ranges(self):
        """Test that Go Now scores are in valid range."""
        response = client.get(
            "/api/suggestions/go-now?lat=25.0330&lng=121.5654&radius=5000&limit=10"
        )
        assert response.status_code == 200
        data = response.json()
        for location in data:
            assert 0 <= location["goNowScore"] <= 100
            assert location["crowdLevel"] in ["low", "moderate", "high"]
            assert 0 <= location["estimatedCrowdPercentage"] <= 100

    def test_go_now_sorted_by_score(self):
        """Test that results are sorted by Go Now score descending."""
        response = client.get(
            "/api/suggestions/go-now?lat=25.0330&lng=121.5654&radius=5000&limit=10"
        )
        assert response.status_code == 200
        data = response.json()
        if len(data) > 1:
            scores = [loc["goNowScore"] for loc in data]
            assert scores == sorted(scores, reverse=True)

    def test_go_now_distance_calculation(self):
        """Test that distances are calculated correctly."""
        response = client.get(
            "/api/suggestions/go-now?lat=25.0330&lng=121.5654&radius=5000&limit=10"
        )
        assert response.status_code == 200
        data = response.json()
        for location in data:
            assert 0 <= location["distance"] <= 5000


class TestBestVisitTime:
    """Test cases for best visit time endpoint."""

    def test_best_visit_time_valid_location(self):
        """Test best visit time for a valid location."""
        response = client.get("/api/suggestions/best-visit-time?location_id=1")
        assert response.status_code == 200
        data = response.json()
        assert "locationId" in data
        assert "bestTimes" in data
        assert "peakHours" in data
        assert "offPeakHours" in data
        assert "recommendation" in data

    def test_best_visit_time_invalid_location(self):
        """Test best visit time for invalid location."""
        response = client.get("/api/suggestions/best-visit-time?location_id=invalid_id_12345")
        assert response.status_code == 404

    def test_best_visit_time_contains_hours(self):
        """Test that best times contain valid hour data."""
        response = client.get("/api/suggestions/best-visit-time?location_id=1")
        assert response.status_code == 200
        data = response.json()

        # Verify best times
        assert len(data["bestTimes"]) <= 5
        for time in data["bestTimes"]:
            assert "hour" in time
            assert 0 <= time["hour"] < 24
            assert "crowdLevel" in time
            assert 0 <= time["crowdLevel"] <= 100
            assert "score" in time
            assert 0 <= time["score"] <= 100

    def test_best_visit_time_peak_hours(self):
        """Test that peak hours are identified."""
        response = client.get("/api/suggestions/best-visit-time?location_id=1")
        assert response.status_code == 200
        data = response.json()

        # Peak hours should have crowd level > 70
        for hour in data["peakHours"]:
            assert hour["isPeakHour"] is True
            assert hour["crowdLevel"] > 70

    def test_best_visit_time_offpeak_hours(self):
        """Test that off-peak hours are identified."""
        response = client.get("/api/suggestions/best-visit-time?location_id=1")
        assert response.status_code == 200
        data = response.json()

        # Off-peak hours should have crowd level < 40
        for hour in data["offPeakHours"]:
            assert hour["isOffPeak"] is True
            assert hour["crowdLevel"] < 40

    def test_best_visit_time_recommendation_text(self):
        """Test that recommendation text is meaningful."""
        response = client.get("/api/suggestions/best-visit-time?location_id=1")
        assert response.status_code == 200
        data = response.json()

        assert len(data["recommendation"]) > 0
        assert "Best time" in data["recommendation"] or "最佳時間" in data["recommendation"]


class TestSmartSuggestionsIntegration:
    """Integration tests for smart suggestions feature."""

    def test_go_now_and_best_time_consistency(self):
        """Test that Go Now and best visit time recommendations are consistent."""
        # Get Go Now suggestions
        go_now_response = client.get(
            "/api/suggestions/go-now?lat=25.0330&lng=121.5654&radius=5000&limit=1"
        )
        assert go_now_response.status_code == 200
        go_now_data = go_now_response.json()

        if len(go_now_data) > 0:
            location_id = go_now_data[0]["location"]["id"]

            # Get best visit time for that location
            time_response = client.get(f"/api/suggestions/best-visit-time?location_id={location_id}")
            assert time_response.status_code == 200
            time_data = time_response.json()

            # Should have both Go Now and best time data
            assert time_data["locationId"] == location_id
            assert len(time_data["bestTimes"]) > 0

    def test_large_radius_request(self):
        """Test Go Now with large radius."""
        response = client.get(
            "/api/suggestions/go-now?lat=25.0330&lng=121.5654&radius=10000&limit=10"
        )
        assert response.status_code == 200
        data = response.json()
        # Should return locations within radius
        assert len(data) <= 10

    def test_all_crowd_levels_present(self):
        """Test that recommendations include various crowd levels."""
        response = client.get(
            "/api/suggestions/go-now?lat=25.0330&lng=121.5654&radius=5000&limit=10"
        )
        assert response.status_code == 200
        data = response.json()

        crowd_levels = {loc["crowdLevel"] for loc in data}
        # Should ideally have variety of crowd levels
        assert "low" in crowd_levels or "moderate" in crowd_levels or "high" in crowd_levels
