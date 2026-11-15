import React, { useState } from 'react';
import { MapPin, Search, ArrowRight, Layers, Satellite, ShieldAlert } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-cyan-400" />
            Planetary Reference Landing Regions
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            Standardized planetary benchmark sites used to calibrate Earth analog searches.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <div className="p-1 bg-slate-900 border border-slate-800 rounded-lg flex text-xs">
            <button
              onClick={() => setActivePlanetFilter('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activePlanetFilter === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Worlds
            </button>
            <button
              onClick={() => {
                setActivePlanetFilter('mars');
                onSelectPlanet('mars');
              }}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activePlanetFilter === 'mars'
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
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
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activePlanetFilter === 'moon'
                  ? 'bg-slate-300/20 text-slate-200 border border-slate-400/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Moon ({regions.filter((r) => r.planet === 'moon').length})
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by crater name, mineral feature, or NASA mission..."
          className="w-full bg-[#0D1424] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60"
        />
      </div>

      {/* Grid of Regions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRegions.map((region) => (
          <div
            key={region.id}
            className="rounded-xl bg-[#0D1424] border border-slate-800 hover:border-slate-700 p-5 flex flex-col justify-between transition-all space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        region.planet === 'mars'
                          ? 'bg-orange-950/80 text-orange-400 border border-orange-700/50'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {region.planet}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {region.latitude.toFixed(1)}°, {region.longitude.toFixed(1)}°
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1.5">{region.name}</h3>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-200">{region.diameter_km} km</div>
                  <div className="text-[10px] text-slate-500 uppercase">Diameter</div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                {region.description}
              </p>

              {/* Key Features */}
              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Key Morphological Features</div>
                <div className="flex flex-wrap gap-1.5">
                  {region.key_features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-cyan-300 border border-slate-800"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Data Provenance Details */}
              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500">Altimetry:</span>{' '}
                  <span className="text-slate-300 font-mono">{region.elevation_m} m</span>
                </div>
                <div>
                  <span className="text-slate-500">Dataset:</span>{' '}
                  <span className="text-slate-300 font-mono">{region.primary_dataset}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
                <Satellite className="w-3.5 h-3.5 text-emerald-400" />
                {region.mission_relevance}
              </div>
              <button
                onClick={() => onNavigate('map')}
                className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                Scan Earth for Analogs
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

