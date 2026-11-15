"""
Reference regions routes
Queries planetary reference regions (e.g. Jezero Crater, Lunar South Pole) from the database.
"""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.models.all_models import ReferenceRegion

router = APIRouter()


@router.get("/regions", summary="List reference regions")
def list_regions(
    planet: Optional[str] = Query(None, description="Filter by planet: 'moon' or 'mars'"),
    db: Session = Depends(get_db),
):
    """
    Returns planetary reference regions available for analog comparison.
    Supports filtering by target planet.
    """
    query = db.query(ReferenceRegion)
    if planet:
        query = query.filter(ReferenceRegion.planet_id == planet.lower())
    regions = query.all()

    return {
        "count": len(regions),
        "data_status": "DEMO_DATA",
        "filter": {"planet": planet},
        "regions": [
            {
                "id": r.id,
                "planet": r.planet_id,
                "name": r.name,
                "latitude": r.latitude,
                "longitude": r.longitude,
                "diameter_km": r.diameter_km,
                "elevation_m": r.elevation_m,
                "description": r.description,
                "key_features": r.key_features,
                "primary_dataset": r.primary_dataset,
                "mission_relevance": r.mission_relevance,
                "data_status": r.data_status,
            }
            for r in regions
        ],
    }


@router.get("/regions/{region_id}", summary="Get reference region details")
def get_region(region_id: str, db: Session = Depends(get_db)):
    """Returns details for a specific planetary reference region."""
    r = db.query(ReferenceRegion).filter(ReferenceRegion.id == region_id).first()
    if not r:
        raise HTTPException(status_code=404, detail=f"Region '{region_id}' not found.")
    return {
        "data_status": r.data_status,
        "region": {
            "id": r.id,
            "planet": r.planet_id,
            "name": r.name,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "diameter_km": r.diameter_km,
            "elevation_m": r.elevation_m,
            "description": r.description,
            "key_features": r.key_features,
            "primary_dataset": r.primary_dataset,
            "mission_relevance": r.mission_relevance,
            "data_status": r.data_status,
        },
    }
