# TerraTwin – Earth-Moon-Mars Analog Discovery & Research Platform

**NASA Space Apps Challenge 2026**  
**Tagline:** *Discover Earth. Explore Other Worlds.*

---

## 🌍 What is TerraTwin?

TerraTwin is a full-stack scientific web platform that discovers, characterizes,
and ranks terrestrial environments on Earth that share measurable environmental,
geological, topographical, and surface characteristics with selected regions of
the **Moon** and **Mars**.

It uses real open scientific datasets from NASA, ESA, USGS, and other credible
organizations to produce transparent, traceable analog comparisons.

---

## 🚀 Quick Start

### Prerequisites

| Software | Version | Required |
|----------|---------|----------|
| Python | 3.11+ | ✅ Required |
| Node.js | LTS | ✅ Required |
| Git | Any | ✅ Required |
| uv | Latest | ✅ Required |
| PostgreSQL + PostGIS | 15+ | For production |
| Docker Desktop | Latest | Recommended |

### Backend (Terminal 1)

```bash
cd TerraTwin/backend
uv venv --python 3.11
.venv\Scripts\activate
uv sync
uv run uvicorn app.main:app --reload
```

Backend API: http://127.0.0.1:8000  
API Docs: http://127.0.0.1:8000/docs

### Frontend (Terminal 2)

```bash
cd TerraTwin/frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

---

## 📁 Project Structure

```
TerraTwin/
├── docs/                    # Technical documentation
│   ├── SRS.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE_DESIGN.md
│   ├── API_DOCUMENTATION.md
│   ├── DATA_SOURCES.md
│   ├── SCIENTIFIC_METHODOLOGY.md
│   ├── TEST_PLAN.md
│   └── DEVELOPMENT_ROADMAP.md
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── api/routes/      # API route handlers
│   │   ├── core/            # Configuration and utilities
│   │   ├── db/              # Database setup and migrations
│   │   ├── models/          # SQLAlchemy data models
│   │   ├── schemas/         # Pydantic validation schemas
│   │   ├── services/        # Business logic
│   │   └── scientific/      # Scientific processing engine
│   │       ├── data_connectors/   # NASA/ESA/USGS connectors
│   │       ├── processing/        # Geospatial processing
│   │       └── similarity/        # Similarity calculations
│   └── tests/               # Pytest test suite
├── frontend/                # React TypeScript frontend
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── pages/           # Application pages
│       ├── hooks/           # React hooks
│       ├── services/        # API client
│       └── types/           # TypeScript definitions
├── data/                    # Scientific datasets
│   ├── raw/                 # Unprocessed source data
│   │   ├── earth/
│   │   ├── moon/
│   │   └── mars/
│   ├── processed/           # Processed outputs
│   └── exports/             # Generated reports
└── scripts/                 # Utility and setup scripts
```

---

## 🔬 Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React + TypeScript + Vite |
| CSS | Tailwind CSS |
| UI Components | shadcn/ui |
| 2D Map | MapLibre GL JS |
| 3D Globe | CesiumJS |
| Charts | Plotly |
| Backend | FastAPI (Python) |
| Database | SQLite → PostgreSQL + PostGIS |
| ORM | SQLAlchemy + Alembic |
| Data Analysis | NumPy + Pandas |
| Geospatial | GeoPandas + Shapely |
| Raster Data | Rasterio + GDAL |
| ML | Scikit-learn |
| Testing | Pytest + Vitest |

---

## 📊 Key Features

- 🌑 **Moon & Mars Target Selection** — Choose reference regions like Jezero Crater or the Lunar South Pole
- 🗺️ **Interactive Earth Map** — MapLibre GL JS with analog site markers
- 🔍 **Discovery Engine** — Scan Earth observation data for candidate analog environments
- 📐 **Similarity Engine** — Transparent, weighted Analog Compatibility Score (ACS)
- 📋 **Site Profiles** — Detailed environmental and geological site information
- 🔄 **Comparison Tool** — Side-by-side analysis of multiple candidate sites
- 📦 **Data Catalog** — Source attribution for every dataset used
- 📄 **Report Generator** — Downloadable scientific reports with full methodology

---

## ⚠️ Scientific Disclaimer

> TerraTwin computes **analog compatibility scores** based on measurable terrain,
> geological, and surface characteristics. These scores are **not** geological
> equivalence certifications. Physical differences (gravity, atmosphere, radiation)
> between Earth, Moon, and Mars are always displayed prominently and are never
> hidden inside a similarity score.

All sample data shown during development is clearly labeled **DEMO DATA**.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [SRS.md](docs/SRS.md) | Software Requirements Specification |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture |
| [DATABASE_DESIGN.md](docs/DATABASE_DESIGN.md) | Database schema |
| [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) | REST API spec |
| [DATA_SOURCES.md](docs/DATA_SOURCES.md) | NASA/ESA/USGS datasets |
| [SCIENTIFIC_METHODOLOGY.md](docs/SCIENTIFIC_METHODOLOGY.md) | Scientific calculations |
| [TEST_PLAN.md](docs/TEST_PLAN.md) | Testing strategy |
| [DEVELOPMENT_ROADMAP.md](docs/DEVELOPMENT_ROADMAP.md) | Development milestones |

---

## 🏆 NASA Space Apps Challenge

- **Challenge:** Earth Analog Research
- **Team:** TerraTwin
- **IDE:** Google Antigravity
- **Year:** 2026

