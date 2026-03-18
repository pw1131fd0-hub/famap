from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv
from .routers import location

load_dotenv()

app = FastAPI(title="FamMap API")

# CORS middleware
origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

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

# TODO: Add routers
# app.include_router(favorite_router, prefix="/api/favorites", tags=["favorites"])
# app.include_router(auth_router, prefix="/api/auth", tags=["auth"])

if __name__ == "__main__":
    port = int(os.getenv("PORT", 3000))
    uvicorn.run("server.main:app", host="0.0.0.0", port=port, reload=True)
