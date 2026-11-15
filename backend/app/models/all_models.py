"""
TerraTwin Database Models
=========================
Defines the 10 core tables required for the scientific research platform:
1. users
2. planetary_bodies
3. reference_regions
4. candidate_sites
5. datasets
6. measurements
7. site_analyses
8. analysis_features
9. saved_comparisons
10. reports

All coordinates are stored with spatial reference metadata.
"""
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    JSON,
)
from sqlalchemy.orm import relationship
from app.db.session import Base


# ─────────────────────────────────────────────
# 1. Users Table
# ─────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default="researcher")  # researcher, admin, guest
    organization = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    saved_comparisons = relationship("SavedComparison", back_populates="user")


# ─────────────────────────────────────────────
# 2. Planetary Bodies Table
# ─────────────────────────────────────────────
class PlanetaryBody(Base):
    __tablename__ = "planetary_bodies"

    id = Column(String(50), primary_key=True, index=True)  # moon, mars
    name = Column(String(100), nullable=False)
    full_name = Column(String(255), nullable=False)
    body_type = Column(String(50), default="planet")  # planet, natural_satellite
    distance_from_earth_km = Column(Float, nullable=False)
    radius_km = Column(Float, nullable=False)
    gravity_ms2 = Column(Float, nullable=False)
    atmosphere = Column(String(255), nullable=False)
    surface_temperature_min_c = Column(Float, nullable=False)
    surface_temperature_max_c = Column(Float, nullable=False)
    primary_datasets = Column(JSON, default=list)
    reference_regions_count = Column(Integer, default=0)
    data_status = Column(String(50), default="DEMO_DATA")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    reference_regions = relationship("ReferenceRegion", back_populates="planet")


# ─────────────────────────────────────────────
# 3. Reference Regions Table
# ─────────────────────────────────────────────
class ReferenceRegion(Base):
    __tablename__ = "reference_regions"

    id = Column(String(100), primary_key=True, index=True)
    planet_id = Column(String(50), ForeignKey("planetary_bodies.id"), nullable=False)
    name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    diameter_km = Column(Float, nullable=False)
    elevation_m = Column(Float, nullable=False)
    description = Column(Text, nullable=False)
    key_features = Column(JSON, default=list)
    primary_dataset = Column(String(255), nullable=False)
    mission_relevance = Column(String(255), nullable=False)
    data_status = Column(String(50), default="DEMO_DATA")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    planet = relationship("PlanetaryBody", back_populates="reference_regions")
    measurements = relationship("Measurement", back_populates="reference_region")


