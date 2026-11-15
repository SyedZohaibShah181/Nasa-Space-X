"""
TerraTwin Backend – Test Suite
================================
Milestone 1 tests: Verify that all API endpoints respond correctly.

Run with:
    cd backend
    .venv\\Scripts\\activate
    uv run pytest tests/ -v
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


# ─────────────────────────────────────────────
# TC-01 – Application starts successfully
# ─────────────────────────────────────────────
class TestRoot:
    def test_root_returns_200(self):
        response = client.get("/")
        assert response.status_code == 200

    def test_root_contains_project_name(self):
        response = client.get("/")
        data = response.json()
        assert data["project"] == "TerraTwin"

    def test_root_contains_status(self):
        response = client.get("/")
        data = response.json()
        assert data["status"] == "running"


# ─────────────────────────────────────────────
# TC-01 – Health check
# ─────────────────────────────────────────────
class TestHealth:
    def test_health_returns_200(self):
        response = client.get("/api/health")
        assert response.status_code == 200

    def test_health_status_is_healthy(self):
        response = client.get("/api/health")
        data = response.json()
        assert data["status"] == "healthy"

    def test_health_contains_timestamp(self):
        response = client.get("/api/health")
        data = response.json()
        assert "timestamp" in data


# ─────────────────────────────────────────────
# TC-03 – Planet selection
# ─────────────────────────────────────────────
class TestPlanets:
    def test_list_planets_returns_200(self):
        response = client.get("/api/planets")
        assert response.status_code == 200

    def test_planets_contains_moon_and_mars(self):
        response = client.get("/api/planets")
        data = response.json()
        planet_ids = [p["id"] for p in data["planets"]]
        assert "moon" in planet_ids
        assert "mars" in planet_ids

    def test_get_moon(self):
        response = client.get("/api/planets/moon")
        assert response.status_code == 200
        assert response.json()["planet"]["id"] == "moon"

    def test_get_mars(self):
        response = client.get("/api/planets/mars")
        assert response.status_code == 200
        assert response.json()["planet"]["id"] == "mars"

    def test_invalid_planet_returns_404(self):
        response = client.get("/api/planets/jupiter")
        assert response.status_code == 404


# ─────────────────────────────────────────────
# TC-04 – Reference region selection
# ─────────────────────────────────────────────
class TestRegions:
    def test_list_regions_returns_200(self):
        response = client.get("/api/regions")
        assert response.status_code == 200

    def test_regions_has_items(self):
        response = client.get("/api/regions")
        data = response.json()
        assert data["count"] > 0

    def test_filter_by_mars(self):
        response = client.get("/api/regions?planet=mars")
        data = response.json()
        for region in data["regions"]:
            assert region["planet"] == "mars"

    def test_filter_by_moon(self):
        response = client.get("/api/regions?planet=moon")
        data = response.json()
        for region in data["regions"]:
            assert region["planet"] == "moon"

    def test_get_jezero_crater(self):
        response = client.get("/api/regions/jezero_crater")
        assert response.status_code == 200
        assert response.json()["region"]["id"] == "jezero_crater"

    def test_invalid_region_returns_404(self):
        response = client.get("/api/regions/nonexistent_region")
        assert response.status_code == 404


# ─────────────────────────────────────────────
# TC-05 – Candidate sites
# ─────────────────────────────────────────────
class TestSites:
    def test_list_sites_returns_200(self):
        response = client.get("/api/sites")
        assert response.status_code == 200

    def test_sites_has_items(self):
        response = client.get("/api/sites")
        data = response.json()
        assert data["count"] > 0

    def test_filter_by_mars(self):
        response = client.get("/api/sites?planet=mars")
        data = response.json()
        for site in data["sites"]:
            assert site["planetary_target"] == "mars"

    def test_get_atacama(self):
        response = client.get("/api/sites/atacama_desert")
        assert response.status_code == 200
        assert response.json()["site"]["id"] == "atacama_desert"

    def test_invalid_site_returns_404(self):
        response = client.get("/api/sites/fake_site")
        assert response.status_code == 404

    def test_all_sites_have_data_status_label(self):
        """Every site response must clearly label demo data."""
        response = client.get("/api/sites")
        data = response.json()
        assert data["data_status"] == "DEMO_DATA"


# ─────────────────────────────────────────────
# TC-07 – Dataset catalog
# ─────────────────────────────────────────────
class TestDatasets:
    def test_list_datasets_returns_200(self):
        response = client.get("/api/datasets")
        assert response.status_code == 200

    def test_datasets_has_items(self):
        response = client.get("/api/datasets")
        data = response.json()
        assert data["count"] > 0

    def test_datasets_have_provider_field(self):
        response = client.get("/api/datasets")
        data = response.json()
        for dataset in data["datasets"]:
            assert "provider" in dataset
            assert "url" in dataset


# ─────────────────────────────────────────────
# TC-11 – Rankings
# ─────────────────────────────────────────────
class TestRankings:
    def test_rankings_returns_200(self):
        response = client.get("/api/rankings")
        assert response.status_code == 200

    def test_rankings_labeled_as_demo(self):
        response = client.get("/api/rankings")
        data = response.json()
        assert data["data_status"] == "DEMO_DATA"


# ─────────────────────────────────────────────
# TC-14 – API error handling
# ─────────────────────────────────────────────
class TestErrorHandling:
    def test_nonexistent_endpoint_returns_404(self):
        response = client.get("/api/nonexistent_endpoint_xyz")
        assert response.status_code == 404

    def test_analysis_post_without_body_returns_422(self):
        response = client.post("/api/analysis/compare", json={})
        assert response.status_code == 422

