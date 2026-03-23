"""Tests for monitoring router"""

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class TestErrorReporting:
    """Test client error reporting endpoint"""

    def test_report_error_success(self):
        """Test successful error report"""
        payload = {
            "message": "Test error message",
            "stack": "Error: test\n  at test.js:1",
            "severity": "high",
            "context": {"component": "TestComponent"},
            "userAgent": "test-agent",
            "url": "http://localhost:3000/test"
        }
        response = client.post("/api/monitoring/errors", json=payload)
        assert response.status_code == 200
        assert response.json()["status"] == "error_received"

    def test_report_error_minimal(self):
        """Test error report with minimal data"""
        payload = {"message": "Simple error"}
        response = client.post("/api/monitoring/errors", json=payload)
        assert response.status_code == 200

    def test_report_error_with_severity(self):
        """Test error report with different severity levels"""
        for severity in ["low", "medium", "high", "critical"]:
            payload = {
                "message": f"Error with {severity} severity",
                "severity": severity
            }
            response = client.post("/api/monitoring/errors", json=payload)
            assert response.status_code == 200

    def test_report_error_invalid_severity(self):
        """Test error report with invalid severity"""
        payload = {
            "message": "Error",
            "severity": "invalid"
        }
        response = client.post("/api/monitoring/errors", json=payload)
        assert response.status_code == 422  # Validation error


class TestPerformanceReporting:
    """Test performance metric reporting"""

    def test_report_performance_metric(self):
        """Test successful performance metric report"""
        payload = {
            "name": "api_call_duration",
            "value": 250.5,
            "category": "api",
            "context": {"endpoint": "/api/locations"}
        }
        response = client.post("/api/monitoring/performance", json=payload)
        assert response.status_code == 200
        assert response.json()["status"] == "metric_received"

    def test_report_multiple_metrics(self):
        """Test reporting multiple metrics"""
        metrics = [
            {"name": "page_load", "value": 1250.0, "category": "page"},
            {"name": "render_time", "value": 45.2, "category": "render"},
            {"name": "api_latency", "value": 350.0, "category": "api"}
        ]
        for metric in metrics:
            response = client.post("/api/monitoring/performance", json=metric)
            assert response.status_code == 200

    def test_report_metric_required_fields(self):
        """Test metric with required fields only"""
        payload = {
            "name": "test_metric",
            "value": 100.0
        }
        response = client.post("/api/monitoring/performance", json=payload)
        assert response.status_code == 200


class TestSessionReporting:
    """Test session metric reporting"""

    def test_report_session_metric(self):
        """Test successful session metric report"""
        payload = {
            "sessionId": "session-123",
            "eventType": "location_click",
            "eventData": {"locationId": "loc-456"}
        }
        response = client.post("/api/monitoring/session", json=payload)
        assert response.status_code == 200
        assert response.json()["status"] == "session_metric_received"

    def test_report_session_no_event_data(self):
        """Test session report without event data"""
        payload = {
            "sessionId": "session-789",
            "eventType": "page_view"
        }
        response = client.post("/api/monitoring/session", json=payload)
        assert response.status_code == 200


class TestMonitoringQueries:
    """Test monitoring query endpoints"""

    def test_get_error_stats(self):
        """Test getting error statistics"""
        response = client.get("/api/monitoring/errors")
        assert response.status_code == 200
        data = response.json()
        assert "error_stats" in data
        assert "recent_errors" in data
        assert "timestamp" in data

    def test_get_detailed_health(self):
        """Test getting detailed health status"""
        response = client.get("/api/monitoring/health/detailed")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "total_errors" in data
        assert "error_breakdown" in data


class TestMonitoringIntegration:
    """Integration tests for monitoring system"""

    def test_error_flow(self):
        """Test complete error reporting flow"""
        # Report an error
        error_payload = {
            "message": "Integration test error",
            "severity": "high",
            "context": {"test": True}
        }
        response = client.post("/api/monitoring/errors", json=error_payload)
        assert response.status_code == 200

        # Check error stats
        response = client.get("/api/monitoring/errors")
        assert response.status_code == 200

    def test_performance_tracking_flow(self):
        """Test complete performance tracking flow"""
        # Report performance metrics
        metrics = [
            {"name": "api_call", "value": 250.0, "category": "api"},
            {"name": "render", "value": 45.0, "category": "render"},
        ]
        for metric in metrics:
            response = client.post("/api/monitoring/performance", json=metric)
            assert response.status_code == 200

    def test_health_check_includes_monitoring(self):
        """Test that health check includes monitoring info"""
        response = client.get("/api/monitoring/health/detailed")
        assert response.status_code == 200
        assert "status" in response.json()
