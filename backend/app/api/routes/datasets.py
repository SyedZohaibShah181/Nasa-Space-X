"""
Datasets catalog routes
Queries scientific dataset metadata from the database.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.all_models import Dataset

router = APIRouter()


@router.get("/datasets", summary="List scientific datasets")
def list_datasets(db: Session = Depends(get_db)):
    """Returns the catalog of scientific datasets used by TerraTwin."""
    datasets = db.query(Dataset).all()
    return {
        "count": len(datasets),
        "note": "Authoritative open dataset catalog. Raw raster products are processed separately.",
        "datasets": [
            {
                "id": d.id,
                "name": d.name,
                "provider": d.provider,
                "type": d.dataset_type,
                "url": d.url,
                "spatial_resolution": d.spatial_resolution,
                "coverage": d.coverage,
                "format": d.format,
                "units": d.units,
                "crs": d.crs,
                "authentication_required": d.authentication_required,
                "auth_note": d.auth_note,
                "integration_status": d.integration_status,
                "data_status": d.data_status,
            }
            for d in datasets
        ],
    }
