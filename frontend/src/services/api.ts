/**
 * TerraTwin API Client
 * Connects the frontend to the FastAPI backend with resilient fallbacks.
 */
import { Planet, ReferenceRegion, CandidateSite, DatasetItem, AnalysisSummary } from '../types';

const BASE_URL = '/api';

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
    return data.planets;
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
        reference_regions_count: 8,
        data_status: 'DEMO_DATA',
      },
      {
        id: 'moon',
        name: 'Moon',
        full_name: "Earth's Moon (Luna)",
        type: 'natural_satellite',
        distance_from_earth_km: 384400,
        radius_km: 1737.4,
        gravity_ms2: 1.62,
        atmosphere: 'None (trace exosphere)',
        surface_temperature_min_c: -173,
        surface_temperature_max_c: 127,
        primary_datasets: ['LOLA', 'LROC', 'Lunar Mineralogy Mapper'],
        reference_regions_count: 5,
        data_status: 'DEMO_DATA',
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
    return data.regions;
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
        description: 'Ancient lake-delta system. Primary landing site for NASA Perseverance rover. Contains layered carbonate and clay minerals.',
        key_features: ['ancient delta deposits', 'carbonate rocks', 'clay minerals', 'olivine'],
        primary_dataset: 'MOLA + HiRISE',
        elevation_m: -2500,
        mission_relevance: 'Perseverance Rover (Mars 2020)',
        data_status: 'DEMO_DATA',
      },
      {
        id: 'gale_crater',
        name: 'Gale Crater',
        planet: 'mars',
        latitude: -5.4,
        longitude: 137.8,
        diameter_km: 154,
        description: '5 km central mound (Aeolis Mons / Mount Sharp). Layered sedimentary record explored by NASA Curiosity rover.',
        key_features: ['layered sediments', 'sulfate minerals', 'mudstones', 'fluvial channels'],
        primary_dataset: 'MOLA + HiRISE + CRISM',
        elevation_m: -4500,
        mission_relevance: 'Curiosity Rover (MSL)',
        data_status: 'DEMO_DATA',
      },
      {
        id: 'lunar_south_pole',
        name: 'Lunar South Pole',
        planet: 'moon',
        latitude: -89.9,
        longitude: 0.0,
        diameter_km: 100,
        description: 'Permanently shadowed craters containing water ice deposits. Prime Artemis exploration target with Shackleton Crater.',
        key_features: ['permanently shadowed regions', 'water ice', 'Shackleton Crater'],
        primary_dataset: 'LOLA + LROC',
        elevation_m: -4200,
        mission_relevance: 'Artemis Program',
        data_status: 'DEMO_DATA',
      },
      {
        id: 'tycho_crater',
        name: 'Tycho Crater',
        planet: 'moon',
        latitude: -43.3,
        longitude: -11.2,
        diameter_km: 85,
        description: 'Prominent, young impact crater (~108 Ma old) with prominent ray system and exposed deep crustal central peak.',
        key_features: ['central peak', 'melt sheet', 'ejecta rays', 'young morphology'],
        primary_dataset: 'LOLA + LROC NAC',
        elevation_m: -4800,
        mission_relevance: 'Geological reference site',
        data_status: 'DEMO_DATA',
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
    return data.sites;
  } catch (err) {
    console.warn('Using client-side fallback for candidate sites', err);
    return [
      {
        id: 'atacama_desert',
        name: 'Atacama Desert (Yungay)',
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
      },
      {
        id: 'haughton_crater',
        name: 'Haughton Impact Crater',
        country: 'Canada (Devon Island, Nunavut)',
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
        why_analog: 'Pristine 23 km impact crater in polar desert; tested by NASA Haughton-Mars Project for rover traversal.',
        research_status: 'active_research_site',
        data_sources: ['NASA Haughton-Mars Project', 'USGS'],
        data_status: 'DEMO_DATA',
      },
      {
        id: 'mcmurdo_dry_valleys',
        name: 'McMurdo Dry Valleys',
        country: 'Antarctica',
        latitude: -77.5,
        longitude: 162.5,
        environment_type: 'Polar desert',
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
      },
      {
        id: 'death_valley',
        name: 'Death Valley (Badwater Basin)',
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
        integration_status: 'planned',
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
        integration_status: 'planned',
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
        integration_status: 'planned',
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
        integration_status: 'planned',
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
        integration_status: 'planned',
        data_status: 'METADATA_ONLY',
      },
    ];
  }
}

export async function runComparison(siteId: string, regionId: string): Promise<AnalysisSummary> {
  try {
    const res = await fetch(`${BASE_URL}/analysis/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ earth_site_id: siteId, planetary_region_id: regionId }),
    });
    if (!res.ok) throw new Error('Comparison failed');
    const data = await res.json();
    return data.analysis;
  } catch (err) {
    console.warn('Fallback analysis result', err);
    return {
      id: `analysis_${siteId}_${regionId}`,
      earth_site_id: siteId,
      planetary_region_id: regionId,
      methodology_version: '1.0-demo',
      features_evaluated: 4,
      features_missing: 1,
      analog_compatibility_score: 76.4,
      score_classification: 'High Similarity',
      data_quality: 'Sample / Demonstration Evaluation',
      confidence_note: 'Provisional score based on demo parameter vectors',
      created_at: new Date().toISOString(),
    };
  }
}

