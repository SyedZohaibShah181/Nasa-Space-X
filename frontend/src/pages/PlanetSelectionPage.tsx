import React from 'react';
import { Globe2, ArrowRight, CheckCircle2, ShieldCheck, Thermometer, Compass, Sparkles } from 'lucide-react';
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
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-slate-800/80 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Planetary Reference Calibration
        </div>
        <h1 className="text-2xl lg:text-3xl font-black text-white flex items-center gap-3">
          <Globe2 className="w-7 h-7 text-amber-400" />
          Target Planetary Worlds
        </h1>
        <p className="text-xs lg:text-sm text-slate-400 mt-1 max-w-2xl">
          Calibrate the Analog Compatibility Engine between the oxidized basaltic crust of Mars
          and the airless, heavily cratered anorthositic highlands of the Moon.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mars World Card */}
        <div
          onClick={() => onSelectPlanet('mars')}
          className={`cursor-pointer rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between group ${
            selectedPlanet === 'mars'
              ? 'bg-gradient-to-b from-[#180E09] via-[#0E1322] to-[#060913] border-amber-500/80 shadow-2xl shadow-orange-950/40 ring-1 ring-amber-500/40'
              : 'bg-[#0A0F1D]/80 border-slate-800 hover:border-amber-500/40 hover:-translate-y-1'
          }`}
        >
          {/* Top Banner Image with Mars Imagery */}
          <div className="relative h-48 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80"
              alt="Planet Mars Global Altimetry"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E1322] via-[#0E1322]/40 to-transparent" />

            {selectedPlanet === 'mars' && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-600/90 text-white border border-amber-400 text-xs font-bold shadow-lg shadow-orange-950">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active Target World
              </div>
            )}

            <div className="absolute bottom-3 left-5">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md">
                Fourth Planet • 1.52 AU
              </span>
              <h2 className="text-2xl font-black text-white mt-1 drop-shadow-md flex items-center gap-2">
                Mars
                <span className="text-base text-amber-400 font-semibold">(The Red Planet)</span>
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed bg-[#060A14]/80 p-4 rounded-xl border border-slate-800/80">
              Arid, cold desert planet characterized by iron oxide regolith, extinct volcanic shields,
              hyper-saline paleolake basins, and wind-blown dune fields. Primary focus for astrobiology,
              drilling technology, and future crewed surface exploration.
            </p>

            {/* Scientific Specs */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#080D1A] border border-slate-800/80">
                <div className="text-[10px] text-amber-300/80 uppercase font-semibold">Surface Gravity</div>
                <div className="text-sm font-bold text-slate-100">3.72 m/s² (0.38 g)</div>
              </div>
              <div className="p-3 rounded-xl bg-[#080D1A] border border-slate-800/80">
                <div className="text-[10px] text-amber-300/80 uppercase font-semibold">Mean Atmospheric Density</div>
                <div className="text-sm font-bold text-slate-100">610 Pa (0.6% Earth)</div>
              </div>
              <div className="p-3 rounded-xl bg-[#080D1A] border border-slate-800/80">
                <div className="text-[10px] text-amber-300/80 uppercase font-semibold">Surface Temp Range</div>
                <div className="text-sm font-bold text-slate-100">-125°C to +20°C</div>
              </div>
              <div className="p-3 rounded-xl bg-[#080D1A] border border-slate-800/80">
                <div className="text-[10px] text-amber-300/80 uppercase font-semibold">Primary Orbital DEM</div>
                <div className="text-sm font-bold text-slate-100">MOLA (463 m)</div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-1.5 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-orange-950/60 text-orange-200 border border-orange-800/40 text-[11px]">
                Desiccated Salars
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-orange-950/60 text-orange-200 border border-orange-800/40 text-[11px]">
                Basalt Weathering
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-orange-950/60 text-orange-200 border border-orange-800/40 text-[11px]">
                Polar Cryo-Ice
              </span>
            </div>

            <div className="pt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPlanet('mars');
                  onNavigate('regions');
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C84B31] to-[#E59840] hover:from-[#B83A20] hover:to-[#D97706] text-white text-xs font-bold transition-all shadow-lg shadow-orange-950/50 flex items-center justify-center gap-2 cursor-pointer"
              >
                Explore Mars Reference Sites
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Moon World Card */}
        <div
          onClick={() => onSelectPlanet('moon')}
          className={`cursor-pointer rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between group ${
            selectedPlanet === 'moon'
              ? 'bg-gradient-to-b from-[#141C2B] via-[#0E1322] to-[#060913] border-slate-300/80 shadow-2xl shadow-slate-900/40 ring-1 ring-slate-300/40'
              : 'bg-[#0A0F1D]/80 border-slate-800 hover:border-slate-500/40 hover:-translate-y-1'
          }`}
        >
          {/* Top Banner Image with Moon Crater Imagery */}
          <div className="relative h-48 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1532693322450-2cb5c511067d?auto=format&fit=crop&w=1200&q=80"
              alt="Moon High-Albedo Crater Field"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E1322] via-[#0E1322]/40 to-transparent" />

            {selectedPlanet === 'moon' && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 text-slate-950 border border-white text-xs font-bold shadow-lg shadow-black">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                Active Target World
              </div>
            )}

            <div className="absolute bottom-3 left-5">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-slate-700/40 text-slate-200 border border-slate-500/40 backdrop-blur-md">
                Earth Satellite • 384,400 km
              </span>
              <h2 className="text-2xl font-black text-white mt-1 drop-shadow-md flex items-center gap-2">
                The Moon
                <span className="text-base text-slate-300 font-semibold">(Luna)</span>
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed bg-[#060A14]/80 p-4 rounded-xl border border-slate-800/80">
              Airless, heavily cratered body shaped by billions of years of meteorite bombardment,
              anorthositic crustal evolution, and sharp abrasive regolith dust. Prime focus for NASA
              Artemis surface missions and permanent lunar base architectures.
            </p>

            {/* Scientific Specs */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#080D1A] border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Surface Gravity</div>
                <div className="text-sm font-bold text-slate-100">1.62 m/s² (0.16 g)</div>
              </div>
              <div className="p-3 rounded-xl bg-[#080D1A] border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Atmospheric State</div>
                <div className="text-sm font-bold text-slate-100">Hard Vacuum</div>
              </div>
              <div className="p-3 rounded-xl bg-[#080D1A] border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Surface Temp Range</div>
                <div className="text-sm font-bold text-slate-100">-173°C to +127°C</div>
              </div>
              <div className="p-3 rounded-xl bg-[#080D1A] border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Primary Orbital DEM</div>
                <div className="text-sm font-bold text-slate-100">LOLA (118 m)</div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-1.5 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/60 text-slate-200 border border-slate-700/40 text-[11px]">
                Impact Breccias
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/60 text-slate-200 border border-slate-700/40 text-[11px]">
                Permanently Shadowed Ice
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/60 text-slate-200 border border-slate-700/40 text-[11px]">
                Abrasive Regolith
              </span>
            </div>

            <div className="pt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPlanet('moon');
                  onNavigate('regions');
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-slate-700 to-slate-500 hover:from-slate-600 hover:to-slate-400 text-white text-xs font-bold transition-all shadow-lg shadow-slate-900/50 flex items-center justify-center gap-2 cursor-pointer"
              >
                Explore Moon Reference Sites
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
