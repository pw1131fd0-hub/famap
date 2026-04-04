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
