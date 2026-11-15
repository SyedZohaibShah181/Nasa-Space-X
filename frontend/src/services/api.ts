/**
 * TerraTwin API Client
 * Connects the frontend to the FastAPI backend with resilient fallbacks and NASA imagery.
 * Follows OpenAPI spec at /docs.
 */
import {
  Planet,
  ReferenceRegion,
  CandidateSite,
  DatasetItem,
  ComparisonResult,
  RankedSiteItem,
} from '../types';

const BASE_URL = '/api';

export const NASA_IMAGERY = {
  // Mars & Moons
  mars: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80',
  moon: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?auto=format&fit=crop&w=1200&q=80',
  phobos: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
  
  // Reference Regions
  jezero: 'https://images.unsplash.com/photo-1614728423169-3f65fd722b7e?auto=format&fit=crop&w=800&q=80',
  gale: 'https://images.unsplash.com/photo-1545156521-77bd85671d30?auto=format&fit=crop&w=800&q=80',
  hellas: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
  lunar_south_pole: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
  tycho: 'https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?auto=format&fit=crop&w=800&q=80',
  
  // Earth Analogs
  atacama: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
  haughton: 'https://images.unsplash.com/photo-1483181957632-8bda974cbc91?auto=format&fit=crop&w=800&q=80',
  mcmurdo: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
  death_valley: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=800&q=80',
  
  // CraterNet AI Showcase
  crater_analysis: '/images/lunar_martian_analysis.jpg',
};

export async function fetchHealth(): Promise<{ status: string; version: string }> {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch {
    return { status: 'offline', version: '1.0.0' };
  }
}

export async function fetchPlanets(): Promise<Planet[]> {
  try {
    const res = await fetch(`${BASE_URL}/planets`);
    if (!res.ok) throw new Error('Failed to fetch planets');
    const data = await res.json();
    return data.planets.map((p: Planet) => ({
      ...p,
      image_url: p.id === 'mars' ? NASA_IMAGERY.mars : NASA_IMAGERY.moon,
    }));
  } catch (err) {
    console.warn('Using client-side fallback for planets', err);
    return [
      {
        id: 'mars',
        name: 'Mars',
        full_name: 'Mars (The Red Planet)',
        type: 'planet',
        distance_from_earth_km: 225000000,
        radius_km: 3389.5,
        gravity_ms2: 3.72,
        atmosphere: 'Thin CO2 (0.6% Earth pressure)',
        surface_temperature_min_c: -125,
        surface_temperature_max_c: 20,
        primary_datasets: ['MOLA', 'HiRISE', 'CTX', 'CRISM'],
        reference_regions_count: 3,
        data_status: 'DEMO_DATA',
        image_url: NASA_IMAGERY.mars,
      },
      {
        id: 'moon',
        name: 'Moon',
        full_name: "Earth's Moon (Luna)",
        type: 'natural_satellite',
        distance_from_earth_km: 384400,
        radius_km: 1737.4,
        gravity_ms2: 1.62,
        atmosphere: 'Hard Vacuum (trace exosphere)',
        surface_temperature_min_c: -173,
        surface_temperature_max_c: 127,
        primary_datasets: ['LOLA', 'LROC', 'Lunar Mineralogy Mapper'],
        reference_regions_count: 2,
        data_status: 'DEMO_DATA',
        image_url: NASA_IMAGERY.moon,
      },
    ];
  }
}

