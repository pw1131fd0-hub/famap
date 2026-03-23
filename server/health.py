"""Health check and monitoring module for FamMap API"""

from datetime import datetime
from enum import Enum
from pydantic import BaseModel
from typing import Optional


class HealthStatus(str, Enum):
    """Health status enum"""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"


class HealthMetrics(BaseModel):
    """Health metrics model"""
    status: HealthStatus
    timestamp: str
    uptime_seconds: float
    memory_usage_mb: Optional[float] = None
    location_count: int
    last_check: str


class HealthCheckResponse(BaseModel):
    """Health check response model"""
    status: str
    message: str
    timestamp: str
    version: Optional[str] = None


class ReadinessResponse(BaseModel):
    """Readiness check response model"""
    ready: bool
    timestamp: str
    details: dict


def get_health_status(location_count: int, errors: int = 0) -> HealthStatus:
    """Determine health status based on metrics

    Args:
        location_count: Number of available locations
        errors: Recent error count

    Returns:
        HealthStatus enum value
    """
    if errors > 10:
        return HealthStatus.UNHEALTHY
    if location_count == 0 or errors > 5:
        return HealthStatus.DEGRADED
    return HealthStatus.HEALTHY
