"""
Rankings routes
Returns ranked candidate sites by analog compatibility score.

NOTE: Rankings are DEMO DATA until real similarity engine (Milestone 7) is complete.
"""
from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()


@router.get("/rankings", summary="Get ranked analog sites")
def get_rankings(
    planet: Optional[str] = Query(None, description="Filter by planet: 'moon' or 'mars'"),
    region_id: Optional[str] = Query(None, description="Filter by reference region"),
    limit: int = Query(10, description="Number of results to return"),
):
    """
    Returns Earth analog sites ranked by Analog Compatibility Score.

    **Data Status:** DEMO DATA – real rankings require Milestone 7.
    """
    demo_rankings = [
        {"rank": 1, "site_id": "atacama_desert", "site_name": "Atacama Desert", "planet": "mars", "score": 78.5, "data_status": "DEMO"},
        {"rank": 2, "site_id": "mcmurdo_dry_valleys", "site_name": "McMurdo Dry Valleys", "planet": "mars", "score": 70.1, "data_status": "DEMO"},
        {"rank": 3, "site_id": "haughton_crater", "site_name": "Haughton Crater", "planet": "moon", "score": 72.3, "data_status": "DEMO"},
        {"rank": 4, "site_id": "death_valley", "site_name": "Death Valley", "planet": "mars", "score": 65.8, "data_status": "DEMO"},
    ]

    if planet:
        demo_rankings = [r for r in demo_rankings if r["planet"] == planet.lower()]

    return {
        "data_status": "DEMO_DATA",
        "warning": "These scores are illustrative. Real rankings require Milestone 7 implementation.",
        "total": len(demo_rankings),
        "filters": {"planet": planet, "region_id": region_id},
        "rankings": demo_rankings[:limit],
    }

