from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from supabase import Client
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from database import get_supabase
from typing import Optional

router = APIRouter()
security = HTTPBearer()

class UserRegister(BaseModel):
    email: str
    password: str
    username: str
    role: str
    company_name: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    role: str
    company_name: Optional[str] = None

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserRegister, supabase: Client = Depends(get_supabase)):
    """Register a new user with Supabase Auth"""
    try:
        # Create user in Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "username": user_data.username,
                    "role": user_data.role,
                    "company_name": user_data.company_name
                }
            }
        })
        
        if auth_response.user:
            # Insert user profile in database
            profile_data = {
                "id": auth_response.user.id,
                "email": user_data.email,
                "username": user_data.username,
                "role": user_data.role,
                "company_name": user_data.company_name
            }
            
            supabase.table("users").insert(profile_data).execute()
            
            return UserResponse(**profile_data)
        else:
            raise HTTPException(status_code=400, detail="Registration failed")
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def login(login_data: UserLogin, supabase: Client = Depends(get_supabase)):
    """Login user with Supabase Auth"""
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": login_data.email,
            "password": login_data.password
        })
        
        if auth_response.user and auth_response.session:
            user = auth_response.user
            session = auth_response.session
            return {
                "access_token": session.access_token,
                "refresh_token": session.refresh_token,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "username": user.user_metadata.get("username") if user.user_metadata else None,
                    "role": user.user_metadata.get("role") if user.user_metadata else None
                }
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@router.get("/me", response_model=UserResponse)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), supabase: Client = Depends(get_supabase)):
    """Get current user profile"""
    try:
        # Verify token with Supabase
        user_response = supabase.auth.get_user(credentials.credentials)
        
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid token")
            
        user = user_response.user
        if user:
            # Get user profile from database
            profile_response = supabase.table("users").select("*").eq("id", user.id).execute()
            
            if profile_response.data:
                return UserResponse(**profile_response.data[0])
            else:
                raise HTTPException(status_code=404, detail="User profile not found")
        else:
            raise HTTPException(status_code=401, detail="Invalid token")
            
    except Exception as e:
        raise HTTPException(status_code=401, detail="Authentication required")

@router.post("/logout")
async def logout(supabase: Client = Depends(get_supabase)):
    """Logout user"""
    try:
        supabase.auth.sign_out()
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))