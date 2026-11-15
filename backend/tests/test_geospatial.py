"""
Geospatial terrain and planetary geometry unit tests
===================================================
Tests slope, roughness, statistics, and planetary coordinate operations.
"""
import pytest
import numpy as np
from app.scientific.processing import (
    calculate_slope,
    calculate_roughness,
    compute_terrain_statistics,
    validate_coordinates,
    spherical_distance_km,
    check_point_in_bbox,
)


class TestTerrainProcessing:
    def test_flat_surface_slope_is_zero(self):
        # 5x5 grid of identical 100m elevation
        flat_grid = np.full((5, 5), 100.0)
        slope = calculate_slope(flat_grid, cell_size_m=30.0)
        assert np.allclose(slope, 0.0, atol=1e-5)

    def test_45_degree_uniform_incline_slope(self):
        # For a rise of 30m over a 30m pixel run, dz/dx = 1, so slope = 45 degrees
        x = np.arange(5) * 30.0
        incline_grid = np.tile(x, (5, 1))
        slope = calculate_slope(incline_grid, cell_size_m=30.0)
        # Check interior pixels
        assert np.isclose(slope[2, 2], 45.0, atol=0.1)

    def test_roughness_flat_is_zero(self):
        flat_grid = np.full((5, 5), 50.0)
        tri = calculate_roughness(flat_grid)
        assert np.allclose(tri, 0.0, atol=1e-5)

    def test_roughness_elevated_center(self):
        # Center pixel has 10m bump
        grid = np.zeros((5, 5))
        grid[2, 2] = 10.0
        tri = calculate_roughness(grid)
        # Interior center pixel has 8 neighbors with diff=10, so sqrt(8 * 100) = sqrt(800) ~ 28.28
        assert np.isclose(tri[2, 2], np.sqrt(800.0), atol=0.1)

    def test_terrain_statistics(self):
        data = np.array([[10.0, 20.0, 30.0], [40.0, 50.0, 60.0], [70.0, 80.0, 90.0]])
        stats = compute_terrain_statistics(data)
        assert stats["min"] == 10.0
        assert stats["max"] == 90.0
        assert stats["mean"] == 50.0
        assert stats["median"] == 50.0
        assert stats["valid_pixel_count"] == 9

    def test_terrain_statistics_with_nodata(self):
        data = np.array([[10.0, -9999.0], [30.0, 40.0]])
        stats = compute_terrain_statistics(data, no_data_val=-9999.0)
        assert stats["valid_pixel_count"] == 3
        assert stats["min"] == 10.0
        assert stats["max"] == 40.0


class TestPlanetarySpatialOps:
    def test_validate_coordinates(self):
        assert validate_coordinates(0.0, 0.0) is True
        assert validate_coordinates(89.9, 179.9) is True
        assert validate_coordinates(-90.0, -180.0) is True
        assert validate_coordinates(95.0, 0.0) is False  # Latitude out of bounds
        assert validate_coordinates(0.0, -200.0) is False  # Longitude out of bounds

    def test_spherical_distance_scaling(self):
        # 1 degree of latitude on equator
        dist_earth = spherical_distance_km(0.0, 0.0, 1.0, 0.0, body="earth")
        dist_mars = spherical_distance_km(0.0, 0.0, 1.0, 0.0, body="mars")
        dist_moon = spherical_distance_km(0.0, 0.0, 1.0, 0.0, body="moon")

        # 1 deg on Earth ~ 111.19 km
        assert np.isclose(dist_earth, 111.2, atol=1.0)
        # Mars radius is ~0.53 Earth radius
        assert np.isclose(dist_mars, 59.16, atol=1.0)
        # Moon radius is ~0.27 Earth radius
        assert np.isclose(dist_moon, 30.32, atol=1.0)

    def test_check_point_in_bbox(self):
        assert check_point_in_bbox(10.0, 20.0, 0.0, 10.0, 15.0, 30.0) is True
        assert check_point_in_bbox(25.0, 20.0, 0.0, 10.0, 15.0, 30.0) is False

