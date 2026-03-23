from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
import os
from datetime import datetime, UTC
from dotenv import load_dotenv
from routers import location, favorite, review, auth, recommendations
from data.seed_data import mock_locations
from data.auto_collect import fetch_osm_data, save_locations
from middleware import ErrorHandlingMiddleware, RequestTimingMiddleware, RequestLoggingMiddleware
from monitoring import setup_logging

load_dotenv()

# Setup logging
logger = setup_logging(__name__)

# Version and environment info
VERSION = "5.0.0"
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
START_TIME = datetime.now(UTC)

logger.info(f"FamMap API v{VERSION} starting in {ENVIRONMENT} mode")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup event
    if len(mock_locations) < 10:
        print("Initial location count low. Fetching default Taipei spots...")
        new_locs = await fetch_osm_data(25.0330, 121.5654, 5000)
        if new_locs:
            # Avoid duplicates
            existing_ids = {loc["id"] for loc in mock_locations}
            for loc in new_locs:
                if loc["id"] not in existing_ids:
                    mock_locations.append(loc)
            save_locations(new_locs)
            print(f"Pre-loaded {len(new_locs)} locations.")
    yield
    # Shutdown event (cleanup if needed)
    pass

app = FastAPI(
    title="FamMap API",
    version=VERSION,
    description="Family-friendly location discovery platform",
    redirect_slashes=False,
    lifespan=lifespan
)

# Add middleware in reverse order (last added = first executed)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(RequestTimingMiddleware)
app.add_middleware(ErrorHandlingMiddleware)

# CORS middleware
origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
origins = [origin.strip() for origin in origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Liveness probe - returns immediately if server is alive"""
    return {"status": "alive", "timestamp": datetime.now(UTC).isoformat()}

@app.get("/health/ready")
async def readiness_check():
    """Readiness probe - checks if server is ready to accept traffic"""
    try:
        data_count = len(mock_locations)
        return JSONResponse(
            status_code=200 if data_count > 0 else 503,
            content={
                "status": "ready" if data_count > 0 else "initializing",
                "locations_available": data_count,
                "timestamp": datetime.now(UTC).isoformat()
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={"status": "error", "message": str(e)}
        )

@app.get("/health/live")
async def liveness_check():
    """Detailed liveness check with environment info"""
    uptime_seconds = (datetime.now(UTC) - START_TIME).total_seconds()
    return {
        "status": "live",
        "version": VERSION,
        "environment": ENVIRONMENT,
        "uptime_seconds": uptime_seconds,
        "started_at": START_TIME.isoformat(),
        "timestamp": datetime.now(UTC).isoformat()
    }

@app.get("/version")
async def version_info():
    """Get API version and build information"""
    return {
        "version": VERSION,
        "environment": ENVIRONMENT,
        "api_title": "FamMap API",
        "documentation": "/docs"
    }

app.include_router(location.router, prefix="/api/locations", tags=["locations"])
app.include_router(favorite.router, prefix="/api/favorites", tags=["favorites"])
app.include_router(review.router, prefix="/api/reviews", tags=["reviews"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["recommendations"])

if __name__ == "__main__":
    port = int(os.getenv("PORT", 3001))
    uvicorn.run("server.main:app", host="0.0.0.0", port=port, reload=True)
