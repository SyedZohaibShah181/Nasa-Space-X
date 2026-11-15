# TerraTwin — REST API Documentation

> **Project:** TerraTwin | Earth-Moon-Mars Analog Discovery & Research Platform
> **Challenge:** NASA Space Apps Challenge
> **Backend:** Python + FastAPI
> **API Version:** v1

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Base URLs](#2-base-urls)
3. [Versioning Strategy](#3-versioning-strategy)
4. [Authentication](#4-authentication)
5. [Standard Error Format](#5-standard-error-format)
6. [HTTP Status Codes](#6-http-status-codes)
7. [Rate Limiting](#7-rate-limiting)
8. [Endpoints](#8-endpoints)
   - [GET /health](#81-get-health)
   - [GET /planets](#82-get-planets)
   - [GET /regions](#83-get-regions)
   - [GET /sites](#84-get-sites)
   - [GET /sites/{id}](#85-get-sitesid)
   - [GET /datasets](#86-get-datasets)
   - [POST /discovery/search](#87-post-discoverysearch)
   - [POST /analysis/compare](#88-post-analysiscompare)
   - [GET /analysis/{id}](#89-get-analysisid)
   - [GET /rankings](#810-get-rankings)
   - [POST /reports/generate](#811-post-reportsgenerate)
   - [GET /reports/{id}](#812-get-reportsid)

---

## 1. Design Principles

TerraTwin's API is designed to be **simple, predictable, and beginner-friendly** while following established REST conventions.

### RESTful Resource Design

- **Resources are nouns**, not verbs: `/sites`, `/planets`, `/analysis/{id}`.
- **HTTP methods express intent**: `GET` reads data, `POST` creates resources or triggers computation.
- URLs use **lowercase, hyphenated paths**: `/discovery/search`, `/reports/generate`.
- Collection endpoints return **arrays**; single-resource endpoints return **objects**.

### JSON First

- All request bodies and response bodies are **JSON** (`Content-Type: application/json`).
- Dates and timestamps follow **ISO 8601** format: `"2024-10-15T14:30:00Z"`.
- Null values are included explicitly in responses (not omitted) for schema clarity.

### Consistent Response Envelope

All successful responses are wrapped in a consistent envelope:

```json
{
  "success": true,
  "data": { ... },      // Object or array — the actual result
  "meta": { ... }       // Pagination, counts, timing (where applicable)
}
```

### Error Handling

All errors return a JSON error object (see §5) with a machine-readable `code` and human-readable `message`. HTTP status codes align with the error type (see §6).

### Idempotency

- `GET` requests are always safe and idempotent.
- `POST /analysis/compare` is **not** idempotent — each call creates a new analysis record. The client should check for existing analyses before re-submitting.

---

## 2. Base URLs

| Environment | Base URL |
|---|---|
| **Development (local)** | `http://localhost:8000/api/v1` |
| **Production (placeholder)** | `https://api.terratwin.nasa-spaceapps.example/api/v1` |

All endpoint paths in this document are **relative to the base URL**.

**Example full URL:**
```
GET http://localhost:8000/api/v1/sites?country=Chile&limit=10
```

---

## 3. Versioning Strategy

The API version is embedded in the URL path as `/api/v1/`. This is intentional:

- **Path versioning** is explicit and visible in every request log.
- When a **breaking change** is required (e.g., renamed fields, changed response structure), a new version `/api/v2/` is released.
- `/api/v1/` remains operational for a **deprecation window** (minimum 6 months in production) to allow clients to migrate.
- **Non-breaking additions** (new optional fields, new endpoints) are added to the existing version without bumping.

The current API version is returned in every response header:

```
X-TerraTwin-API-Version: 1.0.0
```

---

## 4. Authentication

> **⚠️ Prototype Notice:** Authentication is **not enforced** in the current prototype build. All endpoints are publicly accessible for demonstration purposes.

### Planned: JWT Bearer Token Authentication

In the production build, authentication will work as follows:

1. The client obtains a JWT token by posting credentials to `POST /auth/token` (not yet implemented).
2. Every subsequent request includes the token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

3. Tokens expire after **24 hours**. A refresh endpoint (`POST /auth/refresh`) will be provided.

### Role-Based Access

| Role         | Permissions                                                   |
|--------------|---------------------------------------------------------------|
| `guest`      | Read-only: list planets, regions, sites, datasets, rankings   |
| `researcher` | All guest permissions + submit sites, run analyses, generate reports |
| `admin`      | All researcher permissions + manage users, datasets, seed data|

Endpoints that require authentication will return `401 Unauthorized` if no token is supplied, and `403 Forbidden` if the token's role is insufficient.

---

## 5. Standard Error Format

All error responses use this structure:

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "No candidate site found with id 999.",
    "details": {
      "field": "id",
      "provided_value": 999
    }
  }
}
```

| Field              | Type   | Description                                              |
|--------------------|--------|----------------------------------------------------------|
| `error.code`       | string | Machine-readable error identifier (SCREAMING_SNAKE_CASE) |
| `error.message`    | string | Human-readable explanation                               |
| `error.details`    | object | Optional: field-level validation errors or context       |

### Common Error Codes

| Code                     | Meaning                                           |
|--------------------------|---------------------------------------------------|
| `VALIDATION_ERROR`       | Request body or query param failed validation     |
| `RESOURCE_NOT_FOUND`     | Requested resource does not exist                 |
| `UNAUTHORIZED`           | Missing or invalid auth token                     |
| `FORBIDDEN`              | Authenticated but insufficient role               |
| `ANALYSIS_IN_PROGRESS`   | Analysis is still running; result not ready       |
| `ANALYSIS_FAILED`        | Analysis computation encountered an error         |
| `UNSUPPORTED_FORMAT`     | Requested report format not supported             |
| `INTERNAL_SERVER_ERROR`  | Unexpected server-side failure                    |

---

## 6. HTTP Status Codes

| Code | Meaning                | When Used                                                        |
|------|------------------------|------------------------------------------------------------------|
| `200`| OK                     | Successful `GET` or `POST` returning existing data               |
| `201`| Created                | Successful `POST` that created a new resource                    |
| `400`| Bad Request            | Malformed JSON, missing required fields                          |
| `401`| Unauthorized           | No auth token (planned)                                          |
| `403`| Forbidden              | Insufficient role for the action (planned)                       |
| `404`| Not Found              | Resource with the given ID does not exist                        |
| `422`| Unprocessable Entity   | Request is well-formed but semantically invalid (FastAPI/Pydantic)|
| `500`| Internal Server Error  | Unhandled exception on the server                                |

---

## 7. Rate Limiting

> **⚠️ Planned Feature:** Rate limiting is not active in the prototype.

In production, the following limits are planned:

| Tier       | Limit                   | Applied To                        |
|------------|-------------------------|-----------------------------------|
| Anonymous  | 60 requests / minute    | All unauthenticated requests      |
| Researcher | 300 requests / minute   | Authenticated researcher accounts |
| Admin      | Unlimited               | Admin accounts                    |

When a rate limit is exceeded, the API will return `429 Too Many Requests` with:

```
Retry-After: 30
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1700000000
```

---

## 8. Endpoints

---

### 8.1 `GET /health`

**Description:** Health check endpoint. Returns the current operational status of the API server and database connection. Useful for load balancer probes and uptime monitoring.

**Authentication required:** No

**Query Parameters:** None

**Request Example:**
```
GET http://localhost:8000/api/v1/health
```

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "database": "connected",
    "timestamp": "2024-10-15T14:30:00Z"
  }
}
```

**Error Codes:**

| Code | Scenario |
|------|----------|
| `500`| Database unreachable or server startup failure |

---

### 8.2 `GET /planets`

**Description:** Returns the list of all planetary bodies in the TerraTwin database (Earth, Moon, Mars). These are the reference bodies used to anchor regions and datasets.

**Authentication required:** No

**Query Parameters:** None

**Request Example:**
```
GET http://localhost:8000/api/v1/planets
```

**Response — 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Earth",
      "radius_km": 6371.0,
      "gravity_ms2": 9.807,
      "atmosphere_pressure_pa": 101325.0,
      "mean_surface_temp_k": 288.15,
      "description": "The third planet from the Sun and only known planet to harbour life.",
      "created_at": "2024-10-01T00:00:00Z"
    },
    {
      "id": 2,
      "name": "Moon",
      "radius_km": 1737.4,
      "gravity_ms2": 1.620,
      "atmosphere_pressure_pa": null,
      "mean_surface_temp_k": 250.0,
      "description": "Earth's only natural satellite.",
      "created_at": "2024-10-01T00:00:00Z"
    },
    {
      "id": 3,
      "name": "Mars",
      "radius_km": 3389.5,
      "gravity_ms2": 3.721,
      "atmosphere_pressure_pa": 610.0,
      "mean_surface_temp_k": 210.0,
      "description": "The fourth planet from the Sun.",
      "created_at": "2024-10-01T00:00:00Z"
    }
  ],
  "meta": {
    "count": 3
  }
}
```

**Error Codes:**

| Code | Scenario |
|------|----------|
| `500`| Database error |

---

### 8.3 `GET /regions`

**Description:** Returns a paginated list of planetary reference regions, optionally filtered by planetary body or region type.

**Authentication required:** No

**Query Parameters:**

| Parameter    | Type    | Required | Description                                        |
|--------------|---------|----------|----------------------------------------------------|
| `planet_id`  | integer | No       | Filter by planetary body ID                        |
| `region_type`| string  | No       | Filter by type (e.g., `crater`, `mare`, `vallis`)  |
| `limit`      | integer | No       | Max results to return (default: `20`, max: `100`)  |
| `offset`     | integer | No       | Pagination offset (default: `0`)                   |

**Request Example:**
```
GET http://localhost:8000/api/v1/regions?planet_id=3&region_type=crater&limit=10&offset=0
```

**Response — 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "planet_body_id": 3,
      "planet_name": "Mars",
      "name": "Jezero Crater",
      "region_type": "crater",
      "center_lat": 18.44,
      "center_lon": 77.45,
      "area_km2": 49.0,
      "description": "Ancient lake bed and Perseverance rover landing site.",
      "source_dataset": "HiRISE, CTX, CRISM — MRO (NASA)",
      "geometry_geojson": {
        "type": "Polygon",
        "coordinates": [[[77.3, 18.3], [77.7, 18.3], [77.7, 18.7], [77.3, 18.7], [77.3, 18.3]]]
      },
      "created_at": "2024-10-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "limit": 10,
    "offset": 0
  }
}
```

**Error Codes:**

| Code | Scenario |
|------|----------|
| `422`| Invalid `planet_id` or `limit` value |
| `500`| Database error |

---

### 8.4 `GET /sites`

**Description:** Returns a paginated, filterable list of Earth candidate analog sites.

**Authentication required:** No

**Query Parameters:**

| Parameter      | Type    | Required | Description                                            |
|----------------|---------|----------|--------------------------------------------------------|
| `country`      | string  | No       | Filter by country name (partial, case-insensitive)     |
| `climate_zone` | string  | No       | Filter by Köppen-Geiger code (e.g., `BWh`, `ET`)       |
| `limit`        | integer | No       | Max results to return (default: `20`, max: `100`)      |
| `offset`       | integer | No       | Pagination offset (default: `0`)                       |

**Request Example:**
```
GET http://localhost:8000/api/v1/sites?country=Chile&climate_zone=BWh&limit=5
```

**Response — 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Atacama Desert — Salar de Atacama",
      "country": "Chile",
      "center_lat": -23.5,
      "center_lon": -68.25,
      "area_km2": 3000.0,
      "elevation_min_m": 2300.0,
      "elevation_max_m": 4500.0,
      "climate_zone": "BWh",
      "description": "Hyperarid high-altitude salt flat, excellent Mars analog.",
      "submitted_by_username": "researcher_alice",
      "created_at": "2024-10-05T09:00:00Z",
      "updated_at": "2024-10-05T09:00:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "limit": 5,
    "offset": 0
  }
}
```

**Error Codes:**

| Code | Scenario |
|------|----------|
| `422`| Invalid parameter types |
| `500`| Database error |

---

### 8.5 `GET /sites/{id}`

**Description:** Returns full details for a single candidate site, including associated measurements.

**Authentication required:** No

**Path Parameters:**

| Parameter | Type    | Required | Description               |
|-----------|---------|----------|---------------------------|
| `id`      | integer | Yes      | Candidate site primary key |

**Request Example:**
```
GET http://localhost:8000/api/v1/sites/1
```

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Atacama Desert — Salar de Atacama",
    "country": "Chile",
    "center_lat": -23.5,
    "center_lon": -68.25,
    "area_km2": 3000.0,
    "elevation_min_m": 2300.0,
    "elevation_max_m": 4500.0,
    "climate_zone": "BWh",
    "description": "Hyperarid high-altitude salt flat, excellent Mars analog.",
    "geometry_geojson": {
      "type": "Polygon",
      "coordinates": [[[-68.5, -24.0], [-67.8, -24.0], [-67.8, -22.5], [-68.5, -22.5], [-68.5, -24.0]]]
    },
    "submitted_by_username": "researcher_alice",
    "created_at": "2024-10-05T09:00:00Z",
    "updated_at": "2024-10-05T09:00:00Z",
    "measurements": [
      {
        "id": 10,
        "parameter_name": "mean_elevation_m",
        "value": 3400.0,
        "unit": "m",
        "measurement_date": "2024-01-15",
        "quality_flag": "good",
        "dataset_name": "SRTM 30m Global DEM"
      },
      {
        "id": 11,
        "parameter_name": "mean_annual_precipitation_mm",
        "value": 15.0,
        "unit": "mm/year",
        "measurement_date": "2023-12-31",
        "quality_flag": "good",
        "dataset_name": "WorldClim v2.1"
      }
    ]
  }
}
```

**Error Codes:**

| Code | Scenario |
|------|----------|
| `404`| No site with the given `id` |
| `422`| `id` is not a valid integer |
| `500`| Database error |

---

### 8.6 `GET /datasets`

**Description:** Returns a list of scientific datasets in the TerraTwin catalogue, optionally filtered by planetary body or dataset type.

**Authentication required:** No

**Query Parameters:**

| Parameter      | Type    | Required | Description                                                   |
|----------------|---------|----------|---------------------------------------------------------------|
| `planet_id`    | integer | No       | Filter by planetary body ID                                   |
| `dataset_type` | string  | No       | One of: `elevation`, `geology`, `thermal`, `spectral`, `imagery` |
| `limit`        | integer | No       | Max results (default: `20`, max: `100`)                       |
| `offset`       | integer | No       | Pagination offset (default: `0`)                              |

**Request Example:**
```
GET http://localhost:8000/api/v1/datasets?planet_id=3&dataset_type=elevation
```

**Response — 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "name": "Mars Orbiter Laser Altimeter (MOLA) — Global DEM",
      "source_agency": "NASA",
      "dataset_type": "elevation",
      "planet_body_id": 3,
      "planet_name": "Mars",
      "spatial_resolution_m": 463.0,
      "temporal_coverage_start": "1997-09-15",
      "temporal_coverage_end": "2001-06-30",
      "file_format": "GeoTIFF",
      "access_url": "https://pds-geosciences.wustl.edu/mgs/mgs-m-mola-5-megdr-l3-v1/mgsl_300x/",
      "license": "Public Domain (NASA)",
      "description": "Global topographic map of Mars at ~460 m/pixel resolution.",
      "ingested_at": "2024-10-01T00:00:00Z",
      "is_active": true
    }
  ],
  "meta": {
    "total": 1,
    "limit": 20,
    "offset": 0
  }
}
```

**Error Codes:**

| Code | Scenario |
|------|----------|
| `422`| Invalid `dataset_type` value |
| `500`| Database error |

---

### 8.7 `POST /discovery/search`

**Description:** The core **discovery engine** endpoint. Given a planetary reference region, this endpoint scores and ranks all matching Earth candidate sites by their analog suitability. Optional filters narrow the search space. Returns a ranked list of candidate sites with preliminary similarity indicators.

**Authentication required:** No (researcher role required in production)

**Request Body Schema:**

| Field                      | Type    | Required | Description                                           |
|----------------------------|---------|----------|-------------------------------------------------------|
| `region_id`                | integer | Yes      | Reference region to compare against                   |
| `filters`                  | object  | No       | Optional narrowing filters                            |
| `filters.country`          | string  | No       | Restrict to sites in a specific country               |
| `filters.climate_zone`     | string  | No       | Restrict to a Köppen climate zone                     |
| `filters.min_area_km2`     | number  | No       | Minimum site area in km²                              |
| `limit`                    | integer | No       | Max results to return (default: `10`, max: `50`)      |

**Request Example:**

```json
POST /discovery/search
Content-Type: application/json

{
  "region_id": 1,
  "filters": {
    "country": "Chile",
    "climate_zone": "BWh",
    "min_area_km2": 500.0
  },
  "limit": 5
}
```

**Response — 200 OK:**

> **SAMPLE DATA** — values are illustrative, not real scientific computations.

```json
{
  "success": true,
  "data": {
    "reference_region": {
      "id": 1,
      "name": "Jezero Crater",
      "planet": "Mars",
      "region_type": "crater",
      "area_km2": 49.0
    },
    "ranked_sites": [
      {
        "rank": 1,
        "candidate_site_id": 1,
        "site_name": "Atacama Desert — Salar de Atacama",
        "country": "Chile",
        "climate_zone": "BWh",
        "area_km2": 3000.0,
        "center_lat": -23.5,
        "center_lon": -68.25,
        "preliminary_score": 82.4,
        "score_basis": "elevation_range, aridity_index, surface_mineralogy",
        "analysis_exists": false,
        "analysis_id": null
      },
      {
        "rank": 2,
        "candidate_site_id": 7,
        "site_name": "Puna de Atacama — Llullaillaco Volcano",
        "country": "Chile",
        "climate_zone": "BWk",
        "area_km2": 850.0,
        "center_lat": -24.72,
        "center_lon": -68.53,
        "preliminary_score": 74.1,
        "score_basis": "elevation_range, volcanic_geology",
        "analysis_exists": true,
        "analysis_id": 15
      }
    ],
    "total_candidates_evaluated": 23,
    "filters_applied": {
      "country": "Chile",
      "climate_zone": "BWh",
      "min_area_km2": 500.0
    }
  },
  "meta": {
    "region_id": 1,
    "limit": 5,
    "returned": 2
  }
}
```

**Error Codes:**

| Code | Scenario |
|------|----------|
| `404`| `region_id` does not exist |
| `422`| Missing `region_id` or invalid field types |
| `500`| Discovery engine error |

---

### 8.8 `POST /analysis/compare`

**Description:** Triggers a **full analog comparison analysis** between one Earth candidate site and one planetary reference region. The analysis computes weighted feature-level similarity scores and an overall analog comparison score (0–100). The response returns an `analysis_id` immediately; the analysis may run asynchronously.

**Authentication required:** No (researcher role required in production)

**Request Body Schema:**

| Field                        | Type   | Required | Description                                             |
|------------------------------|--------|----------|---------------------------------------------------------|
| `candidate_site_id`          | integer| Yes      | Earth site to analyse                                   |
| `reference_region_id`        | integer| Yes      | Planetary region to compare against                     |
| `feature_weights`            | object | No       | Per-feature weight values (must sum to 1.0)             |
| `feature_weights.elevation`  | number | No       | Weight for elevation similarity (default: 0.25)         |
| `feature_weights.slope`      | number | No       | Weight for slope similarity (default: 0.20)             |
| `feature_weights.thermal_range`| number| No    | Weight for surface temperature range (default: 0.20)    |
| `feature_weights.mineralogy` | number | No       | Weight for surface mineralogy match (default: 0.20)     |
| `feature_weights.aridity`    | number | No       | Weight for aridity index similarity (default: 0.15)     |
| `analyst_notes`              | string | No       | Optional free-text notes from the analyst               |

**Request Example:**

```json
POST /analysis/compare
Content-Type: application/json

{
  "candidate_site_id": 1,
  "reference_region_id": 1,
  "feature_weights": {
    "elevation": 0.25,
    "slope": 0.20,
    "thermal_range": 0.20,
    "mineralogy": 0.20,
    "aridity": 0.15
  },
  "analyst_notes": "Prioritising Atacama as a Mars analog due to perchlorate soil chemistry similarities."
}
```

**Response — 201 Created:**

> **SAMPLE DATA** — values are illustrative.

```json
{
  "success": true,
  "data": {
    "analysis_id": 42,
    "status": "running",
    "candidate_site": {
      "id": 1,
      "name": "Atacama Desert — Salar de Atacama"
    },
    "reference_region": {
      "id": 1,
      "name": "Jezero Crater",
      "planet": "Mars"
    },
    "feature_weights_applied": {
      "elevation": 0.25,
      "slope": 0.20,
      "thermal_range": 0.20,
      "mineralogy": 0.20,
      "aridity": 0.15
    },
    "created_at": "2024-10-15T14:30:00Z",
    "estimated_completion_seconds": 8,
    "poll_url": "/api/v1/analysis/42"
  }
}
```

**Error Codes:**

| Code | Scenario |
|------|----------|
| `404`| `candidate_site_id` or `reference_region_id` does not exist |
| `422`| Weights do not sum to 1.0, or missing required fields |
| `500`| Analysis engine failed to initialise |

---

### 8.9 `GET /analysis/{id}`

**Description:** Returns the full result of a completed analysis, including the overall analog comparison score, letter grade, and per-feature breakdown. If the analysis is still running, `status` will be `"running"` and `result` will be `null`.

**Authentication required:** No

**Path Parameters:**

| Parameter | Type    | Required | Description      |
|-----------|---------|----------|------------------|
| `id`      | integer | Yes      | Analysis ID      |

**Request Example:**
```
GET http://localhost:8000/api/v1/analysis/42
```

**Response — 200 OK (complete):**

> **SAMPLE DATA** — values are illustrative.

```json
{
  "success": true,
  "data": {
    "id": 42,
    "status": "complete",
    "candidate_site": {
      "id": 1,
      "name": "Atacama Desert — Salar de Atacama",
      "country": "Chile",
      "climate_zone": "BWh"
    },
    "reference_region": {
      "id": 1,
      "name": "Jezero Crater",
      "planet": "Mars",
      "region_type": "crater"
    },
    "analyst_username": "researcher_alice",
    "analog_comparison_score": 82.4,
    "score_grade": "B+",
    "analysis_notes": "Prioritising Atacama as a Mars analog due to perchlorate soil chemistry similarities.",
    "feature_breakdown": [
      {
        "feature_name": "elevation",
        "earth_value": 3400.0,
        "planetary_value": -2500.0,
        "similarity_score": 0.71,
        "weight": 0.25,
        "unit": "m",
        "weighted_contribution": 0.1775,
        "notes": "Relative elevation range is comparable despite absolute difference."
      },
      {
        "feature_name": "slope",
        "earth_value": 4.2,
        "planetary_value": 3.8,
        "similarity_score": 0.92,
        "weight": 0.20,
        "unit": "degrees",
        "weighted_contribution": 0.184,
        "notes": "Very flat terrain in both locations."
      },
      {
        "feature_name": "thermal_range",
        "earth_value": 55.0,
        "planetary_value": 90.0,
        "similarity_score": 0.68,
        "weight": 0.20,
        "unit": "K",
        "weighted_contribution": 0.136,
        "notes": "Martian diurnal range is wider but structurally similar."
      },
      {
        "feature_name": "mineralogy",
        "earth_value": 0.74,
        "planetary_value": 0.81,
        "similarity_score": 0.88,
        "weight": 0.20,
        "unit": "similarity_index",
        "weighted_contribution": 0.176,
        "notes": "Both show sulphate and iron oxide signatures."
      },
      {
        "feature_name": "aridity",
        "earth_value": 0.03,
        "planetary_value": 0.001,
        "similarity_score": 0.79,
        "weight": 0.15,
        "unit": "precipitation_evapotranspiration_ratio",
        "weighted_contribution": 0.1185,
        "notes": "Atacama is among the most arid Earth locations."
      }
    ],
    "analysis_config": {
      "algorithm": "weighted_euclidean_similarity",
      "version": "1.0.0",
      "normalisation": "min_max",
      "feature_weights": {
        "elevation": 0.25,
        "slope": 0.20,
        "thermal_range": 0.20,
        "mineralogy": 0.20,
        "aridity": 0.15
      }
    },
    "created_at": "2024-10-15T14:30:00Z",
    "completed_at": "2024-10-15T14:30:08Z"
  }
}
```

**Response — 200 OK (still running):**
```json
{
  "success": true,
  "data": {
    "id": 42,
    "status": "running",
    "analog_comparison_score": null,
    "feature_breakdown": null,
    "created_at": "2024-10-15T14:30:00Z",
    "completed_at": null
  }
}
```

**Error Codes:**

| Code | Scenario |
|------|----------|
| `404`| No analysis with the given `id` |
| `422`| `id` is not a valid integer |
| `500`| Database error |

---

### 8.10 `GET /rankings`

**Description:** Returns a ranked leaderboard of Earth candidate sites for a given reference region, filtered by optional minimum score. Useful for high-level discovery and comparison dashboards.

**Authentication required:** No

**Query Parameters:**

| Parameter   | Type    | Required | Description                                             |
|-------------|---------|----------|---------------------------------------------------------|
| `region_id` | integer | Yes      | Reference region to rank sites against                  |
| `limit`     | integer | No       | Max results (default: `10`, max: `50`)                  |
| `min_score` | number  | No       | Minimum `analog_comparison_score` threshold (0–100)     |

**Request Example:**
```
GET http://localhost:8000/api/v1/rankings?region_id=1&limit=5&min_score=70.0
```

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "reference_region": {
      "id": 1,
      "name": "Jezero Crater",
      "planet": "Mars"
    },
    "rankings": [
      {
        "rank": 1,
        "analysis_id": 42,
        "candidate_site_id": 1,
        "site_name": "Atacama Desert — Salar de Atacama",
        "country": "Chile",
        "analog_comparison_score": 82.4,
        "score_grade": "B+",
        "completed_at": "2024-10-15T14:30:08Z"
      },
      {
        "rank": 2,
        "analysis_id": 38,
        "candidate_site_id": 3,
        "site_name": "Namib Desert — Sossusvlei",
        "country": "Namibia",
        "analog_comparison_score": 76.1,
        "score_grade": "B",
        "completed_at": "2024-10-14T11:22:40Z"
      }
    ]
  },
  "meta": {
    "region_id": 1,
    "min_score": 70.0,
    "limit": 5,
    "returned": 2
  }
}
```

**Error Codes:**

| Code | Scenario |
|------|----------|
| `404`| `region_id` does not exist |
| `422`| Invalid parameter types |
| `500`| Database error |

---

### 8.11 `POST /reports/generate`

**Description:** Generates a downloadable report for a completed analysis. Supported formats are PDF, JSON, and CSV. The report is generated asynchronously and stored server-side. Returns a `report_id` which can be used to retrieve the report via `GET /reports/{id}`.

**Authentication required:** No (researcher role required in production)

**Request Body Schema:**

| Field         | Type   | Required | Description                                        |
|---------------|--------|----------|----------------------------------------------------|
| `analysis_id` | integer| Yes      | ID of a completed analysis to report on            |
| `format`      | string | Yes      | Output format: `"pdf"`, `"json"`, or `"csv"`       |

**Request Example:**
```json
POST /reports/generate
Content-Type: application/json

{
  "analysis_id": 42,
  "format": "pdf"
}
```

**Response — 201 Created:**
```json
{
  "success": true,
  "data": {
    "report_id": 17,
    "analysis_id": 42,
    "format": "pdf",
    "status": "generating",
    "poll_url": "/api/v1/reports/17",
    "generated_at": null,
    "estimated_completion_seconds": 5
  }
}
```

**Error Codes:**

| Code | Scenario |
|------|----------|
| `404`| `analysis_id` does not exist |
| `422`| Missing `analysis_id` or `format`, or analysis not yet complete |
| `400`| Unsupported format value (`UNSUPPORTED_FORMAT`) |
| `500`| Report generation engine error |

---

### 8.12 `GET /reports/{id}`

**Description:** Returns metadata for a generated report and the server-side file path (or a download URL in production). If the report is still generating, `file_path` will be `null`.

**Authentication required:** No

**Path Parameters:**

| Parameter | Type    | Required | Description  |
|-----------|---------|----------|--------------|
| `id`      | integer | Yes      | Report ID    |

**Request Example:**
```
GET http://localhost:8000/api/v1/reports/17
```

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": 17,
    "analysis_id": 42,
    "generated_by_username": "researcher_alice",
    "format": "pdf",
    "file_path": "reports/analysis_42_report_20241015.pdf",
    "download_url": "http://localhost:8000/static/reports/analysis_42_report_20241015.pdf",
    "generated_at": "2024-10-15T14:30:15Z",
    "is_public": false,
    "download_count": 3
  }
}
```

**Error Codes:**

| Code | Scenario |
|------|----------|
| `404`| No report with the given `id` |
| `403`| Report is private and requester does not own it (planned) |
| `422`| `id` is not a valid integer |
| `500`| Database or file system error |

---

## Appendix A — Full Example Flow

This walkthrough shows the complete TerraTwin API workflow from discovery to report download.

```
Step 1: Browse planets
  GET /planets
  → Find planet_id 3 (Mars)

Step 2: Find reference regions on Mars
  GET /regions?planet_id=3&region_type=crater
  → Find region_id 1 (Jezero Crater)

Step 3: Discover matching Earth sites
  POST /discovery/search
  Body: { "region_id": 1, "limit": 5 }
  → Top result: candidate_site_id 1 (Atacama Desert)

Step 4: Run full analysis
  POST /analysis/compare
  Body: { "candidate_site_id": 1, "reference_region_id": 1, "feature_weights": {...} }
  → analysis_id: 42

Step 5: Poll for result
  GET /analysis/42
  → status: "complete", analog_comparison_score: 82.4

Step 6: Generate report
  POST /reports/generate
  Body: { "analysis_id": 42, "format": "pdf" }
  → report_id: 17

Step 7: Retrieve report
  GET /reports/17
  → file_path and download_url for the PDF
```

---

## Appendix B — FastAPI Implementation Notes

The TerraTwin API is built with **FastAPI**, which automatically generates:

- **Interactive Swagger UI** at `http://localhost:8000/docs`
- **ReDoc documentation** at `http://localhost:8000/redoc`
- **OpenAPI JSON schema** at `http://localhost:8000/openapi.json`

Pydantic models handle request validation and response serialization. The `422 Unprocessable Entity` errors are automatically generated by FastAPI/Pydantic when input validation fails, with detailed field-level error messages.

```python
# Example FastAPI route signature
@router.get("/sites/{id}", response_model=SiteDetailResponse)
async def get_site(id: int, db: AsyncSession = Depends(get_db)):
    ...
```
