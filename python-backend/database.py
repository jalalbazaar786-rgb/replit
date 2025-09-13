import os
from supabase import create_client, Client
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Create the declarative base here to avoid circular imports
Base = declarative_base()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
DATABASE_URL = os.getenv("DATABASE_URL", "")

# Initialize Supabase client
supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Warning: Could not initialize Supabase client: {e}")

# Database configuration for direct SQL access
engine = None
SessionLocal = None

# Only create engine if we have a proper PostgreSQL connection string
if DATABASE_URL and DATABASE_URL.startswith('postgresql'):
    try:
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        print(f"SQLAlchemy engine created successfully")
    except Exception as e:
        print(f"Warning: Could not create SQLAlchemy engine: {e}")
elif DATABASE_URL:
    print(f"Note: DATABASE_URL is not a PostgreSQL connection string: {DATABASE_URL}")
    print("SQLAlchemy engine not created - using Supabase client only")

def get_db():
    """Get database session"""
    if SessionLocal:
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
    else:
        raise Exception("Database not configured")

def get_supabase():
    """Get Supabase client"""
    if supabase:
        return supabase
    else:
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="Supabase not configured - missing SUPABASE_URL or SUPABASE_KEY")

def create_tables():
    """Create all tables in the database"""
    if engine:
        Base.metadata.create_all(bind=engine)