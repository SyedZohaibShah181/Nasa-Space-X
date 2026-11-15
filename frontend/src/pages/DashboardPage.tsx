import React from 'react';
import {
  Satellite,
  Compass,
  Database,
  ArrowRight,
  TrendingUp,
  MapPin,
  ShieldAlert,
  Layers,
  Sparkles,
} from 'lucide-react';
import { PlanetaryBodyId, CandidateSite, ReferenceRegion } from '../types';
import { NavPage } from '../components/Navigation';

interface DashboardProps {
  selectedPlanet: PlanetaryBodyId;
  onNavigate: (page: NavPage) => void;
  onSelectSite: (site: CandidateSite) => void;
  sites: CandidateSite[];
  regions: ReferenceRegion[];
}

export const DashboardPage: React.FC<DashboardProps> = ({
  selectedPlanet,
  onNavigate,
  onSelectSite,
  sites,
  regions,
}) => {
  const filteredSites = sites.filter((s) => s.planetary_target === selectedPlanet);
  const filteredRegions = regions.filter((r) => r.planet === selectedPlanet);
  const highestScoring = [...filteredSites].sort((a, b) => b.analog_score - a.analog_score)[0];

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-r from-[#0C1322] via-[#0F192C] to-[#0A0F1D] p-6 shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-400 to-transparent pointer-events-none" />
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            NASA Space Apps Challenge 2026
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
            Discover Earth. Explore Other Worlds.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            TerraTwin leverages open planetary and Earth observation datasets from NASA, USGS,
            and ESA to identify, evaluate, and rank terrestrial environments that support
            lunar and Martian exploration research.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('map')}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
            >
              <Compass className="w-4 h-4" />
              Open Interactive Earth Map
            </button>
            <button
              onClick={() => onNavigate('compare')}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              Run Analog Comparison
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary Telemetry Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0D1424] border border-slate-800/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Target Planet</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white capitalize">{selectedPlanet} Reference</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Satellite className="w-3.5 h-3.5 text-cyan-400" />
            {filteredRegions.length} benchmark landing regions
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0D1424] border border-slate-800/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Cataloged Analogs</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white">{filteredSites.length} Terrestrial Sites</div>
          <div className="text-[11px] text-slate-400">
            Highest Score: <span className="text-emerald-400 font-semibold">{highestScoring?.analog_score}%</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0D1424] border border-slate-800/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>NASA / USGS Ingestion</span>
            <Database className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white">5 Open Catalogs</div>
          <div className="text-[11px] text-slate-400">SRTM, MOLA, LOLA, MODIS, EMIT</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0D1424] border border-slate-800/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Decoupled Metrics</span>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white">Category B Isolated</div>
          <div className="text-[11px] text-slate-400">Gravity & vacuum isolated from ACS</div>
        </div>
      </div>

      {/* Main Grid: Top Ranked Analog Candidate & Active Planetary Target Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spotlight Site Card */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#0D1424] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                Featured Terrestrial Analog ({selectedPlanet.toUpperCase()} Target)
              </h2>
              <p className="text-xs text-slate-400">
                Highest ranked candidate based on provisional Analog Compatibility Score.
              </p>
            </div>
            <button
              onClick={() => onNavigate('map')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              View on Map <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {highestScoring && (
            <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-white">{highestScoring.name}</h3>
                  <div className="text-xs text-slate-400">
                    {highestScoring.country} • {highestScoring.latitude.toFixed(2)}°, {highestScoring.longitude.toFixed(2)}°
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-cyan-400">{highestScoring.analog_score}%</div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Analog Compatibility</div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded border border-slate-800/80">
                {highestScoring.why_analog}
              </p>

              {/* Feature Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60">
                  <div className="text-[10px] text-slate-400">Elevation</div>
                  <div className="font-semibold text-slate-200">{highestScoring.features.elevation_m} m</div>
                </div>
                <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60">
                  <div className="text-[10px] text-slate-400">Climate</div>
                  <div className="font-semibold text-slate-200 capitalize">{highestScoring.features.aridity}</div>
                </div>
                <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60">
                  <div className="text-[10px] text-slate-400">Rainfall</div>
                  <div className="font-semibold text-slate-200">{highestScoring.features.annual_rainfall_mm} mm/yr</div>
                </div>
                <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60">
                  <div className="text-[10px] text-slate-400">Data Status</div>
                  <div className="font-semibold text-amber-400 font-mono text-[11px]">{highestScoring.data_status}</div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => onSelectSite(highestScoring)}
                  className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  Inspect Scientific Profile
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Reference Sites Summary */}
        <div className="p-5 rounded-xl bg-[#0D1424] border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Target Reference Sites
            </h2>
            <button
              onClick={() => onNavigate('regions')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              All Sites
            </button>
          </div>

          <div className="space-y-2.5">
            {filteredRegions.slice(0, 3).map((r) => (
              <div
                key={r.id}
                className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-200">{r.name}</div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {r.diameter_km} km ø
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {r.description}
                </div>
                <div className="mt-2 text-[10px] text-cyan-400 font-medium">
                  Mission: {r.mission_relevance}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('regions')}
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              Browse All Reference Sites
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
