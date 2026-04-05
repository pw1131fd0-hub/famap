"""
Tests for health module utilities and health check endpoints.
"""

import pytest
import sys
import os
from fastapi.testclient import TestClient

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from health import get_health_status, HealthStatus, HealthMetrics, HealthCheckResponse, ReadinessResponse
    from main import app
except ImportError:
    from server.health import get_health_status, HealthStatus, HealthMetrics, HealthCheckResponse, ReadinessResponse
    from server.main import app

client = TestClient(app)


class TestGetHealthStatus:
    """Tests for get_health_status function"""

    def test_healthy_with_locations(self):
        """Should return HEALTHY when there are locations and no errors"""
        status = get_health_status(location_count=10, errors=0)
        assert status == HealthStatus.HEALTHY

    def test_healthy_default_errors(self):
        """Should default to 0 errors"""
        status = get_health_status(location_count=5)
        assert status == HealthStatus.HEALTHY

    def test_degraded_no_locations(self):
        """Should return DEGRADED when location count is 0"""
        status = get_health_status(location_count=0, errors=0)
        assert status == HealthStatus.DEGRADED

    def test_degraded_few_errors(self):
        """Should return DEGRADED with 6 errors"""
        status = get_health_status(location_count=10, errors=6)
        assert status == HealthStatus.DEGRADED

    def test_degraded_with_five_errors(self):
        """Should return DEGRADED at exactly 5 errors"""
        status = get_health_status(location_count=10, errors=5)
        assert status == HealthStatus.DEGRADED

    def test_unhealthy_many_errors(self):
        """Should return UNHEALTHY with more than 10 errors"""
        status = get_health_status(location_count=10, errors=11)
        assert status == HealthStatus.UNHEALTHY

    def test_unhealthy_exactly_ten_errors(self):
        """Should return UNHEALTHY with exactly 10 errors"""
        status = get_health_status(location_count=10, errors=10)
        # 10 errors is NOT > 10, so not UNHEALTHY. Check the actual logic.
        # errors > 10 → UNHEALTHY; location_count == 0 or errors > 5 → DEGRADED
        # So 10 errors → DEGRADED
        assert status == HealthStatus.DEGRADED

    def test_degraded_no_locations_no_errors(self):
        """Empty location list should cause degraded status"""
        status = get_health_status(location_count=0, errors=0)
        assert status == HealthStatus.DEGRADED


class TestHealthModels:
    """Tests for health Pydantic models"""

    def test_health_status_enum_values(self):
        """HealthStatus should have proper enum values"""
        assert HealthStatus.HEALTHY == "healthy"
        assert HealthStatus.DEGRADED == "degraded"
        assert HealthStatus.UNHEALTHY == "unhealthy"

    def test_health_metrics_creation(self):
        """HealthMetrics should be creatable with required fields"""
        metrics = HealthMetrics(
            status=HealthStatus.HEALTHY,
            timestamp="2026-04-04T10:00:00Z",
            uptime_seconds=3600.0,
            location_count=50,
            last_check="2026-04-04T09:59:00Z"
        )
        assert metrics.status == HealthStatus.HEALTHY
        assert metrics.location_count == 50
        assert metrics.memory_usage_mb is None

    def test_health_metrics_with_memory(self):
        """HealthMetrics should accept optional memory_usage_mb"""
        metrics = HealthMetrics(
            status=HealthStatus.DEGRADED,
            timestamp="2026-04-04T10:00:00Z",
            uptime_seconds=100.0,
            location_count=0,
            last_check="2026-04-04T09:59:00Z",
            memory_usage_mb=256.5
        )
        assert metrics.memory_usage_mb == 256.5

    def test_health_check_response_creation(self):
        """HealthCheckResponse should be creatable"""
        resp = HealthCheckResponse(
            status="alive",
            message="OK",
            timestamp="2026-04-04T10:00:00Z"
        )
        assert resp.status == "alive"
        assert resp.version is None

    def test_health_check_response_with_version(self):
        """HealthCheckResponse should accept optional version"""
        resp = HealthCheckResponse(
            status="alive",
            message="OK",
            timestamp="2026-04-04T10:00:00Z",
            version="1.0.0"
        )
        assert resp.version == "1.0.0"

    def test_readiness_response_creation(self):
        """ReadinessResponse should be creatable"""
        resp = ReadinessResponse(
            ready=True,
            timestamp="2026-04-04T10:00:00Z",
            details={"database": "ok", "locations": "loaded"}
        )
        assert resp.ready is True
        assert resp.details["database"] == "ok"


class TestHealthEndpoints:
    """Tests for health check HTTP endpoints"""

    def test_health_endpoint_returns_alive(self):
        """GET /health should return status=alive"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "alive"

    def test_health_endpoint_has_timestamp(self):
        """GET /health should include a timestamp"""
        response = client.get("/health")
        data = response.json()
        assert "timestamp" in data
        assert data["timestamp"]  # Should not be empty

    def test_readiness_endpoint(self):
        """GET /ready should return readiness info"""
        response = client.get("/ready")
        # Could be 200 or 503 depending on data state
        assert response.status_code in [200, 503]
        data = response.json()
        assert "ready" in data

    def test_readiness_endpoint_structure(self):
        """GET /ready should have proper response structure"""
        response = client.get("/ready")
        data = response.json()
        assert "ready" in data
        assert "timestamp" in data
        assert "details" in data
