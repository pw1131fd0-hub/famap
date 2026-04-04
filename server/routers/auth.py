from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from datetime import datetime, timezone
import uuid
import hashlib
import secrets
import hmac
import base64
import json
import os
import sys
sys.path.append('..')
from schemas import User, UserCreate, Token

router = APIRouter()

SECRET_KEY = os.getenv("JWT_SECRET_KEY", secrets.token_urlsafe(32))

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return f"{salt}:{pwd_hash.hex()}"

def verify_password(password: str, hashed_password: str) -> bool:
    try:
        salt, pwd_hash = hashed_password.split(':')
        expected_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return expected_hash.hex() == pwd_hash
    except ValueError:
        return False

def create_jwt(payload: dict) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    b64_header = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip('=')
    b64_payload = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip('=')

    signature = hmac.new(SECRET_KEY.encode(), f"{b64_header}.{b64_payload}".encode(), hashlib.sha256).digest()
    b64_signature = base64.urlsafe_b64encode(signature).decode().rstrip('=')

    return f"{b64_header}.{b64_payload}.{b64_signature}"


def verify_jwt(token: str) -> Optional[dict]:
    """Verify JWT and return payload, or None if invalid"""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        b64_header, b64_payload, b64_sig = parts
        expected_sig = hmac.new(
            SECRET_KEY.encode(),
            f"{b64_header}.{b64_payload}".encode(),
            hashlib.sha256
        ).digest()
        expected_b64 = base64.urlsafe_b64encode(expected_sig).decode().rstrip("=")
        if not hmac.compare_digest(expected_b64, b64_sig):
            return None
        # Decode payload
        padded = b64_payload + "=" * (4 - len(b64_payload) % 4)
        payload = json.loads(base64.urlsafe_b64decode(padded).decode())
        # Check expiry
        if payload.get("exp", 0) < int(datetime.now(timezone.utc).timestamp()):
            return None
        return payload
    except Exception:
        return None


async def get_current_user_dep(authorization: Optional[str] = Header(None)) -> dict:
    """Dependency: extract and validate Bearer token, return user dict"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization[7:]
    payload = verify_jwt(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user_id = payload.get("sub")
    user = next((u for u in mock_users if u["id"] == user_id), None)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# Mock user data with secure hashed password
mock_users = [
    {
        "id": "u1",
        "email": "test@example.com",
        "displayName": "Test User",
        "password": hash_password("password123"),
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
]

@router.post("/register", response_model=User)
async def register(user: UserCreate):
    for u in mock_users:
        if u["email"] == user.email:
            raise HTTPException(status_code=400, detail="Email already registered")
            
    new_user = {
        "id": str(uuid.uuid4()),
        "email": user.email,
        "displayName": user.displayName,
        "password": hash_password(user.password),
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    mock_users.append(new_user)
    
    return {k: v for k, v in new_user.items() if k != "password"}

@router.post("/login", response_model=Token)
async def login(user_data: dict):
    email = user_data.get("email")
    password = user_data.get("password", "")
    
    for u in mock_users:
        if u["email"] == email and verify_password(password, u["password"]):
            token = create_jwt({"sub": u["id"], "exp": int(datetime.now(timezone.utc).timestamp()) + 3600})
            return {"access_token": token, "token_type": "bearer"}
            
    raise HTTPException(status_code=401, detail="Invalid email or password")

@router.get("/me", response_model=User)
async def get_current_user(user: dict = Depends(get_current_user_dep)):
    return {k: v for k, v in user.items() if k != "password"}