from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
from contextlib import asynccontextmanager
import os
from datetime import datetime
import uvicorn
from database import create_tables
from api.auth import router as auth_router
# Import models after database setup to ensure proper initialization
import models

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for application startup and shutdown"""
    # Startup
    try:
        create_tables()
        print("Database tables created successfully")
    except Exception as e:
        print(f"Warning: Could not create database tables: {e}")
    
    yield
    
    # Shutdown (if needed)
    print("Application shutting down...")

# Initialize FastAPI app
app = FastAPI(
    title="BuildBidz API",
    description="Premium Construction Procurement Platform API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])

# Pydantic models
class User(BaseModel):
    id: str
    username: str
    email: str
    role: str
    created_at: datetime

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str

class Project(BaseModel):
    id: str
    title: str
    description: str
    budget: float
    status: str
    created_by: str
    created_at: datetime

class ProjectCreate(BaseModel):
    title: str
    description: str
    budget: float

# Basic routes
@app.get("/")
async def root():
    return {
        "message": "BuildBidz API - Premium Construction Procurement Platform",
        "version": "1.0.0",
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "BuildBidz API"
    }

# Auth routes are handled by auth_router

# Project routes
@app.get("/api/projects", response_model=List[Project])
async def get_projects():
    # TODO: Integrate with Supabase Database
    return []

@app.post("/api/projects")
async def create_project(project: ProjectCreate):
    # TODO: Integrate with Supabase Database
    return {"message": "Project creation endpoint - Supabase integration pending"}

# Dashboard routes
@app.get("/api/dashboard/stats")
async def get_dashboard_stats():
    # TODO: Integrate with Supabase Database
    return {
        "active_projects": 0,
        "pending_bids": 0,
        "total_savings": 0,
        "success_rate": 0
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )