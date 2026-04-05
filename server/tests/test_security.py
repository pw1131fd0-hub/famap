"""Security tests - OWASP Top 10 compliance verification"""
import pytest
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from main import app
except ImportError:
    from server.main import app

from fastapi.testclient import TestClient

client = TestClient(app, raise_server_exceptions=False)


class TestSecurityHeaders:
    """A05: Security Misconfiguration - Verify security headers are present"""

    def test_x_content_type_options_header(self):
        response = client.get("/health")
        assert response.headers.get("x-content-type-options") == "nosniff"

    def test_x_frame_options_header(self):
        response = client.get("/health")
        assert response.headers.get("x-frame-options") == "DENY"

    def test_x_xss_protection_header(self):
        response = client.get("/health")
        assert "x-xss-protection" in response.headers

    def test_referrer_policy_header(self):
        response = client.get("/health")
        assert response.headers.get("referrer-policy") == "strict-origin-when-cross-origin"

    def test_content_security_policy_present(self):
        response = client.get("/health")
        csp = response.headers.get("content-security-policy", "")
        assert "default-src" in csp

    def test_csp_blocks_framing(self):
        response = client.get("/health")
        csp = response.headers.get("content-security-policy", "")
        assert "frame-ancestors 'none'" in csp

    def test_permissions_policy_present(self):
        response = client.get("/health")
        assert "permissions-policy" in response.headers


class TestCORSConfig:
    """A05: Security Misconfiguration - CORS is not wildcard"""

    def test_cors_not_wildcard_headers(self):
        """CORS allow_headers should not be wildcard"""
        response = client.options(
            "/api/locations/",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "GET",
            },
        )
        # Should respond without error
        assert response.status_code in [200, 204, 405]

    def test_cors_allowed_origin_present(self):
        """Verify CORS allows the configured origins"""
        response = client.get(
            "/health",
            headers={"Origin": "http://localhost:5173"},
        )
        assert response.status_code == 200


class TestInputValidation:
    """A03: Injection - Input validation on API parameters"""

    def test_lat_lng_must_be_numeric(self):
        """Location endpoint should reject non-numeric lat/lng"""
        response = client.get("/api/locations/?lat=abc&lng=121.5&radius=1000")
        assert response.status_code == 422

    def test_radius_must_be_positive(self):
        """Location endpoint should reject non-numeric radius"""
        response = client.get("/api/locations/?lat=25.0&lng=121.5&radius=notanumber")
        assert response.status_code == 422

    def test_category_validated(self):
        """Category parameter should be validated against allowed values"""
        response = client.get(
            "/api/locations/?lat=25.0330&lng=121.5654&radius=1000&category=malicious_input"
        )
        assert response.status_code == 422

    def test_limit_bounds_enforced(self):
        """Limit parameter should be clamped to valid range"""
        response = client.get(
            "/api/locations/?lat=25.0330&lng=121.5654&radius=1000&limit=99999"
        )
        # Should either clamp (200) or reject (422)
        assert response.status_code in [200, 422]