# ─────────────────────────────────────────────
# 4. Candidate Sites Table (Earth Analogs)
# ─────────────────────────────────────────────
class CandidateSite(Base):
    __tablename__ = "candidate_sites"

    id = Column(String(100), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    country = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    environment_type = Column(String(100), nullable=False)
    planetary_target = Column(String(50), nullable=False)  # moon, mars
    analog_score = Column(Float, default=0.0)
    features = Column(JSON, default=dict)
    why_analog = Column(Text, nullable=False)
    research_status = Column(String(100), default="candidate")
    data_sources = Column(JSON, default=list)
    data_status = Column(String(50), default="DEMO_DATA")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    measurements = relationship("Measurement", back_populates="candidate_site")


# ─────────────────────────────────────────────
# 5. Datasets Table
# ─────────────────────────────────────────────
class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String(100), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    provider = Column(String(100), nullable=False)
    dataset_type = Column(String(100), nullable=False)
    url = Column(String(500), nullable=False)
    spatial_resolution = Column(String(100), nullable=False)
    coverage = Column(String(255), nullable=False)
    format = Column(String(50), nullable=False)
    units = Column(String(100), nullable=False)
    crs = Column(String(100), nullable=False)
    authentication_required = Column(Boolean, default=False)
    auth_note = Column(String(255), nullable=True)
    integration_status = Column(String(50), default="planned")
    data_status = Column(String(50), default="METADATA_ONLY")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    measurements = relationship("Measurement", back_populates="dataset")


# ─────────────────────────────────────────────
# 6. Measurements Table
# ─────────────────────────────────────────────
class Measurement(Base):
    __tablename__ = "measurements"

    id = Column(String(100), primary_key=True, index=True)
    candidate_site_id = Column(String(100), ForeignKey("candidate_sites.id"), nullable=True)
    reference_region_id = Column(String(100), ForeignKey("reference_regions.id"), nullable=True)
    dataset_id = Column(String(100), ForeignKey("datasets.id"), nullable=False)
    parameter_name = Column(String(100), nullable=False)  # elevation, slope, roughness, temperature, etc.
    numerical_value = Column(Float, nullable=False)
    units = Column(String(50), nullable=False)
    spatial_resolution = Column(String(50), nullable=True)
    crs = Column(String(50), nullable=True)
    acquisition_date = Column(DateTime, nullable=True)
    uncertainty = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    candidate_site = relationship("CandidateSite", back_populates="measurements")
    reference_region = relationship("ReferenceRegion", back_populates="measurements")
    dataset = relationship("Dataset", back_populates="measurements")


# ─────────────────────────────────────────────
# 7. Site Analyses Table
# ─────────────────────────────────────────────
class SiteAnalysis(Base):
    __tablename__ = "site_analyses"

    id = Column(String(100), primary_key=True, index=True)
    earth_site_id = Column(String(100), ForeignKey("candidate_sites.id"), nullable=False)
    planetary_region_id = Column(String(100), ForeignKey("reference_regions.id"), nullable=False)
    methodology_version = Column(String(50), default="1.0")
    analog_compatibility_score = Column(Float, nullable=True)
    score_classification = Column(String(100), nullable=True)
    evaluated_features_count = Column(Integer, default=0)
    missing_features_count = Column(Integer, default=0)
    data_quality = Column(String(100), default="preliminary")
    confidence_note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    features = relationship("AnalysisFeature", back_populates="analysis", cascade="all, delete-orphan")


# ─────────────────────────────────────────────
# 8. Analysis Features Table
# ─────────────────────────────────────────────
class AnalysisFeature(Base):
    __tablename__ = "analysis_features"

    id = Column(String(100), primary_key=True, index=True)
    analysis_id = Column(String(100), ForeignKey("site_analyses.id"), nullable=False)
    feature_name = Column(String(100), nullable=False)
    earth_value = Column(Float, nullable=True)
    planetary_value = Column(Float, nullable=True)
    normalization_range = Column(Float, nullable=False)
    weight = Column(Float, nullable=False)
    score = Column(Float, nullable=True)  # S_i, 0-100 or None if missing
    is_missing = Column(Boolean, default=False)
    units = Column(String(50), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    analysis = relationship("SiteAnalysis", back_populates="features")


# ─────────────────────────────────────────────
# 9. Saved Comparisons Table
# ─────────────────────────────────────────────
class SavedComparison(Base):
    __tablename__ = "saved_comparisons"

    id = Column(String(100), primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    earth_site_id = Column(String(100), ForeignKey("candidate_sites.id"), nullable=False)
    planetary_region_id = Column(String(100), ForeignKey("reference_regions.id"), nullable=False)
    notes = Column(Text, nullable=True)
    custom_weights = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="saved_comparisons")


# ─────────────────────────────────────────────
# 10. Reports Table
# ─────────────────────────────────────────────
class Report(Base):
    __tablename__ = "reports"

    id = Column(String(100), primary_key=True, index=True)
    earth_site_id = Column(String(100), ForeignKey("candidate_sites.id"), nullable=False)
    planetary_region_id = Column(String(100), ForeignKey("reference_regions.id"), nullable=False)
    title = Column(String(255), nullable=False)
    status = Column(String(50), default="generated")  # pending, generated, failed
    report_path = Column(String(500), nullable=True)
    methodology_version = Column(String(50), default="1.0")
    created_at = Column(DateTime, default=datetime.utcnow)

