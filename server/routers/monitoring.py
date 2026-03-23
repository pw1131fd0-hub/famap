"""Monitoring router for error tracking and analytics"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime, UTC
from monitoring import setup_logging, error_tracker

router = APIRouter(prefix="/api/monitoring", tags=["monitoring"])
logger = setup_logging(__name__)


class ErrorReport(BaseModel):
    """Client-side error report"""
    message: str
    stack: Optional[str] = None
    severity: str = Field(default="medium", pattern="^(low|medium|high|critical)$")
    context: Optional[dict[str, Any]] = None
    userAgent: Optional[str] = None
    url: Optional[str] = None
    timestamp: Optional[str] = None


class PerformanceMetric(BaseModel):
    """Client-side performance metric"""
    name: str
    value: float  # in milliseconds
    category: Optional[str] = None
    context: Optional[dict[str, Any]] = None


class SessionMetric(BaseModel):
    """User session metric"""
    sessionId: str
    eventType: str
    eventData: Optional[dict[str, Any]] = None
    timestamp: Optional[str] = None


@router.post("/errors")
async def report_error(error_report: ErrorReport) -> dict:
    """Receive and log client-side errors

    Args:
        error_report: Client error report with stack trace and context

    Returns:
        Confirmation of error receipt
    """
    try:
        error_data = {
            "source": "client",
            "severity": error_report.severity,
            "userAgent": error_report.userAgent,
            "url": error_report.url,
            "context": error_report.context,
        }

        error_tracker.record_error(
            error_type="client_error",
            message=error_report.message,
            stack_trace=error_report.stack,
            **error_data
        )

        logger.error(
            f"Client error ({error_report.severity}): {error_report.message}",
            extra={
                "error_stack": error_report.stack,
                "context": error_report.context,
                "url": error_report.url,
            }
        )

        return {
            "status": "error_received",
            "message": "Error report received and logged",
            "timestamp": datetime.now(UTC).isoformat()
        }
    except Exception as e:
        logger.error(f"Failed to process error report: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process error report")


@router.post("/performance")
async def report_performance(metric: PerformanceMetric) -> dict:
    """Receive and track performance metrics

    Args:
        metric: Performance metric with name and duration

    Returns:
        Confirmation of metric receipt
    """
    try:
        logger.info(
            f"Performance metric: {metric.name}={metric.value:.2f}ms",
            extra={
                "category": metric.category,
                "context": metric.context,
            }
        )

        return {
            "status": "metric_received",
            "message": "Performance metric recorded",
            "timestamp": datetime.now(UTC).isoformat()
        }
    except Exception as e:
        logger.error(f"Failed to process performance metric: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process metric")


@router.post("/session")
async def report_session(metric: SessionMetric) -> dict:
    """Receive and track user session metrics

    Args:
        metric: Session metric with session ID and event data

    Returns:
        Confirmation of session metric receipt
    """
    try:
        logger.info(
            f"Session event: {metric.eventType} (session={metric.sessionId})",
            extra={
                "sessionId": metric.sessionId,
                "eventData": metric.eventData,
            }
        )

        return {
            "status": "session_metric_received",
            "message": "Session metric recorded",
            "timestamp": datetime.now(UTC).isoformat()
        }
    except Exception as e:
        logger.error(f"Failed to process session metric: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process session metric")


@router.get("/errors")
async def get_error_stats() -> dict:
    """Get error statistics

    Returns:
        Error counts by type
    """
    stats = error_tracker.get_error_stats()
    recent_errors = error_tracker.get_recent_errors(limit=5)

    return {
        "error_stats": stats,
        "recent_errors": recent_errors,
        "timestamp": datetime.now(UTC).isoformat()
    }


@router.get("/health/detailed")
async def detailed_health() -> dict:
    """Get detailed health status with monitoring info

    Returns:
        Detailed health metrics
    """
    stats = error_tracker.get_error_stats()
    total_errors = sum(stats.values())

    return {
        "status": "healthy",
        "total_errors": total_errors,
        "error_breakdown": stats,
        "last_updated": datetime.now(UTC).isoformat()
    }
