# TerraTwin — Test Plan

**Project:** TerraTwin: Earth-Moon-Mars Analog Discovery & Research Platform
**Version:** 1.0.0
**Last Updated:** 2025-01-01
**Status:** Active

---

## Table of Contents

1. [Testing Strategy Overview](#1-testing-strategy-overview)
2. [Backend Unit Tests (Pytest)](#2-backend-unit-tests-pytest)
3. [Integration Tests — API Endpoints](#3-integration-tests--api-endpoints)
4. [Frontend Tests (Vitest)](#4-frontend-tests-vitest)
5. [Scientific Calculation Tests](#5-scientific-calculation-tests)
6. [Geographic Data Handling Tests](#6-geographic-data-handling-tests)
7. [Performance Test Targets](#7-performance-test-targets)
8. [Acceptance Test Cases (TC-01 – TC-16)](#8-acceptance-test-cases-tc-01--tc-16)
9. [Test Data Management](#9-test-data-management)
10. [Test Environment Setup](#10-test-environment-setup)
11. [Bug Severity Classification](#11-bug-severity-classification)

---

## 1. Testing Strategy Overview

### 1.1 The Testing Pyramid

TerraTwin follows a standard three-layer testing pyramid to maximise coverage while keeping the test suite fast and maintainable.

```
           /\
          /  \
         / E2E\          ← Few, slow, high-value end-to-end flows
        /------\
       /        \
      /Integration\      ← Moderate number; test API contracts & DB
     /------------\
    /              \
   /   Unit Tests   \    ← Many, fast, isolated function/component tests
  /------------------\
```

| Layer | Tooling | Quantity Target | Speed |
|---|---|---|---|
| Unit | Pytest (backend), Vitest (frontend) | ~70% of all tests | Fast (< 1 s each) |
| Integration | Pytest + FastAPI TestClient | ~20% of all tests | Medium (< 5 s each) |
| End-to-End | Playwright (future) | ~10% of all tests | Slow (< 60 s each) |

### 1.2 What We Test and Why

| Concern | Why It Matters |
|---|---|
| Similarity score formula (S_i) | Core scientific output; errors propagate to all rankings |
| ACS weighted aggregation | Determines site discovery results; must be deterministic |
| Data normalization | Bad normalization skews scores silently |
| Missing feature handling | Real planetary data has gaps; must degrade gracefully |
| API endpoint contracts | Frontend depends on stable JSON shapes |
| Map & 3D globe rendering | Primary user-facing deliverable for judges |
| Geographic CRS handling | Coordinate mismatches produce silent wrong locations |
| Report generation | Downloadable artifacts are a key demo requirement |

### 1.3 Testing Principles

- **No production data in tests** — all test runs use synthetic or clearly labelled DEMO DATA.
- **Tests must be repeatable** — seed the random number generator; use fixed timestamps.
- **Fast feedback loop** — the full unit suite must complete in < 60 s.
- **Coverage target** — ≥ 80% line coverage for backend scientific modules; ≥ 70% overall.

---

## 2. Backend Unit Tests (Pytest)

All backend unit tests live in `backend/tests/unit/`.

### 2.1 Similarity Score Calculation (S_i Formula)

The per-feature similarity score formula is:

$$S_i = 1 - \frac{|v_{\text{candidate}} - v_{\text{reference}}|}{R_i}$$

where $R_i$ is the normalization range for feature $i$.

```python
# backend/tests/unit/test_similarity.py

import pytest
from app.science.similarity import compute_feature_similarity

class TestFeatureSimilarity:

    def test_identical_values_return_1(self):
        """When candidate == reference, similarity must be exactly 1.0."""
        score = compute_feature_similarity(candidate=500.0, reference=500.0, range_val=1000.0)
        assert score == pytest.approx(1.0)

    def test_maximum_difference_returns_0(self):
        """When |candidate - reference| == range, similarity must be 0.0."""
        score = compute_feature_similarity(candidate=0.0, reference=1000.0, range_val=1000.0)
        assert score == pytest.approx(0.0)

    def test_half_difference_returns_0_5(self):
        score = compute_feature_similarity(candidate=250.0, reference=750.0, range_val=1000.0)
        assert score == pytest.approx(0.5)

    def test_score_clipped_to_zero_when_difference_exceeds_range(self):
        """Score must never be negative."""
        score = compute_feature_similarity(candidate=0.0, reference=1500.0, range_val=1000.0)
        assert score == pytest.approx(0.0)

    def test_zero_range_raises_value_error(self):
        with pytest.raises(ValueError, match="range_val must be > 0"):
            compute_feature_similarity(candidate=5.0, reference=5.0, range_val=0.0)

    def test_negative_range_raises_value_error(self):
        with pytest.raises(ValueError):
            compute_feature_similarity(candidate=5.0, reference=5.0, range_val=-10.0)

    def test_none_candidate_returns_none(self):
        """Missing candidate value should return None, not raise."""
        result = compute_feature_similarity(candidate=None, reference=500.0, range_val=1000.0)
        assert result is None

    def test_none_reference_returns_none(self):
        result = compute_feature_similarity(candidate=500.0, reference=None, range_val=1000.0)
        assert result is None
```

### 2.2 ACS Weighted Score Calculation

The Analog Composite Score is:

$$\text{ACS} = \frac{\sum_{i} w_i \cdot S_i}{\sum_{i} w_i} \times 100$$

```python
# backend/tests/unit/test_acs.py

import pytest
from app.science.acs import compute_acs

class TestACSCalculation:

    def test_all_perfect_similarity_gives_100(self):
        scores = {"elevation": 1.0, "slope": 1.0, "temperature": 1.0}
        weights = {"elevation": 1.0, "slope": 1.0, "temperature": 1.0}
        assert compute_acs(scores, weights) == pytest.approx(100.0)

    def test_all_zero_similarity_gives_0(self):
        scores = {"elevation": 0.0, "slope": 0.0, "temperature": 0.0}
        weights = {"elevation": 1.0, "slope": 2.0, "temperature": 3.0}
        assert compute_acs(scores, weights) == pytest.approx(0.0)

    def test_weighted_average_correct(self):
        # (0.5 * 2 + 1.0 * 1) / (2 + 1) * 100 = 66.667
        scores = {"a": 0.5, "b": 1.0}
        weights = {"a": 2.0, "b": 1.0}
        assert compute_acs(scores, weights) == pytest.approx(66.667, rel=1e-3)

    def test_missing_score_key_skipped_gracefully(self):
        """Feature in weights but missing from scores should be skipped."""
        scores = {"elevation": 0.8}
        weights = {"elevation": 1.0, "slope": 1.0}
        result = compute_acs(scores, weights)
        assert 0.0 <= result <= 100.0

    def test_weights_sum_to_zero_raises(self):
        scores = {"elevation": 0.5}
        weights = {"elevation": 0.0}
        with pytest.raises(ValueError, match="Total weight must be > 0"):
            compute_acs(scores, weights)

    def test_acs_always_between_0_and_100(self):
        import random
        random.seed(42)
        for _ in range(100):
            n = random.randint(1, 10)
            scores = {str(i): random.random() for i in range(n)}
            weights = {str(i): random.uniform(0.1, 5.0) for i in range(n)}
            result = compute_acs(scores, weights)
            assert 0.0 <= result <= 100.0
```

### 2.3 Data Normalization

```python
# backend/tests/unit/test_normalization.py

import pytest
from app.science.normalization import normalize_feature_value

class TestNormalization:

    def test_min_value_normalizes_to_0(self):
        assert normalize_feature_value(value=0.0, min_val=0.0, max_val=100.0) == pytest.approx(0.0)

    def test_max_value_normalizes_to_1(self):
        assert normalize_feature_value(value=100.0, min_val=0.0, max_val=100.0) == pytest.approx(1.0)

    def test_mid_value_normalizes_to_0_5(self):
        assert normalize_feature_value(value=50.0, min_val=0.0, max_val=100.0) == pytest.approx(0.5)

    def test_value_below_min_clipped_to_0(self):
        assert normalize_feature_value(value=-10.0, min_val=0.0, max_val=100.0) == pytest.approx(0.0)

    def test_value_above_max_clipped_to_1(self):
        assert normalize_feature_value(value=150.0, min_val=0.0, max_val=100.0) == pytest.approx(1.0)

    def test_zero_range_raises(self):
        with pytest.raises(ValueError):
            normalize_feature_value(value=5.0, min_val=5.0, max_val=5.0)
```

### 2.4 Missing Feature Handling

```python
# backend/tests/unit/test_missing_features.py

from app.science.similarity import compute_feature_similarity
from app.science.acs import compute_acs

class TestMissingFeatures:

    def test_all_features_none_returns_none_scores(self):
        features = {"elevation": None, "slope": None, "temperature": None}
        reference = {"elevation": 500.0, "slope": 10.0, "temperature": -60.0}
        ranges = {"elevation": 1000.0, "slope": 45.0, "temperature": 100.0}
        scores = {
            k: compute_feature_similarity(features[k], reference[k], ranges[k])
            for k in features
        }
        assert all(v is None for v in scores.values())

    def test_acs_with_all_none_scores_returns_none_or_zero(self):
        scores = {"elevation": None, "slope": None}
        weights = {"elevation": 1.0, "slope": 1.0}
        result = compute_acs(scores, weights)
        # Must return 0 or None — never raise
        assert result is None or result == 0.0

    def test_partial_missing_uses_available_features(self):
        scores = {"elevation": 0.9, "slope": None, "temperature": 0.7}
        weights = {"elevation": 1.0, "slope": 1.0, "temperature": 1.0}
        result = compute_acs(scores, weights)
        # Only elevation and temperature contribute: (0.9+0.7)/2 * 100 = 80
        assert result == pytest.approx(80.0, rel=0.01)
```

### 2.5 Planetary Body CRUD

```python
# backend/tests/unit/test_planet_crud.py

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.models import Base, Planet
from app.crud.planets import create_planet, get_planet, list_planets, delete_planet

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

class TestPlanetCRUD:

    def test_create_planet(self, db_session):
        planet = create_planet(db_session, name="Earth", gravity=9.81, body_type="terrestrial")
        assert planet.id is not None
        assert planet.name == "Earth"

    def test_get_planet_by_id(self, db_session):
        created = create_planet(db_session, name="Mars", gravity=3.72, body_type="terrestrial")
        fetched = get_planet(db_session, created.id)
        assert fetched.name == "Mars"

    def test_get_nonexistent_planet_returns_none(self, db_session):
        result = get_planet(db_session, planet_id=9999)
        assert result is None

    def test_list_planets_returns_all(self, db_session):
        create_planet(db_session, name="Earth", gravity=9.81, body_type="terrestrial")
        create_planet(db_session, name="Moon", gravity=1.62, body_type="moon")
        planets = list_planets(db_session)
        assert len(planets) >= 2

    def test_delete_planet(self, db_session):
        planet = create_planet(db_session, name="TestBody", gravity=5.0, body_type="terrestrial")
        delete_planet(db_session, planet.id)
        assert get_planet(db_session, planet.id) is None
```

### 2.6 Candidate Site CRUD

```python
# backend/tests/unit/test_site_crud.py

import pytest
from app.crud.sites import create_site, get_site, list_sites, update_site

class TestSiteCRUD:

    def test_create_site(self, db_session, demo_region):
        site = create_site(db_session, name="DEMO Site Alpha",
                           region_id=demo_region.id, latitude=36.0, longitude=-116.0)
        assert site.id is not None

    def test_site_requires_region(self, db_session):
        with pytest.raises(Exception):
            create_site(db_session, name="Orphan", region_id=9999,
                        latitude=0.0, longitude=0.0)

    def test_list_sites_paginated(self, db_session, demo_region):
        for i in range(15):
            create_site(db_session, name=f"Site {i}", region_id=demo_region.id,
                        latitude=float(i), longitude=float(i))
        page1 = list_sites(db_session, skip=0, limit=10)
        assert len(page1) == 10

    def test_update_site_name(self, db_session, demo_region):
        site = create_site(db_session, name="Old Name", region_id=demo_region.id,
                           latitude=0.0, longitude=0.0)
        updated = update_site(db_session, site.id, name="New Name")
        assert updated.name == "New Name"
```

### 2.7 Region CRUD

```python
# backend/tests/unit/test_region_crud.py

from app.crud.regions import create_region, list_regions_by_planet

class TestRegionCRUD:

    def test_create_region(self, db_session, demo_planet):
        region = create_region(db_session, name="Mojave", planet_id=demo_planet.id)
        assert region.id is not None

    def test_list_regions_filters_by_planet(self, db_session, demo_planet_earth, demo_planet_moon):
        create_region(db_session, name="Sahara", planet_id=demo_planet_earth.id)
        create_region(db_session, name="Mare Imbrium", planet_id=demo_planet_moon.id)
        earth_regions = list_regions_by_planet(db_session, demo_planet_earth.id)
        assert all(r.planet_id == demo_planet_earth.id for r in earth_regions)
```

### 2.8 Measurement Ingestion

```python
# backend/tests/unit/test_ingestion.py

from app.ingestion.pipeline import ingest_measurement

class TestMeasurementIngestion:

    def test_valid_measurement_stored(self, db_session, demo_site):
        result = ingest_measurement(db_session, site_id=demo_site.id,
                                    feature_name="elevation", value=1234.5,
                                    source="SRTM", quality_flag="good")
        assert result.id is not None

    def test_duplicate_measurement_handled(self, db_session, demo_site):
        """Upserting same (site, feature, source) should update, not duplicate."""
        ingest_measurement(db_session, site_id=demo_site.id,
                           feature_name="slope", value=5.0, source="SRTM")
        ingest_measurement(db_session, site_id=demo_site.id,
                           feature_name="slope", value=6.0, source="SRTM")
        from app.crud.measurements import get_measurements_for_site
        results = get_measurements_for_site(db_session, demo_site.id,
                                            feature_name="slope", source="SRTM")
        assert len(results) == 1
        assert results[0].value == 6.0

    def test_invalid_quality_flag_raises(self, db_session, demo_site):
        with pytest.raises(ValueError):
            ingest_measurement(db_session, site_id=demo_site.id,
                               feature_name="temperature", value=-50.0,
                               source="TEST", quality_flag="invalid_flag")
```

---

## 3. Integration Tests — API Endpoints

All 12 API endpoints are tested using FastAPI's `TestClient`. Tests live in `backend/tests/integration/`.

```python
# backend/tests/integration/conftest.py

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import get_db
from app.db.seed import seed_demo_data

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="module", autouse=True)
def seeded_db():
    # Seeds DEMO DATA — Earth, Moon, Mars + demo regions + demo sites
    seed_demo_data()
```

### Endpoint Test Matrix

| # | Endpoint | Method | Test File |
|---|---|---|---|
| 1 | `/health` | GET | `test_health.py` |
| 2 | `/planets` | GET | `test_planets.py` |
| 3 | `/regions` | GET | `test_regions.py` |
| 4 | `/sites` | GET | `test_sites.py` |
| 5 | `/sites/{id}` | GET | `test_sites.py` |
| 6 | `/datasets` | GET | `test_datasets.py` |
| 7 | `/discovery/search` | POST | `test_discovery.py` |
| 8 | `/analysis/compare` | POST | `test_analysis.py` |
| 9 | `/analysis/{id}` | GET | `test_analysis.py` |
| 10 | `/rankings` | GET | `test_rankings.py` |
| 11 | `/reports/generate` | POST | `test_reports.py` |
| 12 | `/reports/{id}` | GET | `test_reports.py` |

### 3.1 `/health`

```python
def test_health_check_200(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
```

### 3.2 `/planets`

```python
def test_planets_returns_list(client):
    response = client.get("/planets")
    assert response.status_code == 200
    names = [p["name"] for p in response.json()]
    assert "Earth" in names
    assert "Moon" in names
    assert "Mars" in names

def test_planets_response_schema(client):
    response = client.get("/planets")
    planet = response.json()[0]
    assert "id" in planet
    assert "name" in planet
    assert "gravity" in planet
```

### 3.3 `/regions`

```python
def test_regions_filter_by_planet(client, demo_earth_id):
    response = client.get(f"/regions?planet_id={demo_earth_id}")
    assert response.status_code == 200
    for region in response.json():
        assert region["planet_id"] == demo_earth_id

def test_regions_invalid_planet_returns_empty(client):
    response = client.get("/regions?planet_id=99999")
    assert response.status_code == 200
    assert response.json() == []
```

### 3.4 `/sites`

```python
def test_sites_returns_paginated(client):
    response = client.get("/sites?skip=0&limit=5")
    assert response.status_code == 200
    assert len(response.json()) <= 5

def test_sites_default_limit_applied(client):
    response = client.get("/sites")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
```

### 3.5 `/sites/{id}`

```python
def test_site_detail_returns_measurements(client, demo_site_id):
    response = client.get(f"/sites/{demo_site_id}")
    assert response.status_code == 200
    body = response.json()
    assert "measurements" in body
    assert isinstance(body["measurements"], list)

def test_site_detail_invalid_id_returns_404(client):
    response = client.get("/sites/999999")
    assert response.status_code == 404
```

### 3.6 `/datasets`

```python
def test_datasets_filter_by_type(client):
    response = client.get("/datasets?type=elevation")
    assert response.status_code == 200
    for ds in response.json():
        assert ds["type"] == "elevation"
```

### 3.7 `/discovery/search`

```python
def test_discovery_search_returns_ranked_sites(client):
    payload = {
        "reference_site_id": 1,  # DEMO DATA
        "feature_weights": {"elevation": 1.0, "slope": 0.8}
    }
    response = client.post("/discovery/search", json=payload)
    assert response.status_code == 200
    results = response.json()["results"]
    assert len(results) > 0
    # Verify descending order
    scores = [r["acs_score"] for r in results]
    assert scores == sorted(scores, reverse=True)

def test_discovery_search_no_matches_returns_empty(client):
    payload = {
        "reference_site_id": 1,
        "feature_weights": {"nonexistent_feature": 1.0}
    }
    response = client.post("/discovery/search", json=payload)
    assert response.status_code == 200
    assert response.json()["results"] == []
```

### 3.8 `/analysis/compare`

```python
def test_analysis_compare_triggers_job(client):
    payload = {"site_ids": [1, 2], "reference_id": 1}
    response = client.post("/analysis/compare", json=payload)
    assert response.status_code in (200, 202)
    body = response.json()
    assert "analysis_id" in body

def test_analysis_compare_returns_feature_breakdown(client, demo_analysis_id):
    response = client.get(f"/analysis/{demo_analysis_id}")
    assert response.status_code == 200
    body = response.json()
    assert "feature_breakdown" in body
    assert isinstance(body["feature_breakdown"], list)
```

### 3.9 `/rankings`

```python
def test_rankings_descending_order(client):
    response = client.get("/rankings")
    assert response.status_code == 200
    scores = [r["acs_score"] for r in response.json()]
    assert scores == sorted(scores, reverse=True)
```

### 3.10 `/reports/generate`

```python
def test_report_generation_creates_record(client):
    payload = {"analysis_id": 1, "format": "json"}
    response = client.post("/reports/generate", json=payload)
    assert response.status_code in (200, 201)
    assert "report_id" in response.json()

def test_report_download_returns_correct_format(client, demo_report_id):
    response = client.get(f"/reports/{demo_report_id}?format=json")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/json")
```

---

## 4. Frontend Tests (Vitest)

Frontend tests live in `frontend/src/__tests__/`. Run with `npm run test`.

### 4.1 React Component Rendering

```typescript
// frontend/src/__tests__/components/SiteCard.test.tsx

import { render, screen } from '@testing-library/react'
import { SiteCard } from '@/components/SiteCard'

const DEMO_SITE = {
  id: 1,
  name: 'DEMO — Mojave Desert Site A',
  acs_score: 87.5,
  region: 'Mojave',
  planet: 'Earth'
}

describe('SiteCard', () => {
  it('renders site name', () => {
    render(<SiteCard site={DEMO_SITE} />)
    expect(screen.getByText('DEMO — Mojave Desert Site A')).toBeInTheDocument()
  })

  it('renders ACS score', () => {
    render(<SiteCard site={DEMO_SITE} />)
    expect(screen.getByText('87.5')).toBeInTheDocument()
  })

  it('renders without crashing when score is 0', () => {
    render(<SiteCard site={{ ...DEMO_SITE, acs_score: 0 }} />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})
```

### 4.2 Map Initialization

```typescript
// frontend/src/__tests__/map/MapView.test.tsx

import { render } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('maplibre-gl', () => ({
  Map: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    remove: vi.fn(),
    addLayer: vi.fn(),
    addSource: vi.fn(),
  }))
}))

import { MapView } from '@/components/MapView'

describe('MapView', () => {
  it('renders map container', () => {
    const { container } = render(<MapView />)
    expect(container.querySelector('#map-container')).not.toBeNull()
  })

  it('initializes MapLibre without throwing', () => {
    expect(() => render(<MapView />)).not.toThrow()
  })
})
```

### 4.3 Chart Rendering (Plotly)

```typescript
// frontend/src/__tests__/charts/FeatureBreakdownChart.test.tsx

import { render } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('react-plotly.js', () => ({
  default: vi.fn(() => <div data-testid="plotly-chart" />)
}))

import { FeatureBreakdownChart } from '@/components/FeatureBreakdownChart'

const DEMO_DATA = [
  { feature: 'elevation', score: 0.85 },
  { feature: 'slope', score: 0.72 },
]

describe('FeatureBreakdownChart', () => {
  it('renders chart element', () => {
    const { getByTestId } = render(<FeatureBreakdownChart data={DEMO_DATA} />)
    expect(getByTestId('plotly-chart')).toBeInTheDocument()
  })

  it('renders without crashing on empty data', () => {
    expect(() => render(<FeatureBreakdownChart data={[]} />)).not.toThrow()
  })
})
```

### 4.4 Form Validation

```typescript
// frontend/src/__tests__/forms/DiscoverySearchForm.test.tsx

import { render, fireEvent, screen } from '@testing-library/react'
import { DiscoverySearchForm } from '@/components/DiscoverySearchForm'

describe('DiscoverySearchForm', () => {
  it('shows error when no reference site selected', async () => {
    render(<DiscoverySearchForm onSubmit={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /search/i }))
    expect(await screen.findByText(/reference site is required/i)).toBeInTheDocument()
  })

  it('calls onSubmit with correct payload when valid', async () => {
    const mockSubmit = vi.fn()
    render(<DiscoverySearchForm onSubmit={mockSubmit} />)
    // ... select reference site, set weights, submit
    // Assert mockSubmit called with { reference_site_id, feature_weights }
  })
})
```

### 4.5 API Response Parsing

```typescript
// frontend/src/__tests__/api/apiClient.test.ts

import { vi } from 'vitest'
import { fetchSites, fetchPlanets } from '@/api/client'

global.fetch = vi.fn()

describe('API Client', () => {
  it('fetchPlanets parses response correctly', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [{ id: 1, name: 'Earth', gravity: 9.81 }]
    })
    const planets = await fetchPlanets()
    expect(planets[0].name).toBe('Earth')
  })

  it('fetchSites handles 500 error gracefully', async () => {
    (fetch as any).mockResolvedValue({ ok: false, status: 500 })
    await expect(fetchSites()).rejects.toThrow()
  })
})
```

---

## 5. Scientific Calculation Tests

### 5.1 Edge Case: All Features Missing

```python
def test_all_features_missing_acs_is_none_or_zero():
    scores = {f: None for f in ["elevation", "slope", "temperature", "albedo"]}
    weights = {f: 1.0 for f in scores}
    result = compute_acs(scores, weights)
    assert result is None or result == 0.0
```

### 5.2 Edge Case: One Feature 100% Similar

```python
def test_single_feature_perfect_match():
    result = compute_feature_similarity(candidate=750.0, reference=750.0, range_val=1500.0)
    assert result == pytest.approx(1.0)
```

### 5.3 Edge Case: One Feature 0% Similar

```python
def test_single_feature_zero_similarity():
    result = compute_feature_similarity(candidate=0.0, reference=1500.0, range_val=1500.0)
    assert result == pytest.approx(0.0)
```

### 5.4 Edge Case: Weights Sum to Zero (Error)

```python
def test_zero_total_weight_raises():
    scores = {"elevation": 0.5, "slope": 0.3}
    weights = {"elevation": 0.0, "slope": 0.0}
    with pytest.raises(ValueError, match="Total weight must be > 0"):
        compute_acs(scores, weights)
```

### 5.5 ACS Boundary Values

```python
@pytest.mark.parametrize("scores,weights,expected", [
    ({"a": 1.0}, {"a": 1.0}, 100.0),    # Perfect match
    ({"a": 0.0}, {"a": 1.0}, 0.0),      # No match
    ({"a": 0.5}, {"a": 1.0}, 50.0),     # Midpoint
    ({"a": 1.0, "b": 0.0}, {"a": 1.0, "b": 1.0}, 50.0),  # Mixed
])
def test_acs_boundary_values(scores, weights, expected):
    assert compute_acs(scores, weights) == pytest.approx(expected, rel=1e-3)
```

---

## 6. Geographic Data Handling Tests

### 6.1 CRS Mismatch Handling

```python
# backend/tests/unit/test_geo_handling.py

import pytest
from app.geo.utils import reproject_geometry
import geopandas as gpd
from shapely.geometry import Point

def test_crs_reprojection_from_4326_to_3857():
    gdf = gpd.GeoDataFrame(geometry=[Point(-116.0, 36.0)], crs="EPSG:4326")
    reprojected = reproject_geometry(gdf, target_crs="EPSG:3857")
    assert reprojected.crs.to_epsg() == 3857

def test_missing_crs_raises_error():
    gdf = gpd.GeoDataFrame(geometry=[Point(0, 0)])  # No CRS set
    with pytest.raises(ValueError, match="CRS not defined"):
        reproject_geometry(gdf, target_crs="EPSG:4326")
```

### 6.2 Geometry Validation

```python
def test_invalid_geometry_detected():
    from shapely.geometry import Polygon
    from app.geo.validation import validate_geometry
    # Self-intersecting polygon (bowtie) — invalid
    bowtie = Polygon([(0,0),(1,1),(1,0),(0,1)])
    assert not validate_geometry(bowtie)

def test_valid_geometry_passes():
    from shapely.geometry import Point
    from app.geo.validation import validate_geometry
    assert validate_geometry(Point(0.0, 0.0))
```

### 6.3 Out-of-Bounds Coordinates

```python
@pytest.mark.parametrize("lat,lon,valid", [
    (91.0, 0.0, False),    # Latitude > 90
    (-91.0, 0.0, False),   # Latitude < -90
    (0.0, 181.0, False),   # Longitude > 180
    (0.0, -181.0, False),  # Longitude < -180
    (36.0, -116.0, True),  # Valid (Mojave — DEMO DATA)
    (0.0, 0.0, True),      # Valid (null island)
])
def test_coordinate_bounds_validation(lat, lon, valid):
    from app.geo.validation import validate_coordinates
    assert validate_coordinates(lat, lon) == valid
```

### 6.4 Null Geometry

```python
def test_null_geometry_site_handled():
    from app.geo.utils import get_geometry_or_none
    result = get_geometry_or_none(None)
    assert result is None  # Must not raise

def test_empty_geometry_returns_none():
    from shapely.geometry import GeometryCollection
    from app.geo.utils import get_geometry_or_none
    result = get_geometry_or_none(GeometryCollection())
    assert result is None
```

---

## 7. Performance Test Targets

### 7.1 Summary Table

| Metric | Target | Measurement Tool | Failure Threshold |
|---|---|---|---|
| API response time (single request) | < 500 ms | `pytest-benchmark`, `httpx` | > 1000 ms |
| Map (2D) initial load | < 2 s | Lighthouse, browser DevTools | > 4 s |
| 3D Globe (CesiumJS) initial load | < 3 s | Browser DevTools | > 6 s |
| Discovery search (full corpus) | < 5 s | `pytest-benchmark` | > 10 s |
| Analysis comparison (10 sites) | < 10 s | `pytest-benchmark` | > 20 s |
| Concurrent users supported | ≥ 50 | `locust` load test | < 25 |
| DB query (site list, 1000 rows) | < 100 ms | SQLAlchemy event timing | > 300 ms |

### 7.2 Load Test Script (Locust — DEMO)

```python
# backend/tests/performance/locustfile.py
# DEMO DATA — adjust host and IDs for real environment

from locust import HttpUser, task, between

class TerraTwinUser(HttpUser):
    wait_time = between(1, 3)

    @task(3)
    def browse_sites(self):
        self.client.get("/sites?skip=0&limit=20")

    @task(2)
    def view_site_detail(self):
        self.client.get("/sites/1")  # DEMO DATA — site id 1

    @task(1)
    def run_discovery_search(self):
        self.client.post("/discovery/search", json={
            "reference_site_id": 1,  # DEMO DATA
            "feature_weights": {"elevation": 1.0, "slope": 0.8}
        })
```

Run with: `locust -f locustfile.py --host=http://localhost:8000 --users 50 --spawn-rate 5`

---

## 8. Acceptance Test Cases (TC-01 – TC-16)

> [!NOTE]
> All test cases below use **DEMO DATA** seeded via `seed_demo_data()`. Real IDs will differ.

---

### TC-01: Health Check Returns 200 OK

| Field | Detail |
|---|---|
| **ID** | TC-01 |
| **Name** | Health Check Returns 200 OK |
| **Actor / Component** | QA Engineer / `/health` API endpoint |
| **Preconditions** | Backend server running; database connection established |
| **Test Steps** | 1. Send `GET /health` request to the API server |
| **Expected Result** | HTTP 200 response with body `{"status": "ok"}` |
| **Pass Criteria** | Status code == 200 AND `status` field == `"ok"` |

---

### TC-02: Planet List Returns Earth, Moon, Mars

| Field | Detail |
|---|---|
| **ID** | TC-02 |
| **Name** | Planet List Returns Earth, Moon, Mars |
| **Actor / Component** | QA Engineer / `/planets` API endpoint |
| **Preconditions** | DEMO DATA seeded (Earth, Moon, Mars records present) |
| **Test Steps** | 1. Send `GET /planets` 2. Parse JSON response array |
| **Expected Result** | Array contains objects with `name` values "Earth", "Moon", "Mars" |
| **Pass Criteria** | All three planets present; no duplicates; each has `id` and `gravity` |

---

### TC-03: Region List Filters by planet_id Correctly

| Field | Detail |
|---|---|
| **ID** | TC-03 |
| **Name** | Region List Filters by planet_id Correctly |
| **Actor / Component** | QA Engineer / `/regions` API endpoint |
| **Preconditions** | DEMO DATA seeded; Earth has at least 2 regions, Moon has at least 1 |
| **Test Steps** | 1. `GET /planets` → note Earth's `id` (DEMO: `id=1`) 2. `GET /regions?planet_id=1` 3. Verify all returned regions belong to Earth |
| **Expected Result** | All regions in response have `planet_id == 1` (DEMO DATA) |
| **Pass Criteria** | Zero regions from other planets appear in the response |

---

### TC-04: Site List Returns Paginated Results

| Field | Detail |
|---|---|
| **ID** | TC-04 |
| **Name** | Site List Returns Paginated Results |
| **Actor / Component** | QA Engineer / `/sites` API endpoint |
| **Preconditions** | At least 15 candidate sites in DEMO DATA |
| **Test Steps** | 1. `GET /sites?skip=0&limit=5` → verify 5 results 2. `GET /sites?skip=5&limit=5` → verify different 5 results 3. `GET /sites?skip=100&limit=5` → verify empty or fewer results |
| **Expected Result** | First two pages return exactly 5 items each; third page ≤ 5 items |
| **Pass Criteria** | No overlap between pages; `skip` and `limit` parameters respected |

---

### TC-05: Site Detail Returns Measurements

| Field | Detail |
|---|---|
| **ID** | TC-05 |
| **Name** | Site Detail Returns Measurements |
| **Actor / Component** | QA Engineer / `/sites/{id}` API endpoint |
| **Preconditions** | DEMO Site with `id=1` has ≥ 3 measurement records |
| **Test Steps** | 1. `GET /sites/1` 2. Check response body for `measurements` key 3. Verify at least one measurement has `feature_name`, `value`, `source` |
| **Expected Result** | Response includes `measurements` array with ≥ 1 items |
| **Pass Criteria** | `measurements` is a non-empty list; each item has required fields |

---

### TC-06: Dataset List Filters by Type

| Field | Detail |
|---|---|
| **ID** | TC-06 |
| **Name** | Dataset List Filters by Type |
| **Actor / Component** | QA Engineer / `/datasets` API endpoint |
| **Preconditions** | DEMO DATA includes datasets of types: `elevation`, `thermal`, `spectral` |
| **Test Steps** | 1. `GET /datasets?type=elevation` 2. Verify all returned datasets have `type == "elevation"` |
| **Expected Result** | Only elevation-type datasets returned |
| **Pass Criteria** | Zero datasets of other types in the response |

---

### TC-07: Discovery Search Returns Ranked Sites

| Field | Detail |
|---|---|
| **ID** | TC-07 |
| **Name** | Discovery Search Returns Ranked Sites |
| **Actor / Component** | QA Engineer / `/discovery/search` API endpoint |
| **Preconditions** | DEMO reference site `id=1`; ≥ 5 candidate sites with measurements |
| **Test Steps** | 1. `POST /discovery/search` with `{"reference_site_id": 1, "feature_weights": {"elevation": 1.0, "slope": 0.8}}` 2. Parse `results` array 3. Check ACS scores are in descending order |
| **Expected Result** | Non-empty `results` array; `acs_score` values descending |
| **Pass Criteria** | `results[i].acs_score >= results[i+1].acs_score` for all consecutive pairs |

---

### TC-08: Discovery Search with No Matches Returns Empty List

| Field | Detail |
|---|---|
| **ID** | TC-08 |
| **Name** | Discovery Search with No Matches Returns Empty List |
| **Actor / Component** | QA Engineer / `/discovery/search` API endpoint |
| **Preconditions** | No sites have measurements for feature `"nonexistent_xyz"` |
| **Test Steps** | 1. `POST /discovery/search` with `{"reference_site_id": 1, "feature_weights": {"nonexistent_xyz": 1.0}}` |
| **Expected Result** | HTTP 200 with `{"results": []}` |
| **Pass Criteria** | Status == 200; `results` is an empty list; no error thrown |

---

### TC-09: Analysis Compare Triggers Scoring Job

| Field | Detail |
|---|---|
| **ID** | TC-09 |
| **Name** | Analysis Compare Triggers Scoring Job |
| **Actor / Component** | QA Engineer / `/analysis/compare` API endpoint |
| **Preconditions** | DEMO sites `id=1` and `id=2` exist with measurements |
| **Test Steps** | 1. `POST /analysis/compare` with `{"site_ids": [1, 2], "reference_id": 1}` 2. Verify response contains `analysis_id` |
| **Expected Result** | HTTP 200/202 with `analysis_id` in response |
| **Pass Criteria** | `analysis_id` is a positive integer or UUID; job record created in DB |

---

### TC-10: Analysis Result Contains Feature Breakdown

| Field | Detail |
|---|---|
| **ID** | TC-10 |
| **Name** | Analysis Result Contains Feature Breakdown |
| **Actor / Component** | QA Engineer / `/analysis/{id}` API endpoint |
| **Preconditions** | DEMO analysis `id=1` exists and is complete |
| **Test Steps** | 1. `GET /analysis/1` 2. Verify `feature_breakdown` key present 3. Each breakdown item has `feature_name` and `score` |
| **Expected Result** | `feature_breakdown` is a list with ≥ 1 items |
| **Pass Criteria** | `feature_breakdown[i].score` is numeric; `feature_name` is a string |

---

### TC-11: ACS Score Is Between 0 and 100

| Field | Detail |
|---|---|
| **ID** | TC-11 |
| **Name** | ACS Score Is Between 0 and 100 |
| **Actor / Component** | QA Engineer / `/discovery/search` + `/rankings` |
| **Preconditions** | DEMO data with varied site measurements |
| **Test Steps** | 1. `GET /rankings` 2. For every result, assert `0 <= acs_score <= 100` |
| **Expected Result** | All ACS scores in [0, 100] range |
| **Pass Criteria** | No score below 0 or above 100 in any API response |

---

### TC-12: Rankings Return Sites in Descending Score Order

| Field | Detail |
|---|---|
| **ID** | TC-12 |
| **Name** | Rankings Return Sites in Descending Score Order |
| **Actor / Component** | QA Engineer / `/rankings` API endpoint |
| **Preconditions** | At least 5 sites with computed ACS scores in DEMO DATA |
| **Test Steps** | 1. `GET /rankings` 2. Extract all `acs_score` values 3. Assert list is non-increasing |
| **Expected Result** | First site has highest score; last site has lowest |
| **Pass Criteria** | `scores == sorted(scores, reverse=True)` |

---

### TC-13: Report Generation Creates a Record

| Field | Detail |
|---|---|
| **ID** | TC-13 |
| **Name** | Report Generation Creates a Record |
| **Actor / Component** | QA Engineer / `/reports/generate` API endpoint |
| **Preconditions** | DEMO analysis `id=1` complete; report directory writable |
| **Test Steps** | 1. `POST /reports/generate` with `{"analysis_id": 1, "format": "json"}` 2. Note returned `report_id` 3. Query DB to confirm record exists |
| **Expected Result** | HTTP 200/201; `report_id` present; DB record created |
| **Pass Criteria** | Report record in DB; file exists on disk or in object store |

---

### TC-14: Report Download Returns Correct Format

| Field | Detail |
|---|---|
| **ID** | TC-14 |
| **Name** | Report Download Returns Correct Format |
| **Actor / Component** | QA Engineer / `/reports/{id}` API endpoint |
| **Preconditions** | DEMO report `id=1` exists in JSON format |
| **Test Steps** | 1. `GET /reports/1?format=json` 2. Check `Content-Type` header 3. Verify body is valid JSON |
| **Expected Result** | HTTP 200; `Content-Type: application/json`; parseable body |
| **Pass Criteria** | `json.loads(response.text)` succeeds without error |

---

### TC-15: Missing Feature Data Is Handled Gracefully

| Field | Detail |
|---|---|
| **ID** | TC-15 |
| **Name** | Missing Feature Data Is Handled Gracefully |
| **Actor / Component** | QA Engineer / `/discovery/search` |
| **Preconditions** | DEMO site `id=3` has NO measurements stored |
| **Test Steps** | 1. `POST /discovery/search` with `{"reference_site_id": 1, "feature_weights": {"elevation": 1.0}}` 2. Verify site 3 either absent from results or shows `acs_score: null` |
| **Expected Result** | HTTP 200; no crash; site with missing data handled gracefully |
| **Pass Criteria** | No 500 error; response is valid JSON; site 3 is either excluded or shows `null`/`0` score |

---

### TC-16: Invalid site_id Returns 404

| Field | Detail |
|---|---|
| **ID** | TC-16 |
| **Name** | Invalid site_id Returns 404 |
| **Actor / Component** | QA Engineer / `/sites/{id}` |
| **Preconditions** | Site with `id=999999` does not exist |
| **Test Steps** | 1. `GET /sites/999999` |
| **Expected Result** | HTTP 404 with error message |
| **Pass Criteria** | Status == 404; response body contains `"detail"` or `"error"` key |

---

## 9. Test Data Management

### 9.1 Policy

| Data Type | Usage | Policy |
|---|---|---|
| **Synthetic DEMO DATA** | Unit & integration tests | ✅ Preferred — always labeled "DEMO" in names |
| **Real NASA/ESA datasets** | Manual validation only | ⚠️ Never committed to repo; stored in `/data/raw/` (gitignored) |
| **Production data** | Never used in tests | ❌ Strictly forbidden |

### 9.2 DEMO DATA Seed Contents

The `seed_demo_data()` function populates:

- **3 Planets:** Earth (g=9.81), Moon (g=1.62), Mars (g=3.72) — `[DEMO DATA]`
- **6 Regions:** 2 per planet (e.g., Mojave, Iceland, Mare Imbrium, etc.) — `[DEMO DATA]`
- **15 Candidate Sites:** 5 per planet with lat/lon coordinates — `[DEMO DATA]`
- **45 Measurements:** 3 features × 15 sites (elevation, slope, albedo) — `[DEMO DATA]`
- **1 Analysis Job:** Pre-computed ACS scores for all 15 sites — `[DEMO DATA]`
- **1 Report:** JSON format report for the demo analysis — `[DEMO DATA]`

### 9.3 Test Isolation

- Each test module uses a fresh in-memory SQLite database (via `sqlite:///:memory:`).
- Fixtures with `scope="function"` roll back after each test.
- No test should mutate shared module-scoped fixtures without an explicit `scope="module"` justification.

---

## 10. Test Environment Setup

### 10.1 Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Python | 3.11+ | Backend & scientific tests |
| Node.js | 20 LTS | Frontend tests |
| npm | 10+ | Frontend package management |
| Git | Any | Repository management |

### 10.2 Backend Setup (Windows + PowerShell)

```powershell
# 1. Navigate to backend directory
cd "E:\Nasa Space X\TerraTwin\backend"

# 2. Create virtual environment
python -m venv .venv

# 3. Activate virtual environment
.\.venv\Scripts\Activate.ps1

# 4. Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt  # Includes pytest, pytest-cov, pytest-benchmark

# 5. Run all backend tests
pytest

# 6. Run with coverage report
pytest --cov=app --cov-report=html

# 7. Run only unit tests
pytest tests/unit/ -v

# 8. Run only integration tests
pytest tests/integration/ -v

# 9. Run specific test file
pytest tests/unit/test_similarity.py -v

# 10. Run performance benchmarks
pytest tests/performance/ --benchmark-only
```

### 10.3 Frontend Setup (Windows + PowerShell)

```powershell
# 1. Navigate to frontend directory
cd "E:\Nasa Space X\TerraTwin\frontend"

# 2. Install dependencies
npm install

# 3. Run all frontend tests
npm run test

# 4. Run tests with coverage
npm run test -- --coverage

# 5. Run tests in watch mode (development)
npm run test -- --watch

# 6. Run specific test file
npm run test -- SiteCard.test.tsx
```

### 10.4 Required `pytest` Plugins

```
# requirements-dev.txt (backend)
pytest>=8.0
pytest-cov>=5.0
pytest-benchmark>=4.0
pytest-asyncio>=0.23
httpx>=0.27          # For async TestClient
locust>=2.28         # For load tests
```

### 10.5 Required npm Dev Dependencies

```json
// package.json (frontend devDependencies)
{
  "vitest": "^1.0.0",
  "@testing-library/react": "^14.0.0",
  "@testing-library/jest-dom": "^6.0.0",
  "@testing-library/user-event": "^14.0.0",
  "jsdom": "^24.0.0",
  "c8": "^9.0.0"
}
```

### 10.6 CI/CD Note

> [!TIP]
> Run `pytest tests/unit/ tests/integration/ -x --tb=short` in your CI pipeline for fast feedback. Add `-n auto` with `pytest-xdist` to parallelise across CPU cores.

---

## 11. Bug Severity Classification

### 11.1 Severity Table

| Severity | Label | Definition | Response Time | Examples |
|---|---|---|---|---|
| **Critical** | 🔴 CRIT | System is unusable; data loss or corruption possible; no workaround | Immediate (same session) | Backend crash on any request; ACS score calculation silently returns wrong values; database corruption |
| **High** | 🟠 HIGH | Major feature broken; workaround exists but is unreliable | Within 24 hours | Discovery search returns no results when it should; site detail returns 500; map fails to load on first visit |
| **Medium** | 🟡 MED | Feature partially broken; acceptable workaround available | Within 3 days | Incorrect sort order in rankings; chart label truncated; pagination off by one; CRS warnings in logs |
| **Low** | 🟢 LOW | Cosmetic issue or minor inconvenience; no data or workflow impact | Before next release | Typo in UI label; tooltip alignment off; extra whitespace in JSON response; missing loading spinner |

### 11.2 Bug Report Template

```markdown
**ID:** BUG-XXX
**Severity:** 🔴 CRIT / 🟠 HIGH / 🟡 MED / 🟢 LOW
**Component:** Backend / Frontend / Scientific Engine / Geo / DB
**Summary:** One-line description

**Steps to Reproduce:**
1. ...
2. ...

**Expected Behavior:** ...
**Actual Behavior:** ...
**Environment:** Windows 11 / Python 3.11 / Node 20 / SQLite
**Logs / Screenshots:** (attach)
```

---

*End of TEST_PLAN.md — TerraTwin v1.0.0*
