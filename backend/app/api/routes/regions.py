"""
Reference regions routes
Returns planetary reference regions (e.g. Jezero Crater, Lunar South Pole).

NOTE: All data here is DEMO DATA until real NASA/PDS integration is complete.
"""
from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()

DEMO_REGIONS = [
    {
        "id": "jezero_crater",
        "name": "Jezero Crater",
        "planet": "mars",
        "latitude": 18.4,
        "longitude": 77.4,
        "diameter_km": 49,
        "description": (
            "Ancient lake-delta system. Primary landing site for NASA Perseverance rover. "
            "Contains layered carbonate and olivine-bearing units. High astrobiology relevance."
        ),
        "key_features": ["ancient delta deposits", "carbonate rocks", "clay minerals", "olivine"],
        "primary_dataset": "MOLA + HiRISE",
        "elevation_m": -2500,
        "mission_relevance": "Perseverance Rover (Mars 2020)",
        "data_status": "DEMO_DATA",
    },
    {
        "id": "gale_crater",
        "name": "Gale Crater",
        "planet": "mars",
        "latitude": -5.4,
        "longitude": 137.8,
        "diameter_km": 154,
        "description": (
            "5 km central mound (Aeolis Mons / Mount Sharp). Layered sedimentary record. "
            "Landing site for NASA Curiosity rover. Evidence of ancient habitable environment."
        ),
        "key_features": ["layered sediments", "sulfate minerals", "mudstones", "fluvial channels"],
        "primary_dataset": "MOLA + HiRISE + CRISM",
        "elevation_m": -4500,
        "mission_relevance": "Curiosity Rover (MSL)",
        "data_status": "DEMO_DATA",
    },
    {
        "id": "hellas_basin",
        "name": "Hellas Planitia",
        "planet": "mars",
        "latitude": -42.4,
        "longitude": 70.0,
        "diameter_km": 2300,
        "description": (
            "Largest confirmed impact basin on Mars. Deepest point on Mars (~7 km below datum). "
            "Complex geological history with possible ancient water activity."
        ),
        "key_features": ["deep basin", "volcanic deposits", "periglacial features"],
        "primary_dataset": "MOLA",
        "elevation_m": -7152,
        "mission_relevance": "Future mission target",
        "data_status": "DEMO_DATA",
    },
    {
        "id": "lunar_south_pole",
        "name": "Lunar South Pole",
        "planet": "moon",
        "latitude": -89.9,
        "longitude": 0.0,
        "diameter_km": 100,
        "description": (
            "Permanently shadowed craters contain water ice. High solar exposure on crater rims. "
            "Primary target for Artemis program. Shackleton Crater is key feature."
        ),
        "key_features": ["permanently shadowed regions", "water ice", "Shackleton Crater"],
        "primary_dataset": "LOLA + LROC",
        "elevation_m": -4200,
        "mission_relevance": "Artemis Program",
        "data_status": "DEMO_DATA",
    },
    {
        "id": "tycho_crater",
        "name": "Tycho Crater",
        "planet": "moon",
        "latitude": -43.3,
        "longitude": -11.2,
        "diameter_km": 85,
        "description": (
            "Young, geologically fresh impact crater ~108 Ma old. "
            "Central peak with exposed deep crustal material. High-resolution LROC imagery available."
        ),
        "key_features": ["central peak", "melt sheet", "ejecta blanket", "young morphology"],
        "primary_dataset": "LOLA + LROC NAC",
        "elevation_m": -4800,
        "mission_relevance": "Geological reference site",
        "data_status": "DEMO_DATA",
    },
]


@router.get("/regions", summary="List reference regions")
def list_regions(planet: Optional[str] = Query(None, description="Filter by planet: 'moon' or 'mars'")):
    """
    Returns planetary reference regions available for analog comparison.

    **Data Status:** DEMO_DATA – will be replaced with database records.
    """
    regions = DEMO_REGIONS
    if planet:
        regions = [r for r in regions if r["planet"] == planet.lower()]
    return {
        "count": len(regions),
        "data_status": "DEMO_DATA",
        "filter": {"planet": planet},
        "regions": regions,
    }


@router.get("/regions/{region_id}", summary="Get reference region details")
def get_region(region_id: str):
    """
    Returns details for a specific planetary reference region.

    **Data Status:** DEMO_DATA – will be replaced with database records.
    """
    region = next((r for r in DEMO_REGIONS if r["id"] == region_id), None)
    if not region:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Region '{region_id}' not found.")
    return {"data_status": "DEMO_DATA", "region": region}

