"""
TerraTwin Geospatial Processing Engine
======================================
Numerical terrain algorithms, slope, roughness, and planetary geometries.
"""
from app.scientific.processing.terrain import (
    calculate_slope,
    calculate_roughness,
    compute_terrain_statistics,
)
from app.scientific.processing.spatial_ops import (
    validate_coordinates,
    spherical_distance_km,
    check_point_in_bbox,
    PLANETARY_RADII_KM,
)

__all__ = [
    "calculate_slope",
    "calculate_roughness",
    "compute_terrain_statistics",
    "validate_coordinates",
    "spherical_distance_km",
    "check_point_in_bbox",
    "PLANETARY_RADII_KM",
]
