from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv
from routers import location, favorite, review, auth
from data.seed_data import mock_locations
from data.auto_collect import fetch_osm_data, save_locations
import asyncio

load_dotenv()

app = FastAPI(title="FamMap API", redirect_slashes=False)

@app.on_event("startup")
async def startup_event():
    # If we have very few locations, try a quick fetch for central Taipei
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
    return {"status": "ok", "message": "FamMap API (FastAPI) is running"}

app.include_router(location.router, prefix="/api/locations", tags=["locations"])
app.include_router(favorite.router, prefix="/api/favorites", tags=["favorites"])
app.include_router(review.router, prefix="/api/reviews", tags=["reviews"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

if __name__ == "__main__":
    port = int(os.getenv("PORT", 3001))
    uvicorn.run("server.main:app", host="0.0.0.0", port=port, reload=True)
