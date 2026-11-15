import React from 'react';
import {
  ArrowLeft,
  MapPin,
  ShieldAlert,
  CheckCircle,
  Database,
  Satellite,
  Compass,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { CandidateSite } from '../types';
import { NavPage } from '../components/Navigation';

interface SiteDetailsProps {
  site: CandidateSite;
  onBack: () => void;
  onNavigate: (page: NavPage) => void;
}

export const SiteDetailsPage: React.FC<SiteDetailsProps> = ({ site, onBack, onNavigate }) => {
  const isMars = site.planetary_target === 'mars';

  return (
    <div className="space-y-6">
      {/* Back button & Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl lg:text-2xl font-black text-white">{site.name}</h1>
              <span
                className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${
                  isMars ? 'bg-orange-950 text-orange-400 border border-orange-800' : 'bg-slate-800 text-slate-200'
                }`}
              >
                {site.planetary_target} Analog
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {site.country} • Lat: {site.latitude.toFixed(4)}°, Lon: {site.longitude.toFixed(4)}° • CRS: WGS84
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-black text-cyan-400">{site.analog_score}%</div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">Analog Compatibility (ACS)</div>
          </div>
          <button
            onClick={() => onNavigate('compare')}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            Compare with Reference Site
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Rationale & Scientific Analog Justification */}
      <div className="p-5 rounded-xl bg-[#0D1424] border border-slate-800 space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Satellite className="w-4 h-4 text-cyan-400" />
          Planetary Analogy Scientific Rationale
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-lg border border-slate-800">
          {site.why_analog}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
          <div>
            <span className="text-slate-500">Research Status:</span>{' '}
            <span className="text-slate-200 font-semibold capitalize">{site.research_status.replace('_', ' ')}</span>
          </div>
          <div>
            <span className="text-slate-500">Data Integrity:</span>{' '}
            <span className="text-amber-400 font-mono text-[11px]">{site.data_status}</span>
          </div>
        </div>
      </div>

      {/* Grid: Category A Similarities vs Category B Environmental Differences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category A: Measurable Surface Similarities */}
        <div className="p-5 rounded-xl bg-[#0D1424] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Category A: Measurable Surface Characteristics
            </h3>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
              Evaluated in ACS
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="text-slate-400 text-[11px]">Elevation Datum</div>
                <div className="font-bold text-slate-200">{site.features.elevation_m} meters ASL</div>
              </div>
              <span className="text-[11px] text-cyan-400 font-mono">SRTM 30m</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="text-slate-400 text-[11px]">Aridity & Precipitation</div>
                <div className="font-bold text-slate-200">
                  {site.features.aridity} ({site.features.annual_rainfall_mm} mm/year)
                </div>
              </div>
              <span className="text-[11px] text-cyan-400 font-mono">MODIS / POWER</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="text-slate-400 text-[11px]">Thermal Envelope</div>
                <div className="font-bold text-slate-200">
                  {site.features.temperature_range_c[0]}°C to {site.features.temperature_range_c[1]}°C
                </div>
              </div>
              <span className="text-[11px] text-cyan-400 font-mono">MOD11A2</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="text-slate-400 text-[11px]">Geological & Mineral Context</div>
                <div className="font-bold text-slate-200 capitalize">{site.features.geology}</div>
              </div>
              <span className="text-[11px] text-cyan-400 font-mono">USGS / EMIT</span>
            </div>
          </div>
        </div>

        {/* Category B: Mission-Environment Differences (CANNOT be simulated on Earth) */}
        <div className="p-5 rounded-xl bg-[#0D1424] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              Category B: Mission-Environment Disparities
            </h3>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/60">
              Isolated from ACS
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="flex justify-between font-bold text-slate-200">
                <span>Surface Gravity</span>
                <span className="text-rose-400">{isMars ? '3.72 m/s² (0.38g)' : '1.62 m/s² (0.16g)'}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Earth ({site.name}) exerts 9.81 m/s² (1.0g). Rover mobility torque and suspension dynamics require scaling corrections.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="flex justify-between font-bold text-slate-200">
                <span>Atmospheric Pressure</span>
                <span className="text-rose-400">{isMars ? '610 Pa (CO2)' : 'Vacuum (Trace exosphere)'}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Earth sea-level is 101.3 kPa (N2/O2). Thermal convection, aerodynamic drag, and chemical oxidation behavior differ fundamentally.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="flex justify-between font-bold text-slate-200">
                <span>Space Radiation & Magnetosphere</span>
                <span className="text-rose-400">Unshielded GCR & Solar Protons</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Earth is protected by a strong intrinsic magnetosphere and thick atmosphere. Planetary surfaces experience high cumulative ionizing doses.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Sources & Provenance */}
      <div className="p-5 rounded-xl bg-[#0D1424] border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          Instrument Datasets & Attribution
        </h3>
        <div className="flex flex-wrap gap-2 text-xs">
          {site.data_sources.map((src, i) => (
            <span
              key={i}
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 font-mono text-[11px]"
            >
              {src}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

