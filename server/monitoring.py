"""Monitoring and logging infrastructure for FamMap API"""

import logging
import json
from datetime import datetime, UTC
from typing import Any, Optional
import os

# Configure structured logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_FORMAT = os.getenv("LOG_FORMAT", "json")  # json or text

if LOG_FORMAT == "json":
    class JSONFormatter(logging.Formatter):
        """JSON log formatter for structured logging"""
        def format(self, record: logging.LogRecord) -> str:
            log_data = {
                "timestamp": datetime.now(UTC).isoformat(),
                "level": record.levelname,
                "logger": record.name,
                "message": record.getMessage(),
                "module": record.module,
                "function": record.funcName,
                "line": record.lineno,
            }
            if record.exc_info:
                log_data["exception"] = self.formatException(record.exc_info)
            return json.dumps(log_data)
else:
    class JSONFormatter(logging.Formatter):
        """Text log formatter"""
        def format(self, record: logging.LogRecord) -> str:
            return (
                f"[{datetime.now(UTC).isoformat()}] "
                f"{record.levelname:8} {record.name}: {record.getMessage()}"
            )


def setup_logging(name: str) -> logging.Logger:
    """Setup structured logging for the application

    Args:
        name: Logger name (typically __name__)

    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, LOG_LEVEL))

    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(JSONFormatter())
        logger.addHandler(handler)

    return logger


class RequestLogger:
    """Context manager for logging API requests"""

    def __init__(self, logger: logging.Logger, method: str, path: str):
        self.logger = logger
        self.method = method
        self.path = path
        self.start_time = datetime.now(UTC)

    def __enter__(self):
        self.logger.info(f"Request started: {self.method} {self.path}")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        duration = (datetime.now(UTC) - self.start_time).total_seconds()
        if exc_type:
            self.logger.error(
                f"Request failed: {self.method} {self.path} ({duration:.2f}s)",
                exc_info=(exc_type, exc_val, exc_tb)
            )
        else:
            self.logger.info(
                f"Request completed: {self.method} {self.path} ({duration:.2f}s)"
            )


class ErrorTracker:
    """Track and report errors"""

    def __init__(self, max_recent: int = 100):
        self.errors: list[dict] = []
        self.max_recent = max_recent
        self.logger = setup_logging(__name__)

    def record_error(self, error_type: str, message: str, **kwargs) -> None:
        """Record an error

        Args:
            error_type: Type of error (e.g., "validation", "database", "external_api")
            message: Error message
            **kwargs: Additional context
        """
        error_record = {
            "timestamp": datetime.now(UTC).isoformat(),
            "type": error_type,
            "message": message,
            **kwargs
        }
        self.errors.append(error_record)

        # Keep only recent errors
        if len(self.errors) > self.max_recent:
            self.errors = self.errors[-self.max_recent:]

        self.logger.error(f"Error recorded: {error_type}: {message}", extra=kwargs)

    def get_recent_errors(self, limit: int = 10) -> list[dict]:
        """Get recent errors

        Args:
            limit: Maximum number of errors to return

        Returns:
            List of recent error records
        """
        return self.errors[-limit:]

    def get_error_stats(self) -> dict[str, int]:
        """Get error statistics

        Returns:
            Dictionary with error counts by type
        """
        stats: dict[str, int] = {}
        for error in self.errors:
            error_type = error.get("type", "unknown")
            stats[error_type] = stats.get(error_type, 0) + 1
        return stats


# Global error tracker
error_tracker = ErrorTracker()
