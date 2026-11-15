"""
Candidate sites routes
Returns Earth analog candidate locations.

NOTE: All data here is DEMO DATA until real scientific data integration is complete.
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional

router = APIRouter()

DEMO_SITES = [
    {
        "id": "atacama_desert",
        "name": "Atacama Desert",
        "country": "Chile",
        "latitude": -23.5,
        "longitude": -68.2,
        "environment_type": "Hyper-arid desert",
        "planetary_target": "mars",
        "analog_score": 78.5,
        "features": {
            "elevation_m": 2400,
            "aridity": "hyper-arid",
            "geology": "salt flats, volcanic rock",
            "temperature_range_c": [-10, 40],
            "annual_rainfall_mm": 1,
        },
        "why_analog": "Extreme aridity, UV radiation, mineral deposits similar to Martian surface",
        "research_status": "well_documented",
        "data_sources": ["NASA Earthdata", "USGS", "ESA Copernicus"],
        "data_status": "DEMO_DATA",
    },
    {
        "id": "haughton_crater",
        "name": "Haughton Crater",
        "country": "Canada (Devon Island, Nunavut)",
        "latitude": 75.2,
        "longitude": -89.7,
        "environment_type": "Arctic impact crater",
        "planetary_target": "moon",
        "analog_score": 72.3,
        "features": {
            "elevation_m": 50,
            "aridity": "polar desert",
            "geology": "impact breccia, dolomite",
            "temperature_range_c": [-40, 10],
            "annual_rainfall_mm": 50,
        },
        "why_analog": "Impact crater morphology, cold desert, isolation - used by NASA for analog research",
        "research_status": "active_research_site",
        "data_sources": ["NASA Haughton-Mars Project", "USGS"],
        "data_status": "DEMO_DATA",
    },
    {
        "id": "death_valley",
        "name": "Death Valley",
        "country": "USA",
        "latitude": 36.5,
        "longitude": -117.1,
        "environment_type": "Hot desert basin",
        "planetary_target": "mars",
        "analog_score": 65.8,
        "features": {
            "elevation_m": -86,
            "aridity": "arid",
            "geology": "salt flats, alluvial fans, dunes",
            "temperature_range_c": [-5, 56],
            "annual_rainfall_mm": 50,
        },
        "why_analog": "Extreme temperatures, basin morphology, salt deposits, dune systems",
        "research_status": "well_documented",
        "data_sources": ["NASA Earthdata", "USGS"],
        "data_status": "DEMO_DATA",
    },
    {
        "id": "mcmurdo_dry_valleys",
        "name": "McMurdo Dry Valleys",
        "country": "Antarctica",
        "latitude": -77.5,
        "longitude": 162.5,
        "environment_type": "Polar desert",
        "planetary_target": "mars",
        "analog_score": 70.1,
        "features": {
            "elevation_m": 500,
            "aridity": "polar desert",
            "geology": "till, glacial deposits, permafrost",
            "temperature_range_c": [-40, 2],
            "annual_rainfall_mm": 0,
        },
        "why_analog": "Extreme cold, dry conditions, permafrost, sublimation processes",
        "research_status": "active_research_site",
        "data_sources": ["NASA Earthdata", "ESA Copernicus", "USGS"],
        "data_status": "DEMO_DATA",
    },
]


@router.get("/sites", summary="List Earth analog candidate sites")
def list_sites(
    planet: Optional[str] = Query(None, description="Filter by planetary target: 'moon' or 'mars'"),
    min_score: Optional[float] = Query(None, description="Minimum analog score (0-100)"),
):
    """
    Returns the list of Earth analog candidate sites.

    **Data Status:** DEMO_DATA – analog scores are illustrative only.
    Real scores require completed geospatial analysis (Milestone 7).
    """
    sites = DEMO_SITES
    if planet:
        sites = [s for s in sites if s["planetary_target"] == planet.lower()]
    if min_score is not None:
        sites = [s for s in sites if s["analog_score"] >= min_score]

    # Sort by score descending
    sites = sorted(sites, key=lambda s: s["analog_score"], reverse=True)

    return {
        "count": len(sites),
        "data_status": "DEMO_DATA",
        "filters": {"planet": planet, "min_score": min_score},
        "sites": sites,
    }


@router.get("/sites/{site_id}", summary="Get site details")
def get_site(site_id: str):
    """
    Returns full details for a specific Earth analog candidate site.

    **Data Status:** DEMO_DATA – will be replaced with real measurements.
    """
    site = next((s for s in DEMO_SITES if s["id"] == site_id), None)
    if not site:
        raise HTTPException(status_code=404, detail=f"Site '{site_id}' not found.")
    return {"data_status": "DEMO_DATA", "site": site}

