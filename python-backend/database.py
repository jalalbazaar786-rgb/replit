import os
from supabase import create_client, Client
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
DATABASE_URL = os.getenv("DATABASE_URL", "")

# Initialize Supabase client
supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Database configuration for direct SQL access
engine = None
SessionLocal = None
Base = declarative_base()

if DATABASE_URL:
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

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
        raise Exception("Supabase not configured")