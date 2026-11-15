"""
Candidate sites routes
Queries Earth analog candidate locations from the database.
"""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.models.all_models import CandidateSite

router = APIRouter()


@router.get("/sites", summary="List Earth analog candidate sites")
def list_sites(
    planet: Optional[str] = Query(None, description="Filter by planetary target: 'moon' or 'mars'"),
    min_score: Optional[float] = Query(None, description="Minimum analog score (0-100)"),
    db: Session = Depends(get_db),
):
    """
    Returns Earth analog candidate sites.
    Supports filtering by target planet and minimum ACS score.
    """
    query = db.query(CandidateSite)
    if planet:
        query = query.filter(CandidateSite.planetary_target == planet.lower())
    if min_score is not None:
        query = query.filter(CandidateSite.analog_score >= min_score)

    sites = query.order_by(CandidateSite.analog_score.desc()).all()

    return {
        "count": len(sites),
        "data_status": "DEMO_DATA",
        "filters": {"planet": planet, "min_score": min_score},
        "sites": [
            {
                "id": s.id,
                "name": s.name,
                "country": s.country,
                "latitude": s.latitude,
                "longitude": s.longitude,
                "environment_type": s.environment_type,
                "planetary_target": s.planetary_target,
                "analog_score": s.analog_score,
                "features": s.features,
                "why_analog": s.why_analog,
                "research_status": s.research_status,
                "data_sources": s.data_sources,
                "data_status": s.data_status,
            }
            for s in sites
        ],
    }


@router.get("/sites/{site_id}", summary="Get site details")
def get_site(site_id: str, db: Session = Depends(get_db)):
    """Returns full details for a specific Earth analog candidate site."""
    s = db.query(CandidateSite).filter(CandidateSite.id == site_id).first()
    if not s:
        raise HTTPException(status_code=404, detail=f"Site '{site_id}' not found.")
    return {
        "data_status": s.data_status,
        "site": {
            "id": s.id,
            "name": s.name,
            "country": s.country,
            "latitude": s.latitude,
            "longitude": s.longitude,
            "environment_type": s.environment_type,
            "planetary_target": s.planetary_target,
            "analog_score": s.analog_score,
            "features": s.features,
            "why_analog": s.why_analog,
            "research_status": s.research_status,
            "data_sources": s.data_sources,
            "data_status": s.data_status,
        },
    }
