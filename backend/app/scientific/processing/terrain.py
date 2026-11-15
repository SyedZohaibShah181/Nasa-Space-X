"""
Geospatial Terrain Analysis Engine
===================================
Implements numerical algorithms for processing digital elevation models (DEMs):
- Topographical Slope via Horn's finite difference method
- Terrain Ruggedness Index (TRI) / Roughness
- Multi-scale spatial statistics (Mean, Median, Std, IQR)
- NoData masking and handling
"""
from typing import Dict, Any, Optional
import numpy as np


def calculate_slope(elevation_grid: np.ndarray, cell_size_m: float) -> np.ndarray:
    """
    Compute slope in degrees using Horn's 3x3 window algorithm.

    Formula (Horn 1981):
        [dz/dx] = ((c + 2f + i) - (a + 2d + g)) / (8 * cell_size)
        [dz/dy] = ((g + 2h + i) - (a + 2b + c)) / (8 * cell_size)
        slope = arctan(sqrt((dz/dx)^2 + (dz/dy)^2)) * 180 / pi
    """
    if elevation_grid.ndim != 2 or elevation_grid.shape[0] < 3 or elevation_grid.shape[1] < 3:
        raise ValueError("Elevation grid must be a 2D array of at least 3x3 pixels.")
    if cell_size_m <= 0:
        raise ValueError("cell_size_m must be strictly positive.")

    # Pad boundaries using edge reflection
    padded = np.pad(elevation_grid, pad_width=1, mode="edge")

    # 3x3 neighborhood slice
    a = padded[:-2, :-2]
    b = padded[:-2, 1:-1]
    c = padded[:-2, 2:]
    d = padded[1:-1, :-2]
    f = padded[1:-1, 2:]
    g = padded[2:, :-2]
    h = padded[2:, 1:-1]
    i = padded[2:, 2:]

    dz_dx = ((c + 2 * f + i) - (a + 2 * d + g)) / (8.0 * cell_size_m)
    dz_dy = ((g + 2 * h + i) - (a + 2 * b + c)) / (8.0 * cell_size_m)

    rise_run = np.sqrt(dz_dx**2 + dz_dy**2)
    slope_rad = np.arctan(rise_run)
    slope_deg = np.degrees(slope_rad)
    return slope_deg


def calculate_roughness(elevation_grid: np.ndarray) -> np.ndarray:
    """
    Compute Terrain Ruggedness Index (TRI) using Riley et al. (1999).
    TRI = sqrt(sum((z_ij - z_center)^2)) across 8 neighboring pixels.
    """
    if elevation_grid.ndim != 2 or elevation_grid.shape[0] < 3 or elevation_grid.shape[1] < 3:
        raise ValueError("Elevation grid must be a 2D array of at least 3x3 pixels.")

    padded = np.pad(elevation_grid, pad_width=1, mode="edge")
    center = elevation_grid

    sum_sq_diff = np.zeros_like(center, dtype=np.float64)
    for dy in [-1, 0, 1]:
        for dx in [-1, 0, 1]:
            if dx == 0 and dy == 0:
                continue
            neighbor = padded[1 + dy : 1 + dy + center.shape[0], 1 + dx : 1 + dx + center.shape[1]]
            sum_sq_diff += (neighbor - center) ** 2

    tri = np.sqrt(sum_sq_diff)
    return tri


def compute_terrain_statistics(
    grid: np.ndarray,
    no_data_val: Optional[float] = None,
) -> Dict[str, Any]:
    """
    Compute distribution metrics for a raster terrain grid, ignoring NoData values.
    """
    data = grid.astype(np.float64)
    if no_data_val is not None:
        mask = (data != no_data_val) & ~np.isnan(data) & ~np.isinf(data)
        valid = data[mask]
    else:
        valid = data[~np.isnan(data) & ~np.isinf(data)]

    if len(valid) == 0:
        return {
            "valid_pixel_count": 0,
            "min": None,
            "max": None,
            "mean": None,
            "median": None,
            "std_dev": None,
            "iqr": None,
        }

    q25, q75 = np.percentile(valid, [25, 75])
    return {
        "valid_pixel_count": int(len(valid)),
        "min": round(float(np.min(valid)), 2),
        "max": round(float(np.max(valid)), 2),
        "mean": round(float(np.mean(valid)), 2),
        "median": round(float(np.median(valid)), 2),
        "std_dev": round(float(np.std(valid)), 2),
        "iqr": round(float(q75 - q25), 2),
    }
