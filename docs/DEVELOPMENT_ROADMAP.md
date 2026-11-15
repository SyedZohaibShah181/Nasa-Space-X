# TerraTwin — Development Roadmap

**Project:** TerraTwin: Earth-Moon-Mars Analog Discovery & Research Platform
**Version:** 1.0.0
**Last Updated:** 2025-01-01
**Status:** Active Planning

---

## Table of Contents

1. [Roadmap Overview](#1-roadmap-overview)
2. [Milestone Details](#2-milestone-details)
   - [M-01: Project Setup & Repository](#m-01-project-setup--repository)
   - [M-02: Database Schema & Migrations](#m-02-database-schema--migrations)
   - [M-03: Core Backend API](#m-03-core-backend-api)
   - [M-04: Scientific Engine](#m-04-scientific-engine)
   - [M-05: Data Ingestion Pipeline](#m-05-data-ingestion-pipeline)
   - [M-06: Frontend Foundations](#m-06-frontend-foundations)
   - [M-07: Map & Visualization Layer](#m-07-map--visualization-layer)
   - [M-08: Search & Analysis UI](#m-08-search--analysis-ui)
   - [M-09: Reporting & Export](#m-09-reporting--export)
   - [M-10: Polish, Testing & Submission](#m-10-polish-testing--submission)
3. [Overall Timeline](#3-overall-timeline)
4. [Risk Register](#4-risk-register)
5. [Technical Debt Tracker](#5-technical-debt-tracker)
6. [Version History](#6-version-history)

---

## 1. Roadmap Overview

TerraTwin is developed across **10 milestones** spanning a recommended **10-week schedule**. Each milestone delivers a working, testable increment of the platform.

```
Week 1       Week 2       Week 3       Week 4       Week 5
  │            │            │            │            │
  M-01         M-02         M-03         M-04         M-05
  Setup        DB           API          Science      Ingestion
  & Repo       Schema       Endpoints    Engine       Pipeline
  │            │            │            │            │
Week 6       Week 7       Week 8       Week 9       Week 10
  │            │            │            │            │
  M-06         M-07         M-08         M-09         M-10
  Frontend     Maps &       Search &     Reports      Polish
  Foundations  Visuals      Analysis     & Export     & Submit
```

### Quick Reference Table

| Milestone | Name | Complexity | Depends On |
|---|---|---|---|
| M-01 | Project Setup & Repository | S | — |
| M-02 | Database Schema & Migrations | M | M-01 |
| M-03 | Core Backend API | M | M-02 |
| M-04 | Scientific Engine | L | M-02 |
| M-05 | Data Ingestion Pipeline | L | M-02, M-03 |
| M-06 | Frontend Foundations | M | M-01 |
| M-07 | Map & Visualization Layer | XL | M-06, M-03 |
| M-08 | Search & Analysis UI | L | M-07, M-04 |
| M-09 | Reporting & Export | M | M-03, M-04 |
| M-10 | Polish, Testing & Submission | XL | All |

> **Complexity Scale:** S = Small (~1–2 days), M = Medium (~3–4 days), L = Large (~5–7 days), XL = Extra Large (~7–10 days)

---

## 2. Milestone Details

---

### M-01: Project Setup & Repository

**Milestone ID:** M-01
**Estimated Complexity:** S (Small — ~1–2 days)
**Dependencies:** None

#### Goals

- Establish a clean, documented monorepo structure that all team members can clone and run locally on Windows.
- Scaffold both the React/TypeScript frontend and the FastAPI backend with correct tooling configured.
- Publish developer onboarding documentation so any new contributor can be productive within 30 minutes.

#### Tasks Checklist

- [ ] Initialize Git repository with `.gitignore` for Python, Node, and IDE files
- [ ] Create monorepo directory structure: `frontend/`, `backend/`, `docs/`, `data/`, `scripts/`
- [ ] Scaffold React + TypeScript + Vite frontend (`npm create vite@latest frontend -- --template react-ts`)
- [ ] Install and configure Tailwind CSS and shadcn/ui in the frontend
- [ ] Scaffold FastAPI backend with `uvicorn`, create `main.py` with a `/health` stub
- [ ] Configure `pyproject.toml` or `requirements.txt` for backend dependencies
- [ ] Write `docs/DEVELOPER_SETUP.md` with Windows-specific setup steps (PowerShell commands)
- [ ] Confirm both frontend (`npm run dev`) and backend (`uvicorn app.main:app --reload`) start without errors

#### Definition of Done

- [ ] Repository is accessible to all team members
- [ ] `GET /health` returns `{"status": "ok"}` with HTTP 200
- [ ] `npm run dev` serves the Vite app at `http://localhost:5173`
- [ ] `DEVELOPER_SETUP.md` reviewed and followed successfully by at least one team member

---

### M-02: Database Schema & Migrations

**Milestone ID:** M-02
**Estimated Complexity:** M (Medium — ~3–4 days)
**Dependencies:** M-01

#### Goals

- Define all 10 SQLAlchemy ORM models covering planetary bodies, geographic regions, candidate sites, measurements, datasets, analysis jobs, and reports.
- Create Alembic migration files so the schema can be versioned and reproduced deterministically.
- Seed the database with DEMO DATA (Earth, Moon, Mars + regions + sites) for development and testing.

#### Tasks Checklist

- [ ] Design and document the entity-relationship diagram (ERD) for all 10 tables
- [ ] Implement SQLAlchemy models: `Planet`, `Region`, `CandidateSite`, `Measurement`, `Dataset`, `DatasetFile`, `FeatureWeight`, `AnalysisJob`, `AnalysisResult`, `Report`
- [ ] Configure Alembic (`alembic init alembic`); write initial migration `001_initial_schema.py`
- [ ] Add foreign key constraints, indexes on `planet_id`, `region_id`, `site_id`, `feature_name`
- [ ] Write `seed_demo_data()` function: 3 planets, 6 regions, 15 sites, 45 measurements — all clearly labeled **DEMO DATA**
- [ ] Write Pydantic response schemas for each model
- [ ] Run migration on fresh SQLite DB; verify all tables created correctly
- [ ] Write unit tests for CRUD operations (create, read, update, delete for each model)

#### Definition of Done

- [ ] `alembic upgrade head` runs without errors on a blank SQLite database
- [ ] All 10 tables exist with correct columns, types, and constraints
- [ ] `seed_demo_data()` populates DB with DEMO DATA; can be re-run idempotently
- [ ] ≥ 80% unit test coverage for CRUD functions

#### Database Table Summary

| # | Table | Purpose |
|---|---|---|
| 1 | `planets` | Earth, Moon, Mars metadata (gravity, radius, atmosphere) |
| 2 | `regions` | Geographic macro-regions per planet |
| 3 | `candidate_sites` | Individual field sites with coordinates |
| 4 | `measurements` | Feature values per site (elevation, slope, etc.) |
| 5 | `datasets` | Registered datasets (SRTM, MOLA, LOLA, etc.) |
| 6 | `dataset_files` | Individual files within a dataset |
| 7 | `feature_weights` | User-configurable weights per feature |
| 8 | `analysis_jobs` | Comparison job records (status, timestamps) |
| 9 | `analysis_results` | Per-site ACS scores + feature breakdowns |
| 10 | `reports` | Generated report records (format, path) |

---

### M-03: Core Backend API

**Milestone ID:** M-03
**Estimated Complexity:** M (Medium — ~3–4 days)
**Dependencies:** M-02

#### Goals

- Implement all 12 REST API endpoints with correct Pydantic request/response schemas and input validation.
- Ensure every endpoint returns appropriate HTTP status codes and meaningful error messages.
- Generate automatic OpenAPI documentation (`/docs`) for frontend developers to reference.

#### Tasks Checklist

- [ ] Implement `GET /health` — server health and DB connectivity check
- [ ] Implement `GET /planets` — list all planetary bodies
- [ ] Implement `GET /regions` — list regions, with optional `?planet_id=` filter
- [ ] Implement `GET /sites` — paginated list of candidate sites (`?skip=`, `?limit=`)
- [ ] Implement `GET /sites/{id}` — site detail with nested measurements; return 404 on invalid ID
- [ ] Implement `GET /datasets` — list datasets with optional `?type=` filter
- [ ] Implement `POST /discovery/search` — accept weights + reference site, return ranked results
- [ ] Implement `POST /analysis/compare` — trigger scoring job, return `analysis_id`
- [ ] Implement `GET /analysis/{id}` — return analysis result with feature breakdown
- [ ] Implement `GET /rankings` — return all sites sorted by ACS score descending
- [ ] Implement `POST /reports/generate` — create report record for an analysis
- [ ] Implement `GET /reports/{id}` — download report in requested format
- [ ] Write Pydantic request and response models for every endpoint
- [ ] Verify OpenAPI spec at `/docs` documents all endpoints correctly

#### Definition of Done

- [ ] All 12 endpoints return correct responses for valid DEMO DATA inputs
- [ ] Invalid inputs return appropriate 4xx status codes with `{"detail": "..."}` body
- [ ] `/docs` page renders without errors and shows all 12 endpoints
- [ ] Integration test suite passes for all endpoints

#### API Endpoint Summary

| # | Method | Path | Description |
|---|---|---|---|
| 1 | GET | `/health` | Server health check |
| 2 | GET | `/planets` | List planetary bodies |
| 3 | GET | `/regions` | List regions (filter by planet) |
| 4 | GET | `/sites` | Paginated candidate site list |
| 5 | GET | `/sites/{id}` | Site detail + measurements |
| 6 | GET | `/datasets` | List datasets (filter by type) |
| 7 | POST | `/discovery/search` | Weighted analog search |
| 8 | POST | `/analysis/compare` | Trigger comparison job |
| 9 | GET | `/analysis/{id}` | Retrieve analysis results |
| 10 | GET | `/rankings` | Global site rankings |
| 11 | POST | `/reports/generate` | Generate a report |
| 12 | GET | `/reports/{id}` | Download a report |

---

### M-04: Scientific Engine

**Milestone ID:** M-04
**Estimated Complexity:** L (Large — ~5–7 days)
**Dependencies:** M-02

#### Goals

- Implement the peer-reviewed similarity scoring formula (S_i) and the Analog Composite Score (ACS) aggregation.
- Support configurable feature weights so researchers can tune which environmental parameters matter most.
- Handle all edge cases (missing data, zero weights, single features) robustly without crashes.

#### Tasks Checklist

- [ ] Implement `compute_feature_similarity(candidate, reference, range_val) → float | None`
- [ ] Implement `compute_acs(scores: dict, weights: dict) → float | None`
- [ ] Implement `normalize_feature_value(value, min_val, max_val) → float`
- [ ] Implement `load_feature_weights(config_path) → dict` — load from JSON/YAML config file
- [ ] Add edge-case guards: `None` inputs, zero `range_val`, zero total weight, all-None scores
- [ ] Write a configuration file `feature_weights_default.json` with sensible defaults
- [ ] Integrate scientific engine into `/discovery/search` endpoint (M-03)
- [ ] Write comprehensive unit tests (≥ 95% branch coverage for science module)
- [ ] Document the mathematical formulas with LaTeX in `docs/SCIENCE.md`

#### Definition of Done

- [ ] All unit tests for the scientific engine pass, including all edge cases from TEST_PLAN.md §5
- [ ] `compute_acs` never returns a value outside [0, 100]
- [ ] `compute_acs` raises `ValueError` when total weight ≤ 0
- [ ] Missing feature data returns `None` score (not 0.0 or crash)
- [ ] `docs/SCIENCE.md` explains the formula clearly enough for a non-programmer judge to understand

#### Formula Reference

The per-feature similarity score:

```
S_i = max(0, 1 - |v_candidate - v_reference| / R_i)
```

The Analog Composite Score:

```
ACS = (Σ w_i * S_i) / (Σ w_i) × 100
```

Where `w_i` are the user-defined feature weights and `R_i` is the normalization range for feature `i`.

---

### M-05: Data Ingestion Pipeline

**Milestone ID:** M-05
**Estimated Complexity:** L (Large — ~5–7 days)
**Dependencies:** M-02, M-03

#### Goals

- Build parsers for the three primary planetary terrain datasets: SRTM (Earth), MOLA (Mars), LOLA (Moon).
- Store parsed measurements in the database with provenance metadata and data quality flags.
- Provide a CLI script so the team can re-ingest data without code changes.

#### Tasks Checklist

- [ ] Implement `SRTMParser` — reads GeoTIFF elevation tiles using Rasterio; extracts elevation and slope per site coordinate
- [ ] Implement `MOLAParser` — reads MOLA PDS/GeoTIFF products; handles Mars-specific CRS (IAU_2015)
- [ ] Implement `LOLAParser` — reads LOLA CSV or GeoTIFF; extracts lunar elevation and roughness
- [ ] Implement `ingest_measurement(db, site_id, feature_name, value, source, quality_flag)` with upsert logic
- [ ] Add `quality_flag` values: `"good"`, `"interpolated"`, `"low_confidence"`, `"missing"`
- [ ] Implement CLI script: `python scripts/ingest.py --dataset SRTM --region Mojave`
- [ ] Write unit tests for each parser using small synthetic GeoTIFF files
- [ ] Write ingestion test: duplicate record upserts correctly without duplicating rows

#### Definition of Done

- [ ] All three parsers produce valid `Measurement` records for a sample tile
- [ ] Ingesting the same data twice does not create duplicate rows
- [ ] CLI script runs end-to-end without manual code changes
- [ ] Quality flag is stored for every measurement
- [ ] At least 45 DEMO DATA measurements loaded for 15 demo sites

#### Supported Data Sources

| Source | Planet | Features | Format |
|---|---|---|---|
| SRTM v3 (NASA) | Earth | Elevation, Slope | GeoTIFF |
| MOLA MEGDR (NASA) | Mars | Elevation, Roughness | GeoTIFF / PDS |
| LOLA (NASA) | Moon | Elevation, Slope, Roughness | GeoTIFF / CSV |

---

### M-06: Frontend Foundations

**Milestone ID:** M-06
**Estimated Complexity:** M (Medium — ~3–4 days)
**Dependencies:** M-01

#### Goals

- Set up React Router with all application routes defined and navigable.
- Apply the TerraTwin brand theme (colors, typography, spacing) via Tailwind and shadcn/ui.
- Create the core layout shell (navbar, sidebar, main content area) and an API client layer.

#### Tasks Checklist

- [ ] Configure `react-router-dom` with routes: `/`, `/planets`, `/sites`, `/discovery`, `/analysis`, `/reports`
- [ ] Design and implement the brand color palette in `tailwind.config.ts` (space-dark background, accent blue/orange)
- [ ] Configure shadcn/ui components: `Button`, `Card`, `Select`, `Input`, `Table`, `Badge`, `Dialog`
- [ ] Implement `AppShell` layout: top navigation bar, left sidebar with planet selector, main content slot
- [ ] Build an API client module (`src/api/client.ts`) wrapping `fetch` with base URL config and error handling
- [ ] Implement typed API hooks using the response schemas from M-03 (or React Query)
- [ ] Add global loading state and error boundary components
- [ ] Write Vitest component tests for `AppShell`, `NavBar`, and API client

#### Definition of Done

- [ ] All routes render without errors (pages may show placeholder content)
- [ ] API client correctly hits `localhost:8000` backend in development
- [ ] Theme is consistent across all pages (no default Vite/React styling visible)
- [ ] NavBar highlights the active route

---

### M-07: Map & Visualization Layer

**Milestone ID:** M-07
**Estimated Complexity:** XL (Extra Large — ~7–10 days)
**Dependencies:** M-06, M-03

#### Goals

- Deliver an interactive 2D map (MapLibre GL JS) and a 3D planetary globe (CesiumJS) with candidate site markers.
- Render feature comparison charts using Plotly for the analysis and rankings pages.
- Ensure map performance meets the < 2 s initial load target.

#### Tasks Checklist

- [ ] Install and configure `maplibre-gl` in the React frontend; render the 2D base map in a `MapView` component
- [ ] Add candidate site markers to MapLibre; clicking a marker navigates to the site detail page
- [ ] Install and configure `resium` (CesiumJS React wrapper); render the 3D globe in a `GlobeView` component
- [ ] Load planetary body terrain tiles onto the CesiumJS globe (Earth DEM, Moon/Mars placeholder textures)
- [ ] Place site pins on the 3D globe with popups showing site name and ACS score
- [ ] Install `react-plotly.js`; create `FeatureBreakdownChart` (horizontal bar chart of per-feature scores)
- [ ] Create `ACSRadarChart` (radar/spider chart of multi-feature comparison)
- [ ] Create `RankingBarChart` (vertical bar chart of top-N sites by ACS score)
- [ ] Add a toggle button to switch between 2D (MapLibre) and 3D (Cesium) views
- [ ] Write Vitest tests: map container renders; chart renders without crash on empty data

#### Definition of Done

- [ ] 2D map renders at `http://localhost:5173/sites` with site markers visible
- [ ] 3D globe renders without crash at `http://localhost:5173/globe`
- [ ] Clicking a site marker on either map navigates to the correct site detail page
- [ ] All three Plotly charts render with DEMO DATA
- [ ] 2D map initial load ≤ 2 s (Lighthouse measurement on localhost)

---

### M-08: Search & Analysis UI

**Milestone ID:** M-08
**Estimated Complexity:** L (Large — ~5–7 days)
**Dependencies:** M-07, M-04

#### Goals

- Build the Discovery Search page: a form to select a reference site, configure feature weights, and submit a search.
- Build the Analysis page: trigger a comparison job, poll for completion, and display the ranked results with feature breakdown.
- Display ACS scores and per-feature breakdowns as interactive charts.

#### Tasks Checklist

- [ ] Implement `DiscoverySearchForm`: reference site picker, feature weight sliders (0–1 range), submit button
- [ ] Display real-time form validation errors (required reference site; at least one weight > 0)
- [ ] On submit, call `POST /discovery/search`; show loading spinner during request
- [ ] Display search results as a ranked list of `SiteCard` components (site name, ACS score badge, planet badge)
- [ ] Implement `AnalysisTriggerPanel`: multi-site selector, "Compare Sites" button, calls `POST /analysis/compare`
- [ ] Poll `GET /analysis/{id}` every 2 seconds until `status == "complete"`; show progress indicator
- [ ] Render `FeatureBreakdownChart` for each site in the analysis results
- [ ] Add a "View on Map" button in the results panel to highlight the site on the MapLibre map
- [ ] Write Vitest tests: form validation, API call on submit, results rendering

#### Definition of Done

- [ ] Discovery search with DEMO DATA returns a ranked list of sites within 5 s
- [ ] Analysis comparison completes and displays feature breakdown chart
- [ ] "View on Map" highlights the correct marker on the 2D map
- [ ] All form validation rules tested and passing

---

### M-09: Reporting & Export

**Milestone ID:** M-09
**Estimated Complexity:** M (Medium — ~3–4 days)
**Dependencies:** M-03, M-04

#### Goals

- Enable users to generate downloadable analysis reports in JSON, CSV, and PDF formats.
- Provide a report history page so previous reports can be re-downloaded without re-running analysis.
- Store report metadata in the database with download links.

#### Tasks Checklist

- [ ] Implement `POST /reports/generate` backend handler: accepts `analysis_id` and `format`; writes output file
- [ ] Implement JSON report serializer: includes site metadata, feature breakdown, ACS scores, timestamp
- [ ] Implement CSV report serializer: tabular format with one row per site
- [ ] Implement PDF report generator using `reportlab` or `weasyprint`; include TerraTwin header/footer
- [ ] Implement `GET /reports/{id}` to serve the file with correct `Content-Type` header
- [ ] Build `ReportHistoryPage` in the frontend: table of past reports with download buttons
- [ ] Add "Generate Report" button to the Analysis results page (calls `POST /reports/generate`)
- [ ] Write tests: report creation, format selection, download endpoint

#### Definition of Done

- [ ] JSON report downloads and parses correctly as valid JSON
- [ ] CSV report opens correctly in Excel/LibreOffice (Windows-compatible line endings)
- [ ] PDF report renders with TerraTwin branding and analysis data
- [ ] Report history page lists all DEMO DATA reports with working download links
- [ ] All 3 formats tested in TC-13 and TC-14 (see TEST_PLAN.md)

---

### M-10: Polish, Testing & Submission

**Milestone ID:** M-10
**Estimated Complexity:** XL (Extra Large — ~7–10 days)
**Dependencies:** All previous milestones (M-01 through M-09)

#### Goals

- Execute the full acceptance test suite (TC-01 through TC-16) and resolve all Critical and High bugs.
- Review and finalize all documentation for judges.
- Load a compelling DEMO DATA set and record the submission demo video.

#### Tasks Checklist

- [ ] Run all 16 acceptance test cases (TC-01 to TC-16); document results in a test results table
- [ ] Achieve ≥ 80% backend code coverage; ≥ 70% frontend coverage
- [ ] Fix all bugs classified as Critical (🔴) or High (🟠)
- [ ] Review and finalize: `README.md`, `TEST_PLAN.md`, `DEVELOPMENT_ROADMAP.md`, `SCIENCE.md`, `API_REFERENCE.md`
- [ ] Load a rich DEMO DATA set: 3 planets, 10+ regions, 50+ candidate sites, full measurement sets — all labeled **DEMO DATA**
- [ ] Run performance tests: confirm API < 500ms, map load < 2s, analysis < 10s, 50 concurrent users
- [ ] Deploy to a demo environment (Render / Railway / local tunneled instance) for judge access
- [ ] Record the 3-minute demo video showcasing: discovery search, analysis comparison, 3D globe, report download
- [ ] Submit to NASA Space Apps Challenge platform before the deadline

#### Definition of Done

- [ ] All 16 acceptance tests pass (TC-01 through TC-16)
- [ ] Zero Critical or High bugs open
- [ ] All documentation files finalized and spell-checked
- [ ] Demo environment accessible to judges via public URL
- [ ] Submission submitted on time ✅

---

## 3. Overall Timeline

> [!NOTE]
> This is a **suggested** 10-week schedule. Teams with more members or prior experience can compress it.

| Week | Milestone | Key Deliverables |
|---|---|---|
| **Week 1** | M-01: Project Setup | Repo live, Vite + FastAPI running, `DEVELOPER_SETUP.md` written |
| **Week 2** | M-02: Database Schema | 10 SQLAlchemy models, Alembic migration, DEMO DATA seeded |
| **Week 3** | M-03: Core Backend API | All 12 endpoints stubbed, Pydantic schemas, `/docs` live |
| **Week 4** | M-04: Scientific Engine | S_i formula, ACS calculation, edge cases, unit tests |
| **Week 5** | M-05: Data Ingestion | SRTM/MOLA/LOLA parsers, CLI ingest script, quality flags |
| **Week 6** | M-06: Frontend Foundations | React Router, theme, layout, API client |
| **Week 7** | M-07: Maps & Visualization | MapLibre 2D, CesiumJS 3D, Plotly charts |
| **Week 8** | M-08: Search & Analysis UI | Discovery form, comparison trigger, results panel |
| **Week 9** | M-09: Reporting & Export | PDF/CSV/JSON reports, download endpoint, history page |
| **Week 10** | M-10: Polish & Submit | Full test run, bug fixes, demo data, video, submission |

### Parallel Tracks

Where the team has 2+ members, these milestones can run in parallel:

```
Track A (Backend):   M-01 → M-02 → M-03 → M-04 → M-05 → M-09
Track B (Frontend):  M-01 → M-06 → M-07 → M-08
Integration:                               ↑ Merge at M-08 / M-09
Final:                                                   M-10
```

---

## 4. Risk Register

> [!WARNING]
> Review this register at the start of each milestone. Update probability and impact as the project progresses.

| Risk ID | Description | Probability | Impact | Mitigation Strategy |
|---|---|---|---|---|
| **R-01** | External API / data portal unavailability (NASA PDS, USGS EarthExplorer down) | M | H | Pre-download all required datasets in Week 1; cache locally in `data/raw/` (gitignored); use DEMO DATA if real data unavailable |
| **R-02** | Planetary data format changes (MOLA/LOLA PDS format update breaks parsers) | L | H | Pin dataset versions with exact URLs and checksums in `data/SOURCES.md`; write format-version detection in parsers |
| **R-03** | CesiumJS performance issues on target hardware (3D globe laggy or crashes) | M | M | Set a minimum GPU requirement in docs; implement a graceful fallback to 2D MapLibre view if WebGL fails |
| **R-04** | PostGIS migration complexity (SQLite → PostgreSQL + PostGIS adds unexpected schema changes) | M | M | Develop with SQLite; write Alembic migrations that are PostGIS-compatible from the start; test migration in Week 2 |
| **R-05** | Scientific formula peer review identifies errors in S_i or ACS calculation | L | H | Document formula with citations in `SCIENCE.md`; have a second team member independently verify the math in Week 4 |
| **R-06** | Team member availability drop (illness, exams, other commitments) | H | M | Assign an owner and a backup for each milestone; document all decisions in GitHub Issues so anyone can pick up the work |
| **R-07** | Scope creep (adding new features or planets beyond the core 3) | H | M | Lock the feature set at M-03 completion; any new feature proposals go into a "v2 backlog" in GitHub Issues, not the current sprint |
| **R-08** | Windows development environment issues (path separators, PowerShell policies, WSL conflicts) | M | L | Test all setup instructions on a clean Windows 11 VM; document PowerShell execution policy fix (`Set-ExecutionPolicy RemoteSigned`) |
| **R-09** | Missing or incomplete planetary measurement data for Moon or Mars sites | M | H | Use DEMO DATA synthetic measurements as fallback; document gaps clearly in the UI with `quality_flag: "missing"` |
| **R-10** | Submission deadline pressure causing incomplete testing | H | H | Complete TC-01 through TC-10 by Week 9; keep TC-11 through TC-16 as Week 10 targets; never skip Critical bug fixes for submission |

### Risk Priority Matrix

```
        HIGH IMPACT
              │
     R-01     │   R-05
     R-02     │   R-10
              │
     R-04 ───┼─── R-06     → HIGH PRIORITY
     R-09     │
              │
     R-03     │   R-07
     R-08     │
              │
        LOW IMPACT
         LOW ──────── HIGH PROBABILITY
```

---

## 5. Technical Debt Tracker

> [!TIP]
> Log any shortcuts, workarounds, or "good enough for now" decisions here as soon as they are made. Review and clear debt before submission (M-10).

| ID | Description | Area | Priority | Logged Date | Resolved Date |
|---|---|---|---|---|---|
| | | | | | |
| | | | | | |
| | | | | | |
| | | | | | |
| | | | | | |

**Priority Levels:** P1 = Must fix before submission | P2 = Fix if time permits | P3 = Acceptable for v1.0

**Area Tags:** `backend` · `frontend` · `science` · `geo` · `db` · `infra` · `docs` · `testing`

---

## 6. Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| v0.1.0 | 2025-01-01 | TerraTwin Team | Initial roadmap draft — 10 milestones, risk register, timeline |
| | | | |
| | | | |

---

*End of DEVELOPMENT_ROADMAP.md — TerraTwin v1.0.0*
