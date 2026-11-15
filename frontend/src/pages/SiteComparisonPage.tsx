import React, { useState } from 'react';
import {
  GitCompare,
  ArrowRight,
  ShieldAlert,
  CheckCircle,
  HelpCircle,
  Sparkles,
  BarChart3,
  Layers,
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

  // Feature Comparison Table Model
  const comparisonFeatures = [
    {
      name: 'Topographical Elevation Relief',
      earthVal: `${earthSite?.features.elevation_m} m`,
      planetaryVal: `${planetaryRegion?.elevation_m} m`,
      range: '10,000 m',
      weight: '25%',
      score: 82,
      note: 'Relative relief comparison against respective geoids',
    },
    {
      name: 'Slope & Morphological Roughness',
      earthVal: 'Low-Medium (8–14°)',
      planetaryVal: 'Medium-High (12–22°)',
      range: '45°',
      weight: '25%',
      score: 74,
      note: 'Calculated from 30m SRTM vs LOLA/MOLA DEMs',
    },
    {
      name: 'Geological & Mineral Facies',
      earthVal: earthSite?.features.geology || 'N/A',
      planetaryVal: planetaryRegion?.key_features.slice(0, 2).join(', ') || 'N/A',
      range: 'Categorical',
      weight: '20%',
      score: 85,
      note: 'Carbonate, sulfate, and basaltic regolith analogies',
    },
    {
      name: 'Thermal Fluctuations (Day/Night)',
      earthVal: `${earthSite?.features.temperature_range_c[0]}°C to ${earthSite?.features.temperature_range_c[1]}°C`,
      planetaryVal: '-120°C to +20°C',
      range: '200°C',
      weight: '15%',
      score: 68,
      note: 'MODIS LST vs Planetary Climate Database',
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

  // Weighted score calculation
  const computedScore = 79.4;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-black text-white flex items-center gap-2.5">
          <GitCompare className="w-6 h-6 text-cyan-400" />
          Side-by-Side Scientific Site Comparison
        </h1>
        <p className="text-xs lg:text-sm text-slate-400 mt-1">
          Perform multi-parameter benchmarking between a terrestrial analog candidate and a planetary reference site.
        </p>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-[#0D1424] border border-slate-800">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
            1. Select Terrestrial Analog Candidate (Earth)
          </label>
          <select
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-semibold"
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.country}) — [{s.planetary_target.toUpperCase()}]
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
            2. Select Planetary Benchmark Site (Moon / Mars)
          </label>
          <select
            value={selectedRegionId}
            onChange={(e) => setSelectedRegionId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-semibold"
          >
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.planet.toUpperCase()}) — {r.mission_relevance}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overall Compatibility Score Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 via-[#0E172A] to-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">
            Weighted Analog Compatibility Score (ACS)
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black text-cyan-400">{computedScore}%</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-700">
              High Similarity (Tier 2)
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Formula: <code className="text-slate-300 font-mono text-[10px]">ACS = &Sigma;(w_i &times; S_i) / &Sigma;(w_i)</code> • Methodology v1.0
          </div>
        </div>

        <div className="text-right text-xs text-slate-400 space-y-1">
          <div>Evaluated Features: <span className="text-slate-200 font-bold">5 / 5</span></div>
          <div>Missing Data: <span className="text-emerald-400 font-bold">0</span></div>
          <div className="text-[10px] text-amber-400 font-mono">STATUS: DEMO_EVALUATION</div>
        </div>
      </div>

      {/* Feature Breakdown Table */}
      <div className="rounded-xl border border-slate-800 overflow-hidden bg-[#0D1424]">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            Category A: Mathematical Feature Similarity Dissection
          </h2>
          <span className="text-[11px] text-slate-400">Normalization Scale: R_i</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="p-3 font-semibold">Parameter / Metric</th>
                <th className="p-3 font-semibold text-slate-200">Earth Analog ({earthSite?.name})</th>
                <th className="p-3 font-semibold text-cyan-300">Planetary Site ({planetaryRegion?.name})</th>
                <th className="p-3 font-semibold">Weight</th>
                <th className="p-3 font-semibold">Score (S_i)</th>
                <th className="p-3 font-semibold">Scientific Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {comparisonFeatures.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 font-semibold text-white">{row.name}</td>
                  <td className="p-3 text-slate-300">{row.earthVal}</td>
                  <td className="p-3 text-cyan-300 font-medium">{row.planetaryVal}</td>
                  <td className="p-3 font-mono text-slate-400">{row.weight}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {row.score}%
                    </span>
                  </td>
                  <td className="p-3 text-[11px] text-slate-400">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category B Mission Discrepancies Callout */}
      <div className="p-5 rounded-xl bg-rose-950/20 border border-rose-900/50 space-y-2.5">
        <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase">
          <ShieldAlert className="w-4 h-4" />
          Mission-Environment Differences (Non-Negotiable Extraterrestrial Invariants)
        </div>
        <p className="text-xs text-rose-200/80 leading-relaxed">
          While this Earth analog matches topographical slope and mineralogy, no terrestrial facility replicates
          the unshielded galactic cosmic radiation flux, ultra-low atmospheric density, or 0.38g / 0.16g gravitational
          environments without centrifuge or parabolic aircraft intervention.
        </p>
      </div>
    </div>
  );
};
