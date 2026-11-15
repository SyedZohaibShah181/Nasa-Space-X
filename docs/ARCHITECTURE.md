# System Architecture Document
## TerraTwin — Earth-Moon-Mars Analog Discovery & Research Platform
### NASA Space Apps Challenge Entry

---

> **Document Version:** 1.0  
> **Date:** November 2026  
> **Status:** Draft  
> **Audience:** Developers, Reviewers, Contributors

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Component Descriptions](#2-component-descriptions)
3. [Data Flow Diagrams](#3-data-flow-diagrams)
4. [API Communication Patterns](#4-api-communication-patterns)
5. [Module Dependency Map](#5-module-dependency-map)
6. [Database Architecture](#6-database-architecture)
7. [Security Architecture](#7-security-architecture)
8. [Scalability Considerations](#8-scalability-considerations)
9. [Technology Justifications](#9-technology-justifications)
10. [Directory Structure](#10-directory-structure)

---

## 1. Architecture Overview

TerraTwin follows a **3-tier client-server architecture** with a clear separation between the presentation layer (React frontend), the application/business logic layer (FastAPI backend + scientific engine), and the data layer (SQLite/PostgreSQL database).

External data APIs feed into the backend through a dedicated ingestion pipeline.

### 1.1 High-Level Architecture Diagram

```
╔══════════════════════════════════════════════════════════════════════════╗
║                          TERRATWIN SYSTEM                                ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  ┌─────────────────────────────────────────────────────────────────┐    ║
║  │                    USER'S BROWSER                                │    ║
║  │                                                                  │    ║
║  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │    ║
║  │  │ React + Vite │  │ MapLibre GL  │  │      CesiumJS         │  │    ║
║  │  │  TypeScript  │  │  (2D Map)    │  │     (3D Globe)        │  │    ║
║  │  │ Tailwind CSS │  └──────────────┘  └───────────────────────┘  │    ║
║  │  │  shadcn/ui   │                                                │    ║
║  │  └──────┬───────┘           ┌────────────────────────────────┐  │    ║
║  │         │                   │     Plotly.js (Charts)         │  │    ║
║  │         │                   └────────────────────────────────┘  │    ║
║  └─────────┼──────────────────────────────────────────────────────-┘    ║
║            │  HTTP/REST (JSON)   CORS-controlled                         ║
║            ▼                                                             ║
║  ┌─────────────────────────────────────────────────────────────────┐    ║
║  │                     FASTAPI BACKEND                              │    ║
║  │                                                                  │    ║
║  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌────────────┐  │    ║
║  │  │   Auth    │  │   Sites   │  │  Search   │  │   Admin    │  │    ║
║  │  │  Router   │  │  Router   │  │  Router   │  │  Router    │  │    ║
║  │  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬──────┘  │    ║
║  │        └──────────────┼──────────────┼───────────────┘          │    ║
║  │                       ▼                                          │    ║
║  │  ┌─────────────────────────────────────────────────────────┐    │    ║
║  │  │               SCIENTIFIC ENGINE                          │    │    ║
║  │  │   Analog Scoring  │  Feature Extraction  │  Ranking     │    │    ║
║  │  └─────────────────────────────────────────────────────────┘    │    ║
║  │                       │                                          │    ║
║  │  ┌────────────────────▼────────────────────────────────────┐    │    ║
║  │  │               DATA INGESTION PIPELINE                   │    │    ║
║  │  │   Fetcher  │  Transformer  │  Validator  │  Loader      │    │    ║
║  │  └────────────────────────────────────────────────────────-┘    │    ║
║  │                       │                                          │    ║
║  │  ┌────────────────────▼────────────────────────────────────┐    │    ║
║  │  │            SQLAlchemy ORM  +  Alembic                   │    │    ║
║  │  └────────────────────────────────────────────────────────-┘    │    ║
║  └──────────────────────────┬──────────────────────────────────────┘    ║
║                             │                                            ║
║          ┌──────────────────┼──────────────────┐                        ║
║          ▼                                      ▼                        ║
║  ┌───────────────────┐             ┌───────────────────────┐             ║
║  │  SQLite (Dev)     │             │ PostgreSQL + PostGIS   │             ║
║  │  terratwin.db     │             │     (Production)      │             ║
║  └───────────────────┘             └───────────────────────┘             ║
║                                                                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║                        EXTERNAL APIS                                     ║
║                                                                          ║
║  ┌────────────────┐  ┌────────────┐  ┌──────────────┐  ┌────────────┐  ║
║  │ NASA Earthdata │  │    USGS    │  │ NASA PDS     │  │    ESA     │  ║
║  │  (MODIS data)  │  │ (Elevation)│  │ (Planetary)  │  │ Copernicus │  ║
║  └────────────────┘  └────────────┘  └──────────────┘  └────────────┘  ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### 1.2 Architecture Style

| Property | Decision |
|----------|---------|
| **Pattern** | 3-Tier Client-Server |
| **Frontend ↔ Backend** | RESTful API over HTTP/HTTPS (JSON) |
| **Backend ↔ Database** | SQLAlchemy ORM (database-agnostic) |
| **Backend ↔ External APIs** | HTTP REST calls via Python `httpx` / `requests` |
| **State Management (Frontend)** | React Context API + TanStack Query (server state) |
| **Authentication** | JWT tokens (stateless) |
| **Deployment (Prototype)** | Local development server (Vite dev server + Uvicorn) |
| **Deployment (Future)** | Containerized (Docker) + Cloud hosting |

---

## 2. Component Descriptions

### 2.1 Frontend Layer

The frontend is a **Single-Page Application (SPA)** built with React and TypeScript. It communicates exclusively with the FastAPI backend via REST API calls.

#### 2.1.1 React + Vite + TypeScript

```
frontend/
├── src/
│   ├── components/        ← Reusable UI components (shadcn/ui wrappers)
│   ├── pages/             ← Full-page route components
│   ├── hooks/             ← Custom React hooks (data fetching, auth)
│   ├── store/             ← Global state (React Context)
│   ├── api/               ← API client functions (Axios/fetch wrappers)
│   ├── types/             ← TypeScript interfaces and type definitions
│   └── utils/             ← Helper functions
├── public/
├── index.html
├── vite.config.ts
└── tailwind.config.ts
```

**Key Responsibilities:**
- Routing between pages (React Router)
- Rendering UI components from shadcn/ui
- Calling backend API endpoints
- Managing user authentication state (JWT stored in `localStorage` / `httpOnly` cookie)
- Passing data to MapLibre GL JS, CesiumJS, and Plotly instances

**Why Vite over Create React App (CRA)?**
Vite uses native ES modules for development (no bundling during dev), giving near-instant Hot Module Replacement (HMR) compared to CRA's webpack-based bundler. Build times are also significantly faster.

---

#### 2.1.2 MapLibre GL JS (2D Interactive Map)

MapLibre GL JS renders the main 2D map view. It is a **fully open-source** fork of Mapbox GL JS v1, with no commercial license required.

```
┌─────────────────────────────────────────────────────────────────┐
│                    MapLibre GL JS Map                           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │   Base Tile Layer (OpenStreetMap / MapTiler free tier)   │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │   GeoJSON Layer: Analog Site Markers (circles/symbols)   │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │   Optional Data Layer Overlays (Elevation, Temperature)  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│   Controls: Zoom In/Out | Rotation Reset | Fullscreen          │
└─────────────────────────────────────────────────────────────────┘
```

**Data Flow to Map:**
1. Frontend calls `GET /api/sites?...` with current filters
2. Backend returns a GeoJSON FeatureCollection of matching sites
3. MapLibre renders each Feature as a marker using a custom layer
4. Click events on markers trigger a React state update that shows the site popup

---

#### 2.1.3 CesiumJS (3D Globe Viewer)

CesiumJS provides the 3D globe experience. It is an open-source JavaScript library for 3D geospatial visualization.

```
┌─────────────────────────────────────────────────────────────────┐
│                     CesiumJS Viewer                            │
│                                                                 │
│    🌍  3D Globe with:                                          │
│         - Bing Maps / OSM imagery layer (free tier)            │
│         - Cesium World Terrain (elevation mesh)                │
│         - 3D analog site pins (Cesium Entities)                │
│         - Camera controls: rotate, zoom, tilt                  │
│                                                                 │
│    Click on pin → Entity description popup                     │
│    Popup contains: name, score, link to detail page            │
└─────────────────────────────────────────────────────────────────┘
```

**CesiumJS Ion Integration:**
- CesiumJS Ion provides terrain and imagery assets via a free-tier API key
- Key is stored in the frontend `.env` file as `VITE_CESIUM_ION_TOKEN`
- Never committed to source control

---

#### 2.1.4 Plotly.js (Charts & Visualizations)

Plotly.js renders all data charts. It is a fully open-source, declarative charting library.

| Chart Type | Used For |
|-----------|---------|
| **Radar/Spider Chart** | Analog score breakdown (dimensions per site) |
| **Grouped Bar Chart** | Multi-site comparison (FR-20) |
| **Line Chart** | Temperature/aridity trends over time (future) |
| **Scatter Plot** | Site distribution by two selected dimensions |

**Integration Pattern:**
- Plotly data (`traces`) and `layout` objects are built from API response data
- Charts are rendered inside React components using the `react-plotly.js` wrapper
- Charts are responsive (auto-resize with container)

---

#### 2.1.5 shadcn/ui + Tailwind CSS

shadcn/ui provides accessible, unstyled (copy-into-project) React components based on Radix UI primitives. Tailwind CSS provides utility-first styling.

**Key UI Components Used:**
- `Button`, `Input`, `Select`, `Checkbox`, `Slider` — search and filter controls
- `Card` — site cards in results list
- `Dialog` / `Sheet` — modals and slide-over panels
- `Table` — comparison view and admin user list
- `Toast` — success/error notifications
- `Badge` — score level indicators

---

### 2.2 Backend Layer

The backend is a **Python-based REST API** server built with FastAPI.

```
backend/
├── app/
│   ├── main.py              ← FastAPI app instance, CORS config, router registration
│   ├── config.py            ← Settings (from environment variables)
│   ├── database.py          ← SQLAlchemy engine and session factory
│   ├── models/              ← SQLAlchemy ORM models (database tables)
│   │   ├── site.py
│   │   ├── user.py
│   │   ├── ingestion_job.py
│   │   └── bookmark.py
│   ├── schemas/             ← Pydantic request/response models
│   │   ├── site.py
│   │   ├── user.py
│   │   └── auth.py
│   ├── routers/             ← FastAPI route handlers (grouped by domain)
│   │   ├── auth.py
│   │   ├── sites.py
│   │   ├── search.py
│   │   ├── comparison.py
│   │   └── admin.py
│   ├── services/            ← Business logic layer
│   │   ├── auth_service.py
│   │   ├── site_service.py
│   │   └── scoring_service.py
│   ├── scientific/          ← Scientific engine (see 2.3)
│   │   ├── scoring.py
│   │   ├── feature_extractor.py
│   │   └── ranking.py
│   ├── ingestion/           ← Data ingestion pipeline (see 2.4)
│   │   ├── pipeline.py
│   │   ├── sources/
│   │   │   ├── nasa_earthdata.py
│   │   │   └── usgs.py
│   │   └── transformers.py
│   └── migrations/          ← Alembic migration scripts
│       └── versions/
├── tests/
├── requirements.txt
└── alembic.ini
```

#### 2.2.1 FastAPI Routers

Each router handles a specific domain. FastAPI routers are like "sub-applications" that group related endpoints.

| Router | Prefix | Key Endpoints |
|--------|--------|--------------|
| `auth.py` | `/api/auth` | `POST /register`, `POST /login`, `POST /logout` |
| `sites.py` | `/api/sites` | `GET /` (list), `GET /{id}` (detail), `GET /{id}/score` |
| `search.py` | `/api/search` | `GET /` (search+filter), `POST /saved`, `GET /saved` |
| `comparison.py` | `/api/compare` | `POST /` (compare sites), `GET /export/{format}` |
| `admin.py` | `/api/admin` | `GET /users`, `PATCH /users/{id}`, `POST /ingest/{source}` |

**Example router pattern:**
```python
# routers/sites.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.site import SiteResponse
from app.services.site_service import get_site_by_id

router = APIRouter(prefix="/api/sites", tags=["sites"])

@router.get("/{site_id}", response_model=SiteResponse)
def read_site(site_id: int, db: Session = Depends(get_db)):
    site = get_site_by_id(db, site_id)
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return site
```

---

#### 2.2.2 SQLAlchemy ORM

SQLAlchemy is the ORM (Object-Relational Mapper) that translates between Python objects and database rows. This means developers write Python, not SQL.

**Core Models:**

```python
# Example: models/site.py
class AnalogSite(Base):
    __tablename__ = "analog_sites"

    id            = Column(Integer, primary_key=True)
    name          = Column(String(200), nullable=False)
    latitude      = Column(Float, nullable=False)
    longitude     = Column(Float, nullable=False)
    country       = Column(String(100))
    biome_type    = Column(String(100))
    analog_target = Column(String(20))   # "mars", "moon", "both"
    description   = Column(Text)
    mars_score    = Column(Float)
    lunar_score   = Column(Float)
    composite_score = Column(Float)
    created_at    = Column(DateTime, default=datetime.utcnow)
    updated_at    = Column(DateTime, onupdate=datetime.utcnow)
```

---

#### 2.2.3 Pydantic Schemas

Pydantic models are used for two purposes:
1. **Request Validation** — incoming API request bodies are automatically validated
2. **Response Serialization** — outgoing data is shaped and filtered

```python
# Example: schemas/site.py
from pydantic import BaseModel
from typing import Optional

class SiteBase(BaseModel):
    name: str
    latitude: float
    longitude: float
    analog_target: str

class SiteCreate(SiteBase):
    country: Optional[str] = None
    description: Optional[str] = None

class SiteResponse(SiteBase):
    id: int
    mars_score: Optional[float]
    lunar_score: Optional[float]
    composite_score: Optional[float]

    class Config:
        from_attributes = True  # Allows ORM model → Pydantic conversion
```

---

#### 2.2.4 Alembic Migrations

Alembic is the database migration tool for SQLAlchemy projects. It tracks database schema changes over time (similar to Git for database structure).

```
Workflow:
  1. Developer modifies a SQLAlchemy model
  2. Run: alembic revision --autogenerate -m "Add terrain_roughness to sites"
  3. Alembic generates a migration script in migrations/versions/
  4. Run: alembic upgrade head
  5. Database schema is updated without data loss
```

---

### 2.3 Scientific Engine

The Scientific Engine is the heart of TerraTwin's value proposition. It processes raw geospatial data and calculates analog similarity scores.

```
┌─────────────────────────────────────────────────────────────────┐
│                    SCIENTIFIC ENGINE                            │
│                                                                 │
│  ┌─────────────────┐     ┌──────────────────┐                  │
│  │ feature_extractor│────▶│  scoring.py      │                  │
│  │                 │     │                  │                  │
│  │  Input:         │     │  Input:          │                  │
│  │  - Raw DEM data │     │  - Feature dict  │                  │
│  │  - Climate CSV  │     │  - Target profile│                  │
│  │  - Spectral idx │     │                  │                  │
│  │                 │     │  Output:         │                  │
│  │  Output:        │     │  - Mars score    │                  │
│  │  - Feature dict │     │  - Lunar score   │                  │
│  │  {aridity,      │     │  - Composite     │                  │
│  │   temp_range,   │     │  - Dimension     │                  │
│  │   roughness...} │     │    breakdown     │                  │
│  └─────────────────┘     └────────┬─────────┘                  │
│                                   │                             │
│                          ┌────────▼─────────┐                  │
│                          │   ranking.py     │                  │
│                          │                  │                  │
│                          │  Sorts sites by  │                  │
│                          │  composite score │                  │
│                          │  Applies filters │                  │
│                          └──────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 2.3.1 Feature Extractor (`feature_extractor.py`)

Uses **NumPy, Pandas, GeoPandas, and Rasterio** to extract quantitative features from raw geospatial data:

| Feature | Source | Library Used |
|---------|--------|-------------|
| Terrain roughness | DEM raster | Rasterio + NumPy |
| Mean annual temperature | Climate CSV | Pandas |
| Aridity index | Climate data | Pandas + NumPy |
| Land cover type | Raster layer | Rasterio |
| Surface albedo proxy | Spectral index | NumPy |
| Geographic bounds | Vector data | GeoPandas + Shapely |

**Processing Example:**
```python
# Terrain roughness from DEM (simplified prototype)
import numpy as np
import rasterio

def calculate_roughness(dem_path: str, site_bounds: tuple) -> float:
    with rasterio.open(dem_path) as src:
        # Read the elevation array for the site's bounding box
        window = src.window(*site_bounds)
        elevation = src.read(1, window=window)
    # Standard deviation of elevation = roughness proxy
    return float(np.std(elevation))
```

#### 2.3.2 Scoring Engine (`scoring.py`)

Implements a **weighted multi-criteria scoring** algorithm:

```python
# Mars analog score calculation (prototype algorithm)
MARS_WEIGHTS = {
    "aridity":          0.25,
    "temperature_range": 0.20,
    "soil_type":        0.20,
    "uv_index":         0.15,
    "roughness":        0.10,
    "pressure_proxy":   0.10,
}

MARS_TARGET_PROFILE = {
    # DEMO DATA — these are illustrative prototype values, not NASA measurements
    "aridity":          0.95,  # Very high (1.0 = most arid possible)
    "temperature_range": 0.80,  # Wide temperature swings
    "soil_type":        0.70,  # Regolith-like
    "uv_index":         0.75,  # High UV
    "roughness":        0.60,  # Moderately rough terrain
    "pressure_proxy":   0.50,  # High altitude proxy for low pressure
}

def calculate_mars_score(features: dict) -> float:
    score = 0.0
    for dimension, weight in MARS_WEIGHTS.items():
        site_value = features.get(dimension, 0.0)
        target_value = MARS_TARGET_PROFILE[dimension]
        # Similarity = 1 - normalized distance
        similarity = 1.0 - abs(site_value - target_value)
        score += similarity * weight * 100
    return round(score, 2)
```

> **⚠️ DEMO DATA NOTICE:** The `MARS_TARGET_PROFILE` values above are illustrative prototype parameters. They are NOT derived from NASA-validated Mars measurements. The scoring algorithm is a heuristic prototype for demonstration purposes.

#### 2.3.3 Ranking Engine (`ranking.py`)

Uses **Scikit-learn** for more advanced similarity operations:

- Applies `sklearn.preprocessing.MinMaxScaler` to normalize features across all sites
- Uses `sklearn.metrics.pairwise.cosine_similarity` to rank sites by similarity to a query profile
- Supports filtering by percentile (e.g., top 20% of Mars analogs)

---

### 2.4 Data Ingestion Pipeline

The ingestion pipeline runs in the background and populates the database with data from external APIs.

```
External API
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   INGESTION PIPELINE                           │
│                                                                 │
│  Step 1: FETCH                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Source-specific fetcher (nasa_earthdata.py / usgs.py) │    │
│  │  - Makes HTTP request to external API                  │    │
│  │  - Handles pagination, rate limits, retries            │    │
│  │  - Returns raw JSON/GeoTIFF/CSV data                   │    │
│  └───────────────────────────┬────────────────────────────┘    │
│                              │                                  │
│  Step 2: TRANSFORM                                              │
│  ┌───────────────────────────▼────────────────────────────┐    │
│  │  transformers.py                                        │    │
│  │  - Parses raw data into Python dicts/DataFrames         │    │
│  │  - Applies unit conversions                             │    │
│  │  - Clips data to site bounding boxes                    │    │
│  │  - Runs feature_extractor to compute site features      │    │
│  └───────────────────────────┬────────────────────────────┘    │
│                              │                                  │
│  Step 3: VALIDATE                                               │
│  ┌───────────────────────────▼────────────────────────────┐    │
│  │  Pydantic models validate every record                  │    │
│  │  Invalid records are logged and skipped                 │    │
│  └───────────────────────────┬────────────────────────────┘    │
│                              │                                  │
│  Step 4: LOAD                                                   │
│  ┌───────────────────────────▼────────────────────────────┐    │
│  │  SQLAlchemy session.merge() / session.add()             │    │
│  │  Upserts records (insert or update if exists)           │    │
│  │  Triggers score recalculation for affected sites        │    │
│  │  Logs job completion to ingestion_jobs table            │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Flow Diagrams

### 3.1 User Search Flow

This describes what happens when a user types in the search box and applies filters.

```
User types in search box (e.g., "volcanic")
     │
     ▼
[Frontend] Debounce 300ms
     │
     ▼
[Frontend] Build query params: ?q=volcanic&target=mars&min_score=70
     │
     │  GET /api/search?q=volcanic&target=mars&min_score=70
     ▼
[FastAPI] search router receives request
     │
     ▼
[FastAPI] Pydantic validates query params (SearchQueryParams model)
     │
     ▼
[site_service.py] Builds SQLAlchemy query:
   SELECT * FROM analog_sites
   WHERE (name ILIKE '%volcanic%' OR description ILIKE '%volcanic%')
   AND analog_target IN ('mars', 'both')
   AND composite_score >= 70
   ORDER BY composite_score DESC
     │
     ▼
[SQLAlchemy] Executes query against SQLite/PostgreSQL
     │
     ▼
[FastAPI] Serializes results using SiteListResponse Pydantic model
     │
     │  200 OK — JSON array of site objects
     ▼
[Frontend] Updates React state with results
     │
     ▼
[Frontend] Updates site list panel (re-renders cards)
[Frontend] Updates MapLibre GeoJSON source → markers update on map
```

---

### 3.2 Analysis / Scoring Flow

This describes how a site's analog score is calculated or recalculated.

```
Trigger: Admin runs ingestion job OR new site is added
     │
     ▼
[ingestion/pipeline.py] Job starts for site X
     │
     ▼
[ingestion/sources/nasa_earthdata.py] Fetch MODIS temperature data
   - HTTP GET to NASA Earthdata API
   - Authenticate with NASA API key (from env vars)
   - Retrieve surface temperature raster for site bounding box
     │
     ▼
[ingestion/sources/usgs.py] Fetch DEM elevation data
   - HTTP GET to USGS National Map API (free, no key needed)
   - Retrieve DEM GeoTIFF for site bounding box
     │
     ▼
[ingestion/transformers.py] Process raw data
   - Rasterio reads DEM → NumPy array
   - Pandas parses temperature CSV → statistics (mean, range)
   - Normalize all values to 0.0–1.0 scale
     │
     ▼
[scientific/feature_extractor.py] Build feature dictionary
   {
     "aridity": 0.91,          ← DEMO DATA
     "temperature_range": 0.78, ← DEMO DATA
     "roughness": 0.55,         ← DEMO DATA
     ...
   }
     │
     ▼
[scientific/scoring.py] Calculate Mars Score
   Mars Score = Σ (feature_similarity × weight) × 100
   Result: 76.4  ← DEMO DATA
     │
     ▼
[scientific/scoring.py] Calculate Lunar Score
   Result: 52.1  ← DEMO DATA
     │
     ▼
[scientific/scoring.py] Calculate Composite Score
   Result: 64.3  ← DEMO DATA
     │
     ▼
[SQLAlchemy] UPDATE analog_sites SET mars_score=76.4, ... WHERE id=X
     │
     ▼
[ingestion/pipeline.py] Log job completion to ingestion_jobs table
```

---

### 3.3 Data Ingestion Flow (External API → Database)

```
Admin clicks "Run Ingestion" for "NASA Earthdata - MODIS Temp"
     │
     ▼
[Frontend] POST /api/admin/ingest/nasa_earthdata
     │
     ▼
[FastAPI admin router] Verifies JWT (admin role required)
     │
     ▼
[FastAPI] Creates new IngestionJob record (status="queued")
     │
     ▼
[FastAPI] Background task starts (FastAPI BackgroundTasks)
     │
     ▼ (async, non-blocking)
[ingestion/pipeline.py] Loads list of all sites from DB
     │
     ├── For each site:
     │   [nasa_earthdata.py] GET https://earthdata.nasa.gov/api/...
     │   Handle rate limiting (429 → sleep and retry, max 3 attempts)
     │   Parse JSON/GeoTIFF response
     │   transformers.py processes raw data
     │   Update site features in DB
     │
     ▼
[pipeline.py] Mark IngestionJob status="completed"
              Record: sites_updated=N, errors=M, end_time=now()
     │
     ▼
[Admin dashboard] Polls GET /api/admin/jobs/latest → shows "Completed"
```

---

## 4. API Communication Patterns

### 4.1 REST API Design

TerraTwin uses a **RESTful API** design. This means:

| HTTP Method | Use | Example |
|------------|-----|---------|
| `GET` | Retrieve data | `GET /api/sites/42` → returns site #42 |
| `POST` | Create data | `POST /api/auth/register` → creates user |
| `PATCH` | Partially update | `PATCH /api/admin/users/5` → update user role |
| `DELETE` | Remove data | `DELETE /api/sites/42` → delete site (admin only) |

### 4.2 Request / Response Format

All API request bodies and responses use **JSON** format with `Content-Type: application/json`.

**Example Request:**
```http
POST /api/auth/login HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "email": "researcher@example.com",
  "password": "SecurePass123"
}
```

**Example Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

**Example Error Response:**
```http
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json

{
  "detail": [
    {
      "loc": ["body", "password"],
      "msg": "Password must be at least 8 characters",
      "type": "value_error"
    }
  ]
}
```

### 4.3 CORS Configuration

The FastAPI backend configures CORS (Cross-Origin Resource Sharing) to control which frontend origins can make requests.

```python
# app/main.py — CORS configuration
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    # Production: ["https://terratwin.yourdomain.com"]
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

**Why CORS matters:** Without this, the browser would block the frontend (port 5173) from calling the backend (port 8000) because they're on different ports, which counts as "different origins."

### 4.4 Authentication Header Pattern

Protected endpoints require the JWT token in the `Authorization` header:

```http
GET /api/sites/42/score-breakdown
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 5. Module Dependency Map

This shows which Python modules import from which, to understand the dependency hierarchy.

```
app/main.py
    ├── imports: routers/auth.py
    │               └── imports: services/auth_service.py
    │                               └── imports: models/user.py
    │                               └── imports: schemas/auth.py
    │
    ├── imports: routers/sites.py
    │               └── imports: services/site_service.py
    │                               └── imports: models/site.py
    │                               └── imports: schemas/site.py
    │                               └── imports: scientific/scoring.py
    │                                               └── imports: scientific/feature_extractor.py
    │
    ├── imports: routers/search.py
    │               └── imports: services/site_service.py  (shared)
    │
    ├── imports: routers/comparison.py
    │               └── imports: services/site_service.py  (shared)
    │               └── imports: scientific/ranking.py
    │                               └── imports: scientific/scoring.py (shared)
    │
    ├── imports: routers/admin.py
    │               └── imports: services/auth_service.py  (shared)
    │               └── imports: ingestion/pipeline.py
    │                               └── imports: ingestion/sources/nasa_earthdata.py
    │                               └── imports: ingestion/sources/usgs.py
    │                               └── imports: ingestion/transformers.py
    │                                               └── imports: scientific/feature_extractor.py
    │
    └── imports: database.py
                    └── provides: get_db() (dependency injection for all routers)
```

**Key design rule:** Lower-level modules (models, schemas) NEVER import from higher-level modules (routers, services). Data flows upward; dependencies flow downward.

---

## 6. Database Architecture

### 6.1 Development vs. Production Database

| Property | Development | Production |
|----------|------------|-----------|
| Engine | SQLite | PostgreSQL + PostGIS |
| File/Host | `./terratwin.db` | Cloud-hosted PostgreSQL instance |
| Spatial queries | Basic lat/lon math | Full PostGIS spatial functions |
| Concurrency | Single-writer | Multi-user concurrent access |
| Setup | Zero configuration | Requires PostgreSQL server |

The switch between SQLite and PostgreSQL is controlled by a single environment variable:
```bash
# .env (development)
DATABASE_URL=sqlite:///./terratwin.db

# .env (production)
DATABASE_URL=postgresql+psycopg2://user:password@host:5432/terratwin
```

SQLAlchemy's database-agnostic ORM means application code doesn't change.

### 6.2 Core Database Schema (ERD)

```
┌────────────────────────────────┐
│          users                 │
├────────────────────────────────┤
│ id           INTEGER PK        │
│ full_name    VARCHAR(200)      │
│ email        VARCHAR(255) UNIQUE│
│ password_hash VARCHAR(255)     │
│ role         VARCHAR(20)       │
│              (guest/researcher/│
│               admin)           │
│ is_active    BOOLEAN           │
│ created_at   DATETIME          │
│ last_login   DATETIME          │
└────────────┬───────────────────┘
             │ 1
             │
             │ M
┌────────────▼───────────────────┐    ┌──────────────────────────────┐
│          bookmarks             │    │        analog_sites          │
├────────────────────────────────┤    ├──────────────────────────────┤
│ id         INTEGER PK          │    │ id             INTEGER PK    │
│ user_id    INTEGER FK → users  │───▶│ name           VARCHAR(200)  │
│ site_id    INTEGER FK → sites  │    │ latitude       FLOAT         │
│ created_at DATETIME            │    │ longitude      FLOAT         │
└────────────────────────────────┘    │ country        VARCHAR(100)  │
                                      │ biome_type     VARCHAR(100)  │
┌────────────────────────────────┐    │ analog_target  VARCHAR(20)   │
│        saved_searches          │    │ description    TEXT          │
├────────────────────────────────┤    │ mars_score     FLOAT         │
│ id         INTEGER PK          │    │ lunar_score    FLOAT         │
│ user_id    INTEGER FK → users  │    │ composite_score FLOAT        │
│ name       VARCHAR(200)        │    │ data_confidence VARCHAR(20)  │
│ query_json TEXT (JSON string)  │    │ created_at     DATETIME      │
│ created_at DATETIME            │    │ updated_at     DATETIME      │
└────────────────────────────────┘    └──────────────────────────────┘
                                                   │ 1
                                                   │
                                                   │ M
┌──────────────────────────────────────────────────▼───────────────────┐
│                        site_features                                 │
├──────────────────────────────────────────────────────────────────────┤
│ id                  INTEGER PK                                       │
│ site_id             INTEGER FK → analog_sites                       │
│ feature_name        VARCHAR(100)  (e.g., "aridity", "roughness")    │
│ feature_value       FLOAT                                            │
│ data_source         VARCHAR(200)                                     │
│ ingestion_job_id    INTEGER FK → ingestion_jobs                     │
│ recorded_at         DATETIME                                         │
└──────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                        ingestion_jobs                              │
├────────────────────────────────────────────────────────────────────┤
│ id              INTEGER PK                                         │
│ source_name     VARCHAR(100)  (e.g., "nasa_earthdata")             │
│ status          VARCHAR(20)   (queued/running/completed/failed)    │
│ sites_processed INTEGER                                            │
│ sites_updated   INTEGER                                            │
│ error_count     INTEGER                                            │
│ error_log       TEXT                                               │
│ started_at      DATETIME                                           │
│ completed_at    DATETIME                                           │
│ triggered_by    INTEGER FK → users                                 │
└────────────────────────────────────────────────────────────────────┘
```

### 6.3 PostGIS Spatial Upgrade (Production)

In production with PostgreSQL + PostGIS, the `analog_sites` table gains a geometry column:

```sql
-- PostGIS geometry column for spatial queries
ALTER TABLE analog_sites ADD COLUMN geom GEOMETRY(POINT, 4326);

-- Spatial index for fast bounding-box queries
CREATE INDEX idx_sites_geom ON analog_sites USING GIST(geom);

-- Example PostGIS query: sites within 500km of a point
SELECT name, composite_score
FROM analog_sites
WHERE ST_DWithin(
    geom::geography,
    ST_MakePoint(-67.89, -23.45)::geography,
    500000  -- 500,000 meters = 500 km
)
ORDER BY composite_score DESC;
```

---

## 7. Security Architecture

### 7.1 Authentication Flow (JWT)

```
User submits login form
       │
       ▼
POST /api/auth/login  {email, password}
       │
       ▼
[auth_service.py]
  1. Query DB: SELECT * FROM users WHERE email = $1
  2. Verify password against stored bcrypt hash
  3. If valid: generate JWT token
     {
       "sub": user_id,
       "role": "researcher",
       "exp": now() + 24h
     }
     Signed with HS256 + SECRET_KEY (from env var)
       │
       ▼
Return: { "access_token": "eyJ..." }
       │
       ▼ (stored by frontend)
Subsequent requests:
  Authorization: Bearer eyJ...
       │
       ▼
[FastAPI Dependency: get_current_user()]
  1. Extract token from Authorization header
  2. Verify signature and expiry
  3. Return user object to route handler
  4. If invalid: raise HTTPException(401)
```

### 7.2 Security Layers

| Layer | Mechanism | Protection Against |
|-------|-----------|-------------------|
| **Input Validation** | Pydantic models on all endpoints | Malformed input, type confusion |
| **SQL Injection** | SQLAlchemy ORM (parameterized queries only) | SQL injection attacks |
| **CORS Policy** | FastAPI CORS middleware (allowlist-only) | Cross-site request forgery |
| **Password Storage** | bcrypt hashing (via `passlib`) | Password theft from DB leak |
| **JWT Signing** | HS256 with secret key (from env var) | Token forgery |
| **JWT Expiry** | 24-hour token lifetime | Stolen token reuse |
| **Rate Limiting** | `slowapi` middleware on auth endpoints | Brute-force attacks |
| **Secrets** | `.env` file + `.gitignore` | Key exposure in source code |
| **Admin Routes** | Role check (`role == "admin"`) in dependency | Unauthorized admin access |

### 7.3 Known Security Limitations (Prototype)

> **⚠️ The following limitations apply to the prototype and must be addressed before any public production deployment:**

| Limitation | Risk | Future Mitigation |
|-----------|------|------------------|
| SQLite has no user-level access control | Low (dev only) | PostgreSQL with role-based access |
| No HTTPS in local dev | Medium | TLS/SSL via reverse proxy (nginx + Let's Encrypt) in prod |
| JWT stored in localStorage | Medium | Move to httpOnly cookies |
| No API key rotation mechanism | Low | Implement key rotation policy |

---

## 8. Scalability Considerations

### 8.1 Horizontal Scaling Path

The backend is designed to scale horizontally (adding more server instances):

```
Current (Prototype):
  Browser → [Single Uvicorn instance] → SQLite

Future (Production):
  Browser → [Load Balancer (nginx)]
                  ├── [FastAPI Instance 1 (Uvicorn)]
                  ├── [FastAPI Instance 2 (Uvicorn)]
                  └── [FastAPI Instance N (Uvicorn)]
                              │
                        [PostgreSQL + PostGIS]
                              │
                        [Redis Cache] (future)
```

**Why this works:** Because the backend is **stateless** (no server-side session storage), any instance can handle any request. The JWT token carries all authentication state.

### 8.2 Database Scaling

| Stage | Database | Action |
|-------|---------|--------|
| Prototype | SQLite | Zero setup, single-file |
| Small Prod (< 1M records) | PostgreSQL | Direct connection |
| Large Prod (> 1M records) | PostgreSQL + PostGIS | Connection pooling (pgbouncer), spatial indexing |
| Very Large (future) | Read replicas | Route read queries to replicas |

### 8.3 Caching Strategy (Future)

```
Currently: Every search → database query
Future:    Search → Redis cache → (cache miss) → database query

Cache targets:
  - Popular search results (5-minute TTL)
  - Computed analog scores (invalidated on data ingestion)
  - Site detail pages (1-hour TTL)
```

### 8.4 Scientific Processing Scaling

For large-scale analog scoring across thousands of sites:

```
Current:  Scoring runs synchronously during ingestion job
Future:   Celery task queue + Redis broker
          - Ingestion produces tasks
          - Multiple Celery workers process sites in parallel
          - Results written back to DB asynchronously
```

---

## 9. Technology Justifications

### 9.1 Frontend Choices

| Technology | Alternative Considered | Why TerraTwin Chose It |
|-----------|----------------------|------------------------|
| **React** | Vue.js, Angular, Svelte | Largest ecosystem, best GIS library support, team familiarity |
| **TypeScript** | JavaScript | Compile-time type checking prevents runtime bugs; better IDE support |
| **Vite** | Create React App (CRA) | 10–100× faster dev server HMR; native ES modules; simpler config |
| **Tailwind CSS** | Bootstrap, MUI | Utility-first → no naming fatigue; easier responsive design; smaller final bundle |
| **shadcn/ui** | Chakra UI, Ant Design | Copy-into-project model (not a dependency), Radix accessibility primitives, Tailwind-native |
| **MapLibre GL JS** | Mapbox GL JS, Leaflet | Fully open-source (no license cost), identical API to Mapbox GL JS v1, vector tile support |
| **CesiumJS** | Three.js + custom globe | Purpose-built for geospatial 3D; built-in terrain, time, and camera controls |
| **Plotly.js** | Chart.js, D3.js | Strong scientific chart types (radar, 3D scatter); React wrapper available; interactive by default |

### 9.2 Backend Choices

| Technology | Alternative Considered | Why TerraTwin Chose It |
|-----------|----------------------|------------------------|
| **FastAPI** | Flask, Django, Express | Automatic OpenAPI docs; native async support; Pydantic integration; 2–3× faster than Flask for I/O-bound work |
| **SQLAlchemy** | raw SQL, Tortoise ORM | Database-agnostic (SQLite ↔ PostgreSQL without code changes); mature; powerful query builder |
| **Pydantic** | marshmallow, dataclasses | FastAPI native integration; automatic validation and serialization; v2 is very fast |
| **Alembic** | Manual SQL scripts | Auto-generates migration scripts from model changes; prevents schema drift |
| **bcrypt (passlib)** | sha256, md5 | bcrypt is specifically designed for password hashing with adjustable cost factor |

### 9.3 Scientific Stack Choices

| Technology | Alternative Considered | Why TerraTwin Chose It |
|-----------|----------------------|------------------------|
| **NumPy** | Pure Python math | Vectorized array operations are 10–100× faster than Python loops for raster data |
| **Pandas** | CSV/manual parsing | Powerful DataFrame operations; handles missing data; easy CSV/JSON I/O |
| **GeoPandas** | Fiona + Shapely manual | Extends Pandas with geospatial data types; CRS (coordinate reference system) management |
| **Shapely** | Custom geometry | Well-tested geometry library; polygon intersections, bounding boxes, buffering |
| **Rasterio** | GDAL Python bindings | Pythonic API for raster data (GeoTIFF); built on GDAL but much easier to use |
| **Scikit-learn** | Custom algorithms | Provides cosine similarity, MinMaxScaler, etc.; avoids reinventing the wheel for ML/stats |

### 9.4 Database Choices

| Technology | Alternative Considered | Why TerraTwin Chose It |
|-----------|----------------------|------------------------|
| **SQLite** (dev) | PostgreSQL for all envs | Zero setup required; single file; perfect for local development and demos |
| **PostgreSQL** (prod) | MySQL, MongoDB | ACID compliance; best-in-class extension ecosystem; PostGIS support |
| **PostGIS** | Manual lat/lon math | Native spatial data types (GEOMETRY, GEOGRAPHY); spatial indexing (GIST); ST_* function library |

### 9.5 Testing Choices

| Technology | Alternative Considered | Why TerraTwin Chose It |
|-----------|----------------------|------------------------|
| **Pytest** | unittest | Simpler test writing (plain functions vs. class inheritance); rich plugin ecosystem; better fixtures |
| **Vitest** | Jest | Native Vite integration; same API as Jest (easy migration); significantly faster than Jest for Vite projects |

---

## 10. Directory Structure

Full project directory structure for reference:

```
TerraTwin/
├── frontend/                        ← React + TypeScript SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── map/
│   │   │   │   ├── MapLibreView.tsx      ← 2D map component
│   │   │   │   └── CesiumGlobe.tsx       ← 3D globe component
│   │   │   ├── charts/
│   │   │   │   ├── RadarChart.tsx        ← Score breakdown radar
│   │   │   │   └── ComparisonChart.tsx   ← Grouped bar comparison
│   │   │   ├── sites/
│   │   │   │   ├── SiteCard.tsx
│   │   │   │   └── SiteDetail.tsx
│   │   │   └── ui/                       ← shadcn/ui components
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── SearchPage.tsx
│   │   │   ├── SiteDetailPage.tsx
│   │   │   ├── ComparePage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   └── AdminPage.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useSites.ts
│   │   │   └── useSearch.ts
│   │   ├── api/
│   │   │   ├── client.ts                 ← Axios instance with base URL
│   │   │   ├── sites.ts
│   │   │   ├── auth.ts
│   │   │   └── search.ts
│   │   ├── types/
│   │   │   ├── site.ts
│   │   │   └── user.ts
│   │   ├── store/
│   │   │   └── authContext.tsx
│   │   └── utils/
│   │       └── scoring.ts               ← Frontend score display helpers
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                             ← Python + FastAPI
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── site.py
│   │   │   ├── user.py
│   │   │   ├── bookmark.py
│   │   │   ├── saved_search.py
│   │   │   └── ingestion_job.py
│   │   ├── schemas/
│   │   │   ├── site.py
│   │   │   ├── user.py
│   │   │   └── auth.py
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── sites.py
│   │   │   ├── search.py
│   │   │   ├── comparison.py
│   │   │   └── admin.py
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   └── site_service.py
│   │   ├── scientific/
│   │   │   ├── __init__.py
│   │   │   ├── scoring.py
│   │   │   ├── feature_extractor.py
│   │   │   └── ranking.py
│   │   ├── ingestion/
│   │   │   ├── __init__.py
│   │   │   ├── pipeline.py
│   │   │   ├── transformers.py
│   │   │   └── sources/
│   │   │       ├── nasa_earthdata.py
│   │   │       └── usgs.py
│   │   └── migrations/
│   │       ├── env.py
│   │       └── versions/
│   ├── tests/
│   │   ├── test_auth.py
│   │   ├── test_sites.py
│   │   ├── test_scoring.py
│   │   └── test_ingestion.py
│   ├── requirements.txt
│   ├── alembic.ini
│   └── .env.example                     ← Template for env vars (committed)
│
├── docs/
│   ├── SRS.md                           ← Software Requirements Specification
│   └── ARCHITECTURE.md                  ← This document
│
├── .gitignore                           ← Excludes .env, __pycache__, node_modules
└── README.md
```

---

> **Disclaimer:** TerraTwin is a NASA Space Apps Challenge prototype. The architecture described in this document represents the intended design. Some components may be partially implemented in the prototype submission. All analog scores and scientific values marked as DEMO DATA are illustrative and not scientifically validated.

---

*Document prepared by the TerraTwin Team | NASA Space Apps Challenge 2026*
