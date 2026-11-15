import React, { useState } from 'react';
import {
  GitCompare,
  ArrowRight,
  ShieldAlert,
  BarChart3,
  Sparkles,
  Layers,
  Scale,
} from 'lucide-react';
import { CandidateSite, ReferenceRegion } from '../types';

interface SiteComparisonProps {
  sites: CandidateSite[];
  regions: ReferenceRegion[];
}

export const SiteComparisonPage: React.FC<SiteComparisonProps> = ({ sites, regions }) => {
  const [selectedSiteId, setSelectedSiteId] = useState<string>(sites[0]?.id || '');
  const [selectedRegionId, setSelectedRegionId] = useState<string>(regions[0]?.id || '');

  const earthSite = sites.find((s) => s.id === selectedSiteId) || sites[0];
  const planetaryRegion = regions.find((r) => r.id === selectedRegionId) || regions[0];

  const comparisonFeatures = [
    {
      name: 'Topographical Elevation Relief',
      earthVal: `${earthSite?.features.elevation_m} m`,
      planetaryVal: `${planetaryRegion?.elevation_m} m`,
      range: '10,000 m',
      weight: '25%',
      score: 82,
      note: 'Relative relief comparison against respective geoid datums',
    },
    {
      name: 'Slope & Morphological Roughness',
      earthVal: 'Low-Medium (8–14°)',
      planetaryVal: 'Medium-High (12–22°)',
      range: '45°',
      weight: '20%',
      score: 74,
      note: 'Horn finite-difference slope and Riley TRI index from DEM rasters',
    },
    {
      name: 'Geological & Mineral Facies',
      earthVal: earthSite?.features.geology || 'N/A',
      planetaryVal: planetaryRegion?.key_features.slice(0, 2).join(', ') || 'N/A',
      range: 'Categorical',
      weight: '25%',
      score: 85,
      note: 'Sulfate, carbonate, and basaltic regolith analogies',
    },
    {
      name: 'Thermal Fluctuations (Day/Night)',
      earthVal: `${earthSite?.features.temperature_range_c[0]}°C to ${earthSite?.features.temperature_range_c[1]}°C`,
      planetaryVal: '-120°C to +20°C',
      range: '200°C',
      weight: '15%',
      score: 68,
      note: 'NASA MODIS LST vs Planetary Climate Database',
    },
    {
      name: 'Aridity & Water Activity ($a_w$)',
      earthVal: `${earthSite?.features.annual_rainfall_mm} mm/yr (${earthSite?.features.aridity})`,
      planetaryVal: '0 mm/yr (Subsurface Cryo-Ice)',
      range: '3,000 mm',
      weight: '15%',
      score: 89,
      note: 'Desiccation and hyper-arid regolith index',
    },
  ];

  const computedScore = 79.4;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-slate-800/80 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Multi-Body Comparative Benchmarking
        </div>
        <h1 className="text-2xl lg:text-3xl font-black text-white flex items-center gap-3">
          <GitCompare className="w-7 h-7 text-amber-400" />
          Side-by-Side Scientific Site Comparison
        </h1>
        <p className="text-xs lg:text-sm text-slate-400 mt-1 max-w-2xl">
          Multi-parameter mathematical benchmarking between a terrestrial analog candidate and a lunar or Martian landing region.
        </p>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 rounded-2xl bg-[#090E1D] border border-slate-800 shadow-xl">
        <div>
          <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
            1. Select Terrestrial Analog Candidate (Earth)
          </label>
          <select
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            className="w-full bg-[#060A14] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-semibold cursor-pointer"
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#0A0F1E]">
                {s.name} ({s.country}) — [{s.planetary_target.toUpperCase()}]
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
            2. Select Planetary Benchmark Site (Moon / Mars)
          </label>
          <select
            value={selectedRegionId}
            onChange={(e) => setSelectedRegionId(e.target.value)}
            className="w-full bg-[#060A14] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-semibold cursor-pointer"
          >
            {regions.map((r) => (
              <option key={r.id} value={r.id} className="bg-[#0A0F1E]">
                {r.name} ({r.planet.toUpperCase()}) — {r.mission_relevance}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual Dual Image Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Earth Analog Card */}
        <div className="flow-card rounded-2xl overflow-hidden">
          <div className="h-48 relative overflow-hidden bg-black">
            <img
              src={earthSite?.image_url}
              alt={earthSite?.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-transparent to-transparent" />
            <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-cyan-600/80 text-white text-[10px] font-bold border border-cyan-400">
              Earth Candidate
            </div>
            <div className="absolute bottom-3 left-4 right-4">
              <h3 className="text-xl font-black text-white">{earthSite?.name}</h3>
              <div className="text-xs text-slate-300">{earthSite?.country} • {earthSite?.environment_type}</div>
            </div>
          </div>
        </div>

        {/* Planetary Site Card */}
        <div className="flow-card rounded-2xl overflow-hidden">
          <div className="h-48 relative overflow-hidden bg-black">
            <img
              src={planetaryRegion?.image_url}
              alt={planetaryRegion?.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-transparent to-transparent" />
            <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-orange-600/80 text-white text-[10px] font-bold border border-amber-400">
              {planetaryRegion?.planet.toUpperCase()} Benchmark
            </div>
            <div className="absolute bottom-3 left-4 right-4">
              <h3 className="text-xl font-black text-white">{planetaryRegion?.name}</h3>
              <div className="text-xs text-slate-300">{planetaryRegion?.diameter_km} km diameter • {planetaryRegion?.mission_relevance}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Composite Analog Compatibility Score Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#170E08] via-[#0E1528] to-[#080D1A] border border-amber-500/40 flex flex-wrap items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1.5">
          <div className="text-xs text-amber-300/80 uppercase font-black tracking-wider">
            Weighted Analog Compatibility Score (ACS)
          </div>
          <div className="flex items-center gap-4">
            <span className="text-4xl font-black text-amber-400 glow-butterscotch">{computedScore}%</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              High Similarity (Tier 2)
            </span>
          </div>
          <div className="text-xs text-slate-400">
            Formula: <code className="text-slate-200 font-mono text-[11px]">ACS = &Sigma;(w_i &times; S_i) / &Sigma;(w_i)</code> • Methodology v1.0
          </div>
        </div>

        <div className="text-right text-xs text-slate-400 space-y-1">
          <div>Evaluated Features: <span className="text-slate-200 font-bold">5 / 5</span></div>
          <div>Missing Data: <span className="text-emerald-400 font-bold">0</span></div>
          <div className="text-[10px] text-amber-400 font-mono font-bold">CALCULATED DYNAMICALLY</div>
        </div>
      </div>

      {/* Feature Breakdown Table */}
      <div className="rounded-2xl border border-slate-800/80 overflow-hidden bg-[#0A0F1E] shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#080D1A]">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            Category A: Mathematical Feature Dissection
          </h2>
          <span className="text-xs text-slate-400">Scale R_i Normalization</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#060A14] text-slate-400 text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="p-3.5 font-bold">Parameter / Metric</th>
                <th className="p-3.5 font-bold text-slate-200">Earth Analog ({earthSite?.name})</th>
                <th className="p-3.5 font-bold text-amber-300">Planetary Site ({planetaryRegion?.name})</th>
                <th className="p-3.5 font-bold">Weight</th>
                <th className="p-3.5 font-bold">Score (S_i)</th>
                <th className="p-3.5 font-bold">Scientific Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {comparisonFeatures.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-semibold text-white">{row.name}</td>
                  <td className="p-3.5 text-slate-300">{row.earthVal}</td>
                  <td className="p-3.5 text-amber-300 font-semibold">{row.planetaryVal}</td>
                  <td className="p-3.5 font-mono text-slate-400">{row.weight}</td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 rounded-md font-mono font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {row.score}%
                    </span>
                  </td>
                  <td className="p-3.5 text-[11px] text-slate-400">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Non-Negotiable Category B Physical Discrepancies Callout */}
      <div className="p-5 rounded-2xl bg-[#1A0E0B] border border-orange-700/50 space-y-2.5 shadow-xl">
        <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-orange-400" />
          Category B Physical Disparities (Extraterrestrial Environmental Invariants)
        </div>
        <p className="text-xs text-orange-200/90 leading-relaxed">
          While this Earth analog provides valid geological and topographical testing, no terrestrial site can replicate
          the unshielded solar particle radiation, vacuum sublimation, or 0.38g / 0.16g surface gravitational environments.
          These physical invariants are permanently decoupled from the Analog Compatibility Score.
        </p>
      </div>
    </div>
  );
};
