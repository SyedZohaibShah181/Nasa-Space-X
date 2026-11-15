import React, { useState } from 'react';
import { Database, Search, ExternalLink, ShieldCheck, Key, Globe2, FileCode, Sparkles } from 'lucide-react';
import { DatasetItem } from '../types';

interface ScientificDataCatalogProps {
  datasets: DatasetItem[];
}

export const ScientificDataCatalogPage: React.FC<ScientificDataCatalogProps> = ({ datasets }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = datasets.filter((ds) => {
    const matchesSearch =
      ds.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ds.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ds.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || ds.type.toLowerCase().includes(filterType.toLowerCase());
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Planetary Geospatial Data Register
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-white flex items-center gap-3">
            <Database className="w-7 h-7 text-amber-400" />
            Scientific Dataset & Provenance Catalog
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1 max-w-2xl">
            Authoritative open-access Earth observation and planetary mission datasets from NASA, USGS, and ESA.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#090E1D] p-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-bold px-2">Domain:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#060A14] border border-slate-700 text-xs text-amber-300 font-bold rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="all">All Domains ({datasets.length})</option>
            <option value="elevation">Elevation / Topography</option>
            <option value="temperature">Temperature / Climate</option>
            <option value="mineral">Mineral / Spectral</option>
          </select>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by dataset title, provider (NASA/USGS/ESA), resolution, or coordinate system..."
          className="w-full bg-[#0A0F1E] border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60 shadow-inner"
        />
      </div>

      {/* Dataset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((ds) => (
          <div
            key={ds.id}
            className="flow-card p-6 rounded-2xl flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {ds.type}
                  </span>
                  <h3 className="text-base font-bold text-white mt-2 group-hover:text-amber-200 transition-colors">
                    {ds.name}
                  </h3>
                  <div className="text-xs text-slate-400">{ds.provider}</div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-md bg-[#060A14] text-emerald-400 border border-slate-800">
                    {ds.format}
                  </span>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 rounded-xl bg-[#080D1A] border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Spatial Resolution</div>
                  <div className="font-bold text-slate-200 font-mono text-[11px]">{ds.spatial_resolution}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#080D1A] border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Coordinate System (CRS)</div>
                  <div className="font-bold text-slate-200 font-mono text-[11px]">{ds.crs}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#080D1A] border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Measurement Units</div>
                  <div className="font-bold text-slate-200 font-mono text-[11px]">{ds.units}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#080D1A] border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Global Coverage</div>
                  <div className="font-bold text-slate-200 font-mono text-[11px]">{ds.coverage}</div>
                </div>
              </div>

              {ds.authentication_required && (
                <div className="p-2.5 rounded-xl bg-orange-950/40 border border-orange-800/50 text-[11px] text-orange-300 flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 shrink-0" />
                  <span>{ds.auth_note || 'Authentication required for full raster downloads.'}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-500 font-mono">Status: {ds.data_status}</span>
              <a
                href={ds.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors"
              >
                Access NASA Portal <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
