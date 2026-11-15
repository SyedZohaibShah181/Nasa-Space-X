# TerraTwin — Database Design

> **Project:** TerraTwin | Earth-Moon-Mars Analog Discovery & Research Platform
> **Challenge:** NASA Space Apps Challenge
> **Stack:** SQLite (development) → PostgreSQL + PostGIS (production)
> **ORM / Migrations:** SQLAlchemy + Alembic

---

## Table of Contents

1. [Entity Relationship Overview](#1-entity-relationship-overview)
2. [Table Definitions](#2-table-definitions)
3. [Relationships](#3-relationships)
4. [Indexing Strategy](#4-indexing-strategy)
5. [PostGIS Spatial Columns](#5-postgis-spatial-columns)
6. [Migration Strategy](#6-migration-strategy)
7. [Seed Data](#7-seed-data)
8. [Data Retention & Provenance](#8-data-retention--provenance)

---

## 1. Entity Relationship Overview

### Narrative

The TerraTwin database models the full lifecycle of **planetary analog site discovery and analysis**:

- **Users** log in and may submit candidate Earth sites, run analyses, and save comparisons.
- **Planetary Bodies** (Earth, Moon, Mars) anchor all reference data.
- **Reference Regions** are known planetary surface zones (e.g., lunar mare, Martian regolith plains) that Earth sites are compared against. Each region belongs to a planetary body.
- **Candidate Sites** are Earth locations (deserts, volcanic fields, polar regions) proposed as analogs. They are submitted by users.
- **Datasets** describe external data products (elevation, spectral, thermal…) linked to a planetary body.
- **Measurements** are individual data readings that connect a dataset to either a candidate site or a reference region.
- **Site Analyses** are the core computation records — they link one candidate site to one reference region, record who ran the analysis, and store the resulting analog comparison score.
- **Analysis Features** break down an analysis result into individual feature-level scores (e.g., elevation similarity, slope similarity).
- **Saved Comparisons** let users bookmark multi-site comparison sessions.
- **Reports** are exportable outputs generated from a completed analysis.

### ASCII ER Sketch

```
 ┌─────────────┐         ┌──────────────────┐
 │    users    │         │ planetary_bodies  │
 │─────────────│         │──────────────────│
 │ id (PK)     │         │ id (PK)          │
 │ username    │         │ name             │
 │ email       │         │ radius_km        │
 │ role        │         │ gravity_ms2      │
 └──────┬──────┘         └────────┬─────────┘
        │ submitted_by            │ planet_body_id
        │                 ┌───────┴──────────┐
        │                 │ reference_regions │
        │                 │──────────────────│
        │                 │ id (PK)          │
        │                 │ planet_body_id FK│
        │                 │ geometry POLYGON │
        │                 └───────┬──────────┘
        │                         │ reference_region_id
        │  ┌──────────────────┐   │
        └──► candidate_sites  ◄───┤
           │──────────────────│   │
           │ id (PK)          │   │
           │ submitted_by FK  │   │
           │ geometry POLYGON │   │
           └────────┬─────────┘   │
                    │             │
           ┌────────▼─────────────▼──┐
           │      site_analyses       │
           │─────────────────────────│
           │ id (PK)                 │
           │ candidate_site_id FK    │
           │ reference_region_id FK  │
           │ analyst_user_id FK      │
           │ analog_comparison_score │
           └────────┬────────────────┘
                    │
         ┌──────────┴───────────┐
         │                      │
 ┌───────▼──────────┐  ┌────────▼──────┐
 │ analysis_features│  │    reports    │
 │──────────────────│  │───────────────│
 │ id (PK)          │  │ id (PK)       │
 │ site_analysis_id │  │ site_analysis │
 │ feature_name     │  │ generated_by  │
 │ similarity_score │  │ format        │
 └──────────────────┘  └───────────────┘

 ┌──────────────────┐    ┌──────────────────┐
 │    datasets      │    │  measurements    │
 │──────────────────│    │──────────────────│
 │ id (PK)          │◄───│ dataset_id FK    │
 │ planet_body_id FK│    │ site_id FK       │
 │ dataset_type     │    │ region_id FK     │
 └──────────────────┘    │ value REAL       │
                         └──────────────────┘

 ┌───────────────────────┐
 │   saved_comparisons   │
 │───────────────────────│
 │ id (PK)               │
 │ user_id FK            │
 │ site_ids JSON         │
 │ region_ids JSON       │
 └───────────────────────┘
```

---

## 2. Table Definitions

> **SQLite Compatibility Notes:**
> - SQLite does not enforce `CHECK` constraints on `ENUM`-like values natively in all versions; the application layer (Pydantic) enforces these.
> - `BOOLEAN` is stored as `INTEGER` (0/1) in SQLite.
> - `JSON` is stored as `TEXT` in SQLite; PostgreSQL uses the native `JSONB` type.
> - `geometry` columns are stored as `TEXT` (WKT) in SQLite and as PostGIS `GEOMETRY` in PostgreSQL.

---

### 2.1 `users`

Stores all registered users of the TerraTwin platform.

```sql
CREATE TABLE users (
    id               INTEGER      PRIMARY KEY AUTOINCREMENT,
    username         TEXT         NOT NULL UNIQUE,
    email            TEXT         NOT NULL UNIQUE,
    password_hash    TEXT         NOT NULL,
    role             TEXT         NOT NULL DEFAULT 'guest'
                                  CHECK (role IN ('researcher', 'admin', 'guest')),
    created_at       DATETIME     NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    last_login       DATETIME,
    is_active        INTEGER      NOT NULL DEFAULT 1   -- BOOLEAN (0/1)
);
```

| Column          | Type      | Constraints          | Description                              |
|-----------------|-----------|----------------------|------------------------------------------|
| `id`            | INTEGER   | PK, AUTOINCREMENT    | Surrogate primary key                    |
| `username`      | TEXT      | NOT NULL, UNIQUE     | Display name / login handle              |
| `email`         | TEXT      | NOT NULL, UNIQUE     | Email address for auth                   |
| `password_hash` | TEXT      | NOT NULL             | Bcrypt hash — never store plaintext      |
| `role`          | TEXT      | CHECK ENUM           | `researcher`, `admin`, or `guest`        |
| `created_at`    | DATETIME  | NOT NULL, DEFAULT    | Account creation timestamp (UTC)         |
| `last_login`    | DATETIME  | NULLABLE             | Last successful authentication timestamp |
| `is_active`     | INTEGER   | NOT NULL, DEFAULT 1  | Soft-delete / deactivation flag          |

---

### 2.2 `planetary_bodies`

Master reference table for celestial bodies in scope (Earth, Moon, Mars).

```sql
CREATE TABLE planetary_bodies (
    id                        INTEGER  PRIMARY KEY AUTOINCREMENT,
    name                      TEXT     NOT NULL UNIQUE,
    radius_km                 REAL     NOT NULL,
    gravity_ms2               REAL     NOT NULL,
    atmosphere_pressure_pa    REAL,                    -- NULL for airless bodies
    mean_surface_temp_k       REAL,
    description               TEXT,
    created_at                DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);
```

| Column                    | Type     | Description                                   |
|---------------------------|----------|-----------------------------------------------|
| `id`                      | INTEGER  | PK                                            |
| `name`                    | TEXT     | e.g., `"Earth"`, `"Moon"`, `"Mars"`           |
| `radius_km`               | REAL     | Mean radius in kilometres                     |
| `gravity_ms2`             | REAL     | Surface gravity (m/s²)                        |
| `atmosphere_pressure_pa`  | REAL     | Mean surface pressure (Pascals); NULL if none |
| `mean_surface_temp_k`     | REAL     | Mean surface temperature (Kelvin)             |
| `description`             | TEXT     | Free-text description                         |
| `created_at`              | DATETIME | Record creation timestamp                     |

---

### 2.3 `reference_regions`

Known planetary surface zones used as comparison targets (e.g., Jezero Crater, Mare Tranquillitatis).

```sql
CREATE TABLE reference_regions (
    id              INTEGER  PRIMARY KEY AUTOINCREMENT,
    planet_body_id  INTEGER  NOT NULL REFERENCES planetary_bodies(id) ON DELETE RESTRICT,
    name            TEXT     NOT NULL,
    region_type     TEXT     NOT NULL,   -- e.g., 'crater', 'mare', 'vallis', 'polar_cap'
    geometry        TEXT,                -- WKT POLYGON (PostGIS: GEOMETRY(POLYGON, 4326))
    center_lat      REAL     NOT NULL,
    center_lon      REAL     NOT NULL,
    area_km2        REAL,
    description     TEXT,
    source_dataset  TEXT,                -- Citation / dataset origin
    created_at      DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);
```

| Column           | Type     | Description                                        |
|------------------|----------|----------------------------------------------------|
| `id`             | INTEGER  | PK                                                 |
| `planet_body_id` | INTEGER  | FK → `planetary_bodies.id`                        |
| `name`           | TEXT     | Region name                                        |
| `region_type`    | TEXT     | Descriptive type tag (crater, vallis, mare…)       |
| `geometry`       | TEXT     | WKT polygon boundary (see §5)                      |
| `center_lat`     | REAL     | Centroid latitude (degrees)                        |
| `center_lon`     | REAL     | Centroid longitude (degrees)                       |
| `area_km2`       | REAL     | Area in square kilometres                          |
| `description`    | TEXT     | Scientific context                                 |
| `source_dataset` | TEXT     | Data provenance / citation                         |
| `created_at`     | DATETIME | Record creation timestamp                          |

---

### 2.4 `candidate_sites`

Earth locations proposed as planetary analogs, submitted by researchers.

```sql
CREATE TABLE candidate_sites (
    id              INTEGER  PRIMARY KEY AUTOINCREMENT,
    name            TEXT     NOT NULL,
    country         TEXT     NOT NULL,
    geometry        TEXT,                -- WKT POLYGON (PostGIS: GEOMETRY(POLYGON, 4326))
    center_lat      REAL     NOT NULL,
    center_lon      REAL     NOT NULL,
    area_km2        REAL,
    elevation_min_m REAL,
    elevation_max_m REAL,
    climate_zone    TEXT,                -- e.g., 'BWh', 'ET', 'EF' (Köppen codes)
    description     TEXT,
    submitted_by    INTEGER  REFERENCES users(id) ON DELETE SET NULL,
    created_at      DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at      DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);
```

| Column           | Type     | Description                                      |
|------------------|----------|--------------------------------------------------|
| `id`             | INTEGER  | PK                                               |
| `name`           | TEXT     | Site name (e.g., "Atacama Desert")               |
| `country`        | TEXT     | ISO country name or code                         |
| `geometry`       | TEXT     | WKT polygon boundary                             |
| `center_lat`     | REAL     | Centroid latitude                                |
| `center_lon`     | REAL     | Centroid longitude                               |
| `area_km2`       | REAL     | Site area in km²                                 |
| `elevation_min_m`| REAL     | Minimum elevation above sea level                |
| `elevation_max_m`| REAL     | Maximum elevation above sea level                |
| `climate_zone`   | TEXT     | Köppen-Geiger climate classification             |
| `description`    | TEXT     | Researcher notes                                 |
| `submitted_by`   | INTEGER  | FK → `users.id`; NULL if user deleted            |
| `created_at`     | DATETIME | Creation timestamp                               |
| `updated_at`     | DATETIME | Last modification timestamp                      |

---

### 2.5 `datasets`

Catalogue of external scientific datasets (MOLA, HiRISE, CRISM, SRTM, etc.).

```sql
CREATE TABLE datasets (
    id                        INTEGER  PRIMARY KEY AUTOINCREMENT,
    name                      TEXT     NOT NULL,
    source_agency             TEXT     NOT NULL,          -- e.g., 'NASA', 'ESA', 'USGS'
    dataset_type              TEXT     NOT NULL
                                       CHECK (dataset_type IN
                                              ('elevation','geology','thermal','spectral','imagery')),
    planet_body_id            INTEGER  NOT NULL REFERENCES planetary_bodies(id) ON DELETE RESTRICT,
    spatial_resolution_m      REAL,
    temporal_coverage_start   DATE,
    temporal_coverage_end     DATE,
    file_format               TEXT,                       -- e.g., 'GeoTIFF', 'NetCDF', 'HDF5'
    access_url                TEXT,
    license                   TEXT,
    description               TEXT,
    ingested_at               DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    is_active                 INTEGER  NOT NULL DEFAULT 1
);
```

| Column                    | Type     | Description                                        |
|---------------------------|----------|----------------------------------------------------|
| `id`                      | INTEGER  | PK                                                 |
| `name`                    | TEXT     | Dataset name                                       |
| `source_agency`           | TEXT     | Originating agency                                 |
| `dataset_type`            | TEXT     | Category ENUM                                      |
| `planet_body_id`          | INTEGER  | FK → `planetary_bodies.id`                        |
| `spatial_resolution_m`    | REAL     | Ground sample distance in metres                   |
| `temporal_coverage_start` | DATE     | Earliest observation date                          |
| `temporal_coverage_end`   | DATE     | Latest observation date (NULL if ongoing)          |
| `file_format`             | TEXT     | File encoding format                               |
| `access_url`              | TEXT     | Public download or API endpoint                    |
| `license`                 | TEXT     | Usage license (e.g., CC BY 4.0, Public Domain)     |
| `description`             | TEXT     | Abstract / notes                                   |
| `ingested_at`             | DATETIME | When the record was added to TerraTwin             |
| `is_active`               | INTEGER  | Whether the dataset is currently accessible        |

---

### 2.6 `measurements`

Individual scalar readings extracted from datasets for a site or region.

```sql
CREATE TABLE measurements (
    id               INTEGER  PRIMARY KEY AUTOINCREMENT,
    dataset_id       INTEGER  NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    site_id          INTEGER  REFERENCES candidate_sites(id) ON DELETE CASCADE,
    region_id        INTEGER  REFERENCES reference_regions(id) ON DELETE CASCADE,
    parameter_name   TEXT     NOT NULL,   -- e.g., 'mean_elevation_m', 'surface_temp_k'
    value            REAL     NOT NULL,
    unit             TEXT     NOT NULL,
    measurement_date DATE,
    source_file      TEXT,
    quality_flag     TEXT     NOT NULL DEFAULT 'good'
                              CHECK (quality_flag IN ('good','suspect','missing')),
    notes            TEXT,
    created_at       DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),

    -- Either site_id or region_id must be set (enforced at app layer)
    CHECK (site_id IS NOT NULL OR region_id IS NOT NULL)
);
```

| Column           | Type     | Description                                        |
|------------------|----------|----------------------------------------------------|
| `id`             | INTEGER  | PK                                                 |
| `dataset_id`     | INTEGER  | FK → `datasets.id`                                |
| `site_id`        | INTEGER  | FK → `candidate_sites.id` (nullable)              |
| `region_id`      | INTEGER  | FK → `reference_regions.id` (nullable)            |
| `parameter_name` | TEXT     | Measured variable label                            |
| `value`          | REAL     | Numeric measurement value                          |
| `unit`           | TEXT     | SI or domain unit string                           |
| `measurement_date`| DATE    | Date of observation                                |
| `source_file`    | TEXT     | Originating file name / path                       |
| `quality_flag`   | TEXT     | Data quality classification                        |
| `notes`          | TEXT     | Analyst annotations                                |
| `created_at`     | DATETIME | Record creation timestamp                          |

---

### 2.7 `site_analyses`

Core analysis records linking an Earth candidate site to a planetary reference region.

```sql
CREATE TABLE site_analyses (
    id                      INTEGER  PRIMARY KEY AUTOINCREMENT,
    candidate_site_id       INTEGER  NOT NULL REFERENCES candidate_sites(id) ON DELETE CASCADE,
    reference_region_id     INTEGER  NOT NULL REFERENCES reference_regions(id) ON DELETE RESTRICT,
    analyst_user_id         INTEGER  REFERENCES users(id) ON DELETE SET NULL,
    analog_comparison_score REAL     CHECK (analog_comparison_score BETWEEN 0.0 AND 100.0),
    score_grade             TEXT,    -- e.g., 'A+', 'B', 'C-' — derived from score
    analysis_notes          TEXT,
    analysis_config         TEXT,    -- JSON: feature weights, algorithm version, params
    status                  TEXT     NOT NULL DEFAULT 'pending'
                                     CHECK (status IN ('pending','running','complete','failed')),
    created_at              DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    completed_at            DATETIME
);
```

| Column                    | Type     | Description                                        |
|---------------------------|----------|----------------------------------------------------|
| `id`                      | INTEGER  | PK                                                 |
| `candidate_site_id`       | INTEGER  | FK → `candidate_sites.id`                         |
| `reference_region_id`     | INTEGER  | FK → `reference_regions.id`                       |
| `analyst_user_id`         | INTEGER  | FK → `users.id`; who triggered the analysis        |
| `analog_comparison_score` | REAL     | 0–100 weighted composite score                     |
| `score_grade`             | TEXT     | Letter grade derived from score                    |
| `analysis_notes`          | TEXT     | Free-text notes from analyst                       |
| `analysis_config`         | TEXT     | JSON blob: weights, algorithm, version             |
| `status`                  | TEXT     | Workflow state ENUM                                |
| `created_at`              | DATETIME | When analysis was submitted                        |
| `completed_at`            | DATETIME | When analysis finished (NULL if not done)          |

---

### 2.8 `analysis_features`

Per-feature breakdown of a site analysis result.

```sql
CREATE TABLE analysis_features (
    id                INTEGER  PRIMARY KEY AUTOINCREMENT,
    site_analysis_id  INTEGER  NOT NULL REFERENCES site_analyses(id) ON DELETE CASCADE,
    feature_name      TEXT     NOT NULL,   -- e.g., 'elevation', 'slope', 'thermal_range'
    earth_value       REAL,
    planetary_value   REAL,
    similarity_score  REAL     CHECK (similarity_score BETWEEN 0.0 AND 1.0),
    weight            REAL     CHECK (weight BETWEEN 0.0 AND 1.0),
    unit              TEXT,
    notes             TEXT
);
```

| Column            | Type    | Description                                        |
|-------------------|---------|----------------------------------------------------|
| `id`              | INTEGER | PK                                                 |
| `site_analysis_id`| INTEGER | FK → `site_analyses.id`                            |
| `feature_name`    | TEXT    | Feature label (elevation, slope, etc.)             |
| `earth_value`     | REAL    | Measured value at the Earth candidate site         |
| `planetary_value` | REAL    | Corresponding value at the planetary region        |
| `similarity_score`| REAL    | 0.0–1.0 per-feature similarity                     |
| `weight`          | REAL    | Analyst-specified weight (0.0–1.0, sums to 1.0)   |
| `unit`            | TEXT    | Measurement unit                                   |
| `notes`           | TEXT    | Per-feature analyst comment                        |

---

### 2.9 `saved_comparisons`

User-bookmarked multi-site comparison sessions.

```sql
CREATE TABLE saved_comparisons (
    id          INTEGER  PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT     NOT NULL,
    description TEXT,
    site_ids    TEXT     NOT NULL,   -- JSON array of candidate_site IDs
    region_ids  TEXT     NOT NULL,   -- JSON array of reference_region IDs
    created_at  DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    is_public   INTEGER  NOT NULL DEFAULT 0   -- BOOLEAN
);
```

| Column       | Type     | Description                                      |
|--------------|----------|--------------------------------------------------|
| `id`         | INTEGER  | PK                                               |
| `user_id`    | INTEGER  | FK → `users.id`                                  |
| `name`       | TEXT     | Human-readable comparison session name           |
| `description`| TEXT     | Optional notes                                   |
| `site_ids`   | TEXT     | JSON array: `[1, 4, 7]`                          |
| `region_ids` | TEXT     | JSON array: `[2, 5]`                             |
| `created_at` | DATETIME | Creation timestamp                               |
| `is_public`  | INTEGER  | 1 = publicly shareable; 0 = private              |

---

### 2.10 `reports`

Generated analysis output files (PDF, JSON, CSV).

```sql
CREATE TABLE reports (
    id               INTEGER  PRIMARY KEY AUTOINCREMENT,
    site_analysis_id INTEGER  NOT NULL REFERENCES site_analyses(id) ON DELETE CASCADE,
    generated_by     INTEGER  REFERENCES users(id) ON DELETE SET NULL,
    format           TEXT     NOT NULL
                              CHECK (format IN ('pdf','json','csv')),
    file_path        TEXT,
    generated_at     DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    is_public        INTEGER  NOT NULL DEFAULT 0,
    download_count   INTEGER  NOT NULL DEFAULT 0
);
```

| Column            | Type     | Description                                |
|-------------------|----------|--------------------------------------------|
| `id`              | INTEGER  | PK                                         |
| `site_analysis_id`| INTEGER  | FK → `site_analyses.id`                   |
| `generated_by`    | INTEGER  | FK → `users.id`                           |
| `format`          | TEXT     | Output format ENUM                         |
| `file_path`       | TEXT     | Server-side path or object storage key     |
| `generated_at`    | DATETIME | Report generation timestamp                |
| `is_public`       | INTEGER  | Public sharing flag                        |
| `download_count`  | INTEGER  | Cumulative download counter                |

---

## 3. Relationships

```
planetary_bodies ─────────< reference_regions      (1 body → many regions)
planetary_bodies ─────────< datasets               (1 body → many datasets)
users            ─────────< candidate_sites        (1 user submits many sites)
users            ─────────< site_analyses          (1 user triggers many analyses)
users            ─────────< saved_comparisons      (1 user has many saved sessions)
users            ─────────< reports                (1 user generates many reports)
candidate_sites  ─────────< site_analyses          (1 site → many analyses)
reference_regions─────────< site_analyses          (1 region → many analyses)
site_analyses    ─────────< analysis_features      (1 analysis → many feature rows)
site_analyses    ─────────< reports                (1 analysis → many report exports)
datasets         ─────────< measurements           (1 dataset → many measurements)
candidate_sites  ─────────< measurements           (1 site can have many readings)
reference_regions─────────< measurements           (1 region can have many readings)
```

### Key Referential Integrity Rules

| FK Column                      | ON DELETE Behaviour | Rationale                                             |
|--------------------------------|---------------------|-------------------------------------------------------|
| `reference_regions.planet_body_id` | RESTRICT        | Don't delete a body that has associated regions        |
| `candidate_sites.submitted_by` | SET NULL            | Preserve sites even if submitting user is removed     |
| `site_analyses.candidate_site_id`| CASCADE           | Deleting a site removes its analyses                  |
| `site_analyses.analyst_user_id`| SET NULL            | Preserve analysis history if user account is removed  |
| `analysis_features.site_analysis_id`| CASCADE        | Features are meaningless without parent analysis      |
| `measurements.dataset_id`     | CASCADE             | Measurements tied to dataset lifecycle                |
| `reports.site_analysis_id`    | CASCADE             | Reports belong to their analysis                      |
| `saved_comparisons.user_id`   | CASCADE             | Private bookmarks deleted with account                |

---

## 4. Indexing Strategy

Indexes accelerate common query patterns. Each index below is justified by an expected access pattern.

```sql
-- Users
CREATE INDEX idx_users_email     ON users(email);
CREATE INDEX idx_users_role      ON users(role);

-- Reference regions — frequent lookups by planet and type
CREATE INDEX idx_ref_regions_planet     ON reference_regions(planet_body_id);
CREATE INDEX idx_ref_regions_type       ON reference_regions(region_type);

-- Candidate sites — primary filter columns in discovery search
CREATE INDEX idx_sites_country          ON candidate_sites(country);
CREATE INDEX idx_sites_climate_zone     ON candidate_sites(climate_zone);
CREATE INDEX idx_sites_submitted_by     ON candidate_sites(submitted_by);

-- Datasets — filter by body and type
CREATE INDEX idx_datasets_planet        ON datasets(planet_body_id);
CREATE INDEX idx_datasets_type          ON datasets(dataset_type);
CREATE INDEX idx_datasets_active        ON datasets(is_active);

-- Measurements — most queried via dataset or site/region
CREATE INDEX idx_meas_dataset           ON measurements(dataset_id);
CREATE INDEX idx_meas_site              ON measurements(site_id);
CREATE INDEX idx_meas_region            ON measurements(region_id);
CREATE INDEX idx_meas_param_date        ON measurements(parameter_name, measurement_date);

-- Site analyses — status polling and score ranking
CREATE INDEX idx_analyses_status        ON site_analyses(status);
CREATE INDEX idx_analyses_score         ON site_analyses(analog_comparison_score DESC);
CREATE INDEX idx_analyses_site          ON site_analyses(candidate_site_id);
CREATE INDEX idx_analyses_region        ON site_analyses(reference_region_id);

-- Analysis features — lookup by parent analysis
CREATE INDEX idx_features_analysis      ON analysis_features(site_analysis_id);

-- Reports — lookup by analysis and public flag
CREATE INDEX idx_reports_analysis       ON reports(site_analysis_id);
CREATE INDEX idx_reports_public         ON reports(is_public);

-- Saved comparisons
CREATE INDEX idx_saved_user             ON saved_comparisons(user_id);
CREATE INDEX idx_saved_public           ON saved_comparisons(is_public);
```

### PostGIS Spatial Indexes (PostgreSQL only)

```sql
-- GiST indexes on geometry columns for fast spatial queries
CREATE INDEX idx_ref_regions_geom  ON reference_regions USING GIST (geometry);
CREATE INDEX idx_sites_geom        ON candidate_sites    USING GIST (geometry);
```

---

## 5. PostGIS Spatial Columns

### How Geometry Columns Work

In **SQLite (development)**, the `geometry` column stores **WKT (Well-Known Text)** strings, e.g.:

```
POLYGON((-70.5 -24.1, -69.0 -24.1, -69.0 -22.5, -70.5 -22.5, -70.5 -24.1))
```

In **PostgreSQL + PostGIS (production)**, the column type is changed to:

```sql
geometry(POLYGON, 4326)
```

Where `4326` is the EPSG code for the WGS-84 coordinate reference system (latitude/longitude degrees) used globally by GPS.

### Common PostGIS Spatial Functions Used in TerraTwin

| Function | Description | Example Use |
|---|---|---|
| `ST_Area(geom)` | Returns area in CRS units | `ST_Area(geometry::geography) / 1e6` → km² |
| `ST_Centroid(geom)` | Returns the centroid point | Compute `center_lat`, `center_lon` automatically |
| `ST_Intersects(a, b)` | True if geometries overlap | Filter sites within a bounding box |
| `ST_Distance(a, b)` | Distance between geometries | Proximity ranking |
| `ST_Within(a, b)` | True if A is inside B | Site containment checks |
| `ST_GeomFromText(wkt, srid)` | Parse WKT into geometry | Alembic migration from SQLite WKT |
| `ST_AsGeoJSON(geom)` | Serialize to GeoJSON | API response geometry serialization |
| `ST_MakeValid(geom)` | Auto-repair invalid polygons | Data ingestion safety |

### Enabling PostGIS

```sql
-- Run once on the PostgreSQL database
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
```

---

## 6. Migration Strategy

TerraTwin uses **Alembic** (the SQLAlchemy migration toolkit) for schema versioning. The migration path is:

```
SQLite (local dev) ──► PostgreSQL + PostGIS (production / cloud deploy)
```

### Step-by-Step Process

#### Step 1 — Initialize Alembic

```bash
cd backend/
alembic init alembic
```

Edit `alembic/env.py` to reference the SQLAlchemy models:

```python
from app.db.base import Base
from app.core.config import settings

target_metadata = Base.metadata
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
```

#### Step 2 — Generate Initial Migration

```bash
alembic revision --autogenerate -m "initial_schema"
```

This creates a versioned migration file under `alembic/versions/`.

#### Step 3 — Apply to SQLite (Dev)

```bash
alembic upgrade head
```

#### Step 4 — Switching to PostgreSQL

Update `.env`:

```
DATABASE_URL=postgresql+psycopg2://terratwin:password@localhost:5432/terratwin_db
```

Add a migration step to enable PostGIS and convert geometry columns:

```python
# In an Alembic migration file
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis;")

    # Convert WKT TEXT column to native PostGIS geometry
    op.execute("""
        ALTER TABLE reference_regions
        ALTER COLUMN geometry TYPE geometry(POLYGON, 4326)
        USING ST_GeomFromText(geometry, 4326);
    """)

    op.execute("""
        ALTER TABLE candidate_sites
        ALTER COLUMN geometry TYPE geometry(POLYGON, 4326)
        USING ST_GeomFromText(geometry, 4326);
    """)

    # Add GiST spatial indexes
    op.execute("CREATE INDEX idx_ref_regions_geom ON reference_regions USING GIST (geometry);")
    op.execute("CREATE INDEX idx_sites_geom ON candidate_sites USING GIST (geometry);")

def downgrade():
    op.execute("ALTER TABLE reference_regions ALTER COLUMN geometry TYPE TEXT USING ST_AsText(geometry);")
    op.execute("ALTER TABLE candidate_sites ALTER COLUMN geometry TYPE TEXT USING ST_AsText(geometry);")
```

#### Step 5 — Apply to PostgreSQL

```bash
alembic upgrade head
```

#### Step 6 — JSON / JSONB Column Upgrade

```python
# In another migration
def upgrade():
    op.execute("""
        ALTER TABLE site_analyses
        ALTER COLUMN analysis_config TYPE JSONB
        USING analysis_config::JSONB;
    """)
    op.execute("""
        ALTER TABLE saved_comparisons
        ALTER COLUMN site_ids TYPE JSONB USING site_ids::JSONB;
        ALTER TABLE saved_comparisons
        ALTER COLUMN region_ids TYPE JSONB USING region_ids::JSONB;
    """)
```

---

## 7. Seed Data

> **⚠️ DEMO DATA — For development and testing only. Not real scientific measurements.**

### Planetary Bodies

```sql
-- DEMO DATA
INSERT INTO planetary_bodies (name, radius_km, gravity_ms2, atmosphere_pressure_pa, mean_surface_temp_k, description) VALUES
(
    'Earth',
    6371.0,
    9.807,
    101325.0,
    288.15,
    'The third planet from the Sun and the only known planet to harbour life. Used as the source of analog candidate sites.'
),
(
    'Moon',
    1737.4,
    1.620,
    NULL,
    250.0,
    'Earth''s only natural satellite. Airless, tidally locked, with extreme day/night temperature swings. Target body for lunar analog studies.'
),
(
    'Mars',
    3389.5,
    3.721,
    610.0,
    210.0,
    'The fourth planet from the Sun. Thin CO₂ atmosphere, ancient riverbeds, and volcanic terrain make it a primary target for astrobiology and human exploration.'
);
```

### Reference Regions

```sql
-- DEMO DATA
INSERT INTO reference_regions (planet_body_id, name, region_type, geometry, center_lat, center_lon, area_km2, description, source_dataset) VALUES
(
    3,  -- Mars
    'Jezero Crater',
    'crater',
    'POLYGON((77.3 18.3, 77.7 18.3, 77.7 18.7, 77.3 18.7, 77.3 18.3))',
    18.44,
    77.45,
    49.0,
    'An ancient 45 km impact crater on Mars that once held a lake. Landing site of NASA Perseverance rover. Rich in delta sediments and carbonate minerals.',
    'HiRISE, CTX, CRISM — MRO (NASA)'
),
(
    3,  -- Mars
    'Valles Marineris — Melas Chasma',
    'vallis',
    'POLYGON((-75.0 -12.0, -60.0 -12.0, -60.0 -8.0, -75.0 -8.0, -75.0 -12.0))',
    -10.0,
    -67.5,
    700000.0,
    'The largest canyon in the solar system. Melas Chasma shows evidence of past water activity and varied mineralogy including sulphates and iron oxides.',
    'MOLA, THEMIS — Mars Odyssey (NASA)'
),
(
    2,  -- Moon
    'Mare Tranquillitatis',
    'mare',
    'POLYGON((20.0 5.0, 35.0 5.0, 35.0 15.0, 20.0 15.0, 20.0 5.0))',
    8.5,
    31.4,
    421000.0,
    'A lunar mare (basaltic plain) formed by ancient volcanic flooding. Apollo 11 landing site. Used as a reference for flat, basaltic, low-regolith analog studies.',
    'LROC, Kaguya — JAXA/NASA'
),
(
    3,  -- Mars
    'Gale Crater',
    'crater',
    'POLYGON((137.0 -5.5, 138.0 -5.5, 138.0 -4.5, 137.0 -4.5, 137.0 -5.5))',
    -5.08,
    137.44,
    154.0,
    'A 154 km crater hosting Mount Sharp (Aeolis Mons). Explored by Curiosity rover since 2012. Layered sedimentary sequences record billions of years of Martian history.',
    'HiRISE, ChemCam — MSL (NASA)'
);
```

### Candidate Sites (Demo)

```sql
-- DEMO DATA
INSERT INTO candidate_sites (name, country, geometry, center_lat, center_lon, area_km2, elevation_min_m, elevation_max_m, climate_zone, description) VALUES
(
    'Atacama Desert — Salar de Atacama',
    'Chile',
    'POLYGON((-68.5 -24.0, -67.8 -24.0, -67.8 -22.5, -68.5 -22.5, -68.5 -24.0))',
    -23.5,
    -68.25,
    3000.0,
    2300.0,
    4500.0,
    'BWh',
    'One of the driest non-polar deserts on Earth. Hyperarid, high UV, salt flats, and volcanic geology make it an excellent Mars analog.'
),
(
    'Icelandic Lava Fields — Askja Caldera',
    'Iceland',
    'POLYGON((-16.9 65.0, -16.6 65.0, -16.6 65.1, -16.9 65.1, -16.9 65.0))',
    65.05,
    -16.75,
    50.0,
    1000.0,
    1510.0,
    'ET',
    'Basaltic lava desert used to train Apollo astronauts. Volcanic terrain with fresh lava flows, fumaroles, and subglacial hydrothermal systems.'
);
```

---

## 8. Data Retention & Provenance

### Retention Policy

| Table               | Retention Rule                                                                 |
|---------------------|--------------------------------------------------------------------------------|
| `users`             | Indefinite; deactivated via `is_active = 0` (soft delete)                     |
| `planetary_bodies`  | Permanent reference data; never deleted                                        |
| `reference_regions` | Permanent unless superseded by updated dataset; old records archived (not deleted) |
| `candidate_sites`   | Retained indefinitely; `updated_at` tracks changes                             |
| `datasets`          | Marked `is_active = 0` when deprecated; never hard-deleted                     |
| `measurements`      | Retained for scientific reproducibility; CASCADE-deleted with parent site      |
| `site_analyses`     | Retained indefinitely for audit trail                                          |
| `analysis_features` | Retained as part of analysis record                                            |
| `saved_comparisons` | Deleted with user account (CASCADE)                                            |
| `reports`           | Retained for `download_count` audit; file may be purged from storage separately|

### Provenance Rules

1. **Source citation is mandatory** — Every `reference_region` must have a `source_dataset` value citing the originating mission/dataset.
2. **Measurements are immutable** — Once ingested, measurement records should not be updated. Create a new record with an updated `quality_flag` instead.
3. **Analysis reproducibility** — The `analysis_config` JSON field must capture the full algorithm version, feature weights, and parameter set so that any analysis can be re-run identically.
4. **Audit fields** — All tables include `created_at`; mutable tables (`candidate_sites`) also carry `updated_at`.
5. **User attribution** — `submitted_by` and `analyst_user_id` FK relationships preserve attribution even after soft-deleting users (via `SET NULL`).
6. **Dataset versioning** — New dataset versions should be inserted as new rows with updated `ingested_at`; old rows marked `is_active = 0`.
