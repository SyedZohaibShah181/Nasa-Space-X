"""
Datasets catalog routes
Returns metadata about scientific datasets used by TerraTwin.

NOTE: Dataset metadata is documented; actual data files are downloaded separately.
"""
from fastapi import APIRouter

router = APIRouter()

DATASETS_CATALOG = [
    {
        "id": "srtm_dem",
        "name": "SRTM Digital Elevation Model",
        "provider": "NASA / USGS",
        "type": "Earth elevation",
        "url": "https://www2.jpl.nasa.gov/srtm/",
        "spatial_resolution": "30 m (1 arc-second)",
        "coverage": "Global (60°N to 56°S)",
        "format": "GeoTIFF",
        "units": "Meters above sea level",
        "crs": "WGS84 (EPSG:4326)",
        "authentication_required": False,
        "integration_status": "planned",
        "data_status": "METADATA_ONLY",
    },
    {
        "id": "mola_dem",
        "name": "Mars Orbiter Laser Altimeter (MOLA)",
        "provider": "NASA PDS / USGS Astrogeology",
        "type": "Mars elevation",
        "url": "https://astrogeology.usgs.gov/search/map/Mars/GlobalSurveyor/MOLA",
        "spatial_resolution": "463 m/pixel (global)",
        "coverage": "Global Mars",
        "format": "GeoTIFF / IMG",
        "units": "Meters above MOLA datum",
        "crs": "IAU Mars 2000 Sphere (EPSG:49900)",
        "authentication_required": False,
        "integration_status": "planned",
        "data_status": "METADATA_ONLY",
    },
    {
        "id": "lola_dem",
        "name": "Lunar Orbiter Laser Altimeter (LOLA)",
        "provider": "NASA PDS / USGS Astrogeology",
        "type": "Lunar elevation",
        "url": "https://astrogeology.usgs.gov/search/map/Moon/LRO/LOLA",
        "spatial_resolution": "118 m/pixel (global)",
        "coverage": "Global Moon",
        "format": "GeoTIFF / IMG",
        "units": "Meters above lunar datum",
        "crs": "IAU Moon 2000 (EPSG:104903)",
        "authentication_required": False,
        "integration_status": "planned",
        "data_status": "METADATA_ONLY",
    },
    {
        "id": "modis_lst",
        "name": "MODIS Land Surface Temperature",
        "provider": "NASA Earthdata",
        "type": "Earth surface temperature",
        "url": "https://search.earthdata.nasa.gov/",
        "product_id": "MOD11A2",
        "spatial_resolution": "1 km",
        "coverage": "Global",
        "format": "HDF4",
        "units": "Kelvin",
        "crs": "Sinusoidal projection",
        "authentication_required": True,
        "auth_note": "Free NASA Earthdata account required",
        "integration_status": "planned",
        "data_status": "METADATA_ONLY",
    },
    {
        "id": "emit_minerals",
        "name": "EMIT Surface Mineral Dust",
        "provider": "NASA JPL / Earthdata",
        "type": "Earth mineral mapping",
        "url": "https://earth.jpl.nasa.gov/emit/",
        "spatial_resolution": "60 m",
        "coverage": "Arid/semi-arid global",
        "format": "NetCDF",
        "units": "Reflectance / mineral composition",
        "crs": "UTM / WGS84",
        "authentication_required": True,
        "auth_note": "Free NASA Earthdata account required",
        "integration_status": "planned",
        "data_status": "METADATA_ONLY",
    },
    {
        "id": "sentinel2",
        "name": "Sentinel-2 Multispectral Imagery",
        "provider": "ESA Copernicus",
        "type": "Earth surface imagery",
        "url": "https://dataspace.copernicus.eu/",
        "spatial_resolution": "10–60 m (band dependent)",
        "coverage": "Global",
        "format": "GeoTIFF / SAFE",
        "units": "Reflectance",
        "crs": "UTM / WGS84",
        "authentication_required": True,
        "auth_note": "Free Copernicus account required",
        "integration_status": "planned",
        "data_status": "METADATA_ONLY",
    },
]


@router.get("/datasets", summary="List scientific datasets")
def list_datasets():
    """
    Returns the catalog of scientific datasets used or planned for TerraTwin.

    Shows metadata only — actual dataset files are downloaded separately.
    Dataset availability and access methods are subject to change based on
    official provider APIs.
    """
    return {
        "count": len(DATASETS_CATALOG),
        "note": "Dataset metadata catalog. Actual data files are managed separately.",
        "datasets": DATASETS_CATALOG,
    }

