"""
Discovery engine routes
Searches Earth geospatial data for analog candidate areas.

NOTE: Returns DEMO DATA until geospatial processing engine (Milestone 6) is complete.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()


class DiscoveryRequest(BaseModel):
    planet: str  # "moon" or "mars"
    reference_region_id: str
    features: Optional[List[str]] = ["elevation", "slope", "geology"]
    geographic_bounds: Optional[dict] = None  # {north, south, east, west}
    max_results: Optional[int] = 10


@router.post("/discovery/search", summary="Search for analog candidates")
def search_analogs(request: DiscoveryRequest):
    """
    Scans Earth geospatial data to discover candidate analog environments.

    **Data Status:** DEMO DATA – real discovery requires Milestone 6 (geospatial processing).
    """
    return {
        "data_status": "DEMO_DATA",
        "warning": "Real discovery scan requires geospatial processing engine (Milestone 6).",
        "request": request.model_dump(),
        "results": [],
        "message": (
            "Discovery engine will scan SRTM, EMIT, MODIS, and USGS datasets "
            "to identify Earth regions matching the requested planetary characteristics. "
            "Implementation is planned for Milestone 6."
        ),
    }

