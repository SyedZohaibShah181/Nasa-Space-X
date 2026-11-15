import React from 'react';
import { Globe2, ArrowRight, CheckCircle2, ShieldCheck, Thermometer, Compass } from 'lucide-react';
import { PlanetaryBodyId } from '../types';
import { NavPage } from '../components/Navigation';

interface PlanetSelectionProps {
  selectedPlanet: PlanetaryBodyId;
  onSelectPlanet: (planet: PlanetaryBodyId) => void;
  onNavigate: (page: NavPage) => void;
}

export const PlanetSelectionPage: React.FC<PlanetSelectionProps> = ({
  selectedPlanet,
  onSelectPlanet,
  onNavigate,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-black text-white flex items-center gap-2.5">
          <Globe2 className="w-6 h-6 text-cyan-400" />
          Planetary Target Worlds
        </h1>
        <p className="text-xs lg:text-sm text-slate-400 mt-1">
          Select target celestial body to calibrate analog discovery algorithms, orbital datasets,
          and environmental reference parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mars Card */}
        <div
          onClick={() => onSelectPlanet('mars')}
          className={`cursor-pointer rounded-2xl p-6 border transition-all relative overflow-hidden flex flex-col justify-between ${
            selectedPlanet === 'mars'
              ? 'bg-[#140E0A] border-orange-500 shadow-xl shadow-orange-500/10'
              : 'bg-[#0D1424] border-slate-800 hover:border-slate-700'
          }`}
        >
          {selectedPlanet === 'mars' && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active Target
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-700 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-orange-500/30">
                ♂
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Mars (The Red Planet)</h2>
                <div className="text-xs text-orange-400 font-medium">Terrestrial Planet • 1.52 AU</div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Arid, cold desert world with basaltic volcanism, hyper-saline paleolake basins,
              aeolian dune dynamics, and complex clay-carbonate stratigraphy. Target for astrobiology
              and future crewed habitation missions.
            </p>

            {/* Scientific Parameters */}
            <div className="grid grid-cols-2 gap-2.5 text-xs pt-2">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Surface Gravity</div>
                <div className="text-sm font-bold text-slate-100">3.72 m/s² (0.38 g)</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Mean Pressure</div>
                <div className="text-sm font-bold text-slate-100">610 Pa (0.6% Earth)</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Surface Temp Range</div>
                <div className="text-sm font-bold text-slate-100">-125°C to +20°C</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Primary Orbital DEM</div>
                <div className="text-sm font-bold text-slate-100">MOLA (463 m)</div>
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <div className="font-semibold text-slate-300">Key Analogy Disciplines:</div>
              <div className="text-[11px] flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Hyper-arid evaporites</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Basalt weathering</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Permafrost patterned ground</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectPlanet('mars');
                onNavigate('regions');
              }}
              className="w-full py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              Explore Mars Reference Sites
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Moon Card */}
        <div
          onClick={() => onSelectPlanet('moon')}
          className={`cursor-pointer rounded-2xl p-6 border transition-all relative overflow-hidden flex flex-col justify-between ${
            selectedPlanet === 'moon'
              ? 'bg-[#0E1524] border-slate-400 shadow-xl shadow-slate-400/10'
              : 'bg-[#0D1424] border-slate-800 hover:border-slate-700'
          }`}
        >
          {selectedPlanet === 'moon' && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-300/20 text-slate-200 border border-slate-400/40 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active Target
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-300 to-slate-600 flex items-center justify-center text-slate-950 text-xl font-bold shadow-lg shadow-slate-400/20">
                ☾
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">The Moon (Luna)</h2>
                <div className="text-xs text-slate-400 font-medium">Natural Satellite • 384,400 km</div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Airless, heavily cratered body dominated by impact gardening, anorthositic highlands,
              basaltic maria, and permanently shadowed polar regions harboring volatiles. Primary
              focus for NASA Artemis lunar surface architecture.
            </p>

            {/* Scientific Parameters */}
            <div className="grid grid-cols-2 gap-2.5 text-xs pt-2">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Surface Gravity</div>
                <div className="text-sm font-bold text-slate-100">1.62 m/s² (0.16 g)</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Atmospheric State</div>
                <div className="text-sm font-bold text-slate-100">Near-Hard Vacuum</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Surface Temp Range</div>
                <div className="text-sm font-bold text-slate-100">-173°C to +127°C</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Primary Orbital DEM</div>
                <div className="text-sm font-bold text-slate-100">LOLA (118 m)</div>
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <div className="font-semibold text-slate-300">Key Analogy Disciplines:</div>
              <div className="text-[11px] flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Impact cratering morphology</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Regolith abrasive mechanics</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Pyroclastic tephra plains</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectPlanet('moon');
                onNavigate('regions');
              }}
              className="w-full py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              Explore Moon Reference Sites
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

