import React, { useState } from 'react';
import { Database, Search, ExternalLink, ShieldCheck, Key, Globe2, FileCode } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-white flex items-center gap-2.5">
            <Database className="w-6 h-6 text-cyan-400" />
            Scientific Dataset & Provenance Catalog
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            Authoritative open-access Earth observation and planetary mission datasets from NASA, USGS, and ESA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Filter Domain:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none"
          >
            <option value="all">All Domains</option>
            <option value="elevation">Elevation / Topography</option>
            <option value="temperature">Temperature / Climate</option>
            <option value="mineral">Mineral / Spectral</option>
          </select>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by dataset title, provider (NASA/USGS/ESA), resolution, or coordinate system..."
          className="w-full bg-[#0D1424] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60"
        />
      </div>

      {/* Dataset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((ds) => (
          <div
            key={ds.id}
            className="p-5 rounded-xl bg-[#0D1424] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                    {ds.type}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1.5">{ds.name}</h3>
                  <div className="text-xs text-slate-400">{ds.provider}</div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-900 text-emerald-400 border border-slate-800">
                    {ds.format}
                  </span>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Spatial Resolution</div>
                  <div className="font-semibold text-slate-200 font-mono text-[11px]">{ds.spatial_resolution}</div>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Coordinate System (CRS)</div>
                  <div className="font-semibold text-slate-200 font-mono text-[11px]">{ds.crs}</div>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Measurement Units</div>
                  <div className="font-semibold text-slate-200 font-mono text-[11px]">{ds.units}</div>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Coverage</div>
                  <div className="font-semibold text-slate-200 text-[11px]">{ds.coverage}</div>
                </div>
              </div>

              {/* Authentication & Integration Notice */}
              <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800/80 text-[11px] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {ds.authentication_required ? (
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span className="text-slate-300">
                    {ds.authentication_required ? ds.auth_note : 'Open Public Access (No API Key Required)'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">
                  {ds.integration_status}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">{ds.data_status}</span>
              <a
                href={ds.url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
              >
                Access Catalog Source <ExternalLink className="w-3 h-3 text-cyan-400" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

