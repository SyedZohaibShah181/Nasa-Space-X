import React, { useState } from 'react';
import {
  Satellite,
  Compass,
  Database,
  ArrowRight,
  TrendingUp,
  MapPin,
  ShieldAlert,
  Sparkles,
  Maximize2,
  Scan,
  Activity,
  Layers,
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
  const [showAnalysisViewer, setShowAnalysisViewer] = useState(false);

  const filteredSites = sites.filter((s) => s.planetary_target === selectedPlanet);
  const filteredRegions = regions.filter((r) => r.planet === selectedPlanet);
  const highestScoring = [...filteredSites].sort((a, b) => b.analog_score - a.analog_score)[0];

  const isMars = selectedPlanet === 'mars';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Cosmic Hero Header with Flowing Visual Background */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-[#120B07] via-[#0B101E] to-[#050811] p-6 lg:p-8 shadow-2xl shadow-orange-950/20">
        {/* Subtle Ambient Cosmic Glows */}
        <div className="absolute -right-10 -top-10 w-96 h-96 rounded-full bg-gradient-to-br from-[#C84B31]/20 via-[#E59840]/15 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-80 h-80 rounded-full bg-gradient-to-tr from-[#06B6D4]/15 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-3xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-[#C84B31]/30 to-[#E59840]/20 text-amber-300 border border-amber-500/40 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            NASA Space Apps Challenge 2026 • Planetary Research Suite
          </div>

          <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
            Discover Earth. <span className="bg-gradient-to-r from-[#E59840] via-[#F59E0B] to-[#C84B31] bg-clip-text text-transparent">Explore Other Worlds.</span>
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
            TerraTwin correlates open planetary and Earth observation data from NASA, USGS, and ESA
            to discover, characterize, and rank terrestrial environments that support lunar and Martian exploration.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('map')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C84B31] to-[#E59840] hover:from-[#B83A20] hover:to-[#D97706] text-white text-xs font-bold flex items-center gap-2 transition-all duration-300 shadow-lg shadow-orange-900/40 hover:shadow-orange-700/60 hover:-translate-y-0.5 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              Launch Analog Geospatial Map
            </button>
            <button
              onClick={() => onNavigate('compare')}
              className="px-4 py-2.5 rounded-xl bg-[#0E1626] hover:bg-[#152038] text-amber-200 text-xs font-semibold border border-amber-500/30 flex items-center gap-1.5 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            >
              Run Comparative Analysis
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
            <button
              onClick={() => setShowAnalysisViewer(!showAnalysisViewer)}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all duration-300 cursor-pointer"
            >
              <Scan className="w-3.5 h-3.5 text-cyan-400" />
              {showAnalysisViewer ? 'Hide AI Crater Network' : 'Inspect AI Crater Detection'}
            </button>
          </div>
        </div>
      </div>

      {/* Featured AI Deep Crater Detection Network Analysis (User's Uploaded Architecture) */}
      {showAnalysisViewer && (
        <div className="rounded-2xl border border-amber-500/40 bg-[#070B16] p-5 shadow-2xl animate-fade-in space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-950 text-amber-400 border border-orange-700/60 flex items-center justify-center">
                <Scan className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  AI Deep Crater Detection System (Moon & Mars Comparison)
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    CraterNet v3.2
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  LRO LROC NAC (0.5 m/px) vs. MRO HiRISE (0.25 m/px) automated surface crater density mapping.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAnalysisViewer(false)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Close
            </button>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-inner bg-black">
            <img
              src="/images/lunar_martian_analysis.jpg"
              alt="Lunar and Martian AI Surface Analysis"
              className="w-full h-auto max-h-[500px] object-contain mx-auto"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
            <div className="p-3 rounded-xl bg-[#0C1222] border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Lunar Craters Detected</div>
              <div className="text-base font-bold text-slate-100">1,248 craters</div>
              <div className="text-[10px] text-cyan-400">Density: 18.7 / km²</div>
            </div>
            <div className="p-3 rounded-xl bg-[#0C1222] border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Martian Craters Detected</div>
              <div className="text-base font-bold text-orange-400">2,193 craters</div>
              <div className="text-[10px] text-amber-300">Density: 27.3 / km²</div>
            </div>
            <div className="p-3 rounded-xl bg-[#0C1222] border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">AI Neural Net Throughput</div>
              <div className="text-base font-bold text-emerald-400">2.4 GB/s</div>
              <div className="text-[10px] text-slate-400">GPU Load: 78% • Operational</div>
            </div>
            <div className="p-3 rounded-xl bg-[#0C1222] border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Surface Age Modeling</div>
              <div className="text-base font-bold text-slate-200">3.2 Ga (Moon) / 3.7 Ga (Mars)</div>
              <div className="text-[10px] text-slate-400">Equirectangular projection</div>
            </div>
          </div>
        </div>
      )}

      {/* Planetary Atmosphere & Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flow-card rounded-2xl p-4.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-amber-300/80">Active Target</span>
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse shadow-sm shadow-orange-500" />
          </div>
          <div className="text-2xl font-black text-white capitalize flex items-center gap-2">
            {selectedPlanet} Reference
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Satellite className="w-3.5 h-3.5 text-amber-400" />
            {filteredRegions.length} verified mission landing regions
          </div>
        </div>

        <div className="flow-card rounded-2xl p-4.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-amber-300/80">Analog Candidates</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{filteredSites.length} Terrestrial Sites</div>
          <div className="text-xs text-slate-400">
            Top Compatibility: <span className="text-emerald-400 font-bold">{highestScoring?.analog_score}%</span>
          </div>
        </div>

        <div className="flow-card rounded-2xl p-4.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-amber-300/80">NASA Open Datasets</span>
            <Database className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">5 Active Pipelines</div>
          <div className="text-xs text-slate-400">SRTM 30m, MOLA 463m, LOLA 118m</div>
        </div>

        <div className="flow-card rounded-2xl p-4.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-amber-300/80">Physical Boundaries</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-white">Category B Decoupled</div>
          <div className="text-xs text-slate-400">Gravity & vacuum isolated from ACS</div>
        </div>
      </div>

      {/* Main Grid: Featured Terrestrial Analog with High-Res Photography */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spotlight Terrestrial Analog Card */}
        <div className="lg:col-span-2 flow-card rounded-2xl overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                Featured Earth Analog ({selectedPlanet.toUpperCase()} Target)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Highest scoring candidate based on normalized topographical and geochemical vectors.
              </p>
            </div>
            <button
              onClick={() => onNavigate('map')}
              className="text-xs text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 cursor-pointer"
            >
              Open on Map <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {highestScoring && (
            <div className="space-y-4">
              {/* Photo & Identity Banner */}
              <div className="relative rounded-xl overflow-hidden h-52 border border-slate-800/80 group">
                <img
                  src={highestScoring.image_url}
                  alt={highestScoring.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060A14] via-[#060A14]/40 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-orange-600/80 text-white border border-orange-400/50">
                      {highestScoring.environment_type}
                    </span>
                    <h3 className="text-xl font-black text-white mt-1 drop-shadow-md">
                      {highestScoring.name}
                    </h3>
                    <div className="text-xs text-slate-300 drop-shadow">
                      {highestScoring.country} • Lat: {highestScoring.latitude.toFixed(2)}°, Lon: {highestScoring.longitude.toFixed(2)}°
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-amber-400 glow-butterscotch">
                      {highestScoring.analog_score}%
                    </div>
                    <div className="text-[9px] uppercase font-bold text-amber-200/70 tracking-wider">
                      Compatibility (ACS)
                    </div>
                  </div>
                </div>
              </div>

              {/* Rationale Quote */}
              <p className="text-xs text-slate-300 leading-relaxed bg-[#080D1A]/90 p-4 rounded-xl border border-slate-800/80">
                {highestScoring.why_analog}
              </p>

              {/* Feature Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-[#0A0F1E] border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Elevation ASL</div>
                  <div className="font-bold text-slate-200">{highestScoring.features.elevation_m} m</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0A0F1E] border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Climate Classification</div>
                  <div className="font-bold text-slate-200 capitalize">{highestScoring.features.aridity}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0A0F1E] border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Annual Rainfall</div>
                  <div className="font-bold text-slate-200">{highestScoring.features.annual_rainfall_mm} mm/yr</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0A0F1E] border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Verification Status</div>
                  <div className="font-bold text-emerald-400 font-mono text-[11px]">{highestScoring.data_status}</div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => onSelectSite(highestScoring)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C84B31] to-[#E59840] hover:from-[#B83A20] hover:to-[#D97706] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-orange-950/40"
                >
                  Inspect Site Profile
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Reference Landing Sites Cards with Mars/Moon Photo Accents */}
        <div className="flow-card rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Target Benchmark Sites
            </h2>
            <button
              onClick={() => onNavigate('regions')}
              className="text-xs text-amber-300 hover:text-amber-200 font-bold cursor-pointer"
            >
              View All ({filteredRegions.length})
            </button>
          </div>

          <div className="space-y-3">
            {filteredRegions.slice(0, 3).map((r) => (
              <div
                key={r.id}
                className="rounded-xl overflow-hidden bg-[#0A0F1E] border border-slate-800/80 hover:border-amber-500/50 transition-all duration-300 group cursor-pointer"
                onClick={() => onNavigate('regions')}
              >
                <div className="h-24 relative overflow-hidden">
                  <img
                    src={r.image_url}
                    alt={r.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-transparent to-transparent" />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono text-amber-300 border border-amber-500/30">
                    {r.diameter_km} km ø
                  </div>
                </div>

                <div className="p-3 space-y-1">
                  <div className="font-bold text-xs text-slate-100 group-hover:text-amber-200 transition-colors">
                    {r.name}
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {r.description}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-semibold pt-1 flex items-center gap-1">
                    <Satellite className="w-3 h-3" />
                    {r.mission_relevance}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('regions')}
            className="w-full py-2.5 rounded-xl bg-[#0E1626] hover:bg-[#142036] text-amber-200 text-xs font-bold border border-amber-500/30 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            Explore All Benchmark Sites
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
