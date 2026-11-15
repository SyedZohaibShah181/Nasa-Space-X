/**
 * TerraTwin TypeScript Type Definitions
 * =====================================
 * Structured data types for the Earth-Moon-Mars Analog Discovery Platform.
 */

export type PlanetaryBodyId = 'moon' | 'mars';

export interface Planet {
  id: PlanetaryBodyId;
  name: string;
  full_name: string;
  type: string;
  distance_from_earth_km: number;
  radius_km: number;
  gravity_ms2: number;
  atmosphere: string;
  surface_temperature_min_c: number;
  surface_temperature_max_c: number;
  primary_datasets: string[];
  reference_regions_count: number;
  data_status: string;
}

export interface ReferenceRegion {
  id: string;
  name: string;
  planet: PlanetaryBodyId;
  latitude: number;
  longitude: number;
  diameter_km: number;
  description: string;
  key_features: string[];
  primary_dataset: string;
  elevation_m: number;
  mission_relevance: string;
  data_status: string;
}

export interface CandidateSite {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  environment_type: string;
  planetary_target: PlanetaryBodyId;
  analog_score: number;
  features: {
    elevation_m: number;
    aridity: string;
    geology: string;
    temperature_range_c: [number, number];
    annual_rainfall_mm: number;
  };
  why_analog: string;
  research_status: string;
  data_sources: string[];
  data_status: string;
}

export interface DatasetItem {
  id: string;
  name: string;
  provider: string;
  type: string;
  url: string;
  spatial_resolution: string;
  coverage: string;
  format: string;
  units: string;
  crs: string;
  authentication_required: boolean;
  auth_note?: string;
  integration_status: string;
  data_status: string;
}

export interface FeatureWeightConfig {
  topography: number;
  geology: number;
  roughness: number;
  temperature: number;
  aridity: number;
}

export interface AnalysisSummary {
  id: string;
  earth_site_id: string;
  planetary_region_id: string;
  methodology_version: string;
  features_evaluated: number;
  features_missing: number;
  analog_compatibility_score: number | null;
  score_classification: string;
  data_quality: string;
  confidence_note: string;
  created_at: string;
}

