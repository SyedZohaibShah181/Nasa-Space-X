"""
Reports routes
Generates and retrieves scientific research reports.

NOTE: Report generation (PDF) will be implemented in Milestone 9.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter()


class ReportRequest(BaseModel):
    site_id: str
    region_id: str
    analysis_id: Optional[str] = None
    include_methodology: bool = True
    include_data_sources: bool = True


@router.post("/reports/generate", summary="Generate scientific report")
def generate_report(request: ReportRequest):
    """
    Generates a downloadable scientific report for an analog comparison.

    **Data Status:** PLACEHOLDER – PDF generation implemented in Milestone 9.
    """
    report_id = f"report_{request.site_id}_{int(datetime.utcnow().timestamp())}"
    return {
        "data_status": "PLACEHOLDER",
        "report_id": report_id,
        "status": "not_yet_implemented",
        "message": "PDF report generation will be implemented in Milestone 9.",
        "planned_sections": [
            "Executive Summary",
            "Site Description",
            "Planetary Reference Region",
            "Analog Compatibility Score",
            "Feature-by-Feature Comparison",
            "Environmental Differences (Gravity, Atmosphere, Radiation)",
            "Dataset Sources and Provenance",
            "Scientific Methodology",
            "Limitations and Caveats",
            "References",
        ],
    }


@router.get("/reports/{report_id}", summary="Retrieve report")
def get_report(report_id: str):
    """
    Retrieves a previously generated report by ID.

    **Data Status:** PLACEHOLDER – will be implemented in Milestone 9.
    """
    return {
        "data_status": "PLACEHOLDER",
        "report_id": report_id,
        "message": "Report retrieval will be implemented in Milestone 9.",
    }

