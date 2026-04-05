from fastapi.testclient import TestClient
import pytest
import sys
import os

# Add parent directory to path to allow importing from 'server' if needed, 
# but here we prefer direct imports if running from 'server' dir.
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from main import app
    from data.seed_data import mock_locations, mock_users, mock_favorites, mock_reviews
except ImportError:
    from server.main import app
    from server.data.seed_data import mock_locations, mock_users, mock_favorites, mock_reviews

client = TestClient(app)


def get_auth_token():
    """Helper to get a valid Bearer token using the seed user"""
    response = client.post("/api/auth/login", json={"email": "test@example.com", "password": "password123"})
    return response.json().get("access_token", "")


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "alive"
    assert "timestamp" in data

def test_get_locations():
    # Provide coordinates in Taipei
    response = client.get("/api/locations/?lat=25.0330&lng=121.5654&radius=10000")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(mock_locations) > 0:
        assert len(data) > 0

def test_get_location():
    if not mock_locations:
        return
    loc_id = mock_locations[0]["id"]
    response = client.get(f"/api/locations/{loc_id}")
    assert response.status_code == 200
    assert response.json()["id"] == loc_id

def test_get_location_not_found():
    response = client.get("/api/locations/invalid_id_999")
    assert response.status_code == 404

def test_create_location():
    token = get_auth_token()
    new_loc = {
        "name": {"zh": "測試公園", "en": "Test Park"},
        "description": {"zh": "測試用", "en": "For testing"},
        "category": "park",
        "coordinates": {"lat": 25.0, "lng": 121.0},
        "address": {"zh": "測試地址", "en": "Test Addr"},
        "facilities": ["playground"]
    }
    response = client.post("/api/locations/", json=new_loc, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["name"]["en"] == "Test Park"

def test_create_location_unauthenticated():
    new_loc = {
        "name": {"zh": "未授權公園", "en": "Unauth Park"},
        "description": {"zh": "測試", "en": "Test"},
        "category": "park",
        "coordinates": {"lat": 25.0, "lng": 121.0},
        "address": {"zh": "地址", "en": "Addr"},
        "facilities": []
    }
    response = client.post("/api/locations/", json=new_loc)
    assert response.status_code == 401

def test_update_location():
    if not mock_locations:
        return
    token = get_auth_token()
    loc_id = mock_locations[0]["id"]
    update_data = {"photoUrl": "http://test.com/photo.jpg"}
    response = client.patch(f"/api/locations/{loc_id}", json=update_data, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["photoUrl"] == "http://test.com/photo.jpg"

def test_update_location_not_found():
    token = get_auth_token()
    response = client.patch("/api/locations/invalid_id_999", json={"photoUrl": "test"}, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 404

def test_get_favorites():
    response = client.get("/api/favorites/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_add_favorite():
    fav = {"locationId": "test_loc_1"}
    response = client.post("/api/favorites/", json=fav)
    assert response.status_code == 200
    assert response.json()["locationId"] == "test_loc_1"

def test_remove_favorite():
    # add a favorite first
    fav = {"locationId": "test_loc_to_remove"}
    client.post("/api/favorites/", json=fav)
    # now remove it
    response = client.delete("/api/favorites/test_loc_to_remove")
    assert response.status_code == 200
    assert response.json() == {"status": "success"}

def test_get_reviews():
    response = client.get("/api/reviews/test_loc_1")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_review():
    token = get_auth_token()
    review = {
        "locationId": "1",
        "rating": 5,
        "comment": "Great place!"
    }
    response = client.post("/api/reviews/", json=review, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["comment"] == "Great place!"

def test_create_review_unauthenticated():
    review = {
        "locationId": "test_loc_1",
        "rating": 5,
        "comment": "Should fail"
    }
    response = client.post("/api/reviews/", json=review)
    assert response.status_code == 401

def test_create_review_invalid_rating():
    token = get_auth_token()
    review = {
        "locationId": "test_loc_1",
        "rating": 10,
        "comment": "Invalid rating"
    }
    response = client.post("/api/reviews/", json=review, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 422

def test_register_and_login():
    # Register with strong password (letter + digit)
    user_data = {
        "email": "newuser@test.com",
        "displayName": "New User",
        "password": "secretpass1"
    }
    response = client.post("/api/auth/register", json=user_data)
    assert response.status_code == 200
    assert response.json()["email"] == "newuser@test.com"

    # Register duplicate
    response_dup = client.post("/api/auth/register", json=user_data)
    assert response_dup.status_code == 400

    # Login
    login_data = {"email": "newuser@test.com", "password": "secretpass1"}
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 200
    assert "access_token" in response.json()

    # Login invalid
    login_invalid = {"email": "newuser@test.com", "password": "wrongpassword"}
    response = client.post("/api/auth/login", json=login_invalid)
    assert response.status_code == 401

def test_register_weak_password():
    """Weak passwords should be rejected"""
    user_data = {
        "email": "weakpass@test.com",
        "displayName": "Weak Pass",
        "password": "onlyletters"  # no digit
    }
    response = client.post("/api/auth/register", json=user_data)
    assert response.status_code == 422

def test_register_short_password():
    """Short passwords should be rejected"""
    user_data = {
        "email": "shortpass@test.com",
        "displayName": "Short",
        "password": "Ab1"  # too short
    }
    response = client.post("/api/auth/register", json=user_data)
    assert response.status_code == 422

def test_get_me():
    # Login first to get a valid token
    login_data = {"email": "test@example.com", "password": "password123"}
    login_response = client.post("/api/auth/login", json=login_data)
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert "email" in response.json()

def test_get_me_unauthenticated():
    response = client.get("/api/auth/me")
    assert response.status_code == 401

def test_get_events():
    """Test getting events for a location"""
    if not mock_locations:
        return
    loc_id = mock_locations[0]["id"]
    response = client.get(f"/api/locations/{loc_id}/events")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_event():
    """Test creating an event for a location"""
    if not mock_locations:
        return
    loc_id = mock_locations[0]["id"]
    new_event = {
        "title": {"zh": "兒童生日派對", "en": "Kids Birthday Party"},
        "description": {"zh": "歡慶小壽星的日子", "en": "Celebrate a child's birthday"},
        "eventType": "birthday_party",
        "startDate": "2026-04-01T10:00:00",
        "endDate": "2026-04-01T12:00:00",
        "ageRange": {"minAge": 3, "maxAge": 10},
        "capacity": 20,
        "price": 500
    }
    response = client.post(f"/api/locations/{loc_id}/events", json=new_event)
    assert response.status_code == 200
    data = response.json()
    assert data["title"]["zh"] == "兒童生日派對"
    assert data["eventType"] == "birthday_party"
    assert "id" in data
    assert "locationId" in data
    assert data["locationId"] == loc_id

def test_create_event_not_found():
    """Test creating an event for a non-existent location"""
    new_event = {
        "title": {"zh": "測試活動", "en": "Test Event"},
        "description": {"zh": "測試", "en": "Test"},
        "eventType": "activity",
        "startDate": "2026-04-01T10:00:00",
        "endDate": "2026-04-01T12:00:00",
        "capacity": 10,
        "price": 0
    }
    response = client.post("/api/locations/invalid_loc_999/events", json=new_event)
    assert response.status_code == 404


# --- Featured & Search endpoint tests ---

def test_get_featured_locations():
    """GET /api/locations/featured returns a list of top-rated venues"""
    response = client.get("/api/locations/featured")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= 10  # default limit
    if len(data) > 1:
        ratings = [float(loc.get("averageRating", 0) or 0) for loc in data]
        assert ratings == sorted(ratings, reverse=True)


def test_get_featured_locations_custom_limit():
    """GET /api/locations/featured respects the limit param"""
    response = client.get("/api/locations/featured?limit=3")
    assert response.status_code == 200
    data = response.json()
    assert len(data) <= 3


def test_search_locations_by_name():
    """GET /api/locations/search finds locations by zh name"""
    response = client.get("/api/locations/search?q=大安")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert "has_next" in data
    assert data["total"] >= 1
    assert any("大安" in loc["name"]["zh"] for loc in data["items"])


def test_search_locations_english_query():
    """GET /api/locations/search finds locations by English name"""
    response = client.get("/api/locations/search?q=Park")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data["items"], list)


def test_search_locations_no_results():
    """GET /api/locations/search returns empty results for unmatched query"""
    response = client.get("/api/locations/search?q=xyzNonExistent999")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["items"] == []


def test_search_locations_pagination():
    """GET /api/locations/search supports pagination metadata"""
    r1 = client.get("/api/locations/search?q=公園&page=1&page_size=5")
    assert r1.status_code == 200
    d1 = r1.json()
    assert d1["page"] == 1
    assert d1["page_size"] == 5
    assert not d1["has_prev"]


def test_search_locations_with_category_filter():
    """GET /api/locations/search supports category filter"""
    response = client.get("/api/locations/search?q=公&category=park")
    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert item["category"] == "park"


def test_get_locations_with_text_filter():
    """GET /api/locations/ supports optional q text filter"""
    response = client.get("/api/locations/?lat=25.0330&lng=121.5654&radius=50000&q=大安")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    for loc in data:
        name_zh = loc.get("name", {}).get("zh", "")
        name_en = loc.get("name", {}).get("en", "")
        desc_zh = loc.get("description", {}).get("zh", "")
        desc_en = loc.get("description", {}).get("en", "")
        addr_zh = loc.get("address", {}).get("zh", "")
        addr_en = loc.get("address", {}).get("en", "")
        text = (name_zh + name_en + desc_zh + desc_en + addr_zh + addr_en).lower()
        assert "大安" in text


def test_search_empty_query_rejected():
    """GET /api/locations/search rejects empty/whitespace-only query"""
    response = client.get("/api/locations/search?q=")
    assert response.status_code == 422
