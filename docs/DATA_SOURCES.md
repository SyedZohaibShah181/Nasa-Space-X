# TerraTwin Data Sources Catalog

> **Project:** TerraTwin — Earth-Moon-Mars Analog Discovery & Research Platform  
> **Challenge:** NASA Space Apps Challenge  
> **Document Version:** 1.0  
> **Last Updated:** 2025

---

## Table of Contents

1. [Data Strategy Overview](#1-data-strategy-overview)
2. [Data Source Catalog](#2-data-source-catalog)
   - [2.1 NASA Earthdata / CMR](#21-nasa-earthdata--cmr)
   - [2.2 MODIS (Terra/Aqua)](#22-modis-terraaqua)
   - [2.3 SRTM](#23-srtm-shuttle-radar-topography-mission)
   - [2.4 EMIT](#24-emit-earth-surface-mineral-dust-source-investigation)
   - [2.5 NASA PDS / MOLA](#25-nasa-pds--mola-mars-orbiter-laser-altimeter)
   - [2.6 NASA PDS / LOLA](#26-nasa-pds--lola-lunar-orbiter-laser-altimeter)
   - [2.7 LROC](#27-lroc-lunar-reconnaissance-orbiter-camera)
   - [2.8 HiRISE / CTX](#28-hirise--ctx-mars-reconnaissance-orbiter)
   - [2.9 USGS Geological Maps](#29-usgs-geological-maps)
   - [2.10 ESA Sentinel](#210-esa-sentinel-sentinel-1-sar--sentinel-2-multispectral)
3. [Cross-Planet Data Comparison Matrix](#3-cross-planet-data-comparison-matrix)
4. [Data Quality and Uncertainty Notes](#4-data-quality-and-uncertainty-notes)
5. [Data Licensing Summary](#5-data-licensing-summary)

---

## 1. Data Strategy Overview

### Multi-Source, Multi-Planet Philosophy

TerraTwin is built on the principle that meaningful analog research requires **consistent, standardized, and comparable data** across three planetary bodies: Earth, the Moon, and Mars. No single data source covers all three worlds, and no two sources use identical reference systems, resolutions, or file formats. The TerraTwin data strategy addresses this through a layered ingestion and harmonization pipeline.

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Multi-Source** | Ten primary data sources spanning Earth, Moon, and Mars, covering topography, mineralogy, imagery, and geological mapping |
| **Multi-Planet** | Each data category (e.g., elevation, geology, imagery) has at least one representative dataset per planetary body |
| **Standardized Ingestion** | All incoming datasets are normalized to a common internal schema: unified CRS projection per body, consistent resolution tiers, and standard metadata fields |
| **Uncertainty-Aware** | Every dataset carries quality flags, resolution metadata, and uncertainty bounds for use in the Analog Comparison Score (ACS) engine |

### Standardized Ingestion Pipeline

```
Raw Data Sources
      │
      ▼
[Acquisition Layer]
  - API fetch (CMR, PDS API)
  - Direct file download (HDF5, GeoTIFF, IMG)
      │
      ▼
[Validation & Parsing Layer]
  - Format conversion (IMG → GeoTIFF, HDF5 → NetCDF)
  - CRS detection and re-projection
  - Null/NaN masking and fill-value replacement
      │
      ▼
[Harmonization Layer]
  - Resolution resampling to target tier (30m / 100m / 500m / 1km)
  - Unit normalization (K → °C, raw DN → reflectance, etc.)
  - Attribute mapping to TerraTwin internal schema
      │
      ▼
[Storage Layer]
  - SQLite (development) → PostgreSQL + PostGIS (production)
  - COG (Cloud Optimized GeoTIFF) tiles for raster serving
  - Metadata records in TerraTwin catalog DB
      │
      ▼
[API / Frontend Delivery]
  - FastAPI endpoints → MapLibre GL / CesiumJS rendering
```

---

## 2. Data Source Catalog

---

### 2.1 NASA Earthdata / CMR

#### What It Is

The **Common Metadata Repository (CMR)** is NASA's unified search and discovery system for Earth science data. It acts as a metadata catalog indexing datasets from 12+ NASA Distributed Active Archive Centers (DAACs). CMR does not host the data itself but provides standardized metadata records and download links pointing to actual repositories (e.g., ORNL DAAC, NSIDC, LP DAAC).

TerraTwin uses CMR as the **primary discovery layer** for all Earth observation datasets, allowing programmatic search by spatial bounding box, temporal range, keyword, and product short name.

#### What Data It Provides

- Metadata records for 40,000+ Earth science datasets
- Granule-level search with temporal and spatial filters
- Download links (HTTPS, S3) to actual data files
- Product documentation, version history, and DOI links
- Browse imagery thumbnails for visual previewing

#### Access URL

- **CMR Search API:** `https://cmr.earthdata.nasa.gov/search`
- **Earthdata Portal:** `https://earthdata.nasa.gov`
- **Example Query:** `https://cmr.earthdata.nasa.gov/search/granules.json?short_name=MOD11A1&bounding_box=-120,30,-100,50`

#### Authentication Requirements

- **Free Earthdata Login account** required: `https://urs.earthdata.nasa.gov/`
- Bearer token or `.netrc` credential file for HTTPS downloads
- No authentication required for metadata search queries
- S3 direct access requires NASA Earthdata Cloud credentials (Temporary credentials via STS)

#### File Formats

- API responses: JSON, XML (ECHO10, ISO-SMAP, DIF10)
- Data files: format varies per dataset (HDF4, HDF5, NetCDF-4, GeoTIFF — determined by specific product)

#### Spatial Resolution

- Varies by product — CMR itself is metadata-only
- Coverage: Global Earth surface

#### Units

- Metadata fields (strings, ISO dates, bounding boxes in decimal degrees)

#### Coordinate Reference System

- Bounding boxes in **WGS84 (EPSG:4326)**
- Actual data CRS determined by specific product

#### Known Limitations

- CMR is a **metadata gateway**, not a data store — actual file access requires separate authentication per DAAC
- Search results may include deprecated or superseded dataset versions; always filter by `version` parameter
- Large bounding box queries may return paginated results requiring scroll token handling
- Some older datasets (pre-2010) have incomplete CMR metadata records

#### Integration Status

> 🟡 **In Progress** — CMR API client implemented in `backend/services/earthdata.py`; granule search and download link extraction functional; bulk ingestion scheduler pending.

---

### 2.2 MODIS (Terra/Aqua)

#### What It Is

**MODIS (Moderate Resolution Imaging Spectroradiometer)** is a key scientific instrument aboard NASA's Terra (launched 1999) and Aqua (launched 2002) satellites. MODIS provides consistent, long-term global Earth observation data critical for land surface monitoring, climate research, and change detection.

TerraTwin uses MODIS products primarily for **land surface temperature (LST)**, **vegetation index (NDVI/EVI)**, and **land cover classification** — all of which serve as Earth analog baseline parameters for comparison against Mars and Moon surface characteristics.

#### What Data It Provides

| Product | Description | Temporal Resolution |
|---------|-------------|---------------------|
| **MOD11A1 / MYD11A1** | Land Surface Temperature (LST) & Emissivity, Day/Night | Daily |
| **MOD13A1 / MYD13A1** | Vegetation Indices (NDVI, EVI) | 16-day composite |
| **MCD12Q1** | Land Cover Type Classification (IGBP, FAO, etc.) | Annual |
| **MOD09GA** | Surface Reflectance (7 bands: 459–2155 nm) | Daily |
| **MOD44W** | Land/Water Mask | Annual |

#### Access URL

- **LP DAAC (primary):** `https://lpdaac.usgs.gov/products/`
- **Earthdata Search:** `https://search.earthdata.nasa.gov`
- **AppEEARS (easy access portal):** `https://appeears.earthdatacloud.nasa.gov/`
- **CMR short names:** `MOD11A1`, `MYD11A1`, `MOD13A1`, `MCD12Q1`

#### Authentication Requirements

- NASA Earthdata Login (free) required for all downloads
- AppEEARS API supports OAuth2 token authentication
- HTTPS `.netrc` configuration for bulk downloads via `wget`/`curl`

#### File Formats

- **HDF4** (`.hdf`) — legacy format for older MODIS collections
- **HDF5** (`.h5`) — newer collections (Collection 6.1+)
- Subset exports via AppEEARS available as GeoTIFF or NetCDF

#### Spatial Resolution

| Product | Resolution |
|---------|------------|
| LST (MOD11A1) | **1 km** (~1000 m/pixel) |
| Vegetation Index (MOD13A1) | **500 m** |
| Land Cover (MCD12Q1) | **500 m** |
| Surface Reflectance (MOD09GA) | **500 m** (bands 1–2: 250 m) |

#### Units

| Variable | Units |
|----------|-------|
| Land Surface Temperature | Kelvin (K) × 0.02 scale factor → stored as K, converted to °C for display |
| NDVI | Dimensionless index (−1.0 to +1.0), stored as scaled integer ×10000 |
| EVI | Dimensionless index, same scaling as NDVI |
| Surface Reflectance | Fraction (0–1), stored as scaled integer ×10000 |

#### Coordinate Reference System

- **Sinusoidal projection** (MODIS native tile grid: `SR-ORG:6842`)
- Tiles indexed by horizontal/vertical grid (e.g., h08v05)
- Reprojected to **WGS84 Geographic (EPSG:4326)** or **Web Mercator (EPSG:3857)** for TerraTwin display

#### Known Limitations

- **1 km LST resolution** is coarser than SRTM elevation (30 m) — spatial mismatch must be accounted for in multi-layer analysis
- Cloud cover creates data gaps in optical products; gap-filled composites (8-day, 16-day) reduce but do not eliminate missing data
- Terra satellite orbit drift has introduced calibration inconsistencies in long-term time series post-2017
- MODIS instruments reached end-of-life; long-term continuity provided by VIIRS on Suomi NPP/JPSS
- Sinusoidal tile projection requires reprojection before use in standard GIS environments

#### Integration Status

> 🟡 **In Progress** — HDF4 reader implemented via `rasterio` + GDAL HDF4 driver; LST extraction and K→°C conversion functional; tile mosaicking for analog region extraction in development.

---

### 2.3 SRTM (Shuttle Radar Topography Mission)

#### What It Is

The **Shuttle Radar Topography Mission (SRTM)** flew aboard Space Shuttle Endeavour in February 2000, using interferometric synthetic aperture radar (InSAR) to produce the first near-global digital elevation model (DEM) of Earth's land surface. SRTM data is the **primary Earth elevation dataset** in TerraTwin, providing the topographic baseline against which Mars (MOLA) and Moon (LOLA) topography are compared.

#### What Data It Provides

| Product | Description |
|---------|-------------|
| **SRTM 1 Arc-Second Global** | ~30 m resolution DEM, global land coverage |
| **SRTM 3 Arc-Second** | ~90 m resolution DEM (older public release, superseded) |
| **NASADEM** | Reprocessed SRTM using updated algorithms (void-filled, improved) |

#### Access URL

- **LP DAAC SRTM 1-arcsec:** `https://lpdaac.usgs.gov/products/srtmgl1v003/`
- **OpenTopography:** `https://opentopography.org/`
- **USGS EarthExplorer:** `https://earthexplorer.usgs.gov/`
- **Direct HTTPS:** `https://e4ftl01.cr.usgs.gov/MEASURES/SRTMGL1.003/`

#### Authentication Requirements

- NASA Earthdata Login required for LP DAAC HTTPS downloads
- OpenTopography API: free registration, API key for bulk access
- USGS EarthExplorer: free registration

#### File Formats

- **GeoTIFF** (`.tif`) — primary format for NASADEM and modern SRTM releases
- **HGT** (`.hgt`) — SRTM raw binary format (1-degree tiles, 3601×3601 pixels)
- **IMG** — alternative ERDAS Imagine format in some distributions

#### Spatial Resolution

- **1 arc-second (~30 m at equator)** — SRTM Global 1 Arc-Second
- Resolution degrades toward poles (30 m at equator → ~25 m at 45° lat)
- Coverage: 56°S to 60°N latitude (land masses only)

#### Units

| Variable | Units |
|----------|-------|
| Elevation | Meters above EGM96 geoid (orthometric height) |
| Void fill values | −32768 (HGT) or NoData (GeoTIFF) |

#### Coordinate Reference System

- **WGS84 Geographic (EPSG:4326)** — horizontal datum
- **EGM96 geoid** — vertical datum (orthometric height)
- Tiles: 1°×1° tiles named by SW corner (e.g., `N36W112.hgt`)

#### Known Limitations

- **Coverage gap:** No data above 60°N or below 56°S (excludes Greenland interior, Antarctica)
- **Void areas:** Water bodies, steep terrain, and dense vegetation cause radar voids (~0.3% of land area in original SRTM; improved in NASADEM)
- **Vegetation bias:** Radar surface return reflects vegetation canopy top, not bare ground (canopy height error up to 20–30 m in dense forests)
- **Single epoch:** Data collected February 2000 — dynamic surfaces (glaciers, dunes) may differ from current state
- **Vertical accuracy:** ±16 m absolute (90th percentile), ±6 m relative

#### Integration Status

> 🟢 **Complete** — GeoTIFF ingest via `rasterio`, elevation extraction by bounding box, slope and roughness calculation via `numpy`/`scipy`, WGS84 tile indexing implemented.

---

### 2.4 EMIT (Earth Surface Mineral Dust Source Investigation)

#### What It Is

**EMIT** is a NASA imaging spectrometer installed on the International Space Station (ISS) in July 2022. It maps Earth's arid land surfaces in 285 spectral bands across the visible to shortwave infrared (VSWIR: 380–2500 nm) with ~60 m spatial resolution. EMIT's primary science goal is to characterize mineral dust composition to improve climate models, but it also serves as a **spectral analog baseline** for Mars mineralogy comparison in TerraTwin.

#### What Data It Provides

| Product | Description |
|---------|-------------|
| **EMIT_L2A_RFL** | Surface reflectance (285 bands, 380–2500 nm) |
| **EMIT_L2B_MIN** | Mineral identification maps (10 mineral classes) |
| **EMIT_L2B_MINUNCERT** | Mineral fraction uncertainty estimates |
| **EMIT_L1B_RAD** | Top-of-atmosphere radiance (calibrated) |

#### Access URL

- **LP DAAC EMIT:** `https://lpdaac.usgs.gov/data/get-started-data/collection-overview/missions/emit-overview/`
- **Earthdata Search:** `https://search.earthdata.nasa.gov` (search `EMIT_L2B_MIN`)
- **EMIT data portal:** `https://earth.jpl.nasa.gov/emit/data/data-portal/`
- **VISIONS web viewer:** `https://earth.jpl.nasa.gov/emit/`

#### Authentication Requirements

- NASA Earthdata Login required
- S3 direct access via NASA Earthdata Cloud (us-west-2 region, temporary credentials)

#### File Formats

- **NetCDF-4** (`.nc`) — primary format for all EMIT products
- Internally organized with `latitude`, `longitude`, `reflectance`, `wavelengths` variables
- Requires `netCDF4`, `h5py`, or `xarray` for access

#### Spatial Resolution

- **~60 m** ground sample distance (GSD)
- Swath width: ~75 km
- Coverage: Arid and semi-arid land surfaces (global, ISS orbit 51.6° inclination)

#### Units

| Variable | Units |
|----------|-------|
| Surface Reflectance | Fraction (0–1), dimensionless |
| Mineral Fraction | Volume fraction (0–1) |
| Wavelength | Nanometers (nm) |

#### Coordinate Reference System

- **WGS84 Geographic (EPSG:4326)**
- Orthorectified to 60 m grid

#### Known Limitations

- **ISS orbit coverage:** 51.6° inclination limits coverage to between ~52°N and 52°S — excludes high-latitude analogs (e.g., Iceland, Svalbard)
- **Cloud/atmosphere sensitivity:** Optical instrument; cloud-contaminated scenes must be masked
- **Mineral mapping accuracy:** Current L2B products identify 10 mineral end-members; some mixed-composition surfaces may be misclassified
- **Spatial resolution mismatch:** 60 m EMIT pixels vs. 30 m SRTM → bi-linear resampling required for co-analysis
- **Early mission:** Data collection began mid-2022; temporal coverage limited compared to MODIS

#### Integration Status

> 🟡 **In Progress** — NetCDF4 reader with `xarray` implemented; L2B mineral maps extracted for Atacama and Saharan test regions; Mars CRISM mineral comparison pipeline in design phase.

---

### 2.5 NASA PDS / MOLA (Mars Orbiter Laser Altimeter)

#### What It Is

**MOLA (Mars Orbiter Laser Altimeter)** was an instrument aboard NASA's **Mars Global Surveyor (MGS)** spacecraft, which orbited Mars from 1997 to 2006. MOLA produced the definitive global topographic map of Mars by firing a laser and measuring return-pulse timing. It is the **Mars elevation dataset** in TerraTwin, directly comparable to SRTM (Earth) and LOLA (Moon) for topographic analog analysis.

#### What Data It Provides

| Product | Description |
|---------|-------------|
| **MOLA MEGDR** | Mission Experiment Gridded Data Record — global topographic grids at multiple resolutions (4, 16, 32, 64, 128 pixel/degree) |
| **MOLA PEDR** | Precision Experiment Data Record — raw altimetry point measurements |
| **MOLA Hillshade** | Derived shaded relief products |
| **MOLA Color Topography** | Color-mapped elevation products |

#### Access URL

- **PDS Geosciences Node (WUSTL):** `https://pds-geosciences.wustl.edu/missions/mgs/mola.html`
- **USGS Astrogeology (download):** `https://astrogeology.usgs.gov/search/results?q=MOLA`
- **Example MEGDR 128ppd:** `https://pds-geosciences.wustl.edu/mgs/mgs-m-mola-5-megdr-l3-v1/mgsl_300x/meg128/`
- **OpenPlanetary Hub:** `https://www.openplanetary.org/`

#### Authentication Requirements

- **No authentication required** — NASA PDS data is fully open and free
- Direct HTTPS/FTP download without login

#### File Formats

- **IMG / LBL** — PDS3 binary image format with detached PDS label
- **TIF / GeoTIFF** — available for some pre-processed products from USGS Astrogeology
- Requires GDAL (with `PDS` driver), `pvl` (Python label parser), or ISIS3 (USGS planetary software)

#### Spatial Resolution

| Grid | Resolution | Approx. Ground Sampling |
|------|-----------|-------------------------|
| 4 ppd | ~15 km | Very coarse, global overview |
| 16 ppd | ~3.7 km | Regional |
| 32 ppd | ~1.85 km | Standard global product |
| 64 ppd | ~925 m | High-resolution global |
| **128 ppd** | **~463 m** | **Highest global resolution** |

> Note: 128 ppd is the standard TerraTwin ingestion target for Mars topography.

#### Units

| Variable | Units |
|----------|-------|
| Elevation | Meters relative to **Mars areoid** (Mars equipotential surface, analogous to Earth's geoid) |
| Null/void values | −99999 m (pre-filled in MEGDR) |

#### Coordinate Reference System

- **IAU 2000 Mars sphere (R = 3396.19 km)** — horizontal datum
- **Areocentric latitude / East longitude (0°–360°)** — coordinate convention
- PROJ string: `+proj=longlat +a=3396190 +b=3376200 +no_defs`
- Requires custom PROJ CRS definition (not standard EPSG)

#### Known Limitations

- **Resolution ceiling:** 128 ppd (~463 m) is global maximum — no sub-500 m global coverage (unlike SRTM 30 m on Earth)
- **Coverage gaps near poles:** Sparse PEDR track coverage above ±87° latitude
- **Age of data:** Primary mission 1997–2001; surface changes (aeolian processes, CO₂ frost) have occurred since
- **Areoid datum:** Mars has no sea level — the areoid must be explained clearly when comparing elevation values to Earth
- **Custom CRS required:** Standard EPSG codes do not apply; custom PROJ definitions needed in GDAL/PostGIS

#### Integration Status

> 🟡 **In Progress** — PDS IMG reader via GDAL PDS driver implemented; 128 ppd MEGDR tiles ingested for Valles Marineris, Olympus Mons test regions; CRS transformation pipeline for Earth-Mars co-registration in development.

---

### 2.6 NASA PDS / LOLA (Lunar Orbiter Laser Altimeter)

#### What It Is

**LOLA (Lunar Orbiter Laser Altimeter)** is an instrument aboard NASA's **Lunar Reconnaissance Orbiter (LRO)**, launched in June 2009 and still operational. LOLA uses five laser beams to measure lunar surface elevation with high precision, producing the definitive global topographic map of the Moon. It is the **Moon elevation dataset** in TerraTwin, directly comparable to SRTM (Earth) and MOLA (Mars).

#### What Data It Provides

| Product | Description |
|---------|-------------|
| **LOLA LDEM** | Lunar Digital Elevation Model — global gridded products (4, 16, 32, 64, 128, 256, 512 ppd) |
| **LOLA RDR** | Reduced Data Records — precision altimetry point tracks |
| **LOLA Slope Maps** | Derived global slope maps |
| **LOLA Roughness** | Surface roughness at multiple baseline lengths |
| **LOLA POLAR** | High-resolution polar region products (up to 2 m/pixel near-polar) |

#### Access URL

- **PDS Geosciences Node:** `https://pds-geosciences.wustl.edu/missions/lro/lola.html`
- **USGS Astrogeology Moon products:** `https://astrogeology.usgs.gov/search/results?q=LOLA`
- **LRO LOLA data portal (WUSTL):** `https://imbrium.mit.edu/`
- **Example 128ppd:** `https://pds-geosciences.wustl.edu/lro/lro-l-lola-3-rdr-v1/lrolol_1xxx/data/ldem/`

#### Authentication Requirements

- **No authentication required** — fully open PDS archive
- Direct HTTPS/FTP download

#### File Formats

- **IMG / LBL** — PDS3 binary format (same as MOLA)
- **JP2 (JPEG2000)** — available for some USGS-derived products
- **GeoTIFF** — available via USGS Astrogeology for pre-processed products

#### Spatial Resolution

| Grid | Resolution | Approx. Ground Sampling |
|------|-----------|-------------------------|
| 64 ppd | ~473 m | Standard global |
| **128 ppd** | **~237 m** | **Standard TerraTwin target** |
| 256 ppd | ~118 m | High resolution |
| 512 ppd | ~59 m | Very high resolution (selected regions) |
| Polar products | up to 2 m | Near-poles only |

#### Units

| Variable | Units |
|----------|-------|
| Elevation | Meters relative to **mean lunar radius** (1737.4 km from center) |
| Fill value | −9999 m |

#### Coordinate Reference System

- **IAU 2015 Lunar sphere (R = 1737400 m)** — horizontal datum
- **Selenographic coordinates:** Latitude (−90° to +90°), Longitude (−180° to +180° or 0°–360°)
- PROJ: `+proj=longlat +a=1737400 +b=1737400 +no_defs`
- Requires custom PROJ CRS (no standard EPSG)

#### Known Limitations

- **Coverage:** Global; LRO's near-polar orbit provides denser track coverage near poles than near equator
- **Vertical precision:** ±1 m radial accuracy (excellent) but horizontal accuracy ~100 m depends on spacecraft position knowledge
- **Resolution vs. Earth:** Even 512 ppd (~59 m) does not match SRTM 30 m — resolution mismatch is a documented limitation in ACS calculations
- **Permanently shadowed regions (PSRs):** Polar PSRs have limited laser return quality due to extremely cold surfaces and reduced albedo
- **Active mission:** Data continuously updated — version pinning required for reproducible analysis

#### Integration Status

> 🟡 **In Progress** — PDS IMG reader implemented; 128 ppd LDEM ingested for South Pole Aitken Basin test region; slope/roughness extraction implemented via `numpy`.

---

### 2.7 LROC (Lunar Reconnaissance Orbiter Camera)

#### What It Is

**LROC (Lunar Reconnaissance Orbiter Camera)** is a camera system aboard NASA's **LRO spacecraft**, comprising:
- **NAC (Narrow Angle Camera):** Two cameras, ~0.5 m/pixel resolution — highest-resolution routine lunar imaging
- **WAC (Wide Angle Camera):** 7-band (UV to visible), ~100 m/pixel resolution — global mosaic coverage

LROC NAC imagery is the **Moon surface imagery dataset** in TerraTwin, comparable to HiRISE (Mars) and commercial/Sentinel-2 imagery (Earth).

#### What Data It Provides

| Product | Description |
|---------|-------------|
| **LROC NAC** | Panchromatic images, ~0.5 m/pixel, narrow strips (~2.5 km wide) |
| **LROC WAC** | 7-band multispectral (321–689 nm), ~100 m/pixel, near-global |
| **LROC WAC Global Mosaic** | Controlled 100 m/pixel global mosaic (TemporalMosaic) |
| **LROC NAC DTM** | Stereo-derived Digital Terrain Models from NAC pairs |
| **LROC ACT-REACT QuickMap** | Web-based map of all LROC products |

#### Access URL

- **LROC Data Archive (WUSTL):** `https://wms.lroc.asu.edu/lroc`
- **PDS Archive:** `https://pds.lroc.asu.edu/data/`
- **LROC QuickMap (web viewer):** `https://quickmap.lroc.asu.edu/`
- **ACT-REACT Search:** `https://wms.lroc.asu.edu/lroc/search`

#### Authentication Requirements

- **No authentication required** — fully open PDS archive
- Large NAC file sizes (1–4 GB per image) require robust download management

#### File Formats

- **IMG** — PDS3 binary (NAC raw/calibrated)
- **TIF / GeoTIFF** — available for pre-processed WAC global mosaic tiles
- Calibrated files: `EDR` (raw) → `CDR` (calibrated) → `RDR` (map-projected)

#### Spatial Resolution

| Product | Resolution |
|---------|------------|
| NAC | **~0.5 m/pixel** |
| WAC | **~100 m/pixel** |
| WAC Global Mosaic | **100 m/pixel** |
| NAC DTM | **~2 m/pixel** (from stereo pairs) |

#### Units

| Variable | Units |
|----------|-------|
| NAC pixel values | 12-bit raw DN (digital number) → calibrated radiance (W/m²/sr/µm) |
| WAC reflectance | I/F (irradiance factor, dimensionless) |

#### Coordinate Reference System

- **Selenographic (ESRI:104903 / IAU 2015 Moon)** — map-projected products
- **Simple Cylindrical** — WAC global mosaic
- **Polar Stereographic** — polar products

#### Known Limitations

- **Narrow strips:** NAC covers ~2.5 km wide strips — full Moon coverage requires millions of images; global NAC mosaic does not exist
- **No spectral bands in NAC:** Panchromatic only — no mineralogy or multispectral analysis possible from NAC alone
- **Large file sizes:** Individual NAC images commonly 500 MB–4 GB
- **Illumination variability:** Lunar images acquired at different solar incidence angles across the archive — comparison requires incidence angle normalization
- **Stereo DTM coverage:** NAC DTMs exist only for select high-interest sites, not globally

#### Integration Status

> 🔵 **Planned** — WAC 100 m/pixel global mosaic tile server configured; NAC on-demand fetch by region planned; NAC DTM ingestion for Apollo site analog regions planned.

---

### 2.8 HiRISE / CTX (Mars Reconnaissance Orbiter)

#### What It Is

**MRO (Mars Reconnaissance Orbiter)** carries two imaging instruments used in TerraTwin:

- **HiRISE (High Resolution Imaging Science Experiment):** 0.25–0.5 m/pixel — the highest-resolution camera to orbit another planet, comparable to LROC NAC for the Moon and aerial/commercial imagery for Earth
- **CTX (Context Camera):** ~6 m/pixel — provides broader context for HiRISE targets; nearly global coverage of Mars at 6 m resolution

Together, HiRISE and CTX provide the **Mars surface imagery datasets** for TerraTwin's visual analog comparison.

#### What Data It Provides

| Instrument | Product | Description |
|------------|---------|-------------|
| HiRISE | **RED** | Red-channel panchromatic, 0.25 m/pixel, ~6 km wide strips |
| HiRISE | **COLOR** | 3-channel (BG, RED, NIR) color, 0.25 m/pixel, center ~1.2 km wide |
| HiRISE | **DTM** | Stereo-derived DEM, ~1 m/pixel vertical resolution |
| CTX | **CTX Image** | Panchromatic, ~6 m/pixel, ~30 km wide strips |
| CTX | **Murray Lab Mosaic** | Global 6 m/pixel CTX mosaic (Bruce Murray Lab, Caltech) |

#### Access URL

- **HiRISE archive (UA):** `https://www.uahirise.org/`
- **PDS HiRISE:** `https://hirise-pds.lpl.arizona.edu/PDS/`
- **CTX archive:** `https://pds-imaging.jpl.nasa.gov/data/mro/mars_reconnaissance_orbiter/ctx/`
- **Murray Lab CTX Mosaic:** `https://murray-lab.caltech.edu/CTX/`
- **USGS POW (Planetary Observatory for Windshields):** `https://astrogeology.usgs.gov/tools/map-a-planet-2`

#### Authentication Requirements

- **No authentication required** — fully open PDS/HiRISE archive
- Murray Lab mosaic tiles: free, no registration

#### File Formats

- **JP2 (JPEG2000)** — HiRISE primary format (compressed, lossless)
- **IMG / LBL** — PDS3 raw format
- **TIF / GeoTIFF** — USGS-processed products and CTX mosaic tiles

#### Spatial Resolution

| Instrument | Resolution |
|------------|------------|
| HiRISE RED | **~0.25 m/pixel** (25–50 cm, altitude-dependent) |
| HiRISE COLOR | **~0.25 m/pixel** (1.2 km swath) |
| HiRISE DTM | **~1 m/pixel** vertical |
| CTX | **~6 m/pixel** |
| CTX Global Mosaic | **~6 m/pixel** |

#### Units

| Variable | Units |
|----------|-------|
| HiRISE DN | 14-bit raw digital number → calibrated I/F reflectance |
| CTX DN | 8-bit raw digital number |

#### Coordinate Reference System

- **IAU 2000 Mars sphere (ESRI:104905)** — Equirectangular projection for most products
- **Polar Stereographic** — polar region products
- **Custom Sinusoidal** — some HiRISE DTM products

#### Known Limitations

- **Partial coverage:** HiRISE has imaged ~3% of Mars surface at full resolution — not globally complete
- **Extreme file sizes:** Full-resolution HiRISE JP2 images: 300 MB–10 GB
- **Illumination variability:** Images acquired across years with different solar geometry — photometric normalization required for comparison
- **CTX global mosaic age:** Murray Lab mosaic is a composite of images from 2006–2020; not a single-epoch product
- **Custom CRS:** Requires ISIS3 or GDAL with Planetary CRS support

#### Integration Status

> 🔵 **Planned** — CTX Murray Lab tile server planned for global Mars context imagery; HiRISE on-demand JP2 fetch for specific analog site high-resolution views planned; HiRISE DTM ingestion for Jezero Crater planned.

---

### 2.9 USGS Geological Maps

#### What It Is

**USGS (United States Geological Survey)** produces geological maps for both Earth and planetary bodies. TerraTwin uses USGS geological maps as **rock type and geological unit data** — directly comparable between Earth and Mars, and partially comparable for the Moon.

- **Earth:** USGS National Geologic Map Database (NGMDB) — regional and national geological maps
- **Mars:** USGS Astrogeology global Mars geological map (Tanaka et al., 2014)
- **Moon:** USGS Astrogeology global Lunar geological map (Fortezzo et al., 2020)

#### What Data It Provides

| Source | Product | Description |
|--------|---------|-------------|
| USGS NGMDB (Earth) | Geologic unit polygons | Rock type, age, formation name, description |
| USGS Astrogeology (Mars) | Global Geological Map of Mars | 44 geological units, contacts, structures (1:20,000,000 scale) |
| USGS Astrogeology (Moon) | Unified Lunar Geologic Map | 43 geologic units (1:5,000,000 scale) |

#### Access URL

- **Earth NGMDB:** `https://ngmdb.usgs.gov/`
- **Earth Geologic Map (National):** `https://mrdata.usgs.gov/geology/us/`
- **Mars Global Geological Map:** `https://astrogeology.usgs.gov/search/details/Mars/Geology/Tanaka2014_MarsMGSGeologicMap/cub`
- **Mars map (Tanaka 2014) PDS:** `https://pubs.er.usgs.gov/publication/sim3292`
- **Lunar Geological Map (Fortezzo 2020):** `https://astrogeology.usgs.gov/search/map/Moon/Geology/Unified_Geologic_Map_of_the_Moon_GIS_v2`

#### Authentication Requirements

- **No authentication required** for most products
- Some NGMDB state-level maps may require free account for bulk WFS access

#### File Formats

- **Shapefile (.shp)** — primary vector format for geological unit polygons
- **GeoPackage (.gpkg)** — modern alternative
- **GeoJSON** — for web API access
- **Geodatabase (.gdb)** — ESRI format for some NGMDB products

#### Spatial Resolution

| Source | Scale / Resolution |
|--------|-------------------|
| USGS Earth (national) | 1:500,000 (state-level maps available to 1:24,000) |
| Mars Tanaka 2014 | **1:20,000,000** (global) |
| Moon Fortezzo 2020 | **1:5,000,000** (global) |

#### Units

| Variable | Description |
|----------|-------------|
| Geological unit code | String identifier (e.g., `Htu` = Hesperian transition unit) |
| Rock age | Geologic period/epoch name |
| Dominant lithology | Categorical (basalt, breccia, impact melt, etc.) |

#### Coordinate Reference System

- **Earth:** WGS84 (EPSG:4326) — NGMDB products
- **Mars:** IAU 2000 Mars (ESRI:104905) — Tanaka 2014 shapefile
- **Moon:** IAU 2015 Moon (ESRI:104903) — Fortezzo 2020 shapefile

#### Known Limitations

- **Scale mismatch:** Mars/Moon maps are 1:5M–1:20M scale; Earth analog regions may have 1:24,000-scale maps — direct comparison requires explicit acknowledgment of scale difference
- **Classification schemes differ:** Earth rock type classifications (IUGS) differ from planetary geological unit systems — mapping between systems requires a lookup table
- **Planetary maps are interpretive:** Planetary geological maps are based on remote sensing, not ground truth (except Apollo/landing sites) — unit boundaries and identifications carry inherent uncertainty
- **Earth coverage:** National 1:500,000 coverage is complete; local 1:24,000 coverage is patchy

#### Integration Status

> 🟡 **In Progress** — Shapefile ingestion via `GeoPandas` implemented; Earth-Mars-Moon geological unit crosswalk table in development; PostGIS spatial intersection for analog region queries implemented.

---

### 2.10 ESA Sentinel (Sentinel-1 SAR + Sentinel-2 Multispectral)

#### What It Is

The **European Space Agency's Copernicus Programme** operates a constellation of Sentinel satellites. TerraTwin uses two:

- **Sentinel-1:** C-band synthetic aperture radar (SAR) — cloud-independent surface imaging, terrain analysis, and change detection
- **Sentinel-2:** Multispectral optical imager (13 bands: 443–2190 nm) — high-resolution land surface monitoring with 10 m visible bands

Sentinel data provides high-resolution, freely available, and regularly updated Earth surface data for analog site characterization.

#### What Data It Provides

| Instrument | Product | Description |
|------------|---------|-------------|
| Sentinel-1 | **GRD (IW)** | Ground Range Detected, Interferometric Wide swath, VV+VH polarization |
| Sentinel-1 | **SLC** | Single Look Complex — full phase information for InSAR |
| Sentinel-1 | **DEM** (derived) | InSAR-derived elevation supplements |
| Sentinel-2 | **L1C** | Top-of-atmosphere reflectance, all 13 bands |
| Sentinel-2 | **L2A** | Surface reflectance (atmospherically corrected), all 13 bands |

#### Access URL

- **Copernicus Data Space Ecosystem (CDSE, primary):** `https://dataspace.copernicus.eu/`
- **CDSE OData API:** `https://catalogue.dataspace.copernicus.eu/odata/v1`
- **Copernicus STAC API:** `https://stac.dataspace.copernicus.eu/`
- **Google Earth Engine (Sentinel-2 L2A):** `ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")`
- **Microsoft Planetary Computer (STAC):** `https://planetarycomputer.microsoft.com/api/stac/v1`

#### Authentication Requirements

- **Copernicus Data Space:** Free registration required; OAuth2 token for API downloads
- **Google Earth Engine:** Google account + EE project approval (free for research)
- **Planetary Computer:** Free; API token for SAS URL generation

#### File Formats

- **Sentinel-1 GRD:** SAFE format (folder containing multiple TIFF files + XML metadata)
- **Sentinel-2 L2A:** SAFE format (JP2 tiles + XML metadata), or GeoTIFF via CDSE
- Both accessible as **Cloud Optimized GeoTIFF (COG)** via Planetary Computer STAC

#### Spatial Resolution

| Band | Resolution |
|------|------------|
| Sentinel-2 B02, B03, B04, B08 (Visible/NIR) | **10 m** |
| Sentinel-2 B05–B07, B8A, B11, B12 (Red Edge/SWIR) | **20 m** |
| Sentinel-2 B01, B09, B10 (Coastal/Water vapour/Cirrus) | **60 m** |
| Sentinel-1 GRD (IW mode) | **~10 m** (azimuth) × **~2.3 m** (range) → ground projected ~10 m |

#### Units

| Variable | Units |
|----------|-------|
| Sentinel-2 L2A reflectance | Scaled integer (÷10000 → fraction 0–1) |
| Sentinel-1 GRD backscatter | Linear power (or converted to dB: σ⁰ in dB) |

#### Coordinate Reference System

- **WGS84 / UTM** — Sentinel-2 delivered in UTM zone tiles (100 km × 100 km MGRS tiles)
- **WGS84 Geographic** — Sentinel-1 GRD metadata bounding box
- Reprojection to WGS84 (EPSG:4326) or project CRS required for multi-source analysis

#### Known Limitations

- **Sentinel-2 optical:** Cloud cover creates data gaps; seasonal composites required for persistent coverage in cloudy regions
- **Sentinel-1 SAR:** Geometric distortions (foreshortening, layover, shadow) in steep terrain; requires terrain correction (Range-Doppler or ellipsoidal)
- **No planetary equivalents:** No SAR data for Moon; Mars Reconnaissance Orbiter SHARAD is subsurface radar (not imaging SAR) — Sentinel-1 is an Earth-only dataset in TerraTwin with no direct cross-planet analog
- **SAFE format complexity:** Multi-file SAFE packages require specialized parsers (`sentinelsat`, `esa-snappy`, or manual GDAL handling)
- **Data volume:** A single Sentinel-2 L2A tile is ~700 MB; Sentinel-1 GRD scenes ~400–800 MB

#### Integration Status

> 🔵 **Planned** — Sentinel-2 L2A NDVI and band ratio computation via CDSE STAC + `stackstac`; Sentinel-1 SAR backscatter roughness proxy for Earth analog sites planned; Google Earth Engine integration via `ee` Python API planned.

---

## 3. Cross-Planet Data Comparison Matrix

The following table maps equivalent data types across the three planetary bodies. Where a direct equivalent exists, it is listed with resolution. Where no equivalent exists, the cell is marked accordingly.

| Data Type | Earth Dataset | Earth Resolution | Mars Dataset | Mars Resolution | Moon Dataset | Moon Resolution |
|-----------|--------------|-----------------|-------------|----------------|-------------|----------------|
| **Topography / DEM** | SRTM / NASADEM | 30 m | MOLA MEGDR | ~463 m (128 ppd) | LOLA LDEM | ~237 m (128 ppd) |
| **High-Res Imagery** | Sentinel-2 / Commercial | 10 m | HiRISE | ~0.25 m (partial) | LROC NAC | ~0.5 m (partial) |
| **Moderate Imagery** | MODIS / Sentinel-2 | 500 m–10 m | CTX Mosaic | ~6 m | LROC WAC | ~100 m |
| **Mineralogy / Spectral** | EMIT (VSWIR) | ~60 m | CRISM (MRO)* | ~18 m | Kaguya SELENE-2* | ~~84 m |
| **Geological Units** | USGS NGMDB | 1:500K–1:24K | USGS Tanaka 2014 | 1:20M | USGS Fortezzo 2020 | 1:5M |
| **Land Surface Temp** | MODIS LST | 1 km | THEMIS* (Mars Odyssey) | 100 m | Diviner (LRO)* | ~200 m |
| **Surface Roughness** | SRTM-derived | 30 m | MOLA-derived | ~463 m | LOLA-derived | ~237 m |
| **Slope** | SRTM-derived | 30 m | MOLA-derived | ~463 m | LOLA-derived | ~237 m |
| **SAR / Radar** | Sentinel-1 SAR | ~10 m | No direct equivalent | — | Mini-RF (LRO)* | ~15–30 m (polar) |
| **Vegetation / NDVI** | MODIS / Sentinel-2 | 500 m–10 m | **No equivalent** (no vegetation) | — | **No equivalent** | — |
| **Atmospheric Data** | ERA5 / MERRA-2* | ~31 km | MCS (MRO)* | Column-integrated | — | — |

> `*` = Not currently integrated in TerraTwin v1.0; listed for future roadmap reference.

**Key Comparison Pairs Used in ACS Engine:**

```
Elevation:  SRTM (Earth) ↔ MOLA (Mars) ↔ LOLA (Moon)
Slope:      SRTM-derived ↔ MOLA-derived ↔ LOLA-derived
Roughness:  SRTM-derived ↔ MOLA-derived ↔ LOLA-derived
Geology:    USGS NGMDB ↔ USGS Tanaka 2014 ↔ USGS Fortezzo 2020
Imagery:    Sentinel-2 / MODIS ↔ CTX / HiRISE ↔ LROC WAC / NAC
Mineralogy: EMIT ↔ [CRISM - future] ↔ [Kaguya - future]
```

---

## 4. Data Quality and Uncertainty Notes

### 4.1 Resolution Mismatches

The most significant data quality issue in multi-planet analog analysis is the **systematic resolution gap** between Earth and planetary datasets:

| Body | Best Available DEM | Resolution |
|------|--------------------|------------|
| Earth | SRTM / NASADEM | 30 m |
| Moon | LOLA 512 ppd (selected regions) | ~59 m |
| Mars | MOLA 128 ppd (global) | ~463 m |

**Impact:** A 1° slope computed from SRTM 30 m data reflects sub-100 m terrain features; the same slope from MOLA 128 ppd averages terrain over ~500 m. Features below the planetary data resolution are invisible in the comparison.

**Mitigation:** TerraTwin resamples all elevation data to the **coarsest resolution of the comparison set** before computing terrain derivatives. The effective comparison resolution is documented in every ACS result record.

### 4.2 Age of Data

| Dataset | Acquisition Period | Surface Change Risk |
|---------|-------------------|---------------------|
| SRTM | February 2000 (11 days) | Moderate (glaciers, dunes, vegetation) |
| MOLA | 1997–2001 | Low (slow aeolian processes) |
| LOLA | 2009–present (ongoing) | Very Low (geologically static) |
| MODIS LST | 2000–present | High (land use change, climate) |
| Sentinel-2 | 2015–present | High (seasonal, annual vegetation change) |
| HiRISE | 2006–present | Very Low for geology; moderate for seasonal features |

### 4.3 Atmospheric Corrections

- **MODIS LST:** Pre-corrected for atmospheric absorption using split-window algorithm; residual error ~1–2 K in humid conditions
- **Sentinel-2 L2A:** Sen2Cor atmospheric correction applied by ESA; residual error ~2–5% reflectance in aerosol-heavy regions
- **EMIT reflectance:** ATREM-based atmospheric correction; validation ongoing in dust-heavy regions
- **Planetary data (MOLA, LOLA):** Laser altimetry — no atmospheric correction required (direct ranging)
- **HiRISE / CTX / LROC:** Empirical photometric correction applied; absolute reflectance not guaranteed

### 4.4 Vertical Datum Incompatibility

Earth (EGM96 geoid), Mars (areoid), and Moon (mean sphere radius) use fundamentally different vertical reference surfaces. **Raw elevation values cannot be directly compared without offset removal.** TerraTwin normalizes all elevation data to **relative elevation above local mean** before ACS computation to avoid datum comparison errors.

### 4.5 Planetary CRS Challenges

Standard EPSG codes exist only for Earth. Mars and Moon require custom PROJ/WKT definitions. TerraTwin maintains a custom CRS registry in `backend/crs/planetary_crs.py` defining:
- Mars IAU 2000 sphere
- Moon IAU 2015 sphere
- Mars North/South Polar Stereographic projections
- Moon North/South Polar Stereographic projections

---

## 5. Data Licensing Summary

| Dataset | Provider | License | Commercial Use | Attribution Required | Cost |
|---------|----------|---------|----------------|----------------------|------|
| NASA Earthdata / CMR | NASA | Open — NASA Data Policy | ✅ Yes | ✅ Yes | Free |
| MODIS (MOD11A1 etc.) | NASA / USGS | Open — NASA Data Policy | ✅ Yes | ✅ Yes | Free |
| SRTM / NASADEM | NASA / USGS | Open — NASA/USGS Public Domain | ✅ Yes | ✅ Yes | Free |
| EMIT | NASA / JPL | Open — NASA Data Policy | ✅ Yes | ✅ Yes | Free |
| MOLA / PDS | NASA / USGS | Open — PDS Public Domain | ✅ Yes | ✅ Yes | Free |
| LOLA / PDS | NASA / USGS | Open — PDS Public Domain | ✅ Yes | ✅ Yes | Free |
| LROC | NASA / ASU | Open — PDS Public Domain | ✅ Yes | ✅ Yes | Free |
| HiRISE | NASA / UA | Open — PDS Public Domain | ✅ Yes | ✅ Yes | Free |
| CTX / Murray Lab Mosaic | NASA / Caltech | Creative Commons (CC BY) | ✅ Yes | ✅ Yes | Free |
| USGS Geological Maps | USGS | USGS Public Domain / CC0 | ✅ Yes | ✅ Recommended | Free |
| ESA Sentinel-1/2 | ESA / Copernicus | Copernicus Open Access | ✅ Yes | ✅ Yes | Free |

> **Note:** All data sources used in TerraTwin are **freely available and open access** consistent with NASA's open science mandate and ESA's Copernicus free data policy. No proprietary datasets are incorporated. Attribution requirements must be met in any publication or public display of derived products.

---

*Document maintained by the TerraTwin development team. For data ingestion issues, see `backend/services/` and `backend/data_ingestion/`. For pipeline configuration, see `backend/config/data_sources.yaml`.*
