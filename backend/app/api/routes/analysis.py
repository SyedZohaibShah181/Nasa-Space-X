"""
Analysis routes
Handles similarity analysis between Earth sites and planetary regions.

NOTE: Similarity calculations here are DEMO/PLACEHOLDER until the
real scientific similarity engine is implemented in Milestone 7.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()


class AnalysisRequest(BaseModel):
    earth_site_id: str
    planetary_region_id: str
    features: Optional[List[str]] = ["elevation", "slope", "geology", "temperature", "aridity"]
    custom_weights: Optional[dict] = None


@router.post("/analysis/compare", summary="Run analog compatibility analysis")
def run_analysis(request: AnalysisRequest):
    """
    Compares an Earth site to a planetary reference region and returns
    an Analog Compatibility Score (ACS).

    **IMPORTANT:** This endpoint returns PLACEHOLDER data.
    The real similarity engine (Milestone 7) will compute scores from
    actual NASA/USGS measurements.

    The ACS formula is: ACS = Σ(w_i × S_i) / Σ(w_i)
    where S_i = 100 × (1 - min(1, |E_i - P_i| / R_i))
    """
    return {
        "data_status": "PLACEHOLDER_DEMO",
        "warning": (
            "This is a demonstration response. "
            "Real scores will be computed from actual datasets in Milestone 7."
        ),
        "analysis": {
            "id": f"analysis_{request.earth_site_id}_{request.planetary_region_id}_{int(datetime.utcnow().timestamp())}",
            "earth_site_id": request.earth_site_id,
            "planetary_region_id": request.planetary_region_id,
            "methodology_version": "1.0-demo",
            "features_requested": request.features,
            "features_evaluated": 0,
            "features_missing": len(request.features or []),
            "analog_compatibility_score": None,
            "score_classification": "Not yet computed",
            "data_quality": "No real data processed",
            "confidence_note": "Score not available until Milestone 7 implementation",
            "created_at": datetime.utcnow().isoformat() + "Z",
        },
        "environmental_differences": {
            "note": "These differences CANNOT be overcome by any Earth analog.",
            "gravity": "Mars: 3.72 m/s² vs Earth: 9.81 m/s² | Moon: 1.62 m/s² vs Earth: 9.81 m/s²",
            "atmosphere": "Mars: 0.6% Earth pressure, 95% CO2 | Moon: Effectively vacuum",
            "radiation": "No magnetic field protection on Mars or Moon",
        },
    }


@router.get("/analysis/{analysis_id}", summary="Get analysis result")
def get_analysis(analysis_id: str):
    """
    Retrieves a previously computed analysis result by ID.

    **Data Status:** PLACEHOLDER – database integration in Milestone 4.
    """
    return {
        "data_status": "PLACEHOLDER",
        "analysis_id": analysis_id,
        "message": "Analysis retrieval from database will be implemented in Milestone 4.",
    }

