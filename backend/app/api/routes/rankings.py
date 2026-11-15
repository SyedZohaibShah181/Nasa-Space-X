"""
Rankings routes
Queries ranked candidate analog sites from the database.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.models.all_models import CandidateSite

router = APIRouter()


@router.get("/rankings", summary="Get ranked analog sites")
def get_rankings(
    planet: Optional[str] = Query(None, description="Filter by planet: 'moon' or 'mars'"),
    limit: int = Query(10, description="Number of results to return"),
    db: Session = Depends(get_db),
):
    """Returns Earth analog sites ranked by Analog Compatibility Score from the database."""
    query = db.query(CandidateSite)
    if planet:
        query = query.filter(CandidateSite.planetary_target == planet.lower())

    sites = query.order_by(CandidateSite.analog_score.desc()).limit(limit).all()

    return {
        "data_status": "DEMO_DATA",
        "warning": "Scores based on baseline demonstration parameters until Milestone 7 automated scoring.",
        "total": len(sites),
        "filters": {"planet": planet},
        "rankings": [
            {
                "rank": idx + 1,
                "site_id": s.id,
                "site_name": s.name,
                "country": s.country,
                "planet": s.planetary_target,
                "score": s.analog_score,
                "environment_type": s.environment_type,
                "data_status": s.data_status,
            }
            for idx, s in enumerate(sites)
        ],
    }
