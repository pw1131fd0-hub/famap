from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv
from routers import location, favorite, review, auth

load_dotenv()

app = FastAPI(title="FamMap API")

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
