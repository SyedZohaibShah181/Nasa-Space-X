"""
Planetary Spatial Geometry Operations
=====================================
Spherical distance metrics, coordinate system validations,
and bounding-box geometry checks for Earth, Moon, and Mars.
"""
import math
from typing import Dict, Tuple

# Mean volumetric planetary radii in kilometers
PLANETARY_RADII_KM: Dict[str, float] = {
    "earth": 6371.0,
    "mars": 3389.5,
    "moon": 1737.4,
}


def validate_coordinates(latitude: float, longitude: float) -> bool:
    """Validate standard geographic / planetocentric coordinates."""
    if not (-90.0 <= latitude <= 90.0):
        return False
    if not (-180.0 <= longitude <= 360.0):
        return False
    return True


def spherical_distance_km(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float,
    body: str = "earth",
) -> float:
    """
    Compute great-circle distance between two surface points using the Haversine formula,
    scaled by the planetary body's volumetric radius.
    """
    radius_km = PLANETARY_RADII_KM.get(body.lower(), 6371.0)

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    distance = radius_km * c
    return round(distance, 2)


def check_point_in_bbox(
    lat: float,
    lon: float,
    min_lat: float,
    min_lon: float,
    max_lat: float,
    max_lon: float,
) -> bool:
    """Verify if a coordinate falls within a specified geospatial bounding box."""
    return (min_lat <= lat <= max_lat) and (min_lon <= lon <= max_lon)

