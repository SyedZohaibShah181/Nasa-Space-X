"""
Database CRUD and constraint unit tests
========================================
Tests database creation, insertion, reading, updates, and cascading relationships.
"""
import pytest
from app.db.session import SessionLocal
from app.models.all_models import (
    PlanetaryBody,
    ReferenceRegion,
    CandidateSite,
    Dataset,
    SiteAnalysis,
    AnalysisFeature,
)


@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    yield db
    db.close()


class TestDatabaseCRUD:
    def test_read_seeded_planets(self, db_session):
        planets = db_session.query(PlanetaryBody).all()
        assert len(planets) >= 2
        planet_ids = [p.id for p in planets]
        assert "moon" in planet_ids
        assert "mars" in planet_ids

    def test_read_reference_regions(self, db_session):
        regions = db_session.query(ReferenceRegion).all()
        assert len(regions) >= 5
        jezero = db_session.query(ReferenceRegion).filter(ReferenceRegion.id == "jezero_crater").first()
        assert jezero is not None
        assert jezero.planet_id == "mars"
        assert jezero.elevation_m == -2500.0

    def test_read_candidate_sites(self, db_session):
        sites = db_session.query(CandidateSite).all()
        assert len(sites) >= 4
        atacama = db_session.query(CandidateSite).filter(CandidateSite.id == "atacama_desert").first()
        assert atacama is not None
        assert atacama.planetary_target == "mars"
        assert atacama.analog_score > 70.0

    def test_create_and_update_candidate_site(self, db_session):
        test_site_id = "test_pakistan_desert"
        # 1. Clean up if exists
        existing = db_session.query(CandidateSite).filter(CandidateSite.id == test_site_id).first()
        if existing:
            db_session.delete(existing)
            db_session.commit()

        # 2. Insert test site
        new_site = CandidateSite(
            id=test_site_id,
            name="Kharan Desert Test Analog",
            country="Pakistan",
            latitude=28.5,
            longitude=65.4,
            environment_type="Sandy and salt flat desert",
            planetary_target="mars",
            analog_score=68.0,
            features={"elevation_m": 850, "aridity": "hyper-arid"},
            why_analog="Desiccated playa basins and mobile dune fields resembling Martian lowlands.",
            research_status="investigative_candidate",
            data_sources=["NASA Earthdata", "SRTM"],
            data_status="DEMO_DATA",
        )
        db_session.add(new_site)
        db_session.commit()

        # 3. Read back
        site = db_session.query(CandidateSite).filter(CandidateSite.id == test_site_id).first()
        assert site is not None
        assert site.name == "Kharan Desert Test Analog"
        assert site.analog_score == 68.0

        # 4. Update
        site.analog_score = 71.5
        db_session.commit()

        # 5. Verify update
        updated_site = db_session.query(CandidateSite).filter(CandidateSite.id == test_site_id).first()
        assert updated_site.analog_score == 71.5

        # 6. Cleanup
        db_session.delete(updated_site)
        db_session.commit()
        assert db_session.query(CandidateSite).filter(CandidateSite.id == test_site_id).first() is None

    def test_analysis_and_features_cascade(self, db_session):
        analysis_id = "test_analysis_cascade_001"
        # 1. Clean up if exists
        existing = db_session.query(SiteAnalysis).filter(SiteAnalysis.id == analysis_id).first()
        if existing:
            db_session.delete(existing)
            db_session.commit()

        # 2. Create analysis with features
        analysis = SiteAnalysis(
            id=analysis_id,
            earth_site_id="atacama_desert",
            planetary_region_id="jezero_crater",
            methodology_version="1.0-test",
            analog_compatibility_score=79.2,
            score_classification="High Similarity",
            evaluated_features_count=2,
            missing_features_count=0,
            data_quality="Test Synthetic",
        )
        feature1 = AnalysisFeature(
            id="feat_001",
            analysis_id=analysis_id,
            feature_name="elevation",
            earth_value=2400.0,
            planetary_value=-2500.0,
            normalization_range=10000.0,
            weight=0.5,
            score=81.0,
            is_missing=False,
            units="meters",
        )
        feature2 = AnalysisFeature(
            id="feat_002",
            analysis_id=analysis_id,
            feature_name="aridity",
            earth_value=1.0,
            planetary_value=0.0,
            normalization_range=3000.0,
            weight=0.5,
            score=99.9,
            is_missing=False,
            units="mm/yr",
        )
        analysis.features.extend([feature1, feature2])
        db_session.add(analysis)
        db_session.commit()

        # 3. Verify inserted with relationships
        saved = db_session.query(SiteAnalysis).filter(SiteAnalysis.id == analysis_id).first()
        assert saved is not None
        assert len(saved.features) == 2

        # 4. Delete analysis and verify cascade deletion of features
        db_session.delete(saved)
        db_session.commit()
        assert db_session.query(SiteAnalysis).filter(SiteAnalysis.id == analysis_id).first() is None
        assert db_session.query(AnalysisFeature).filter(AnalysisFeature.analysis_id == analysis_id).count() == 0