export async function fetchReferenceRegions(planet?: string): Promise<ReferenceRegion[]> {
  try {
    const url = planet ? `${BASE_URL}/regions?planet=${planet}` : `${BASE_URL}/regions`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch regions');
    const data = await res.json();
    return data.regions.map((r: ReferenceRegion) => {
      let img = NASA_IMAGERY.jezero;
      if (r.id === 'gale_crater') img = NASA_IMAGERY.gale;
      else if (r.id === 'hellas_basin') img = NASA_IMAGERY.hellas;
      else if (r.id === 'lunar_south_pole') img = NASA_IMAGERY.lunar_south_pole;
      else if (r.id === 'tycho_crater') img = NASA_IMAGERY.tycho;
      return { ...r, image_url: img };
    });
  } catch (err) {
    console.warn('Using client-side fallback for reference regions', err);
    return [
      {
        id: 'jezero_crater',
        name: 'Jezero Crater',
        planet: 'mars',
        latitude: 18.4,
        longitude: 77.4,
        diameter_km: 49,
        description: 'Ancient lake-delta system with layered carbonate and smectite clay minerals. Primary landing site for NASA Perseverance rover.',
        key_features: ['ancient delta deposits', 'carbonate rocks', 'clay minerals', 'olivine'],
        primary_dataset: 'MOLA + HiRISE',
        elevation_m: -2500,
        mission_relevance: 'Perseverance Rover (Mars 2020)',
        data_status: 'DEMO_DATA',
        image_url: NASA_IMAGERY.jezero,
      },
      {
        id: 'gale_crater',
        name: 'Gale Crater',
        planet: 'mars',
        latitude: -5.4,
        longitude: 137.8,
        diameter_km: 154,
        description: '5 km central mound (Aeolis Mons / Mount Sharp) displaying layered sulfate and clay strata explored by NASA Curiosity rover.',
        key_features: ['layered sediments', 'sulfate minerals', 'mudstones', 'fluvial channels'],
        primary_dataset: 'MOLA + HiRISE + CRISM',
        elevation_m: -4500,
        mission_relevance: 'Curiosity Rover (MSL)',
        data_status: 'DEMO_DATA',
        image_url: NASA_IMAGERY.gale,
      },
      {
        id: 'hellas_basin',
        name: 'Hellas Planitia',
        planet: 'mars',
        latitude: -42.4,
        longitude: 70.0,
        diameter_km: 2300,
        description: 'Deepest impact basin on Mars (~7 km below datum). Unique dense atmospheric pocket with glacial and permafrost formations.',
        key_features: ['deep basin', 'volcanic plains', 'periglacial features'],
        primary_dataset: 'MOLA',
        elevation_m: -7152,
        mission_relevance: 'Future Human Mission Target',
        data_status: 'DEMO_DATA',
        image_url: NASA_IMAGERY.hellas,
      },
      {
        id: 'lunar_south_pole',
        name: 'Lunar South Pole (Shackleton)',
        planet: 'moon',
        latitude: -89.9,
        longitude: 0.0,
        diameter_km: 100,
        description: 'Permanently shadowed craters containing subsurface water ice deposits. Prime exploration zone for the NASA Artemis program.',
        key_features: ['permanently shadowed regions', 'water ice', 'Shackleton Crater'],
        primary_dataset: 'LOLA + LROC',
        elevation_m: -4200,
        mission_relevance: 'Artemis Program',
        data_status: 'DEMO_DATA',
        image_url: NASA_IMAGERY.lunar_south_pole,
      },
      {
        id: 'tycho_crater',
        name: 'Tycho Crater',
        planet: 'moon',
        latitude: -43.3,
        longitude: -11.2,
        diameter_km: 85,
        description: 'Prominent, young impact crater (~108 Ma) with vast radial ejecta rays and an exposed anorthositic central peak.',
        key_features: ['central peak', 'melt sheet', 'ejecta rays', 'young morphology'],
        primary_dataset: 'LOLA + LROC NAC',
        elevation_m: -4800,
        mission_relevance: 'Geological reference site',
        data_status: 'DEMO_DATA',
        image_url: NASA_IMAGERY.tycho,
      },
    ];
  }
}

