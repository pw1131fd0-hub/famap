"""Custom middleware for error handling and request tracking"""

import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """Middleware for consistent error handling"""

    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except Exception as exc:
            logger.error(
                f"Unhandled exception in {request.method} {request.url.path}: {str(exc)}",
                exc_info=exc
            )
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Internal server error",
                    "detail": "An unexpected error occurred. Please try again.",
                    "path": request.url.path,
                }
            )


class RequestTimingMiddleware(BaseHTTPMiddleware):
    """Middleware to log request timing"""

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)

        # Log slow requests
        if process_time > 1.0:
            logger.warning(
                f"Slow request: {request.method} {request.url.path} took {process_time:.2f}s"
            )

        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log all requests"""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # Log request details
        logger.info(
            f"{request.method} {request.url.path} - {response.status_code}",
            extra={
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "client": request.client.host if request.client else "unknown",
            }
        )

        return response