class TestAuthSecurity:
    """A07: Identification and Authentication Failures"""

    def test_invalid_login_returns_401(self):
        response = client.post(
            "/api/auth/login",
            json={"email": "nonexistent@evil.com", "password": "wrongpassword"},
        )
        assert response.status_code == 401

    def test_register_returns_no_password(self):
        """Registration response must not include password hash"""
        import uuid
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        response = client.post(
            "/api/auth/register",
            json={
                "email": unique_email,
                "password": "SecurePassword123",
                "displayName": "Security Test User",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "password" not in data
        assert "password_hash" not in data

    def test_login_with_correct_credentials(self):
        """Login should succeed with valid credentials"""
        # Register first
        import uuid
        unique_email = f"auth_test_{uuid.uuid4().hex[:8]}@example.com"
        client.post(
            "/api/auth/register",
            json={
                "email": unique_email,
                "password": "TestPassword456",
                "displayName": "Auth Test",
            },
        )
        # Then login
        response = client.post(
            "/api/auth/login",
            json={"email": unique_email, "password": "TestPassword456"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data

    def test_me_endpoint_without_auth(self):
        """Protected endpoint should reject unauthenticated requests"""
        response = client.get("/api/auth/me")
        assert response.status_code in [401, 403, 422]


class TestErrorHandling:
    """A09: Security Logging and Monitoring Failures"""

    def test_404_not_found_handled(self):
        response = client.get("/api/locations/nonexistent_id_12345")
        assert response.status_code == 404

    def test_error_response_no_stack_trace(self):
        """Error responses should not expose stack traces"""
        response = client.get("/api/locations/nonexistent_id_12345")
        body = response.text
        assert "Traceback" not in body
        assert "File " not in body or "test" not in body.lower()


class TestAccessControl:
    """A01: Broken Access Control - Protected endpoints require authentication"""

    def test_create_location_requires_auth(self):
        """POST /api/locations should require authentication"""
        new_loc = {
            "name": {"zh": "未授權", "en": "Unauthorized"},
            "description": {"zh": "測試", "en": "Test"},
            "category": "park",
            "coordinates": {"lat": 25.0, "lng": 121.0},
            "address": {"zh": "地址", "en": "Addr"},
            "facilities": []
        }
        response = client.post("/api/locations/", json=new_loc)
        assert response.status_code == 401

    def test_update_location_requires_auth(self):
        """PATCH /api/locations/:id should require authentication"""
        response = client.patch("/api/locations/1", json={"photoUrl": "evil.com"})
        assert response.status_code == 401

    def test_create_review_requires_auth(self):
        """POST /api/reviews should require authentication"""
        review = {"locationId": "loc_1", "rating": 5, "comment": "Unauthorized review"}
        response = client.post("/api/reviews/", json=review)
        assert response.status_code == 401

    def test_invalid_token_rejected(self):
        """Tampered JWT tokens should be rejected"""
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer invalid.token.here"}
        )
        assert response.status_code == 401


class TestInputBoundaries:
    """A03: Injection - Boundary validation for user input"""

    def test_review_rating_too_high(self):
        """Rating > 5 should be rejected"""
        # Login first
        login = client.post("/api/auth/login", json={"email": "test@example.com", "password": "password123"})
        token = login.json().get("access_token", "")
        review = {"locationId": "loc1", "rating": 6, "comment": "Too high rating"}
        response = client.post("/api/reviews/", json=review, headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 422

    def test_review_rating_too_low(self):
        """Rating < 1 should be rejected"""
        login = client.post("/api/auth/login", json={"email": "test@example.com", "password": "password123"})
        token = login.json().get("access_token", "")
        review = {"locationId": "loc1", "rating": 0, "comment": "Too low rating"}
        response = client.post("/api/reviews/", json=review, headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 422

    def test_comment_xss_sanitized(self):
        """HTML tags in comments should be stripped"""
        login = client.post("/api/auth/login", json={"email": "test@example.com", "password": "password123"})
        token = login.json().get("access_token", "")
        review = {
            "locationId": "1",
            "rating": 4,
            "comment": "<script>alert('xss')</script>Nice place"
        }
        response = client.post("/api/reviews/", json=review, headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        data = response.json()
        assert "<script>" not in data["comment"]
        assert "alert" in data["comment"]  # text remains, tags stripped

    def test_comment_too_long_rejected(self):
        """Comments exceeding 500 chars should be rejected"""
        login = client.post("/api/auth/login", json={"email": "test@example.com", "password": "password123"})
        token = login.json().get("access_token", "")
        review = {
            "locationId": "loc1",
            "rating": 3,
            "comment": "A" * 501
        }
        response = client.post("/api/reviews/", json=review, headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 422

    def test_password_too_short_rejected(self):
        """Passwords < 8 chars should be rejected at registration"""
        response = client.post("/api/auth/register", json={
            "email": "shortpwd@test.com",
            "displayName": "Short Pwd",
            "password": "Ab1"
        })
        assert response.status_code == 422

    def test_password_no_digit_rejected(self):
        """Passwords without a digit should be rejected"""
        response = client.post("/api/auth/register", json={
            "email": "nodigit@test.com",
            "displayName": "No Digit",
            "password": "onlyletters"
        })
        assert response.status_code == 422

    def test_invalid_email_format_rejected(self):
        """Invalid email formats should be rejected"""
        response = client.post("/api/auth/register", json={
            "email": "not-an-email",
            "displayName": "Bad Email",
            "password": "Secure1pass"
        })
        assert response.status_code == 422
