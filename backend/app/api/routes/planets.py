"""
Planetary bodies routes
Queries Moon and Mars planetary metadata from the database.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.all_models import PlanetaryBody

router = APIRouter()


@router.get("/planets", summary="List planetary bodies")
def list_planets(db: Session = Depends(get_db)):
    """
    Returns the list of planetary bodies available for analog comparison.
    Currently supports Moon and Mars.
    """
    planets = db.query(PlanetaryBody).all()
    return {
        "count": len(planets),
        "data_status": "DEMO_DATA",
        "planets": [
            {
                "id": p.id,
                "name": p.name,
                "full_name": p.full_name,
                "type": p.body_type,
                "distance_from_earth_km": p.distance_from_earth_km,
                "radius_km": p.radius_km,
                "gravity_ms2": p.gravity_ms2,
                "atmosphere": p.atmosphere,
                "surface_temperature_min_c": p.surface_temperature_min_c,
                "surface_temperature_max_c": p.surface_temperature_max_c,
                "primary_datasets": p.primary_datasets,
                "reference_regions_count": p.reference_regions_count,
                "data_status": p.data_status,
            }
            for p in planets
        ],
    }


@router.get("/planets/{planet_id}", summary="Get planetary body details")
def get_planet(planet_id: str, db: Session = Depends(get_db)):
    """Returns details for a specific planetary body."""
    p = db.query(PlanetaryBody).filter(PlanetaryBody.id == planet_id.lower()).first()
    if not p:
        raise HTTPException(status_code=404, detail=f"Planet '{planet_id}' not found. Valid options: moon, mars")
    return {
        "data_status": p.data_status,
        "planet": {
            "id": p.id,
            "name": p.name,
            "full_name": p.full_name,
            "type": p.body_type,
            "distance_from_earth_km": p.distance_from_earth_km,
            "radius_km": p.radius_km,
            "gravity_ms2": p.gravity_ms2,
            "atmosphere": p.atmosphere,
            "surface_temperature_min_c": p.surface_temperature_min_c,
            "surface_temperature_max_c": p.surface_temperature_max_c,
            "primary_datasets": p.primary_datasets,
            "reference_regions_count": p.reference_regions_count,
            "data_status": p.data_status,
        },
    }
