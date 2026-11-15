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

IMPORTANT: Never assign zero similarity to missing data.
           Always report number of evaluated vs missing features.
           Never claim statistical confidence without valid statistical method.
"""
from typing import Optional
from dataclasses import dataclass


# ─────────────────────────────────────────────
# Default feature weights (must sum to 1.0)
# These are provisional — researchers can override them.
# ─────────────────────────────────────────────
DEFAULT_WEIGHTS = {
    "elevation":    0.25,  # Topography
    "geology":      0.25,  # Geological characteristics
    "surface":      0.20,  # Surface characteristics
    "temperature":  0.15,  # Temperature characteristics
    "aridity":      0.15,  # Aridity / moisture
}

# ─────────────────────────────────────────────
# Normalization ranges (R_i)
# These define the scale over which differences are compared.
# Must be scientifically justified.
# ─────────────────────────────────────────────
NORMALIZATION_RANGES = {
    "elevation_m":           10000,   # 10 km covers most planetary relief
    "slope_degrees":         45,      # 0–45° covers most slopes
    "roughness":             1.0,     # Normalized roughness index
    "temperature_mean_c":    150,     # Covers Earth-to-Mars/Moon temperature range
    "temperature_range_c":   200,     # Day/night range
    "annual_rainfall_mm":    3000,    # 0 (Mars) to ~3000 mm wet climates
}


@dataclass
class FeatureScore:
    """Holds the result of comparing one feature between Earth and a planetary site."""
    feature_name: str
    earth_value: Optional[float]
    planetary_value: Optional[float]
    normalization_range: float
    weight: float
    score: Optional[float]          # 0–100; None if data is missing
    is_missing: bool
    units: str = ""
    notes: str = ""


def compute_feature_similarity(
    earth_value: Optional[float],
    planetary_value: Optional[float],
    normalization_range: float,
) -> Optional[float]:
    """
    Compute the similarity score for a single feature.

    Returns a score from 0 (completely different) to 100 (identical).
    Returns None if either value is missing — NEVER returns 0 for missing data.

    Args:
        earth_value:         Measurement from Earth analog site.
        planetary_value:     Measurement from planetary reference region.
        normalization_range: Scientifically justified scale (R_i).

    Returns:
        float (0–100) or None if data is unavailable.
    """
    if earth_value is None or planetary_value is None:
        return None  # Missing data — do not assign zero

    if normalization_range <= 0:
        raise ValueError("normalization_range must be > 0")

    absolute_difference = abs(earth_value - planetary_value)
    normalized_difference = absolute_difference / normalization_range
    clamped_difference = min(1.0, normalized_difference)
    similarity = 100.0 * (1.0 - clamped_difference)
    return round(similarity, 2)


def compute_analog_compatibility_score(
    feature_scores: list[FeatureScore],
) -> dict:
    """
    Compute the weighted Analog Compatibility Score (ACS) from individual feature scores.

    Args:
        feature_scores: List of FeatureScore objects.

    Returns:
        dict with:
            - acs: Weighted score (0–100) or None if no features were evaluated
            - evaluated_count: Number of features with real data
            - missing_count: Number of features without data
            - classification: Human-readable label
            - methodology_version: Version string for reproducibility
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
        "data_completeness_pct": round(100 * len(evaluated) / len(feature_scores), 1),
        "methodology_version": "1.0",
        "note": (
            "Score based on measurable terrain and geological characteristics only. "
            "Physical differences (gravity, atmosphere, radiation) are reported separately."
        ),
    }


def classify_score(score: Optional[float]) -> str:
    """
    Map ACS score to classification label.

    These thresholds are proposed interface categories,
    NOT established scientific standards.
    """
    if score is None:
        return "Not computed"
    if score >= 90:
        return "Very High Similarity"
    elif score >= 75:
        return "High Similarity"
    elif score >= 60:
        return "Moderate Similarity"
    elif score >= 40:
        return "Limited Similarity"
    else:
        return "Low Similarity"