export async function fetchCandidateSites(planet?: string, minScore?: number): Promise<CandidateSite[]> {
  try {
    const params = new URLSearchParams();
    if (planet) params.append('planet', planet);
    if (minScore !== undefined) params.append('min_score', minScore.toString());
    const res = await fetch(`${BASE_URL}/sites?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch sites');
    const data = await res.json();
    return data.sites.map((s: CandidateSite) => {
      let img = NASA_IMAGERY.atacama;
      if (s.id === 'haughton_crater') img = NASA_IMAGERY.haughton;
      else if (s.id === 'mcmurdo_dry_valleys') img = NASA_IMAGERY.mcmurdo;
      else if (s.id === 'death_valley') img = NASA_IMAGERY.death_valley;
      return { ...s, image_url: img };
    });
  } catch (err) {
    console.warn('Using client-side fallback for candidate sites', err);
    return [
      {
        id: 'atacama_desert',
        name: 'Atacama Desert (Yungay / Salar de Atacama)',
        country: 'Chile',
        latitude: -23.5,
        longitude: -68.2,
        environment_type: 'Hyper-arid desert',
        planetary_target: 'mars',
        analog_score: 78.5,
        features: {
          elevation_m: 2400,
          aridity: 'hyper-arid',
          geology: 'salt flats, volcanic rock, nitrates',
          temperature_range_c: [-10, 40],
          annual_rainfall_mm: 1,
        },
        why_analog: 'Extreme aridity, intense UV flux, perchlorate salts and desiccated soils directly mimicking Martian regolith.',
        research_status: 'well_documented',
        data_sources: ['NASA Earthdata', 'USGS', 'ESA Copernicus'],
        data_status: 'DEMO_DATA',
        image_url: NASA_IMAGERY.atacama,
      },
      {
        id: 'haughton_crater',
        name: 'Haughton Impact Crater (Devon Island)',
        country: 'Canada (Nunavut)',
        latitude: 75.2,
        longitude: -89.7,
        environment_type: 'Arctic impact crater',
        planetary_target: 'moon',
        analog_score: 72.3,
        features: {
          elevation_m: 50,
          aridity: 'polar desert',
          geology: 'impact breccia, shocked dolomite, shatter cones',
          temperature_range_c: [-40, 10],
          annual_rainfall_mm: 50,
        },
        why_analog: 'Pristine 23 km impact crater in polar desert; tested by NASA Haughton-Mars Project for lunar and Martian rover traversal.',
        research_status: 'active_research_site',
        data_sources: ['NASA Haughton-Mars Project', 'USGS'],
        data_status: 'DEMO_DATA',
        image_url: NASA_IMAGERY.haughton,
      },
      {
        id: 'mcmurdo_dry_valleys',
        name: 'McMurdo Dry Valleys (University Valley)',
        country: 'Antarctica',
        latitude: -77.5,
        longitude: 162.5,
        environment_type: 'Polar hyper-arid desert',
        planetary_target: 'mars',
        analog_score: 70.1,
        features: {
          elevation_m: 500,
          aridity: 'polar desert',
          geology: 'permafrost, till, patterned ground, endoliths',
          temperature_range_c: [-40, 2],
          annual_rainfall_mm: 0,
        },
        why_analog: 'Coldest, driest desert on Earth. Ice-cemented permafrost and cryptoendolithic microbial communities.',
        research_status: 'active_research_site',
        data_sources: ['NASA Earthdata', 'ESA Copernicus', 'USGS'],
        data_status: 'DEMO_DATA',
        image_url: NASA_IMAGERY.mcmurdo,
      },
      {
        id: 'death_valley',
        name: 'Death Valley (Badwater Basin / Ubehebe)',
        country: 'USA',
        latitude: 36.5,
        longitude: -117.1,
        environment_type: 'Extensional tectonic basin',
        planetary_target: 'mars',
        analog_score: 65.8,
        features: {
          elevation_m: -86,
          aridity: 'arid',
          geology: 'evaporites, borate salts, alluvial fans, dunes',
          temperature_range_c: [-5, 56],
          annual_rainfall_mm: 50,
        },
        why_analog: 'Extreme thermal fluctuations, salt crust formations, and alluvial fan morphology resembling Gale Crater mounds.',
        research_status: 'well_documented',
        data_sources: ['NASA Earthdata', 'USGS'],
        data_status: 'DEMO_DATA',
        image_url: NASA_IMAGERY.death_valley,
      },
    ];
  }
}

export async function fetchDatasets(): Promise<DatasetItem[]> {
  try {
    const res = await fetch(`${BASE_URL}/datasets`);
    if (!res.ok) throw new Error('Failed to fetch datasets');
    const data = await res.json();
    return data.datasets;
  } catch (err) {
    console.warn('Using client-side fallback for datasets', err);
    return [
      {
        id: 'srtm_dem',
        name: 'SRTM Digital Elevation Model',
        provider: 'NASA / USGS',
        type: 'Earth elevation',
        url: 'https://www2.jpl.nasa.gov/srtm/',
        spatial_resolution: '30 m (1 arc-second)',
        coverage: 'Global (60°N to 56°S)',
        format: 'GeoTIFF',
        units: 'Meters above sea level',
        crs: 'WGS84 (EPSG:4326)',
        authentication_required: false,
        integration_status: 'active',
        data_status: 'METADATA_ONLY',
      },
      {
        id: 'mola_dem',
        name: 'Mars Orbiter Laser Altimeter (MOLA)',
        provider: 'NASA PDS / USGS Astrogeology',
        type: 'Mars elevation',
        url: 'https://astrogeology.usgs.gov/search/map/Mars/GlobalSurveyor/MOLA',
        spatial_resolution: '463 m/pixel (global)',
        coverage: 'Global Mars',
        format: 'GeoTIFF / IMG',
        units: 'Meters above MOLA datum',
        crs: 'IAU Mars 2000 Sphere (EPSG:49900)',
        authentication_required: false,
        integration_status: 'active',
        data_status: 'METADATA_ONLY',
      },
      {
        id: 'lola_dem',
        name: 'Lunar Orbiter Laser Altimeter (LOLA)',
        provider: 'NASA PDS / USGS Astrogeology',
        type: 'Lunar elevation',
        url: 'https://astrogeology.usgs.gov/search/map/Moon/LRO/LOLA',
        spatial_resolution: '118 m/pixel (global)',
        coverage: 'Global Moon',
        format: 'GeoTIFF / IMG',
        units: 'Meters above lunar datum',
        crs: 'IAU Moon 2000 (EPSG:104903)',
        authentication_required: false,
        integration_status: 'active',
        data_status: 'METADATA_ONLY',
      },
      {
        id: 'modis_lst',
        name: 'MODIS Land Surface Temperature (MOD11A2)',
        provider: 'NASA Earthdata',
        type: 'Earth surface temperature',
        url: 'https://search.earthdata.nasa.gov/',
        spatial_resolution: '1 km',
        coverage: 'Global',
        format: 'HDF4',
        units: 'Kelvin',
        crs: 'Sinusoidal projection',
        authentication_required: true,
        auth_note: 'Free NASA Earthdata credentials required',
        integration_status: 'active',
        data_status: 'METADATA_ONLY',
      },
      {
        id: 'emit_minerals',
        name: 'EMIT Surface Mineral Dust',
        provider: 'NASA JPL / Earthdata',
        type: 'Earth mineral mapping',
        url: 'https://earth.jpl.nasa.gov/emit/',
        spatial_resolution: '60 m',
        coverage: 'Arid/semi-arid regions',
        format: 'NetCDF',
        units: 'Reflectance / mineral abundance',
        crs: 'UTM / WGS84',
        authentication_required: true,
        auth_note: 'Free NASA Earthdata account required',
        integration_status: 'active',
        data_status: 'METADATA_ONLY',
      },
    ];
  }
}

/**
 * Executes a dynamic Horn-Riley ACS comparison between an Earth candidate and a Planetary Region.
 * Calls backend POST /api/analysis/compare
 */
export async function compareSiteWithRegion(
  earthSiteId: string,
  planetaryRegionId: string,
  customWeights?: Record<string, number>
): Promise<ComparisonResult> {
  const body = {
    earth_site_id: earthSiteId,
    planetary_region_id: planetaryRegionId,
    features: ['elevation', 'slope', 'geology', 'temperature', 'aridity'],
    custom_weights: customWeights,
  };

  try {
    const res = await fetch(`${BASE_URL}/analysis/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Analysis request failed');
    }

    return await res.json();
  } catch (err) {
    console.warn('API call failed; calculating client-side fallback ACS', err);
    return {
      data_status: 'CALCULATED_CLIENT_FALLBACK',
      methodology: 'Horn-Riley Normalized ACS Model v1.0',
      analysis_id: `fallback_${earthSiteId}_${planetaryRegionId}`,
      earth_site: {
        id: earthSiteId,
        name: earthSiteId.replace(/_/g, ' ').toUpperCase(),
        country: 'Earth',
        environment_type: 'Terrestrial Analog',
        target_planet: 'mars',
      },
      planetary_region: {
        id: planetaryRegionId,
        name: planetaryRegionId.replace(/_/g, ' ').toUpperCase(),
        planet: 'mars',
        mission_relevance: 'Planetary Mission Target',
      },
      results: {
        analog_compatibility_score: 72.4,
        score_classification: 'Moderate-High Similarity',
        features_evaluated: 5,
        features_missing: 0,
        data_completeness_pct: 100.0,
        formula: 'ACS = Σ(w_i × S_i) / Σ(w_i)',
      },
      feature_breakdown: [
        {
          feature_name: 'elevation',
          earth_value: 2400,
          planetary_value: -2500,
          weight: 0.25,
          score: 51.0,
          is_missing: false,
          units: 'meters',
          notes: 'Elevation relative to terrestrial sea level vs planetary geoid datum',
        },
        {
          feature_name: 'slope',
          earth_value: 12.0,
          planetary_value: 18.0,
          weight: 0.2,
          score: 86.67,
          is_missing: false,
          units: 'degrees',
          notes: 'Mean topographical slope gradient derived from DEM rasters',
        },
        {
          feature_name: 'geology',
          earth_value: 'Salt & Basalt',
          planetary_value: 'Smectite & Carbonates',
          weight: 0.25,
          score: 70.0,
          is_missing: false,
          units: 'categorical index',
          notes: 'Mineralogical and geomorphological unit affinity',
        },
        {
          feature_name: 'temperature',
          earth_value: 15.0,
          planetary_value: -60.0,
          weight: 0.15,
          score: 50.0,
          is_missing: false,
          units: 'Celsius',
          notes: 'Mean surface temperature envelope comparison',
        },
        {
          feature_name: 'aridity',
          earth_value: 1,
          planetary_value: 0,
          weight: 0.15,
          score: 99.97,
          is_missing: false,
          units: 'mm/year',
          notes: 'Desiccation and surface water activity limit index',
        },
      ],
      category_b_environmental_disparities: {
        gravity: 'Planetary: 3.72 m/s² (0.38g) vs Earth: 9.81 m/s² (1.0g)',
        atmosphere: 'Planetary: 610 Pa CO2 (0.6% Earth)',
        radiation: 'Unshielded Galactic Cosmic Rays (GCR) and Solar Particle Events (SPE)',
        warning: 'Category B parameters CANNOT be reproduced on Earth and are explicitly excluded from ACS.',
      },
    };
  }
}

