import os
from pydantic import BaseSettings

class Settings(BaseSettings):
    # Supabase Configuration
    supabase_url: str = ""
    supabase_key: str = ""
    supabase_service_key: str = ""
    
    # Database Configuration
    database_url: str = ""
    
    # JWT Configuration  
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # API Configuration
    api_prefix: str = "/api"
    debug: bool = True
    
    # CORS Configuration
    allowed_origins: list = ["http://localhost:3000", "http://localhost:5000"]
    
    class Config:
        env_file = ".env"

settings = Settings()