"""
Planetary bodies routes
Returns Moon and Mars planetary data.

NOTE: All data here is DEMO DATA until real NASA/PDS integration is complete.
"""
from fastapi import APIRouter

router = APIRouter()

# ─────────────────────────────────────────────
# DEMO DATA – clearly labeled as non-scientific
# Replace with database-driven data in Milestone 4
# ─────────────────────────────────────────────
DEMO_PLANETS = [
    {
        "id": "moon",
        "name": "Moon",
        "full_name": "Earth's Moon (Luna)",
        "type": "natural_satellite",
        "distance_from_earth_km": 384400,
        "radius_km": 1737.4,
        "gravity_ms2": 1.62,
        "atmosphere": "None (trace exosphere)",
        "surface_temperature_min_c": -173,
        "surface_temperature_max_c": 127,
        "primary_datasets": ["LOLA", "LROC", "Lunar Mineralogy Mapper"],
        "reference_regions_count": 5,
        "data_status": "DEMO_DATA",
    },
    {
        "id": "mars",
        "name": "Mars",
        "full_name": "Mars (The Red Planet)",
        "type": "planet",
        "distance_from_earth_km": 225000000,
        "radius_km": 3389.5,
        "gravity_ms2": 3.72,
        "atmosphere": "Thin CO2 (0.6% Earth pressure)",
        "surface_temperature_min_c": -125,
        "surface_temperature_max_c": 20,
        "primary_datasets": ["MOLA", "HiRISE", "CTX", "CRISM"],
        "reference_regions_count": 8,
        "data_status": "DEMO_DATA",
    },
]


@router.get("/planets", summary="List planetary bodies")
def list_planets():
    """
    Returns the list of planetary bodies available for analog comparison.
    Currently supports Moon and Mars.

    **Data Status:** DEMO_DATA – will be replaced with database records.
    """
    return {
        "count": len(DEMO_PLANETS),
        "data_status": "DEMO_DATA",
        "planets": DEMO_PLANETS,
    }


@router.get("/planets/{planet_id}", summary="Get planetary body details")
def get_planet(planet_id: str):
    """
    Returns details for a specific planetary body.

    **Data Status:** DEMO_DATA – will be replaced with database records.
    """
    planet = next((p for p in DEMO_PLANETS if p["id"] == planet_id), None)
    if not planet:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Planet '{planet_id}' not found. Valid options: moon, mars")
    return {"data_status": "DEMO_DATA", "planet": planet}

