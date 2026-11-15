# TerraTwin Scientific Methodology

> **Project:** TerraTwin — Earth-Moon-Mars Analog Discovery & Research Platform  
> **Challenge:** NASA Space Apps Challenge  
> **Document Version:** 1.0  
> **Last Updated:** 2025

---

## Table of Contents

1. [Scientific Framework Overview](#1-scientific-framework-overview)
2. [Analog Research Background and Precedents](#2-analog-research-background-and-precedents)
3. [Comparable vs. Incomparable Environmental Parameters](#3-comparable-vs-incomparable-environmental-parameters)
4. [Category A: Measurable and Comparable Parameters](#4-category-a-measurable-and-comparable-parameters)
5. [Category B: Mission-Environment Parameters (Not Directly Comparable)](#5-category-b-mission-environment-parameters-not-directly-comparable)
6. [The Similarity Formula](#6-the-similarity-formula)
7. [The Analog Comparison Score (ACS)](#7-the-analog-comparison-score-acs)
8. [Feature Weights Table](#8-feature-weights-table)
9. [Score Classification Table](#9-score-classification-table)
10. [Missing Data Handling](#10-missing-data-handling)
11. [Uncertainty Quantification](#11-uncertainty-quantification)
12. [Scientific Limitations and Disclaimers](#12-scientific-limitations-and-disclaimers)
13. [What the ACS Score Does NOT Mean](#13-what-the-acs-score-does-not-mean)

---

## 1. Scientific Framework Overview

### What Is Planetary Analog Research?

**Planetary analog research** is the systematic study of Earth environments that share one or more physical, chemical, or geological characteristics with the surface conditions of other planetary bodies — primarily the Moon and Mars. Rather than treating these similarities as coincidental, analog science uses them as a **controlled experimental proxy**: if we can understand a process on Earth, we can apply that understanding to interpret observations from other planets.

Analog sites serve multiple scientific and engineering functions:

| Function | Description |
|----------|-------------|
| **Science Interpretation** | Ground-truth for orbital remote sensing; explain what sensors on Mars actually "see" by studying the same geology on Earth |
| **Instrument Testing** | Operate rovers, drills, and spectrometers in environments resembling the target body before launch |
| **Mission Planning** | Train astronauts, develop traversability assessments, and test EVA protocols in Mars/Moon-like terrain |
| **Hypothesis Generation** | Use Earth analog processes (hydrology, volcanism, aeolian transport) to generate testable hypotheses for planetary missions |

### Why Computational Analog Discovery Matters

Traditional analog site identification is expert-driven, time-consuming, and inherently subjective. A geologist with Mars mission experience may identify a site in Chile as a good Mars analog based on visual inspection and professional knowledge — but this process:
- Cannot systematically evaluate all candidate sites globally
- Does not produce quantified, reproducible similarity scores
- Cannot easily update as new planetary data arrives
- Is inaccessible to researchers without deep planetary science background

**TerraTwin addresses this gap** by providing a **data-driven, quantified, and reproducible framework** for analog site discovery. It computes a numerical Analog Comparison Score (ACS) for any Earth location against any planetary target region using standardized datasets, enabling:

- Global, automated candidate site search
- Reproducible comparisons with documented methodology
- Multi-feature weighted scoring that reflects scientific priorities
- Transparent uncertainty reporting

---

## 2. Analog Research Background and Precedents

TerraTwin's scientific foundation is built on decades of established analog research. The following sites are well-documented analogs with extensive scientific literature, and they serve as **validation benchmarks** for the ACS algorithm.

---

### 2.1 Atacama Desert, Chile/Peru — Mars Aridity Analog

**Location:** Northern Chile and southern Peru, South America (19°–27°S, 68°–70°W)

**Why It Is Used:** The Atacama Desert is considered the **most Mars-like arid environment on Earth**. Some regions receive less than 1 mm of precipitation per year, with hyper-arid core zones going years or decades without measurable rainfall. It is the driest non-polar desert on Earth.

**Key Analog Characteristics:**
- **Extreme aridity:** Mean annual precipitation <1 mm in hyper-arid core; comparable to Mars atmospheric water vapor content translated to surface availability
- **Nitrate and perchlorate soils:** Atacama soils are rich in nitrates and perchlorates — perchlorate is also a confirmed Mars surface constituent (Phoenix lander, 2008)
- **UV radiation:** High UV flux due to thin atmosphere and high altitude (2,000–5,000 m); analogs testing instrument and microbial UV tolerance
- **Mineralogy:** Iron oxides (jarosite, hematite, gypsum) match spectral signatures observed by Mars orbiters (CRISM, OMEGA)
- **Aeolian landforms:** Yardangs, ventifacts, and sand dunes closely morphologically matched to Mars aeolian features
- **Salt flats (salars):** Evaporite deposits (halite, sulfates) mirror Mars paleolake evaporite environments (Meridiani Planum, Gale Crater)

**Scientific References:** Navarro-González et al. (2003), McKay et al. (2003), Azua-Bustos et al. (2012)

**ACS Validation Expectation:** High to Very High analog score for Mars aridity and mineralogy features.

---

### 2.2 Haughton Crater, Devon Island, Canada — Mars Impact Crater / Permafrost Analog

**Location:** Devon Island, Nunavut, Canada (75°N, 89°W) — High Arctic

**Why It Is Used:** Haughton Impact Crater (23 km diameter, ~39 Ma age) is an **impact-generated geomorphological analog** for Mars craters, combined with the extreme cold, permafrost, and periglacial processes that mirror Mars polar and sub-polar regions. It is the site of the **Mars Desert Research Station (MDRS) and Haughton-Mars Project (HMP)**.

**Key Analog Characteristics:**
- **Impact crater morphology:** Eroded impact structure with central uplift, breccia deposit, and impact melt rock — directly comparable to Mars crater morphology at equivalent erosion state
- **Permafrost and ice-wedge polygons:** Periglacial features (ice-wedge polygons, patterned ground, thermokarst) analogous to Mars polar and mid-latitude ice-related features
- **Extreme cold and aridity:** Summer temperatures −5°C to +10°C; cold desert conditions analogous to Mars mid-latitudes
- **Impact hydrothermal system:** Haughton crater hosted post-impact hydrothermal activity — analogous to Mars impact-induced habitability windows
- **Terrain trafficability:** Used for rover and EVA suit traversal testing by NASA and CSA

**Scientific References:** Lee et al. (2002), Cockell et al. (2001), Osinski et al. (2005)

**ACS Validation Expectation:** High analog score for Mars crater morphology, periglacial terrain, and cold desert aridity.

---

### 2.3 Death Valley, California, USA — Mars Thermal and Aridity Analog

**Location:** Eastern California, USA (36°–37°N, 116°–117°W)

**Why It Is Used:** Death Valley holds the highest reliably recorded air temperature on Earth (+56.7°C, 1913). Its combination of extreme temperature swings, hyper-aridity, salt flats, alluvial fans, and geological diversity makes it a thermal-aridity Mars analog and a **remote sensing calibration site**.

**Key Analog Characteristics:**
- **Extreme thermal range:** Surface temperatures exceed +60°C in summer; thermal inertia patterns used to calibrate Mars THEMIS thermal data
- **Playa/salt flat analogs:** Badwater Basin (salt flat) analogous to Mars evaporite deposits at Meridiani and Hellas basin floor
- **Dune fields:** Mesquite Flat dunes provide aeolian process analog for Mars barchan and transverse dunes
- **Alluvial fans:** Fan systems on valley walls are geomorphologically analogous to Mars alluvial fans (observed from MRO/HiRISE)
- **Spectral diversity:** Diverse exposed lithologies (carbonates, evaporites, volcanic) used to validate EMIT and CRISM spectral maps
- **Fault systems:** Strike-slip and normal faults provide structural analog for Mars tectonic history

**Scientific References:** Farr et al. (2007), de Pablo & Komatsu (2009)

**ACS Validation Expectation:** High analog score for Mars aridity, thermal, and aeolian features; moderate score for geological composition (less iron-rich than Atacama).

---

### 2.4 McMurdo Dry Valleys, Antarctica — Mars Regolith and Ice Analog

**Location:** Victoria Land, Antarctica (77°–78°S, 160°–164°E)

**Why It Is Used:** The McMurdo Dry Valleys are the **largest ice-free region in Antarctica** — a cold desert environment with features strikingly similar to Mars polar and sub-polar regions. The valleys have been extensively studied as the most Mars-like environment on Earth for cold, dry, and ice-related processes.

**Key Analog Characteristics:**
- **Cold desert:** Mean annual temperature −20°C; liquid water extremely rare; analogous to Mars mid-latitude and polar environments
- **Sublimation-driven processes:** Ice loss by sublimation rather than melting mirrors Mars ice processes at the poles
- **Permafrost and regolith:** Deep permafrost with ice-cemented soils; analogous to Mars mid-latitude ice-rich regolith detected by SHARAD and Phoenix
- **Polygonal terrain:** Ice-wedge and contraction-crack polygons identical in morphology to Mars polygon terrain (Phoenix landing site, northern plains)
- **Hypersaline lakes:** Lake Vida and Don Juan Pond contain hypersaline brines; relevant to Mars brine habitability research
- **Sublimation tills:** Debris-covered glacial ice (rock glaciers) analogous to Mars lobate debris aprons

**Scientific References:** Doran et al. (2002), Marchant & Head (2007), Wentworth et al. (2005)

**ACS Validation Expectation:** Very High analog score for Mars polar/periglacial terrain; high for regolith composition; moderate for elevation and slope (Dry Valleys have distinct topography not matching Mars plains).

---

## 3. Comparable vs. Incomparable Environmental Parameters

A central scientific challenge in analog research is determining **which properties can be meaningfully compared** between Earth and another planetary body, and which cannot. TerraTwin divides all features into two categories with a clear scientific rationale.

### Why Some Parameters ARE Comparable

Physical properties that are **scale-invariant geometric or compositional properties** of solid planetary surfaces can be meaningfully compared across bodies because they describe the **shape and substance of terrain**, not the conditions under which that terrain formed. A slope of 15° is geometrically a slope of 15° whether it is on Earth, Mars, or the Moon. A basaltic composition is mineralogically basaltic regardless of which planet formed it.

Comparable parameters meet these criteria:
1. **Dimensionally equivalent** — the same physical quantity exists on all bodies (meters for elevation, degrees for slope)
2. **Measurable by analogous instruments** — laser altimeters, spectrometers, and cameras on all three bodies measure the same physical phenomenon
3. **Process-independent** — the parameter describes the current state, not the specific process that created it

### Why Some Parameters Are NOT Comparable

Properties that are **intrinsic to the planetary body's physical environment** — determined by its mass, composition, orbital position, and history — cannot be matched on Earth. No Earth location can truly replicate Martian gravity (3.72 m/s²) or the lunar vacuum. These are **fixed constants of the target environment**, not features of its surface.

Attempting to "compare" gravity or atmospheric pressure as an analog feature would be scientifically meaningless: Earth gravity is always 9.81 m/s², regardless of which terrain is selected. These values are instead listed as **mission context parameters** — fixed properties of the target body that mission designers must account for but that analog site selection cannot address.

---

## 4. Category A: Measurable and Comparable Parameters

These six parameters form the core of the TerraTwin Analog Comparison Score. Each can be measured on Earth, Mars, and the Moon using comparable techniques, and each is scientifically meaningful for evaluating terrain analog quality.

---

### 4.1 Elevation Profile

**Definition:** The distribution of elevation values within a region of interest, characterizing overall height and relief range.

**How It Is Measured:**
- **Earth:** SRTM/NASADEM DEM (30 m resolution); values in meters above EGM96 geoid
- **Mars:** MOLA MEGDR (128 ppd, ~463 m resolution); values in meters above Mars areoid
- **Moon:** LOLA LDEM (128 ppd, ~237 m resolution); values in meters above mean lunar sphere radius

**Extracted Statistics:** Mean elevation (relative to local reference), elevation range (max−min within ROI), standard deviation of elevation

**Normalization:** Absolute elevation is not comparable (different datums, different planetary radii). TerraTwin uses **relative elevation above local mean** (z-score normalized) and **elevation range** as the comparison metric.

**Scientific Relevance:** Elevation range determines terrain physiography (plateau, basin, canyon, plain) which controls sediment transport, erosion patterns, and trafficability. High-elevation analogs may also serve as low-pressure Earth analogs.

---

### 4.2 Slope Angle

**Definition:** The angle of the terrain surface relative to horizontal, measured in degrees.

**How It Is Measured:**
- Derived from DEM using gradient computation (Horn 1981 algorithm)
- Slope = arctan(√((dz/dx)² + (dz/dy)²))
- Units: degrees (0° = flat; 90° = vertical)
- Computed at the native DEM resolution per body, then resampled to common comparison resolution

**Extracted Statistics:** Mean slope, maximum slope, percentage of area with slope > 5°, slope histogram

**Scientific Relevance:** Slope controls rover traversability (maximum slope for safe rover operation: ~25°–30°), sediment transport potential, erosion mode, and influences landing site safety. Direct comparison of slope distributions is scientifically rigorous.

---

### 4.3 Surface Roughness

**Definition:** The small-scale variability of surface height at scales below the DEM resolution — a measure of terrain texture and boulder density.

**How It Is Measured:**
- **DEM-derived roughness:** Standard deviation of residual elevation after subtracting a planar trend (detrended elevation variance within sliding window)
- **Vector Roughness Measure (VRM):** Circular variance of surface normal vectors within a window
- Formula: `Roughness = std(elevation residuals within N×N pixel window)`
- Window size standardized to ~500 m baseline for cross-planet comparison

**Extracted Statistics:** Mean roughness index, roughness percentile distribution (P10, P50, P90)

**Scientific Relevance:** Surface roughness controls radar backscatter (Sentinel-1, Mini-RF), trafficability at the sub-meter scale, and landing hazard assessment. Mars mission landing site safety analyses (InSight, Perseverance) used roughness as a primary criterion.

---

### 4.4 Geological Composition

**Definition:** The dominant rock type or mineral assemblage present at the surface within the region of interest.

**How It Is Measured:**
- **Earth:** USGS geological maps (rock unit polygons); EMIT surface mineralogy (L2B mineral maps); Sentinel-2 spectral band ratios for mineral discrimination
- **Mars:** USGS Tanaka 2014 geological unit maps; CRISM mineralogy (future integration)
- **Moon:** USGS Fortezzo 2020 geological unit maps

**Scoring:** Geological units are classified into a cross-planet mineral family taxonomy (TerraTwin internal classification: volcanic/basaltic, sedimentary/evaporitic, impact/breccia, regolith, mixed). A match between classification families contributes to the geology similarity score.

**Extracted Statistics:** Dominant geological class, secondary classes, fractional area coverage per class

**Scientific Relevance:** Geological composition determines chemical environment, mineral resources, trafficability (fine regolith vs. bedrock), and spectral properties observable from orbit. ISRU (In-Situ Resource Utilization) mission planning requires accurate geological characterization.

---

### 4.5 Aridity Index

**Definition:** A quantitative measure of the dryness of a region, calculated as the ratio of precipitation to potential evapotranspiration (PET).

**How It Is Measured:**
- **Earth:** Aridity Index (AI) = Mean Annual Precipitation (mm) / Potential Evapotranspiration (mm); standard UNEP definition (Middleton & Thomas, 1992)
  - Sources: WorldClim precipitation, MODIS-derived PET
  - Classification: Hyperarid (<0.05), Arid (0.05–0.20), Semi-arid (0.20–0.50), Sub-humid (0.50–0.65), Humid (>0.65)
- **Mars:** Mars is classified as hyperarid (AI ≈ 0) globally — mean annual precipitation equivalent = ~0 mm; PET extremely high due to low vapor pressure
- **Moon:** Lunar AI = 0 (no atmosphere, no precipitation, no evapotranspiration)

**Scoring:** For Mars analog comparisons, low AI (hyperarid) Earth sites score highest. For Moon comparisons, AI is not a differentiating parameter (all Earth sites are more humid than the Moon) and is weighted accordingly.

**Scientific Relevance:** Aridity controls weathering regime (chemical vs. mechanical), preservation of organic compounds, subsurface ice stability, and microbial habitability — all mission-critical parameters.

---

### 4.6 Surface Morphology

**Definition:** The large-scale landform types present in the region — the geometric "shape vocabulary" of the terrain.

**How It Is Measured:**
- Morphological classification derived from DEM analysis using Terrain Analysis algorithms:
  - **Topographic Position Index (TPI):** Classifies pixels as ridge, upper slope, mid slope, valley, plain, etc.
  - **Geomorphon classification** (Jasiewicz & Stepinski 2013): 10-class landform taxonomy from DEM alone
  - **Visual classification:** From satellite imagery — dune fields, lava plains, channels, craters, etc.
- Results expressed as fractional area of each morphological class

**Extracted Statistics:** Dominant morphological class, morphological diversity index, presence/absence of specific features (craters, channels, dunes)

**Scientific Relevance:** Morphological similarity is the most intuitive analog criterion — a region that "looks like Mars" to a geologist is primarily responding to morphological similarity. The geomorphon classification provides a computationally rigorous equivalent to expert visual assessment.

---

## 5. Category B: Mission-Environment Parameters (Not Directly Comparable)

These parameters define the **physical environment of the target planetary body** and are reported as fixed context values in TerraTwin, not as analog comparison features. No Earth location can replicate these conditions; they are invariant properties of the target world.

| Parameter | Earth Value | Mars Value | Moon Value |
|-----------|-------------|------------|------------|
| **Surface Gravity** | 9.81 m/s² | 3.72 m/s² (0.38 g) | 1.62 m/s² (0.17 g) |
| **Atmospheric Pressure** | 101.3 kPa (1 atm) | 0.6 kPa (~0.006 atm) | ~10⁻¹² Pa (vacuum) |
| **Atmospheric Composition** | 78% N₂, 21% O₂ | 95% CO₂, 3% N₂, ~1.6% Ar | None (trace exosphere) |
| **Radiation Environment** | Shielded by magnetosphere + atmosphere | High GCR + SPE flux; ~0.3 mSv/day | High GCR + SPE flux; ~1.37 mSv/day |
| **Mean Surface Temperature** | +14°C (global mean) | −60°C (global mean, range −125°C to +20°C) | −20°C mean (range −173°C to +127°C) |
| **Day Length (solar day)** | 24 hours | 24.6 hours (sol) | 29.5 Earth days |
| **Magnetic Field** | Yes (global dipole field) | No global field (crustal remnants only) | None |

> **[!IMPORTANT]**  
> These parameters are displayed in the TerraTwin interface as **Mission Environment Context** — the fixed environmental conditions that any mission to the target body must contend with. They are NOT part of the ACS computation and cannot be "matched" by any Earth analog site selection.

**Why they are excluded from ACS:**

- **Gravity:** Earth gravity is always ~9.81 m/s² at any analog site. Selecting a "flatter" site does not reduce apparent gravity. Gravity effects on mission operations (locomotion, structural loads, fluid dynamics) must be simulated through hardware/software means, not analog site selection.
- **Atmospheric pressure:** No naturally occurring location on Earth has atmospheric pressure below ~33 kPa (highest peak, Everest summit). Mars surface pressure (~0.6 kPa) is physically unachievable at any Earth surface location.
- **Radiation:** Earth's magnetosphere and atmosphere reduce surface radiation by orders of magnitude compared to Mars/Moon. Radiation testing is performed in specialized vacuum/radiation facilities, not in the field.
- **Vacuum:** No Earth surface location is a vacuum. LDEF (Long Duration Exposure Facility) experiments and thermal-vacuum chambers are used for materials testing.

---

## 6. The Similarity Formula

For each comparable feature `i`, TerraTwin computes a **per-feature similarity score** `S_i` on a 0–100 scale.

### Formula

```
S_i = 100 × (1 − min(1, |E_i − P_i| / R_i))
```

### Variable Definitions

| Symbol | Name | Description |
|--------|------|-------------|
| `S_i` | Feature Similarity Score | Score for feature `i`, ranging from 0 (completely dissimilar) to 100 (identical) |
| `E_i` | Earth Measurement | The measured value of feature `i` at the Earth analog candidate site |
| `P_i` | Planetary Target Measurement | The measured value of feature `i` at the planetary target region |
| `R_i` | Reference Range | The normalization range for feature `i` — the maximum physically meaningful difference for this feature |
| `\|E_i − P_i\|` | Absolute Difference | The absolute value of the difference between Earth and planetary measurements |
| `min(1, ...)` | Ceiling Function | Clamps the normalized difference to a maximum of 1.0 — differences larger than `R_i` all receive a score of 0 |

### Explanation

The formula computes the **normalized absolute difference** between the Earth measurement and the planetary target measurement, expressed as a fraction of the reference range `R_i`. This fraction is subtracted from 1 and scaled to 0–100:

- When `E_i = P_i` (perfect match): difference = 0 → `S_i = 100`
- When `|E_i − P_i| = R_i` (difference equals full reference range): → `S_i = 0`
- When `|E_i − P_i| > R_i` (exceeds reference range): clamped to → `S_i = 0`
- For intermediate values: score varies linearly between 0 and 100

### Reference Ranges `R_i`

Reference ranges represent the **maximum scientifically meaningful difference** for each feature. Values beyond this range are considered fully dissimilar regardless of exact magnitude.

| Feature | Reference Range `R_i` | Basis |
|---------|----------------------|-------|
| Mean Elevation (relative) | 2000 m | Typical inter-region elevation variance |
| Mean Slope | 30° | Range from flat plain (0°) to near-cliff (30°) |
| Roughness Index | 50 m | Range from smooth playa (≈0) to boulder field |
| Geological Class Match | 1.0 (binary match score) | Category match fraction 0–1 |
| Aridity Index | 1.0 (AI scale 0–1+, capped at 1) | Hyperarid to humid range |
| Morphological Match | 1.0 (class match fraction) | Dominant class fraction 0–1 |

---

## 7. The Analog Comparison Score (ACS)

The **Analog Comparison Score (ACS)** is the final, weighted aggregate of all per-feature similarity scores. It produces a single 0–100 value representing the overall analog quality of an Earth site relative to a planetary target region.

### Formula

```
ACS = (Σ w_i × S_i) / (Σ w_i)
```

Where:
- `w_i` = the weight assigned to feature `i` (see Section 8)
- `S_i` = the per-feature similarity score for feature `i` (from Section 6)
- `Σ` denotes summation over all available features with valid data

This is a **weighted mean** of per-feature scores, where higher-weight features contribute more to the final ACS.

---

### Worked Example — DEMO DATA

> **[!NOTE]**  
> All values below are **DEMO DATA** created for illustration purposes only. They do not represent real measurements of any actual location.

**Scenario:** Comparing an Earth candidate site in the Atacama Desert (DEMO) against a Mars target region in Gale Crater (DEMO).

**Step 1: Per-Feature Measurements (DEMO DATA)**

| Feature `i` | Earth Value `E_i` | Mars Target `P_i` | Reference Range `R_i` |
|-------------|------------------|------------------|----------------------|
| Elevation (relative, m) | +120 m | +95 m | 2000 m |
| Slope (mean, °) | 3.2° | 4.1° | 30° |
| Roughness (index, m) | 8.5 m | 11.2 m | 50 m |
| Geology (class match) | 0.72 | 0.72 | 1.0 |
| Aridity (AI) | 0.04 | 0.00 | 1.0 |
| Morphology (class match) | 0.80 | 0.80 | 1.0 |

**Step 2: Compute Per-Feature Similarity Scores `S_i` (DEMO DATA)**

```
Elevation:
  |E - P| = |120 - 95| = 25 m
  Normalized difference = 25 / 2000 = 0.0125
  S_elevation = 100 × (1 - 0.0125) = 100 × 0.9875 = 98.75

Slope:
  |E - P| = |3.2 - 4.1| = 0.9°
  Normalized difference = 0.9 / 30 = 0.030
  S_slope = 100 × (1 - 0.030) = 100 × 0.970 = 97.00

Roughness:
  |E - P| = |8.5 - 11.2| = 2.7 m
  Normalized difference = 2.7 / 50 = 0.054
  S_roughness = 100 × (1 - 0.054) = 100 × 0.946 = 94.60

Geology:
  |E - P| = |0.72 - 0.72| = 0.00
  Normalized difference = 0.00 / 1.0 = 0.000
  S_geology = 100 × (1 - 0.000) = 100.00

Aridity:
  |E - P| = |0.04 - 0.00| = 0.04
  Normalized difference = 0.04 / 1.0 = 0.040
  S_aridity = 100 × (1 - 0.040) = 100 × 0.960 = 96.00

Morphology:
  |E - P| = |0.80 - 0.80| = 0.00
  Normalized difference = 0.00 / 1.0 = 0.000
  S_morphology = 100 × (1 - 0.000) = 100.00
```

**Step 3: Apply Feature Weights and Compute ACS (DEMO DATA)**

| Feature | Weight `w_i` | Score `S_i` | `w_i × S_i` |
|---------|-------------|------------|------------|
| Elevation | 0.15 | 98.75 | 14.81 |
| Slope | 0.20 | 97.00 | 19.40 |
| Roughness | 0.15 | 94.60 | 14.19 |
| Geology | 0.25 | 100.00 | 25.00 |
| Aridity | 0.15 | 96.00 | 14.40 |
| Morphology | 0.10 | 100.00 | 10.00 |
| **TOTAL** | **1.00** | — | **97.80** |

```
ACS = (Σ w_i × S_i) / (Σ w_i)
    = 97.80 / 1.00
    = 97.80
```

**Result:** `ACS = 97.80` → **Very High Analog** (see Section 9)

> **[!NOTE]**  
> This result is artificially high because the DEMO DATA was constructed to show a close match. Real-world ACS values for even well-known analog sites will typically range from 60–90, reflecting the genuine differences between Earth and planetary surfaces.

---

## 8. Feature Weights Table

The default weights reflect the **scientific consensus on the relative importance of each feature for mission planning and analog quality assessment**, based on published analog research criteria and NASA mission landing site selection literature.

| Feature | Default Weight `w_i` | Justification |
|---------|--------------------:|---------------|
| **Elevation Profile** | 0.15 | Important for physiography, but absolute elevation is planet-specific; relative elevation comparison has limited analog value |
| **Slope Angle** | 0.20 | **Highest single physical importance** — slope directly determines rover traversability, landing safety, and sediment process regime; well-measured across all bodies |
| **Surface Roughness** | 0.15 | Critical for landing site safety and rover mobility; important but partially correlated with slope |
| **Geological Composition** | 0.25 | **Highest overall weight** — geological composition is the primary scientific criterion for analog research; determines chemical environment, ISRU potential, and spectroscopic comparability |
| **Aridity Index** | 0.15 | High importance for chemical weathering, preservation of organics, and habitability research; somewhat redundant with geology for hyperarid sites |
| **Morphological Class** | 0.10 | Useful qualitative indicator; partially captured by slope and roughness — lower weight to avoid double-counting |

**Total weight:** `Σ w_i = 1.00`

> **User-Configurable Weights:** TerraTwin allows mission scientists to adjust feature weights via the UI to reflect specific mission priorities. For example, a mission focused on ISRU would increase the geology weight; a landing site safety analysis would increase slope and roughness weights. Weight adjustments are logged and reported in the ACS result metadata.

---

## 9. Score Classification Table

The ACS is classified into five bands based on the magnitude of overall analog similarity.

| ACS Range | Classification | Interpretation |
|-----------|----------------|----------------|
| **90 – 100** | 🟢 **Very High Analog** | Exceptional overall match across all features; rare Earth locations; strongest scientific analog candidate |
| **75 – 89** | 🟢 **High Analog** | Strong multi-feature similarity; suitable for primary analog research and instrument testing |
| **60 – 74** | 🟡 **Moderate Analog** | Meaningful similarity in several features; useful for specific single-feature studies; important limitations exist |
| **40 – 59** | 🟠 **Limited Analog** | Some similarities present but significant feature mismatches; use with caution; suitable for preliminary screening only |
| **< 40** | 🔴 **Low / No Analog** | Insufficient overall similarity; not recommended as an analog site; major environmental differences |

**Important Classification Notes:**
- A Very High Analog score does not mean the site is a *perfect* replica — no Earth site is
- A Low Analog score for one planetary target does not exclude a site from being a good analog for a different target or different mission type
- Classification bands should be used as guidance, not strict thresholds — an ACS of 74.5 (Moderate) and 75.5 (High) represent essentially equivalent analog quality

---

## 10. Missing Data Handling

Data gaps are inevitable in multi-source, multi-planet analysis. TerraTwin applies consistent rules when one or more feature measurements are unavailable for a given Earth-planet comparison.

### Rule 1: Per-Feature Skip

If a measurement for feature `i` is missing for **either** the Earth site or the planetary target:
- Feature `i` is **excluded** from the ACS computation entirely
- It is not counted in the numerator (`Σ w_i × S_i`) or denominator (`Σ w_i`)

### Rule 2: Weight Re-normalization

After removing missing features, the remaining weights are re-normalized so they sum to 1.0:

```
w_i_adjusted = w_i / (Σ w_j for all available features j)
ACS = (Σ w_i_adjusted × S_i) / 1.0
```

**Example (DEMO DATA):** If Aridity Index data is missing for the Earth site:

| Feature | Original `w_i` | Available? | Adjusted `w_i` |
|---------|--------------|------------|---------------|
| Elevation | 0.15 | ✅ | 0.15 / 0.85 = 0.176 |
| Slope | 0.20 | ✅ | 0.20 / 0.85 = 0.235 |
| Roughness | 0.15 | ✅ | 0.15 / 0.85 = 0.176 |
| Geology | 0.25 | ✅ | 0.25 / 0.85 = 0.294 |
| Aridity | 0.15 | ❌ | — (skipped) |
| Morphology | 0.10 | ✅ | 0.10 / 0.85 = 0.118 |
| **TOTAL** | 0.85 available | — | **1.000** |

### Rule 3: Minimum Feature Requirement

A valid ACS requires a minimum of **3 features** with available data. If fewer than 3 features have valid measurements, the ACS is reported as `null` (not computed) with a data insufficiency flag.

### Rule 4: Missing Data Documentation

Every ACS result record includes:
- `features_used`: list of features included in computation
- `features_missing`: list of features excluded due to missing data
- `weight_sum_before_normalization`: the sum of original weights for available features
- `data_completeness_pct`: percentage of full weight coverage (available weight / 1.0 × 100%)

---

## 11. Uncertainty Quantification

TerraTwin reports uncertainty at three levels, reflected in ACS result metadata.

### 11.1 Data Resolution Uncertainty

Different datasets have different spatial resolutions, creating uncertainty in feature measurements extracted at a point or small area:

| Feature | Earth Resolution | Planet Resolution | Resolution Ratio | Uncertainty Contribution |
|---------|-----------------|------------------|-----------------|--------------------------|
| Elevation | 30 m (SRTM) | 463 m (MOLA) | 15.4× | High — slope/roughness particularly affected |
| Geology | 1:24K–1:500K | 1:5M–1:20M | 10–40× | Moderate — coarse unit boundaries |
| Imagery | 10 m (Sentinel-2) | 6 m (CTX) | 0.6× | Low for Mars CTX |

**Reporting:** TerraTwin reports the **effective comparison resolution** (minimum of Earth and planetary dataset resolutions) and flags comparisons where the resolution ratio exceeds 10× as **high resolution uncertainty**.

### 11.2 Measurement Uncertainty

Instrument measurement uncertainties propagate into similarity scores:

| Dataset | Vertical/Measurement Accuracy | Impact on ACS |
|---------|------------------------------|---------------|
| SRTM elevation | ±16 m (90th percentile) | ±0.8% ACS contribution from elevation |
| MOLA elevation | ±3 m (radial) | Low |
| LOLA elevation | ±1 m (radial) | Very Low |
| MODIS LST | ±1–2 K | Low for aridity proxy |
| EMIT mineralogy | ~5% mineral fraction | Moderate for geology scoring |

**Reporting:** Per-feature uncertainty in `S_i` is estimated by propagating instrument accuracy through the similarity formula: `δS_i ≈ 100 × δ|E_i - P_i| / R_i`.

### 11.3 Model Uncertainty

The ACS formula itself introduces methodological choices that carry uncertainty:
- **Reference range selection (`R_i`):** Different choices of `R_i` produce different absolute ACS values; ranges are documented and justified
- **Weight assignments (`w_i`):** Weights represent expert judgment, not empirically optimized parameters; ACS is sensitive to weight variation
- **Feature independence assumption:** Features are treated as independent; in reality, slope and roughness are correlated — this may overstate confidence in the aggregate ACS

**Reporting:** TerraTwin performs a simple **weight sensitivity analysis** for each ACS result: the ACS is recalculated with ±20% variation on each weight, and the resulting ACS range is reported as a sensitivity interval.

---

## 12. Scientific Limitations and Disclaimers

> **[!WARNING]**  
> TerraTwin is a **computational discovery tool**, not a peer-reviewed scientific instrument. The following limitations must be understood and acknowledged by all users.

### 12.1 This Is Not Peer-Reviewed Science

The TerraTwin ACS methodology has not been peer-reviewed or published in a scientific journal. The formulas, weights, and reference ranges used are grounded in published analog research literature but have not been independently validated against a comprehensive ground-truth dataset of confirmed and rejected analog sites.

### 12.2 Data Representation Limits

All computations are limited by the quality, resolution, and completeness of available datasets:
- Planetary datasets (MOLA, LOLA) have spatial resolutions 10–50× coarser than Earth datasets
- Geological maps for Mars and the Moon are interpretive remote sensing products, not field-mapped geology
- Many Earth analog regions have limited high-quality DEM coverage (e.g., remote Arctic/Antarctic sites)

### 12.3 Static Snapshots

All datasets represent specific historical time windows (SRTM: February 2000; MOLA: 1997–2001; Sentinel: 2015–present). Dynamic Earth surface processes (glacial retreat, vegetation change, land use change) mean that some Earth measurements may no longer accurately represent current conditions.

### 12.4 Single-Point Comparison Limitation

ACS computes similarity for a specified **region of interest** at a defined spatial scale. It does not capture the full complexity of landscape heterogeneity within a site. A large ROI may average out important local analog features.

### 12.5 Expert Judgment Is Required

No computational score replaces expert scientific judgment. TerraTwin scores should be used as a **screening and prioritization tool**, not as a final scientific verdict. Promising high-ACS sites should be evaluated by domain scientists with field experience before being adopted for mission planning.

---

## 13. What the ACS Score Does NOT Mean

> **[!CAUTION]**  
> The following misinterpretations of the ACS are scientifically incorrect and must not be used in mission planning, public communications, or scientific publications.

| ❌ Incorrect Interpretation | ✅ Correct Interpretation |
|-----------------------------|--------------------------|
| A high ACS confirms the Earth site is "identical to Mars/Moon" | A high ACS indicates **quantified geometric and compositional similarity** in the specific features measured |
| A high ACS means life could survive on the target planet | ACS does **not assess habitability** — it compares terrain physical properties only |
| A high ACS means the site is safe for a crewed mission landing | ACS does **not assess mission suitability** — it has no knowledge of subsurface hazards, atmospheric windows, communication geometry, or engineering requirements |
| ACS > 90 means Mars/Moon "looks like" this Earth location from orbit | ACS may score high even when visual appearance differs significantly, because it uses quantitative metrics, not visual similarity |
| A low ACS means the site has no scientific value | A low ACS for one target body may correspond to a **high ACS for a different target** or be valuable for contrasting environment studies |
| ACS confirms the presence or absence of water, ice, or organics | ACS measures **surface terrain analogy**; it makes no claims about subsurface composition, past or present water, or biological potential |
| ACS scores from different TerraTwin versions are directly comparable | ACS scores are only comparable **within the same software version** with identical reference ranges and weights |

---

*Document maintained by the TerraTwin development team. The ACS algorithm is implemented in `backend/services/analog_scoring.py`. Feature extraction pipelines are in `backend/services/feature_extraction/`. For scientific questions, refer to the references cited in Section 2.*

---

### Key References

- Middleton, N. & Thomas, D. (1992). *World Atlas of Desertification*. UNEP.
- Navarro-González, R. et al. (2003). Mars-like soils in the Atacama Desert, Chile, and the dry limit of microbial life. *Science*, 302(5647), 1018–1021.
- Tanaka, K.L. et al. (2014). *Geologic Map of Mars* (SIM 3292). USGS.
- Fortezzo, C.M. et al. (2020). *Release of the digital unified global geologic map of the Moon at 1:5,000,000-scale.* LPSC.
- Jasiewicz, J. & Stepinski, T.F. (2013). Geomorphons — a pattern recognition approach to classification and mapping of landforms. *Geomorphology*, 182, 147–156.
- Horn, B.K.P. (1981). Hill shading and the reflectance map. *Proceedings of the IEEE*, 69(1), 14–47.
- Cockell, C.S. et al. (2001). The Haughton Impact Structure as a Mars Analogue: Overview. *First Landing Conference*.
- Marchant, D.R. & Head, J.W. (2007). Antarctic dry valleys: Microclimate zonation, variable geomorphic processes, and implications for assessing climate change on Mars. *Icarus*, 192(1), 187–222.
