"""
Tests for new features added in iteration 2:
- Real-time crowdedness REST endpoints
- WebSocket crowdedness connection
- Review helpfulness voting
- Location statistics endpoint
- Additional seed data coverage
"""
import pytest
import json
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from main import app
    from data.seed_data import mock_locations, mock_reviews
except ImportError:
    from server.main import app
    from server.data.seed_data import mock_locations, mock_reviews

from fastapi.testclient import TestClient

client = TestClient(app)


def get_auth_headers():
    """Return valid Authorization header using seed test user."""
    resp = client.post("/api/auth/login", json={"email": "test@example.com", "password": "password123"})
    token = resp.json().get("access_token", "")
    return {"Authorization": f"Bearer {token}"}


# ──────────────────────────────────────────────
# Crowdedness REST API
# ──────────────────────────────────────────────

class TestCrowdednessRest:
    def test_get_crowdedness_empty_location(self):
        """GET /api/crowdedness/<id> returns list (may be empty)."""
        resp = client.get("/api/crowdedness/nonexistent_loc_999")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_get_crowdedness_known_location(self):
        """GET /api/crowdedness/1 returns seed reports for Daan Park."""
        resp = client.get("/api/crowdedness/1")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        if data:
            assert "level" in data[0]
            assert "timestamp" in data[0]

    def test_get_crowdedness_limit_param(self):
        """limit query param is respected."""
        resp = client.get("/api/crowdedness/1?limit=1")
        assert resp.status_code == 200
        assert len(resp.json()) <= 1

    def test_post_crowdedness_requires_auth(self):
        """POST without auth returns 401."""
        resp = client.post("/api/crowdedness/1?level=quiet")
        assert resp.status_code == 401

    def test_post_crowdedness_invalid_level(self):
        """POST with invalid level returns 422."""
        headers = get_auth_headers()
        resp = client.post("/api/crowdedness/1?level=super_crowded", headers=headers)
        assert resp.status_code == 422

    def test_post_crowdedness_valid(self):
        """POST a valid crowdedness report."""
        headers = get_auth_headers()
        resp = client.post("/api/crowdedness/1?level=moderate&comment=還好", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["level"] == "moderate"
        assert data["locationId"] == "1"
        assert "id" in data
        assert "timestamp" in data

    def test_post_crowdedness_all_valid_levels(self):
        """All four crowdedness levels are accepted."""
        headers = get_auth_headers()
        for level in ["quiet", "moderate", "busy", "very_busy"]:
            resp = client.post(f"/api/crowdedness/1?level={level}", headers=headers)
            assert resp.status_code == 200, f"Level '{level}' should be accepted"

    def test_get_crowdedness_summary(self):
        """GET /api/crowdedness/<id>/summary returns aggregated data."""
        # First add a report so there's something to summarize
        headers = get_auth_headers()
        client.post("/api/crowdedness/2?level=busy", headers=headers)
        resp = client.get("/api/crowdedness/2/summary")
        assert resp.status_code == 200
        data = resp.json()
        assert "locationId" in data
        assert "currentLevel" in data
        assert "reportCount" in data
        assert "breakdown" in data

    def test_get_crowdedness_summary_empty(self):
        """Summary for location with no reports returns null currentLevel."""
        resp = client.get("/api/crowdedness/loc_with_no_reports_xyz")
        assert resp.status_code == 200
        # We get an empty list — summary endpoint on a fresh location should return nulls
        summary_resp = client.get("/api/crowdedness/loc_with_no_reports_xyz/summary")
        assert summary_resp.status_code == 200
        data = summary_resp.json()
        assert data["currentLevel"] is None
        assert data["reportCount"] == 0


# ──────────────────────────────────────────────
# WebSocket crowdedness
# ──────────────────────────────────────────────

class TestCrowdednessWebSocket:
    def test_ws_connect_receives_snapshot(self):
        """WebSocket client receives a snapshot message on connect."""
        with client.websocket_connect("/api/ws/crowdedness/1") as ws:
            msg = ws.receive_text()
            data = json.loads(msg)
            assert data["type"] == "snapshot"
            assert "data" in data
            assert "connectedClients" in data

    def test_ws_connect_empty_location(self):
        """WebSocket for location with no reports sends snapshot with null data."""
        with client.websocket_connect("/api/ws/crowdedness/no_reports_loc") as ws:
            msg = ws.receive_text()
            data = json.loads(msg)
            assert data["type"] == "snapshot"
            assert data["data"] is None

    def test_ws_connect_multiple_clients(self):
        """Multiple simultaneous WebSocket connections are accepted."""
        with client.websocket_connect("/api/ws/crowdedness/1") as ws1:
            with client.websocket_connect("/api/ws/crowdedness/1") as ws2:
                msg1 = json.loads(ws1.receive_text())
                msg2 = json.loads(ws2.receive_text())
                assert msg1["type"] == "snapshot"
                assert msg2["type"] == "snapshot"


# ──────────────────────────────────────────────
# Review helpfulness voting
# ──────────────────────────────────────────────

class TestReviewHelpfulness:
    def _get_first_review_id(self) -> str:
        """Return a valid review id from mock data."""
        return mock_reviews[0]["id"]

    def test_get_helpful_count(self):
        """GET /api/reviews/<id>/helpful returns count."""
        review_id = self._get_first_review_id()
        resp = client.get(f"/api/reviews/{review_id}/helpful")
        assert resp.status_code == 200
        data = resp.json()
        assert "reviewId" in data
        assert "helpfulCount" in data
        assert data["helpfulCount"] >= 0

    def test_get_helpful_count_not_found(self):
        """GET helpful count for missing review returns 404."""
        resp = client.get("/api/reviews/nonexistent_review_xyz/helpful")
        assert resp.status_code == 404

    def test_post_helpful_requires_auth(self):
        """POST vote without auth returns 401."""
        review_id = self._get_first_review_id()
        resp = client.post(f"/api/reviews/{review_id}/helpful")
        assert resp.status_code == 401

    def test_post_helpful_vote(self):
        """POST vote adds a helpful vote."""
        review_id = self._get_first_review_id()
        headers = get_auth_headers()
        resp = client.post(f"/api/reviews/{review_id}/helpful", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["reviewId"] == review_id
        assert "helpfulCount" in data
        assert "userVoted" in data
        assert data["userVoted"] is True

    def test_post_helpful_toggle_removes_vote(self):
        """Voting twice toggles the vote off."""
        review_id = self._get_first_review_id()
        headers = get_auth_headers()
        # First vote adds
        resp1 = client.post(f"/api/reviews/{review_id}/helpful", headers=headers)
        assert resp1.json()["userVoted"] is True
        count_after_first = resp1.json()["helpfulCount"]
        # Second vote removes
        resp2 = client.post(f"/api/reviews/{review_id}/helpful", headers=headers)
        assert resp2.json()["userVoted"] is False
        assert resp2.json()["helpfulCount"] == count_after_first - 1

    def test_post_helpful_not_found(self):
        """POST helpful for missing review returns 404."""
        headers = get_auth_headers()
        resp = client.post("/api/reviews/nonexistent_review_abc/helpful", headers=headers)
        assert resp.status_code == 404


# ──────────────────────────────────────────────
# Review sorting
# ──────────────────────────────────────────────

class TestReviewSorting:
    def test_get_reviews_default_sort(self):
        """GET reviews without sort param returns a list."""
        resp = client.get("/api/reviews/1")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_get_reviews_sort_highest(self):
        """GET reviews?sort=highest returns highest rated first."""
        resp = client.get("/api/reviews/1?sort=highest")
        assert resp.status_code == 200
        data = resp.json()
        if len(data) > 1:
            ratings = [r["rating"] for r in data]
            assert ratings == sorted(ratings, reverse=True)

    def test_get_reviews_sort_most_helpful(self):
        """GET reviews?sort=most_helpful returns list (order depends on votes)."""
        resp = client.get("/api/reviews/1?sort=most_helpful")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_get_reviews_limit(self):
        """GET reviews with limit param is respected."""
        resp = client.get("/api/reviews/1?limit=1")
        assert resp.status_code == 200
        assert len(resp.json()) <= 1


# ──────────────────────────────────────────────
# Location statistics endpoint
# ──────────────────────────────────────────────

class TestLocationStats:
    def test_get_stats_existing_location(self):
        """GET /api/locations/<id>/stats returns stats for a known location."""
        resp = client.get("/api/locations/1/stats")
        assert resp.status_code == 200
        data = resp.json()
        assert data["locationId"] == "1"
        assert "averageRating" in data
        assert "reviewCount" in data
        assert "ratingDistribution" in data
        assert "facilityCount" in data
        assert "facilities" in data
        assert "upcomingEventCount" in data
        assert "totalEventCount" in data
        assert "hasNursingRoom" in data
        assert "isStrollerAccessible" in data
        assert "isFree" in data

    def test_get_stats_rating_distribution_keys(self):
        """Rating distribution has keys 1-5."""
        resp = client.get("/api/locations/1/stats")
        assert resp.status_code == 200
        dist = resp.json()["ratingDistribution"]
        for k in ["1", "2", "3", "4", "5"]:
            assert k in dist

    def test_get_stats_not_found(self):
        """GET stats for nonexistent location returns 404."""
        resp = client.get("/api/locations/nonexistent_loc_zz9/stats")
        assert resp.status_code == 404

    def test_get_stats_stroller_flag(self):
        """Location with stroller_accessible facility reports isStrollerAccessible=True."""
        resp = client.get("/api/locations/1/stats")
        assert resp.status_code == 200
        data = resp.json()
        assert data["isStrollerAccessible"] is True  # Daan Park has this facility

    def test_get_stats_facility_count_matches(self):
        """facilityCount matches length of facilities list."""
        resp = client.get("/api/locations/1/stats")
        assert resp.status_code == 200
        data = resp.json()
        assert data["facilityCount"] == len(data["facilities"])


# ──────────────────────────────────────────────
# New seed data coverage
# ──────────────────────────────────────────────

class TestNewSeedData:
    def _get_location_ids(self):
        resp = client.get("/api/locations/?lat=25.0330&lng=121.5654&radius=100000")
        assert resp.status_code == 200
        return {loc["id"] for loc in resp.json()}

    def test_taipei_zoo_in_seed(self):
        """New seed: Taipei Zoo (tp01) is present."""
        ids = self._get_location_ids()
        assert "tp01" in ids, "Taipei Zoo should be in seed data"

    def test_national_palace_museum_in_seed(self):
        """New seed: National Palace Museum Children's Art Center (tp02) is present."""
        ids = self._get_location_ids()
        assert "tp02" in ids

    def test_taipei_101_nursing_room_in_seed(self):
        """New seed: Taipei 101 Nursing Room (nr03) is present."""
        ids = self._get_location_ids()
        assert "nr03" in ids

    def test_chimei_museum_in_seed(self):
        """New seed: Chimei Museum Tainan (tn03) is reachable at expanded radius."""
        resp = client.get("/api/locations/?lat=23.0000&lng=120.2000&radius=50000")
        assert resp.status_code == 200
        ids = {loc["id"] for loc in resp.json()}
        assert "tn03" in ids, "Chimei Museum should appear near Tainan"

    def test_new_seed_venues_have_required_fields(self):
        """All new seed venues have the required name, category, coordinates fields."""
        new_ids = {"tp01", "tp02", "tp03", "tp04", "tp05", "ny01", "ny02",
                   "tc03", "tc04", "tn03", "kh04", "kh05", "hc02", "nr03", "nr04", "tp06"}
        from data.seed_data import mock_locations
        loc_map = {loc["id"]: loc for loc in mock_locations}
        for loc_id in new_ids:
            assert loc_id in loc_map, f"Seed location {loc_id} missing"
            loc = loc_map[loc_id]
            assert "name" in loc and "zh" in loc["name"]
            assert "category" in loc
            assert "coordinates" in loc
            assert "lat" in loc["coordinates"]
            assert "lng" in loc["coordinates"]

    def test_total_seed_count_increased(self):
        """Total seed location count is at least 40 (was ~25 before)."""
        from data.seed_data import mock_locations
        base_count = len([l for l in mock_locations if not l.get("id", "").startswith("osm_")])
        assert base_count >= 40, f"Expected at least 40 curated seed locations, got {base_count}"
