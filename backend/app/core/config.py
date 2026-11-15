"""
TerraTwin Application Configuration
======================================
Loads settings from environment variables or the .env file.
Never hard-code credentials in source code.
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "TerraTwin"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # Security
    SECRET_KEY: str = "change-this-secret-key-in-production"

    # Server
    BACKEND_HOST: str = "127.0.0.1"
    BACKEND_PORT: int = 8000
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    # Database
    DATABASE_URL: str = "sqlite:///./terratwin.db"

    # NASA Earthdata (register free at https://urs.earthdata.nasa.gov/)
    NASA_EARTHDATA_USERNAME: str = ""
    NASA_EARTHDATA_PASSWORD: str = ""
    NASA_CMR_API_URL: str = "https://cmr.earthdata.nasa.gov/search"
    NASA_API_KEY: str = "DEMO_KEY"
    NASA_PDS_API_URL: str = "https://pds.nasa.gov/api/search/1"
    NASA_POWER_API_URL: str = "https://power.larc.nasa.gov/api"

    # Data Directories
    RAW_DATA_DIR: str = "../data/raw"
    PROCESSED_DATA_DIR: str = "../data/processed"
    CACHE_DIR: str = "../data/cache"
    EXPORTS_DIR: str = "../data/exports"

    # Logging
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()

