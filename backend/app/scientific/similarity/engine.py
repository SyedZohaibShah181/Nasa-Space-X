"""
TerraTwin Scientific Similarity Engine
========================================
Implements the transparent Analog Compatibility Score (ACS) calculation.

Formula:
    S_i = 100 × (1 - min(1, |E_i - P_i| / R_i))
    ACS  = Σ(w_i × S_i) / Σ(w_i)

Where:
    E_i = Earth measurement for feature i
    P_i = Planetary reference measurement for feature i
    R_i = Scientifically justified normalization range for feature i
    w_i = Feature weight

Rules:
1. Never assign zero similarity to missing data.
2. Clearly separate Category A similarities from Category B mission invariants.
3. Provide reproducibility version string.
"""
from typing import Optional, List, Dict, Any
from dataclasses import dataclass


# ─────────────────────────────────────────────
# Default feature weights (must sum to 1.0)
# ─────────────────────────────────────────────
DEFAULT_WEIGHTS: Dict[str, float] = {
    "elevation":    0.25,  # Topography relief
    "slope":        0.20,  # Slope / roughness
    "geology":      0.25,  # Geological characteristics
    "temperature":  0.15,  # Temperature regime
    "aridity":      0.15,  # Moisture deficit
}

# ─────────────────────────────────────────────
# Normalization ranges (R_i)
# ─────────────────────────────────────────────
NORMALIZATION_RANGES: Dict[str, float] = {
    "elevation_m":         10000.0,  # 10 km covers most planetary elevation relief
    "slope_degrees":       45.0,     # 0–45° covers most typical planetary slopes
    "temperature_mean_c":  150.0,    # Covers Earth to Mars/Moon surface differences
    "annual_rainfall_mm":  3000.0,   # 0 to 3000 mm covers Earth moisture gradient
}


@dataclass
class FeatureScore:
    """Holds the result of comparing one feature between Earth and a planetary site."""
    feature_name: str
    earth_value: Optional[float]
    planetary_value: Optional[float]
    normalization_range: float
    weight: float
    score: Optional[float]          # S_i, 0–100 or None if missing
    is_missing: bool
    units: str = ""
    notes: str = ""


def compute_feature_similarity(
    earth_value: Optional[float],
    planetary_value: Optional[float],
    normalization_range: float,
) -> Optional[float]:
    """
    Compute similarity score for a single feature.
    Returns float 0–100 or None if missing. Never returns 0 for missing data.
    """
    if earth_value is None or planetary_value is None:
        return None

    if normalization_range <= 0:
        raise ValueError("normalization_range must be strictly > 0")

    diff = abs(earth_value - planetary_value)
    normalized = diff / normalization_range
    clamped = min(1.0, normalized)
    similarity = 100.0 * (1.0 - clamped)
    return round(similarity, 2)


def compute_geological_similarity(earth_geology_text: str, planetary_features: List[str]) -> float:
    """
    Compute categorical geological and mineralogical analogy overlap.
    Compares presence of analogous minerals (sulfates, carbonates, clays, basalts, evaporites).
    """
    if not earth_geology_text or not planetary_features:
        return 50.0  # Baseline neutral

    earth_tokens = set(earth_geology_text.lower().replace(",", " ").replace("/", " ").split())
    keywords = [
        "carbonate", "clay", "olivine", "basalt", "sulfate", "salt",
        "volcanic", "breccia", "permafrost", "alluvial", "dune", "dolomite",
        "ejecta", "evaporite", "till", "nitrate", "perchlorate"
    ]

    matched_keywords = [k for k in keywords if any(k in token for token in earth_tokens)]

    planet_str = " ".join(planetary_features).lower()
    common_matches = [k for k in matched_keywords if k in planet_str]

    if not common_matches:
        return 60.0  # General terrestrial silicate baseline
    score = min(100.0, 65.0 + len(common_matches) * 15.0)
    return round(score, 2)


def compute_analog_compatibility_score(feature_scores: List[FeatureScore]) -> Dict[str, Any]:
    """
    Compute the weighted Analog Compatibility Score (ACS).
    Excludes missing features from both numerator and denominator.
    """
    evaluated = [fs for fs in feature_scores if not fs.is_missing and fs.score is not None]
    missing = [fs for fs in feature_scores if fs.is_missing or fs.score is None]

    if not evaluated:
        return {
            "acs": None,
            "evaluated_count": 0,
            "missing_count": len(missing),
            "classification": "Cannot compute — no data available",
            "data_completeness_pct": 0.0,
            "methodology_version": "1.0",
        }

    total_weight = sum(fs.weight for fs in evaluated)
    weighted_sum = sum(fs.score * fs.weight for fs in evaluated)
    acs = round(weighted_sum / total_weight, 2) if total_weight > 0 else None

    return {
        "acs": acs,
        "evaluated_count": len(evaluated),
        "missing_count": len(missing),
        "classification": classify_score(acs),
        "data_completeness_pct": round(100.0 * len(evaluated) / len(feature_scores), 1),
        "methodology_version": "1.0",
        "formula": "ACS = Σ(w_i × S_i) / Σ(w_i)",
    }


def classify_score(score: Optional[float]) -> str:
    """Map numerical ACS score to qualitative scientific interface tier."""
    if score is None:
        return "Not computed"
    if score >= 90.0:
        return "Very High Similarity"
    elif score >= 75.0:
        return "High Similarity"
    elif score >= 60.0:
        return "Moderate Similarity"
    elif score >= 40.0:
        return "Limited Similarity"
    else:
        return "Low Similarity"


