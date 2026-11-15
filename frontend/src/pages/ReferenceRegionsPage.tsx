import React, { useState } from 'react';
import { MapPin, Search, ArrowRight, Satellite, Sparkles } from 'lucide-react';
import { ReferenceRegion, PlanetaryBodyId } from '../types';
import { NavPage } from '../components/Navigation';

interface ReferenceRegionsProps {
  selectedPlanet: PlanetaryBodyId;
  onSelectPlanet: (planet: PlanetaryBodyId) => void;
  regions: ReferenceRegion[];
  onNavigate: (page: NavPage) => void;
}

export const ReferenceRegionsPage: React.FC<ReferenceRegionsProps> = ({
  selectedPlanet,
  onSelectPlanet,
  regions,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activePlanetFilter, setActivePlanetFilter] = useState<'all' | PlanetaryBodyId>(selectedPlanet);

  const filteredRegions = regions.filter((r) => {
    const matchesPlanet = activePlanetFilter === 'all' || r.planet === activePlanetFilter;
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.mission_relevance.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPlanet && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            NASA Planetary Landing Target Register
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-white flex items-center gap-3">
            <MapPin className="w-7 h-7 text-amber-400" />
            Planetary Reference Benchmark Sites
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1 max-w-2xl">
            Standardized lunar and Martian exploration benchmark landing sites used to calibrate terrestrial analog queries.
          </p>
        </div>

        {/* Planet Filter Controls */}
        <div className="flex items-center gap-2 bg-[#080D1A] p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActivePlanetFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activePlanetFilter === 'all'
                ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Worlds ({regions.length})
          </button>
          <button
            onClick={() => {
              setActivePlanetFilter('mars');
              onSelectPlanet('mars');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activePlanetFilter === 'mars'
                ? 'bg-[#C84B31]/30 text-amber-200 border border-orange-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mars ({regions.filter((r) => r.planet === 'mars').length})
          </button>
          <button
            onClick={() => {
              setActivePlanetFilter('moon');
              onSelectPlanet('moon');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activePlanetFilter === 'moon'
                ? 'bg-slate-400/20 text-slate-100 border border-slate-300/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Moon ({regions.filter((r) => r.planet === 'moon').length})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by crater name, mineral signature, or NASA mission (e.g. Jezero, delta, Artemis)..."
          className="w-full bg-[#0A0F1E] border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60 shadow-inner"
        />
      </div>

      {/* Grid of Reference Regions with Flowing Photography */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRegions.map((region) => {
          const isMars = region.planet === 'mars';
          return (
            <div
              key={region.id}
              className={`flow-card rounded-2xl overflow-hidden flex flex-col justify-between group cursor-pointer ${
                isMars ? 'hover:border-amber-500/60' : 'flow-card-moon'
              }`}
            >
              {/* Photo Banner */}
              <div className="relative h-44 overflow-hidden bg-black">
                <img
                  src={region.image_url}
                  alt={region.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-[#0A0F1E]/30 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span
                    className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border backdrop-blur-md ${
                      isMars
                        ? 'bg-orange-600/80 text-white border-orange-400/50'
                        : 'bg-slate-300 text-slate-950 border-white'
                    }`}
                  >
                    {region.planet}
                  </span>
                </div>
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-slate-700">
                  {region.diameter_km} km ø
                </div>
                <div className="absolute bottom-2 left-3 right-3">
                  <h3 className="text-lg font-black text-white drop-shadow-md group-hover:text-amber-200 transition-colors">
                    {region.name}
                  </h3>
                  <div className="text-[11px] text-slate-300 font-mono">
                    Lat: {region.latitude.toFixed(2)}°, Lon: {region.longitude.toFixed(2)}°
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {region.description}
                  </p>

                  {/* Key Features Chips */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      Analogous Facies & Mineralogy
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {region.key_features.map((feat, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#060913] text-amber-200 border border-slate-800"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Technical Spec Matrix */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800/80">
                    <div className="p-2 rounded-lg bg-[#080D1A] border border-slate-800/80">
                      <span className="text-slate-400 text-[10px] block">Datum Elevation</span>
                      <span className="font-mono text-slate-200 font-bold">{region.elevation_m} m</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#080D1A] border border-slate-800/80">
                      <span className="text-slate-400 text-[10px] block">Source DEM</span>
                      <span className="font-mono text-amber-300 font-bold">{region.primary_dataset}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 space-y-2">
                  <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Satellite className="w-3.5 h-3.5" />
                    {region.mission_relevance}
                  </div>
                  <button
                    onClick={() => onNavigate('map')}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C84B31] to-[#E59840] hover:from-[#B83A20] hover:to-[#D97706] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-orange-950/40 cursor-pointer"
                  >
                    Scan Earth for Analogs
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
