from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from datetime import datetime
import uuid
from ..schemas import User, UserCreate, Token

router = APIRouter()

# Mock user data
mock_users = [
    {
        "id": "u1",
        "email": "test@example.com",
        "displayName": "Test User",
        "password": "password123", # In a real app, this should be hashed
        "createdAt": datetime.utcnow().isoformat() + "Z"
    }
]

@router.post("/register", response_model=User)
async def register(user: UserCreate):
    # Check if email exists
    for u in mock_users:
        if u["email"] == user.email:
            raise HTTPException(status_code=400, detail="Email already registered")
            
    new_user = {
        "id": str(uuid.uuid4()),
        "email": user.email,
        "displayName": user.displayName,
        "password": user.password,
        "createdAt": datetime.utcnow().isoformat() + "Z"
    }
    mock_users.append(new_user)
    
    # Return user without password
    return {k: v for k, v in new_user.items() if k != "password"}

@router.post("/login", response_model=Token)
async def login(user_data: dict):
    # In a real app, use OAuth2PasswordRequestForm
    email = user_data.get("email")
    password = user_data.get("password")
    
    for u in mock_users:
        if u["email"] == email and u["password"] == password:
            return {"access_token": f"fake-token-for-{u['id']}", "token_type": "bearer"}
            
    raise HTTPException(status_code=401, detail="Invalid email or password")

@router.get("/me", response_model=User)
async def get_current_user():
    # In a real app, verify token and extract user id
    # Mocking logged in user for now
    user = mock_users[0]
    return {k: v for k, v in user.items() if k != "password"}