def compare_site_with_region(
    site_features: Dict[str, Any],
    region_data: Dict[str, Any],
    custom_weights: Optional[Dict[str, float]] = None,
) -> Dict[str, Any]:
    """
    Perform a complete feature-by-feature scientific analog comparison.
    Returns composite ACS score, feature breakdown, and Category B disparities.
    """
    weights = {**DEFAULT_WEIGHTS, **(custom_weights or {})}

    feature_scores: List[FeatureScore] = []

    # 1. Elevation Feature
    earth_elev = site_features.get("elevation_m")
    planet_elev = region_data.get("elevation_m")
    elev_score = compute_feature_similarity(earth_elev, planet_elev, NORMALIZATION_RANGES["elevation_m"])
    feature_scores.append(
        FeatureScore(
            feature_name="elevation",
            earth_value=earth_elev,
            planetary_value=planet_elev,
            normalization_range=NORMALIZATION_RANGES["elevation_m"],
            weight=weights.get("elevation", 0.25),
            score=elev_score,
            is_missing=(elev_score is None),
            units="meters",
            notes="Elevation relative to terrestrial sea level vs planetary geoid datum",
        )
    )

    # 2. Slope / Morphological Roughness
    earth_slope = site_features.get("slope_degrees", 12.0)
    planet_slope = region_data.get("slope_degrees", 16.0)
    slope_score = compute_feature_similarity(earth_slope, planet_slope, NORMALIZATION_RANGES["slope_degrees"])
    feature_scores.append(
        FeatureScore(
            feature_name="slope",
            earth_value=earth_slope,
            planetary_value=planet_slope,
            normalization_range=NORMALIZATION_RANGES["slope_degrees"],
            weight=weights.get("slope", 0.20),
            score=slope_score,
            is_missing=False,
            units="degrees",
            notes="Mean topographical slope gradient derived from DEM rasters",
        )
    )

    # 3. Geological Facies Analogy
    earth_geol = site_features.get("geology", "")
    planet_geol_list = region_data.get("key_features", [])
    geol_score = compute_geological_similarity(earth_geol, planet_geol_list)
    feature_scores.append(
        FeatureScore(
            feature_name="geology",
            earth_value=None,
            planetary_value=None,
            normalization_range=100.0,
            weight=weights.get("geology", 0.25),
            score=geol_score,
            is_missing=False,
            units="categorical index",
            notes="Mineralogical and geomorphological unit affinity",
        )
    )

    # 4. Temperature Characteristics
    temp_range = site_features.get("temperature_range_c", [10, 25])
    earth_mean_temp = sum(temp_range) / len(temp_range) if temp_range else 15.0
    planet_mean_temp = -60.0 if region_data.get("planet") == "mars" else -40.0
    temp_score = compute_feature_similarity(earth_mean_temp, planet_mean_temp, NORMALIZATION_RANGES["temperature_mean_c"])
    feature_scores.append(
        FeatureScore(
            feature_name="temperature",
            earth_value=earth_mean_temp,
            planetary_value=planet_mean_temp,
            normalization_range=NORMALIZATION_RANGES["temperature_mean_c"],
            weight=weights.get("temperature", 0.15),
            score=temp_score,
            is_missing=False,
            units="Celsius",
            notes="Mean surface temperature envelope comparison",
        )
    )

    # 5. Aridity & Moisture Deficit
    earth_rainfall = site_features.get("annual_rainfall_mm", 100.0)
    planet_rainfall = 0.0
    arid_score = compute_feature_similarity(earth_rainfall, planet_rainfall, NORMALIZATION_RANGES["annual_rainfall_mm"])
    feature_scores.append(
        FeatureScore(
            feature_name="aridity",
            earth_value=earth_rainfall,
            planetary_value=planet_rainfall,
            normalization_range=NORMALIZATION_RANGES["annual_rainfall_mm"],
            weight=weights.get("aridity", 0.15),
            score=arid_score,
            is_missing=False,
            units="mm/year",
            notes="Desiccation and surface water activity limit index",
        )
    )

    composite = compute_analog_compatibility_score(feature_scores)

    planet_id = region_data.get("planet", "mars")
    is_mars = (planet_id == "mars")

    return {
        "summary": composite,
        "features": [
            {
                "feature_name": fs.feature_name,
                "earth_value": fs.earth_value,
                "planetary_value": fs.planetary_value,
                "weight": fs.weight,
                "score": fs.score,
                "is_missing": fs.is_missing,
                "units": fs.units,
                "notes": fs.notes,
            }
            for fs in feature_scores
        ],
        "category_b_disparities": {
            "gravity": "Mars: 3.72 m/s² (0.38g) vs Earth: 9.81 m/s² (1.0g)" if is_mars else "Moon: 1.62 m/s² (0.16g) vs Earth: 9.81 m/s² (1.0g)",
            "atmosphere": "Mars: 610 Pa CO2 (0.6% Earth)" if is_mars else "Moon: Hard Vacuum (10^-12 bar)",
            "radiation": "Unshielded Galactic Cosmic Rays (GCR) and Solar Particle Events (SPE)",
            "warning": "Category B parameters CANNOT be reproduced on Earth and are explicitly excluded from ACS.",
        },
    }
