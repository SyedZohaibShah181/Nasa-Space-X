import React, { useState } from 'react';
import { Settings, Sliders, Database, RotateCcw, Save, ShieldCheck, Key } from 'lucide-react';
import { FeatureWeightConfig } from '../types';

export const SettingsPage: React.FC = () => {
  const [weights, setWeights] = useState<FeatureWeightConfig>({
    topography: 25,
    geology: 25,
    roughness: 20,
    temperature: 15,
    aridity: 15,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const totalWeight =
    weights.topography + weights.geology + weights.roughness + weights.temperature + weights.aridity;

  const handleReset = () => {
    setWeights({
      topography: 25,
      geology: 25,
      roughness: 20,
      temperature: 15,
      aridity: 15,
    });
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl lg:text-2xl font-black text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-cyan-400" />
          Scientific Engine Configuration & Parameters
        </h1>
        <p className="text-xs lg:text-sm text-slate-400 mt-1">
          Customize feature weights, normalization parameters, and external API connectivity for the similarity engine.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Feature weights and engine parameters updated successfully.</span>
        </div>
      )}

      {/* Feature Weights Section */}
      <div className="p-5 rounded-xl bg-[#0D1424] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Analog Compatibility Feature Weights (w_i)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Adjust scientific feature significance for composite ACS score aggregation.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded ${
                totalWeight === 100
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}
            >
              Total: {totalWeight}% {totalWeight !== 100 && '(Must sum to 100%)'}
            </span>
            <button
              onClick={handleReset}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
              title="Reset to default baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4 pt-1">
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
              <span>Topography & Elevation Relief (SRTM / LOLA / MOLA)</span>
              <span className="font-mono text-cyan-400 font-bold">{weights.topography}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={weights.topography}
              onChange={(e) => setWeights({ ...weights, topography: Number(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
              <span>Geological & Mineral Composition (EMIT / USGS)</span>
              <span className="font-mono text-cyan-400 font-bold">{weights.geology}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={weights.geology}
              onChange={(e) => setWeights({ ...weights, geology: Number(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
              <span>Terrain Roughness & Slope Distribution</span>
              <span className="font-mono text-cyan-400 font-bold">{weights.roughness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={weights.roughness}
              onChange={(e) => setWeights({ ...weights, roughness: Number(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
              <span>Surface Temperature Regimes (MODIS MOD11A2)</span>
              <span className="font-mono text-cyan-400 font-bold">{weights.temperature}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={weights.temperature}
              onChange={(e) => setWeights({ ...weights, temperature: Number(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
              <span>Aridity & Moisture Deficit</span>
              <span className="font-mono text-cyan-400 font-bold">{weights.aridity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={weights.aridity}
              onChange={(e) => setWeights({ ...weights, aridity: Number(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={handleSave}
            disabled={totalWeight !== 100}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            Apply Weight Profiles
          </button>
        </div>
      </div>

      {/* External Data Source Endpoints Configuration */}
      <div className="p-5 rounded-xl bg-[#0D1424] border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Database className="w-4 h-4 text-cyan-400" />
          External Scientific API Endpoints
        </h2>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">NASA CMR Search API URL</label>
            <input
              type="text"
              readOnly
              value="https://cmr.earthdata.nasa.gov/search"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-slate-300"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">NASA Planetary Data System (PDS) API</label>
            <input
              type="text"
              readOnly
              value="https://pds.nasa.gov/api/search/1"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-slate-300"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Backend Database Mode</label>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200">SQLite Prototype</span>
                <span className="text-[11px] text-slate-500 block">
                  Automatic migration pipeline to PostgreSQL + PostGIS prepared in Milestone 5
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-slate-800">
                ACTIVE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