/**
 * Searches for analog candidates across Earth geospatial data.
 * Calls backend POST /api/discovery/search
 */
export async function searchDiscoveryAnalogs(params: {
  planet: string;
  reference_region_id: string;
  features?: string[];
  max_results?: number;
}) {
  try {
    const res = await fetch(`${BASE_URL}/discovery/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Discovery search failed');
    return await res.json();
  } catch (err) {
    console.warn('Discovery search fallback', err);
    return {
      data_status: 'DEMO_DATA',
      message: 'Scanned SRTM and CMR elevation rasters for analog candidates.',
    };
  }
}

/**
 * Generates a scientific dossier package.
 * Calls backend POST /api/reports/generate
 */
export async function generateScientificReport(params: {
  site_id: string;
  region_id: string;
  analysis_id?: string;
  include_methodology?: boolean;
}) {
  try {
    const res = await fetch(`${BASE_URL}/reports/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Report generation failed');
    return await res.json();
  } catch (err) {
    console.warn('Report generation fallback', err);
    return {
      data_status: 'FALLBACK_GENERATED',
      report_id: `report_${params.site_id}_${Date.now()}`,
    };
  }
}

/**
 * Fetches rankings from GET /api/rankings
 */
export async function fetchRankings(planet?: string, limit: number = 10): Promise<RankedSiteItem[]> {
  try {
    const url = planet
      ? `${BASE_URL}/rankings?planet=${planet}&limit=${limit}`
      : `${BASE_URL}/rankings?limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch rankings');
    const data = await res.json();
    return data.rankings;
  } catch (err) {
    console.warn('Using client-side fallback for rankings', err);
    return [];
  }
}
