# Software Requirements Specification (SRS)
## TerraTwin — Earth-Moon-Mars Analog Discovery & Research Platform
### NASA Space Apps Challenge Entry

---

> **Document Version:** 1.0  
> **Date:** November 2026  
> **Status:** Draft  
> **Classification:** Public / Open-Source Project

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Problem Statement](#2-problem-statement)
3. [Project Objectives](#3-project-objectives)
4. [Project Scope](#4-project-scope)
5. [User Roles](#5-user-roles)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Use Cases](#8-use-cases)
9. [System Constraints](#9-system-constraints)
10. [Assumptions and Dependencies](#10-assumptions-and-dependencies)
11. [Glossary](#11-glossary)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the functional and non-functional requirements for **TerraTwin**, a web-based platform designed to help scientists and researchers discover Earth locations that serve as analog environments for Mars and Moon mission planning. This document is intended for developers, project stakeholders, and NASA Space Apps Challenge reviewers.

### 1.2 Project Background

Planning crewed and robotic missions to Mars and the Moon requires extensive ground-truth research. Because traveling to those bodies for field tests is not yet possible at scale, researchers rely on **Earth analog sites** — locations on Earth that share geological, environmental, or atmospheric characteristics with Martian or Lunar terrains.

Examples of real-world analog sites include (but are not limited to):
- **Atacama Desert, Chile** — extremely dry, UV-intense, Mars-like regolith
- **Iceland lava fields** — volcanic terrain similar to Lunar maria
- **Antarctic dry valleys** — cold, dry, low-biological-activity environments

TerraTwin is a platform that **aggregates public geospatial datasets**, applies a **scoring and ranking algorithm**, and presents researchers with an **interactive map and visualization interface** to explore and compare these analog sites.

> **⚠️ IMPORTANT:** TerraTwin is an independent research tool built for the NASA Space Apps Challenge. It is **not** an official NASA product and does not represent NASA-validated science. All scoring and ranking is based on publicly available data and prototype algorithms.

### 1.3 Intended Audience

| Audience | Purpose |
|----------|---------|
| Developers | Understand what to build and how components relate |
| Researchers | Understand what the tool does and how to use it |
| Challenge Reviewers | Evaluate scope, feasibility, and innovation |
| Administrators | Understand management and data oversight features |

### 1.4 Document Conventions

- `[CONFIRMED]` — Feature is implemented or actively in development
- `[FUTURE]` — Feature is planned for post-challenge releases
- `> DEMO DATA` — All example numbers, scores, and measurements used in this document are sample values for illustration only
- **FR-XX** — Functional Requirement identifier
- **NFR-XX** — Non-Functional Requirement identifier
- **UC-XX** — Use Case identifier

---

## 2. Problem Statement

### 2.1 The Challenge

Mission planners and planetary scientists need **high-quality Earth analog sites** to:
- Test rovers, suits, and instruments in Mars/Moon-like conditions
- Conduct geological field studies that inform planetary science
- Train astronauts in terrain navigation
- Validate remote sensing instruments

However, the **discovery of suitable analog sites** is currently:
- **Fragmented** — data lives in dozens of separate NASA, USGS, and ESA databases with no unified interface
- **Manual and time-consuming** — researchers spend weeks cross-referencing datasets in GIS tools like ArcGIS or QGIS
- **Inaccessible** — heavy desktop software (ArcGIS, ENVI) has steep learning curves and licensing costs
- **Non-comparative** — there is no standard metric for "how Mars-like is this location?"

### 2.2 The Opportunity

By combining **public satellite imagery, terrain data, climate records, and spectral analysis** into a single web platform with an **automated analog scoring system**, TerraTwin can dramatically reduce the time required to identify and compare analog sites — from weeks to minutes.

---

## 3. Project Objectives

The following objectives guide the development of TerraTwin:

| # | Objective | Priority |
|---|-----------|----------|
| OBJ-01 | Build a unified web interface for browsing, searching, and exploring Earth analog sites for Mars and Moon missions | High |
| OBJ-02 | Implement an analog scoring algorithm that quantifies similarity between Earth locations and target planetary environments | High |
| OBJ-03 | Provide an interactive 2D map (MapLibre GL JS) overlaid with analog site markers and environmental data layers | High |
| OBJ-04 | Provide an interactive 3D globe (CesiumJS) for immersive terrain exploration | Medium |
| OBJ-05 | Support data ingestion from at least two public APIs (NASA Earthdata, USGS) for real-world geospatial data | High |
| OBJ-06 | Allow researchers to compare multiple analog sites side-by-side using charts (Plotly) and statistical summaries | High |
| OBJ-07 | Implement user authentication so researchers can save queries, bookmark sites, and generate reports | Medium |
| OBJ-08 | Provide an administrator interface for managing dataset sources, users, and ingestion jobs | Medium |
| OBJ-09 | Make the platform accessible to non-GIS-experts through a clean, intuitive UI built with shadcn/ui and Tailwind CSS | High |
| OBJ-10 | Lay the groundwork for a scalable production deployment path (SQLite → PostgreSQL + PostGIS migration) | Low |

---

## 4. Project Scope

### 4.1 In-Scope Features

The following features are within scope for the TerraTwin platform:

| Category | Feature |
|----------|---------|
| **Maps** | 2D interactive map with site markers and layer toggles |
| **Maps** | 3D globe viewer for terrain visualization |
| **Search** | Text and filter-based site search (by region, biome, score range) |
| **Scoring** | Analog scoring engine that rates Earth sites against Mars/Moon profiles |
| **Data** | Ingestion pipeline from public APIs (NASA Earthdata, USGS) |
| **Comparison** | Side-by-side site comparison with charts |
| **Reporting** | Exportable summary reports per site (PDF / JSON) |
| **Auth** | User login/logout, session management |
| **Admin** | Dataset management and user administration panel |
| **Visualization** | Plotly-based charts for environmental parameters |

### 4.2 Out-of-Scope Features

The following are **explicitly excluded** from the current version:

| Out-of-Scope Item | Reason |
|-------------------|--------|
| Real-time satellite data streaming | Infrastructure complexity beyond challenge timeline |
| Machine learning model training pipelines | [FUTURE] planned for v2 |
| Mobile native app (iOS/Android) | Web-first approach; responsive design is in-scope |
| Integration with private/classified NASA datasets | Only public datasets are used |
| Actual planetary data from Mars/Moon orbiters directly overlaid on globe | [FUTURE] |
| Scientific peer review or NASA endorsement of scores | Out of scope by design |
| Payment processing or subscription management | Not applicable |

---

## 5. User Roles

TerraTwin defines three distinct user roles with different access levels:

### 5.1 Role Definitions

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER ROLES                               │
├─────────────┬──────────────────────────────────────────────────┤
│    GUEST    │ Browse public sites, view map, read site info     │
│             │ No login required                                 │
├─────────────┼──────────────────────────────────────────────────┤
│  RESEARCHER │ All guest capabilities +                          │
│             │ Save searches, bookmark sites                     │
│             │ Run custom comparisons                            │
│             │ Generate and download reports                     │
│             │ Access full scoring breakdowns                    │
├─────────────┼──────────────────────────────────────────────────┤
│    ADMIN    │ All researcher capabilities +                     │
│             │ Manage users (create, deactivate)                 │
│             │ Trigger data ingestion jobs                       │
│             │ Manage analog site entries (add, edit, delete)    │
│             │ View system health and logs                       │
└─────────────┴──────────────────────────────────────────────────┘
```

### 5.2 Role Permissions Matrix

| Feature | Guest | Researcher | Admin |
|---------|:-----:|:----------:|:-----:|
| View map and site list | ✅ | ✅ | ✅ |
| Search and filter sites | ✅ | ✅ | ✅ |
| View site detail page | ✅ | ✅ | ✅ |
| View analog score summary | ✅ | ✅ | ✅ |
| View full scoring breakdown | ❌ | ✅ | ✅ |
| Save/bookmark sites | ❌ | ✅ | ✅ |
| Run custom comparisons | ❌ | ✅ | ✅ |
| Generate/download reports | ❌ | ✅ | ✅ |
| Manage own account | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| Add/edit/delete sites | ❌ | ❌ | ✅ |
| Trigger data ingestion | ❌ | ❌ | ✅ |
| View system logs | ❌ | ❌ | ✅ |

---

## 6. Functional Requirements

### 6.1 Authentication & User Management

---

#### FR-01 — User Registration `[CONFIRMED]`

**Description:** The system shall allow new users to register with an email address and password.

**Acceptance Criteria:**
- Registration form accepts: full name, email, password, role (researcher/guest)
- Email must be unique in the system
- Password must be at least 8 characters with one uppercase letter and one number
- On success, the system sends a confirmation response
- On failure (duplicate email, invalid password), the system returns a descriptive error

---

#### FR-02 — User Login `[CONFIRMED]`

**Description:** The system shall allow registered users to log in and receive a session token (JWT).

**Acceptance Criteria:**
- Login form accepts email and password
- On success, returns a JWT token valid for 24 hours
- On failure, returns a 401 error with message "Invalid credentials"
- Failed login attempts are rate-limited to 5 attempts per 15 minutes

---

#### FR-03 — User Logout `[CONFIRMED]`

**Description:** The system shall allow authenticated users to log out, invalidating their session.

**Acceptance Criteria:**
- Logout endpoint accepts the JWT token and marks it invalid
- After logout, all protected endpoints return 401 for the old token

---

#### FR-04 — Password Reset `[FUTURE]`

**Description:** The system shall allow users to reset their password via email link.

**Acceptance Criteria:**
- User enters email; system sends a one-time reset link
- Link expires after 1 hour
- New password must meet the same strength requirements as FR-01

---

### 6.2 Map Display

---

#### FR-05 — 2D Interactive Map Display `[CONFIRMED]`

**Description:** The system shall display an interactive 2D map of Earth using MapLibre GL JS, populated with analog site markers.

**Acceptance Criteria:**
- Map renders within 3 seconds on initial load
- Displays all analog sites as clickable markers
- Map supports pan, zoom (scroll/pinch), and reset-to-fit controls
- Clicking a marker opens a site info popup with name, score, and a "View Details" link
- Base map tile layer is loaded from a free public tile provider

---

#### FR-06 — Map Layer Toggles `[CONFIRMED]`

**Description:** The system shall allow users to toggle environmental data overlay layers on the 2D map.

**Acceptance Criteria:**
- Available layers include: Elevation, Aridity Index, Land Cover, Surface Temperature
- Each layer has a toggle checkbox in a "Layers" panel
- Active layers render as semi-transparent color overlays on the map
- Layer legend is displayed when a layer is active
- Maximum of 2 layers can be active simultaneously to maintain performance

---

#### FR-07 — 3D Globe Viewer `[CONFIRMED]`

**Description:** The system shall provide a 3D globe visualization using CesiumJS for immersive terrain exploration.

**Acceptance Criteria:**
- 3D globe loads on the "Globe View" page/tab
- Users can rotate, tilt, and zoom the globe with mouse/touch
- Analog site locations are shown as 3D pins on the globe
- Clicking a pin shows the same site popup as the 2D map (FR-05)
- Terrain elevation data is rendered (using Cesium World Terrain or equivalent free source)

---

#### FR-08 — Map Search by Coordinates `[CONFIRMED]`

**Description:** The system shall allow users to search the map by entering latitude/longitude coordinates.

**Acceptance Criteria:**
- Input accepts decimal degrees format (e.g., `-23.4567, -67.8901`)
- On submit, the map pans and zooms to the entered location
- A temporary marker is placed at the searched coordinates
- Invalid coordinates show an inline validation error

---

### 6.3 Site Search & Filtering

---

#### FR-09 — Text-Based Site Search `[CONFIRMED]`

**Description:** The system shall provide a text search box to find analog sites by name, region, or keyword.

**Acceptance Criteria:**
- Search is case-insensitive and partial-match (e.g., "atac" matches "Atacama Desert")
- Results update as the user types (debounced at 300ms)
- Results are displayed in a list panel alongside the map
- Each result shows: site name, country, analog target (Mars/Moon), overall score
- Empty results show the message: "No sites found matching your search."

---

#### FR-10 — Filter by Analog Target `[CONFIRMED]`

**Description:** The system shall allow users to filter sites by their analog target environment (Mars, Moon, or Both).

**Acceptance Criteria:**
- Filter options: "Mars Analog", "Lunar Analog", "Both"
- Selecting a filter updates the site list and map markers in real time
- Multiple target filters can be selected simultaneously

---

#### FR-11 — Filter by Score Range `[CONFIRMED]`

**Description:** The system shall allow users to filter sites by their analog similarity score using a range slider.

**Acceptance Criteria:**
- Slider range is 0–100 (representing the analog score percentage)
- Dragging either end of the slider updates the site list and map markers in real time
- Current selected range is displayed numerically (e.g., "Score: 60 – 90")

---

#### FR-12 — Filter by Geographic Region `[CONFIRMED]`

**Description:** The system shall allow users to filter sites by continent or country.

**Acceptance Criteria:**
- Dropdown lists continents; selecting a continent shows country options
- Results filter to sites within the selected region
- "All Regions" option resets the filter

---

#### FR-13 — Save Search Query `[CONFIRMED]`

**Description:** The system shall allow authenticated Researchers to save their current search and filter configuration for later use.

**Acceptance Criteria:**
- A "Save Search" button appears for logged-in Researchers
- User provides a name for the saved search
- Saved searches appear in a "My Searches" section in the user dashboard
- Clicking a saved search restores all filters and re-runs the query

---

### 6.4 Analog Site Detail

---

#### FR-14 — Site Detail Page `[CONFIRMED]`

**Description:** The system shall display a dedicated detail page for each analog site with comprehensive information.

**Acceptance Criteria:**
- Page includes: site name, coordinates, country, biome type, description, images (if available)
- Displays the site's overall analog score with a visual score gauge
- Shows individual scoring dimensions (see FR-19) in a breakdown table
- Displays Plotly charts for key environmental parameters
- Shows metadata: data sources, last updated date, data confidence level

---

#### FR-15 — Site Bookmarking `[CONFIRMED]`

**Description:** The system shall allow authenticated Researchers to bookmark sites for quick access.

**Acceptance Criteria:**
- A "Bookmark" (star/heart) icon appears on site cards and detail pages
- Clicking it toggles the bookmark state with visual feedback
- Bookmarked sites appear in the user's "My Bookmarks" dashboard section
- Bookmark state persists across sessions

---

### 6.5 Analog Scoring Engine

---

#### FR-16 — Mars Analog Score Calculation `[CONFIRMED]`

**Description:** The system shall calculate a Mars Analog Score (0–100) for each Earth site based on a multi-factor comparison algorithm.

**Acceptance Criteria:**
- Score is calculated from weighted sub-scores across the following dimensions:
  - Aridity / Precipitation (25%)
  - Surface Temperature Range (20%)
  - Soil/Regolith Type (20%)
  - UV Radiation Index (15%)
  - Terrain Roughness (10%)
  - Atmospheric Pressure at Elevation (10%)
- Higher score = greater similarity to Mars target profile
- Score is recalculated when new data is ingested for a site
- Algorithm parameters are configurable by Administrators

> **DEMO DATA:** The Atacama Desert (sample site) might receive a Mars Analog Score of **78/100** in the prototype system. This number is generated by the prototype algorithm and is **not** a scientifically validated measurement.

---

#### FR-17 — Lunar Analog Score Calculation `[CONFIRMED]`

**Description:** The system shall calculate a Lunar Analog Score (0–100) for each Earth site based on a separate multi-factor algorithm.

**Acceptance Criteria:**
- Score dimensions for Lunar profile:
  - Terrain Roughness / Crater Morphology (30%)
  - Surface Albedo (25%)
  - Lack of Vegetation Cover (20%)
  - Regolith/Dust Composition Proxy (15%)
  - Temperature Extremes (10%)
- All other criteria same as FR-16

---

#### FR-18 — Composite Analog Score `[CONFIRMED]`

**Description:** The system shall calculate and display a single Composite Analog Score combining both Mars and Lunar sub-scores.

**Acceptance Criteria:**
- Composite Score = (Mars Score × 0.5) + (Lunar Score × 0.5) for "Both" sites
- For Mars-only or Lunar-only sites, Composite = that target's score
- Composite score is used for default sorting in search results

---

#### FR-19 — Score Breakdown Visualization `[CONFIRMED]`

**Description:** The system shall display an interactive breakdown of the analog score dimensions in a radar/spider chart.

**Acceptance Criteria:**
- Plotly radar chart shows each scoring dimension as an axis
- Mars profile reference values are shown as a second trace (shaded area)
- User can hover on each axis point to see the exact sub-score and data source
- Chart is embedded on the Site Detail page (FR-14)

---

### 6.6 Site Comparison

---

#### FR-20 — Multi-Site Comparison `[CONFIRMED]`

**Description:** The system shall allow authenticated Researchers to select up to 4 sites for side-by-side comparison.

**Acceptance Criteria:**
- A "Compare" checkbox appears on site cards (max 4 checkboxes can be active)
- A "Compare Selected" button opens the comparison view
- Comparison view shows each site as a column with key parameters in rows
- A Plotly grouped bar chart shows all selected sites' scoring dimensions side-by-side
- Scores and parameters are shown in a sortable table below the chart

---

#### FR-21 — Comparison Export `[CONFIRMED]`

**Description:** The system shall allow users to export a comparison as a JSON file or PDF report.

**Acceptance Criteria:**
- "Export JSON" downloads raw comparison data as a structured JSON file
- "Export PDF" `[FUTURE]` generates a formatted PDF with charts and data table
- Exported files include a timestamp and disclaimer that data is from the prototype system

---

### 6.7 Data Ingestion

---

#### FR-22 — Manual Data Ingestion Trigger `[CONFIRMED]`

**Description:** The system shall allow Administrators to manually trigger a data ingestion job for a specific dataset source.

**Acceptance Criteria:**
- Admin panel lists available data sources (e.g., "USGS Elevation", "NASA MODIS Temperature")
- "Run Ingestion" button triggers the backend ingestion pipeline for the selected source
- Job status (Queued → Running → Completed / Failed) is shown in the Admin panel
- Completed jobs display: records processed, records updated, errors encountered

---

#### FR-23 — Automated Ingestion Scheduling `[FUTURE]`

**Description:** The system shall support scheduled automated data ingestion on a configurable cron-like schedule.

**Acceptance Criteria:**
- Admin can configure ingestion frequency (daily, weekly, monthly) per data source
- Scheduled jobs run in the background without user action
- Job history is logged and viewable in the Admin panel

---

#### FR-24 — External API Integration — NASA Earthdata `[CONFIRMED]`

**Description:** The system shall integrate with NASA Earthdata APIs to retrieve satellite-derived environmental parameters.

**Acceptance Criteria:**
- Backend can fetch MODIS Land Surface Temperature data via NASA Earthdata API
- Retrieved data is stored in the local database and linked to relevant site records
- API errors (timeout, 429 rate limit, 500 server error) are logged and retried up to 3 times
- Data attribution is stored and displayed to users on site detail pages

---

#### FR-25 — External API Integration — USGS `[CONFIRMED]`

**Description:** The system shall integrate with USGS APIs to retrieve terrain elevation data.

**Acceptance Criteria:**
- Backend fetches elevation data (DEM) for site coordinates from the USGS National Map API
- Terrain roughness is calculated from the DEM data using a standard algorithm
- Retrieved data is stored and linked to site records

---

### 6.8 Reporting

---

#### FR-26 — Site Summary Report `[CONFIRMED]`

**Description:** The system shall allow authenticated Researchers to generate a summary report for a single site.

**Acceptance Criteria:**
- Report includes: site name, coordinates, description, score breakdown, data sources, generation timestamp
- Report is downloadable as a JSON file
- Report header clearly states: "Generated by TerraTwin Prototype — Not scientifically validated"

---

#### FR-27 — Search Results Export `[CONFIRMED]`

**Description:** The system shall allow users to export their current search results as a CSV file.

**Acceptance Criteria:**
- "Export CSV" button appears in the search results panel
- Exported file includes: site name, country, coordinates, Mars score, Lunar score, Composite score
- CSV includes a header row with column names
- File is named: `terratwin_results_<timestamp>.csv`

---

### 6.9 Administration

---

#### FR-28 — User Management `[CONFIRMED]`

**Description:** The system shall provide Administrators with a user management interface.

**Acceptance Criteria:**
- Admin can view a list of all registered users with: name, email, role, registration date, last login
- Admin can change a user's role (Guest ↔ Researcher)
- Admin can deactivate a user account (user cannot log in; data is preserved)
- Admin can reactivate a deactivated account
- Admin cannot delete their own account

---

#### FR-29 — Analog Site Management `[CONFIRMED]`

**Description:** The system shall allow Administrators to add, edit, and delete analog site records.

**Acceptance Criteria:**
- "Add Site" form accepts: name, coordinates, description, biome type, analog target, data source links
- "Edit Site" pre-fills the form with existing data
- "Delete Site" requires confirmation ("Type the site name to confirm deletion")
- All changes are logged with timestamp and admin user ID

---

#### FR-30 — System Health Dashboard `[CONFIRMED]`

**Description:** The system shall provide Administrators with a system health dashboard.

**Acceptance Criteria:**
- Displays: total sites, total users, last ingestion job status and timestamp
- Shows recent error logs (last 20 entries) with severity level and message
- Displays API quota usage for external APIs (NASA Earthdata, USGS) if available
- Dashboard auto-refreshes every 60 seconds

---

## 7. Non-Functional Requirements

### 7.1 Performance

---

#### NFR-01 — Map Load Time `[CONFIRMED]`

**Description:** The 2D map (FR-05) shall be fully interactive within **3 seconds** on a standard broadband connection (25 Mbps+).

**Measurement:** Measured via browser DevTools Network tab. Time from navigation to `maplibre` `load` event firing.

---

#### NFR-02 — API Response Time `[CONFIRMED]`

**Description:** All backend API endpoints shall return responses within **500ms** for database queries and **2 seconds** for endpoints that call external APIs.

**Measurement:** Measured via FastAPI middleware timing logs.

---

#### NFR-03 — Search Performance `[CONFIRMED]`

**Description:** Site search results (FR-09) shall return within **300ms** for queries against a database of up to 10,000 analog sites.

**Measurement:** Measured with SQLAlchemy query timing in test suite.

---

### 7.2 Security

---

#### NFR-04 — Authentication Security `[CONFIRMED]`

**Description:** All authenticated endpoints shall require a valid JWT token. Tokens shall use HS256 signing and expire after 24 hours.

---

#### NFR-05 — SQL Injection Prevention `[CONFIRMED]`

**Description:** All database queries shall use SQLAlchemy ORM parameterized queries. Raw SQL strings shall be prohibited in production code.

---

#### NFR-06 — Input Validation `[CONFIRMED]`

**Description:** All API request bodies shall be validated using Pydantic models. Invalid inputs shall be rejected with a 422 status code and descriptive error messages before reaching business logic.

---

#### NFR-07 — CORS Policy `[CONFIRMED]`

**Description:** The FastAPI backend shall enforce a strict CORS policy, allowing requests only from the configured frontend origin(s).

---

#### NFR-08 — Secrets Management `[CONFIRMED]`

**Description:** API keys, database URLs, and JWT secrets shall be stored in environment variables (`.env` file) and never committed to version control. The `.env` file shall be listed in `.gitignore`.

---

### 7.3 Accessibility

---

#### NFR-09 — WCAG 2.1 AA Compliance `[FUTURE]`

**Description:** The frontend UI shall target WCAG 2.1 Level AA compliance for accessibility.

**Key Criteria:**
- All images have descriptive `alt` text
- Color contrast ratio meets 4.5:1 for normal text
- All interactive elements are keyboard-navigable
- Form fields have associated `<label>` elements

---

#### NFR-10 — Responsive Design `[CONFIRMED]`

**Description:** The frontend shall be responsive and usable on screens from 768px width (tablet) and above. Mobile (< 768px) is a best-effort target.

---

### 7.4 Scalability

---

#### NFR-11 — Database Migration Path `[CONFIRMED]`

**Description:** The system shall be designed to migrate from SQLite (development) to PostgreSQL + PostGIS (production) without application code changes, using SQLAlchemy's database-agnostic ORM layer.

---

#### NFR-12 — Stateless Backend `[CONFIRMED]`

**Description:** The FastAPI backend shall be stateless (session state stored in JWT tokens or database), enabling horizontal scaling behind a load balancer in a future production deployment.

---

#### NFR-13 — Concurrent Users `[CONFIRMED]`

**Description:** The system shall support at least **50 concurrent users** in the prototype deployment without degradation in response time beyond the thresholds defined in NFR-01 and NFR-02.

---

### 7.5 Usability

---

#### NFR-14 — Onboarding for Non-GIS Users `[CONFIRMED]`

**Description:** A first-time user with no GIS background shall be able to find and compare two analog sites within **5 minutes** without reading documentation, using the UI alone.

**Measurement:** Measured via informal user testing with 3 non-expert users during development.

---

#### NFR-15 — Error Messages `[CONFIRMED]`

**Description:** All user-facing error messages shall be written in plain English (no stack traces or database error codes) and suggest a corrective action where possible.

**Example:**
```
❌ "psycopg2.OperationalError: could not connect to server"  ← NOT acceptable
✅ "We couldn't connect to the database. Please try again in a moment."  ← acceptable
```

---

## 8. Use Cases

### UC-01 — Browse Analog Sites as a Guest

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-01 |
| **Title** | Browse Analog Sites |
| **Actor** | Guest (unauthenticated user) |
| **Goal** | View the map and explore publicly listed analog sites |
| **Preconditions** | User has navigated to the TerraTwin web application URL |

**Main Flow:**
1. Guest lands on the TerraTwin homepage
2. The system displays the 2D interactive map with analog site markers
3. Guest pans and zooms the map to an area of interest (e.g., South America)
4. Guest clicks a site marker (e.g., "Atacama Desert")
5. The system displays a popup with: site name, country, Mars Analog Score (summary), and a "View Details" link
6. Guest clicks "View Details"
7. The system navigates to the Site Detail page with full information and charts
8. Guest reads the site description, views the score breakdown radar chart

**Postconditions:** Guest has successfully explored a site. No data is saved (Guest has no account).

**Alternative Flows:**
- **3a.** No sites are visible in the current map view: Guest zooms out or uses the search box
- **5a.** Guest closes the popup by pressing Escape or clicking outside it

---

### UC-02 — Search for Mars Analog Sites

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-02 |
| **Title** | Search for Mars Analog Sites |
| **Actor** | Guest or Researcher |
| **Goal** | Find Earth sites with high Mars analog scores |
| **Preconditions** | User is on the main map/search page |

**Main Flow:**
1. User clicks the "Search & Filter" panel (or it is open by default)
2. User types "volcanic" in the text search box
3. The system returns a filtered list of sites with "volcanic" in name or description
4. User selects the "Mars Analog" filter chip
5. User drags the score slider to minimum 70
6. The system updates the map markers and result list in real time
7. User reviews the top result and clicks "View Details"

**Postconditions:** User has found candidate sites matching their criteria.

---

### UC-03 — Register as a Researcher

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-03 |
| **Title** | Register as a Researcher |
| **Actor** | Prospective Researcher (unauthenticated) |
| **Goal** | Create a Researcher account to access advanced features |
| **Preconditions** | User does not have an existing account |

**Main Flow:**
1. User clicks "Sign Up" in the navigation bar
2. The system displays the registration form
3. User fills in: full name, email address, password, selects "Researcher" role
4. User clicks "Create Account"
5. The system validates input (FR-01): checks email uniqueness, password strength
6. The system creates the account and returns a success message
7. User is redirected to the login page

**Postconditions:** A new Researcher account exists in the database. User can now log in.

**Error Flows:**
- **5a.** Email already registered: System displays "An account with this email already exists."
- **5b.** Password too weak: System highlights the password field with requirements

---

### UC-04 — Log In and Save a Search

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-04 |
| **Title** | Log In and Save a Search |
| **Actor** | Researcher |
| **Goal** | Log in and save a custom search configuration |
| **Preconditions** | Researcher has a valid account (UC-03 completed) |

**Main Flow:**
1. Researcher clicks "Log In" in the navigation bar
2. Researcher enters email and password, clicks "Log In"
3. The system validates credentials and issues a JWT token
4. Researcher is redirected to the main map page, now showing their logged-in state
5. Researcher configures a search (text query, filters, score range)
6. Researcher clicks "Save Search"
7. A dialog asks for a name: Researcher types "High-Aridity Mars Sites"
8. The system saves the search configuration linked to the Researcher's account
9. Researcher navigates to "My Searches" in their dashboard and sees the saved search

**Postconditions:** Search configuration is persisted and can be re-run on future sessions.

---

### UC-05 — Compare Multiple Analog Sites

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-05 |
| **Title** | Compare Multiple Analog Sites |
| **Actor** | Researcher |
| **Goal** | Side-by-side comparison of up to 4 candidate sites |
| **Preconditions** | Researcher is logged in; at least 2 sites exist in the system |

**Main Flow:**
1. Researcher performs a search and receives a results list
2. Researcher checks the "Compare" checkbox on 3 sites (e.g., Atacama, Iceland Lava Fields, Namib Desert)
3. A "Compare (3)" button appears at the bottom of the results panel
4. Researcher clicks "Compare (3)"
5. The system navigates to the Comparison view
6. The system renders a table with each site as a column, and scoring dimensions as rows
7. A grouped Plotly bar chart renders below the table, showing all scoring dimensions per site
8. Researcher identifies that Site A scores higher on "Aridity" and Site B on "Terrain Roughness"
9. Researcher clicks "Export JSON" to download the comparison data

**Postconditions:** Researcher has compared 3 sites and exported the data for further analysis.

---

### UC-06 — Generate a Site Report

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-06 |
| **Title** | Generate a Site Summary Report |
| **Actor** | Researcher |
| **Goal** | Download a structured summary of a site's data |
| **Preconditions** | Researcher is logged in; site exists with data |

**Main Flow:**
1. Researcher navigates to a Site Detail page
2. Researcher clicks "Generate Report"
3. The system compiles the site's name, coordinates, description, score breakdown, and data source metadata
4. The system generates a JSON file and triggers a browser download
5. The downloaded file is named `terratwin_site_<sitename>_<timestamp>.json`

**Postconditions:** Researcher has a local copy of the site report.

---

### UC-07 — Administrator Triggers Data Ingestion

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-07 |
| **Title** | Trigger Data Ingestion |
| **Actor** | Administrator |
| **Goal** | Refresh site data from an external API source |
| **Preconditions** | Administrator is logged in; external API credentials are configured |

**Main Flow:**
1. Administrator navigates to the Admin Panel → "Data Sources" section
2. Admin sees a list of configured data sources with last-run timestamps
3. Admin selects "USGS Elevation Data" and clicks "Run Ingestion Now"
4. The system enqueues the ingestion job and displays status: "Queued"
5. The backend processes the job: fetches elevation data, calculates terrain roughness, updates site records
6. Status updates to "Running" and finally "Completed: 150 sites updated, 0 errors"

**Postconditions:** Site elevation data is refreshed. Scores may be recalculated.

**Error Flows:**
- **5a.** External API returns an error: Status shows "Failed: USGS API returned 503". Admin can retry.

---

### UC-08 — Administrator Manages Users

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-08 |
| **Title** | Manage User Accounts |
| **Actor** | Administrator |
| **Goal** | Change a user's role or deactivate their account |
| **Preconditions** | Administrator is logged in |

**Main Flow:**
1. Admin navigates to Admin Panel → "Users"
2. Admin sees a paginated table of all registered users
3. Admin searches for a specific user by email
4. Admin clicks "Edit" next to the target user
5. Admin changes the user's role from "Guest" to "Researcher" using a dropdown
6. Admin clicks "Save Changes"
7. The system updates the user's role and displays a success toast notification

**Postconditions:** The user's role is updated. Next time they log in, they have Researcher permissions.

---

### UC-09 — Administrator Adds a New Analog Site

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-09 |
| **Title** | Add a New Analog Site |
| **Actor** | Administrator |
| **Goal** | Manually add a new Earth analog site to the platform |
| **Preconditions** | Administrator is logged in |

**Main Flow:**
1. Admin navigates to Admin Panel → "Sites" → "Add New Site"
2. Admin fills in the form:
   - Name: "Rub' al Khali Desert"
   - Coordinates: 20.5000° N, 51.5000° E
   - Country: Saudi Arabia
   - Biome: Hot Desert
   - Analog Target: Mars
   - Description: (text)
3. Admin clicks "Save Site"
4. The system validates required fields and saves the record
5. The new site appears on the map and in search results

**Postconditions:** New site is live on the platform. Its analog score will be calculated on the next ingestion run.

---

### UC-10 — View System Health Dashboard

| Field | Detail |
|-------|--------|
| **Use Case ID** | UC-10 |
| **Title** | View System Health Dashboard |
| **Actor** | Administrator |
| **Goal** | Monitor system status and recent activity |
| **Preconditions** | Administrator is logged in |

**Main Flow:**
1. Admin navigates to Admin Panel → "Dashboard"
2. The system displays:
   - Total sites: *N* | Total users: *M* | Last ingestion: *timestamp* | Status: Completed
3. Admin reviews the recent error log panel
4. Admin notices a warning: "NASA Earthdata API: 429 Too Many Requests at [timestamp]"
5. Admin notes the issue and decides to adjust the ingestion schedule

**Postconditions:** Admin is informed of system status and can take corrective action.

---

## 9. System Constraints

| Constraint ID | Category | Description |
|--------------|----------|-------------|
| CON-01 | Technology | Frontend must be built with React + TypeScript + Vite + Tailwind CSS + shadcn/ui |
| CON-02 | Technology | Backend must be built with Python + FastAPI + SQLAlchemy |
| CON-03 | Technology | 2D mapping must use MapLibre GL JS |
| CON-04 | Technology | 3D globe must use CesiumJS |
| CON-05 | Technology | Charts must use Plotly |
| CON-06 | Data | Only publicly accessible (free tier / open) APIs may be used |
| CON-07 | Deployment | Prototype must run on a standard developer laptop without cloud infrastructure |
| CON-08 | Science | The system must clearly label all scores and comparisons as prototype/demo values |
| CON-09 | Legal | NASA Earthdata API must be used in accordance with its Terms of Service |
| CON-10 | Timeline | v1.0 prototype must be deliverable within the NASA Space Apps Challenge timeline |

---

## 10. Assumptions and Dependencies

### 10.1 Assumptions

| ID | Assumption |
|----|-----------|
| ASS-01 | Public NASA Earthdata and USGS APIs will remain available and accessible during development |
| ASS-02 | Free-tier map tile providers (e.g., OpenStreetMap/MapTiler) will be used for the base map |
| ASS-03 | CesiumJS Ion free tier will be used for terrain data; API key will be obtained by the team |
| ASS-04 | SQLite is sufficient for prototype; migration to PostgreSQL is a future concern |
| ASS-05 | The scoring algorithm is a prototype heuristic and does not require domain expert validation for the challenge |
| ASS-06 | All team members have basic Python and React development experience |
| ASS-07 | The platform will be demo'd in a controlled environment (not public internet) for the challenge |

### 10.2 Dependencies

| ID | Dependency | Type | Criticality |
|----|-----------|------|-------------|
| DEP-01 | NASA Earthdata API | External API | High |
| DEP-02 | USGS National Map API | External API | High |
| DEP-03 | CesiumJS Ion (free tier) | External Service | Medium |
| DEP-04 | MapLibre GL JS | Open-Source Library | High |
| DEP-05 | FastAPI | Python Package | High |
| DEP-06 | SQLAlchemy | Python Package | High |
| DEP-07 | Alembic | Python Package | Medium |
| DEP-08 | Plotly.js | JavaScript Package | High |
| DEP-09 | shadcn/ui | React Component Library | Medium |
| DEP-10 | GeoPandas / Rasterio | Python Package | High |

---

## 11. Glossary

| Term | Definition |
|------|-----------|
| **Analog Site** | An Earth location with environmental characteristics similar to those found on Mars or the Moon |
| **Analog Score** | A prototype numerical value (0–100) representing how similar an Earth site is to a target planetary environment |
| **DEM** | Digital Elevation Model — a raster grid of terrain elevation values |
| **JWT** | JSON Web Token — a compact, self-contained token for user authentication |
| **ORM** | Object-Relational Mapper — a programming technique for converting between object-oriented code and relational database records (e.g., SQLAlchemy) |
| **PostGIS** | An extension for PostgreSQL that adds geographic data types and spatial query functions |
| **Regolith** | Loose surface material (rock, dust, broken rock) covering solid bedrock — used on Earth, Moon, and Mars |
| **SRS** | Software Requirements Specification — this document |
| **WCAG** | Web Content Accessibility Guidelines — international standards for web accessibility |
| **Aridity Index** | A measure of water availability in an environment; low aridity = very dry (Mars-like) |
| **MODIS** | Moderate Resolution Imaging Spectroradiometer — a NASA satellite instrument providing land/ocean/atmosphere data |

---

> **Disclaimer:** TerraTwin is a NASA Space Apps Challenge prototype. All analog scores, comparisons, and rankings are generated by a prototype algorithm using publicly available data. They do not represent scientifically validated measurements and should not be used for actual mission planning without independent expert review.

---

*Document prepared by the TerraTwin Team | NASA Space Apps Challenge 2026*
