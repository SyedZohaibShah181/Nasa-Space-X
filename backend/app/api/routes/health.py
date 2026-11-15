"""
Health check routes
Verify that the TerraTwin API is running correctly.
"""
from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/api/health", summary="Health check")
def health_check():
    """
    Returns the current health status of the TerraTwin API.
    Use this endpoint to verify the backend is reachable.
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "service": "TerraTwin API",
        "version": "1.0.0",
    }

