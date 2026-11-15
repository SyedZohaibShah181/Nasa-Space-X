import React, { useState } from 'react';
import {
  Scan,
  Activity,
  Cpu,
  Layers,
  Sparkles,
  Compass,
  ArrowRight,
  Maximize2,
  Sliders,
  CheckCircle2,
  Info,
  X,
  Target,
  Zap,
} from 'lucide-react';
import { CandidateSite } from '../types';

interface CraterNetExplorerProps {
  onClose?: () => void;
  onExploreAnalog?: (siteId: string) => void;
  sites: CandidateSite[];
}

interface CraterHotspot {
  id: string;
  body: 'lunar' | 'martian';
  name: string;
  diameter: string;
  confidence: string;
  rimDepth: string;
  ejectaPattern: string;
  earthAnalog: string;
  earthAnalogSiteId: string;
  coord: string;
  color: string;
  leftPercent: number;
  topPercent: number;
  widthPercent: number;
  heightPercent: number;
}

export const CraterNetExplorer: React.FC<CraterNetExplorerProps> = ({
  onClose,
  onExploreAnalog,
  sites,
}) => {
  const [selectedCrater, setSelectedCrater] = useState<CraterHotspot | null>(null);
  const [activeOverlay, setActiveOverlay] = useState<'all' | 'lunar' | 'martian'>('all');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showDistribution, setShowDistribution] = useState<boolean>(true);

  const craters: CraterHotspot[] = [
    {
      id: 'lunar-large',
      body: 'lunar',
      name: 'Prominent Lunar Impact Basin',
      diameter: '86.3 m',
      confidence: '98.7%',
      rimDepth: '18.4 m',
      ejectaPattern: 'Radial high-albedo rays, sharp rim crest',
      earthAnalog: 'Haughton Impact Crater (Devon Island)',
      earthAnalogSiteId: 'haughton_crater',
      coord: '23.445° N, 45.673° E',
      color: '#38BDF8',
      leftPercent: 8.5,
      topPercent: 16.5,
      widthPercent: 18.5,
      heightPercent: 21.0,
    },
    {
      id: 'lunar-medium',
      body: 'lunar',
      name: 'Secondary Lunar Impact Crater',
      diameter: '32.1 m',
      confidence: '98.1%',
      rimDepth: '7.2 m',
      ejectaPattern: 'Continuous inner rim melt sheet',
      earthAnalog: 'Barringer Meteor Crater (Arizona)',
      earthAnalogSiteId: 'death_valley',
      coord: '23.432° N, 45.689° E',
      color: '#38BDF8',
      leftPercent: 20.0,
      topPercent: 44.0,
      widthPercent: 6.5,
      heightPercent: 8.5,
    },
    {
      id: 'lunar-small',
      body: 'lunar',
      name: 'Micro Impact Craterlet',
      diameter: '8.7 m',
      confidence: '93.2%',
      rimDepth: '1.9 m',
      ejectaPattern: 'Dispersed fine breccia powder',
      earthAnalog: 'Kaali Crater Field (Estonia)',
      earthAnalogSiteId: 'haughton_crater',
      coord: '23.419° N, 45.695° E',
      color: '#38BDF8',
      leftPercent: 14.8,
      topPercent: 59.0,
      widthPercent: 2.8,
      heightPercent: 3.5,
    },
    {
      id: 'mars-large',
      body: 'martian',
      name: 'Major Martian Flat-Floor Crater',
      diameter: '112.4 m',
      confidence: '99.1%',
      rimDepth: '22.8 m',
      ejectaPattern: 'Fluidized ejecta blanket with lobate flow lobes',
      earthAnalog: 'Ries Crater & Atacama Hyper-Arid Regolith',
      earthAnalogSiteId: 'atacama_desert',
      coord: '18.234° N, 77.432° E',
      color: '#FB923C',
      leftPercent: 71.5,
      topPercent: 19.5,
      widthPercent: 17.5,
      heightPercent: 22.0,
    },
    {
      id: 'mars-medium',
      body: 'martian',
      name: 'Sub-Kilometer Martian Dune Basin',
      diameter: '45.3 m',
      confidence: '97.3%',
      rimDepth: '9.6 m',
      ejectaPattern: 'Wind-sculpted aeolian rippled interior fill',
      earthAnalog: 'Death Valley Badwater Salt & Alluvial Fans',
      earthAnalogSiteId: 'death_valley',
      coord: '18.210° N, 77.412° E',
      color: '#FB923C',
      leftPercent: 66.0,
      topPercent: 44.5,
      widthPercent: 8.5,
      heightPercent: 10.5,
    },
    {
      id: 'mars-small',
      body: 'martian',
      name: 'Juvenile Martian Craterlet',
      diameter: '11.2 m',
      confidence: '94.8%',
      rimDepth: '2.4 m',
      ejectaPattern: 'Degraded thermal permafrost rim cracks',
      earthAnalog: 'McMurdo Dry Valleys Polygons',
      earthAnalogSiteId: 'mcmurdo_dry_valleys',
      coord: '18.225° N, 77.450° E',
      color: '#FB923C',
      leftPercent: 65.5,
      topPercent: 60.5,
      widthPercent: 3.2,
      heightPercent: 4.0,
    },
  ];

  return (
    <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-br from-[#060914] via-[#080D1D] to-[#04060E] p-6 lg:p-8 shadow-2xl shadow-orange-950/30 space-y-6">
      {/* HUD Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#C84B31] via-[#E59840] to-cyan-500 p-0.5 shadow-lg shadow-orange-950/40">
            <div className="w-full h-full bg-[#080D1A] rounded-[14px] flex items-center justify-center">
              <Scan className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">
                CraterNet v3.2 • AI Surface Telemetry System
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                LRO NAC &times; MRO HiRISE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Deep convolutional neural network performing real-time crater morphology, diameter clustering, and terrestrial analog mapping.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-[#050812] p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveOverlay('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeOverlay === 'all'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dual View
            </button>
            <button
              onClick={() => setActiveOverlay('lunar')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeOverlay === 'lunar'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Lunar (LRO)
            </button>
            <button
              onClick={() => setActiveOverlay('martian')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeOverlay === 'martian'
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Martian (HiRISE)
            </button>
          </div>

          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              showGrid
                ? 'bg-slate-800 text-slate-200 border-slate-700'
                : 'bg-transparent text-slate-500 border-slate-800'
            }`}
          >
            Grid 1:2,000
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Radar & Analysis Frame */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800/90 bg-black shadow-2xl group">
        {/* Base Image */}
        <img
          src="/images/lunar_martian_analysis.jpg"
          alt="CraterNet v3.2 AI Analysis System"
          className="w-full h-auto object-cover select-none"
        />

        {/* Coordinate Overlay Watermark */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        )}

        {/* Interactive Hotspot Bounding Boxes */}
        {craters.map((c) => {
          if (activeOverlay === 'lunar' && c.body !== 'lunar') return null;
          if (activeOverlay === 'martian' && c.body !== 'martian') return null;

          const isSelected = selectedCrater?.id === c.id;
          const isLunar = c.body === 'lunar';

          return (
            <div
              key={c.id}
              onClick={() => setSelectedCrater(isSelected ? null : c)}
              style={{
                position: 'absolute',
                left: `${c.leftPercent}%`,
                top: `${c.topPercent}%`,
                width: `${c.widthPercent}%`,
                height: `${c.heightPercent}%`,
              }}
              className={`border-2 rounded-sm cursor-pointer transition-all duration-300 pointer-events-auto ${
                isLunar
                  ? isSelected
                    ? 'border-cyan-400 bg-cyan-500/30 shadow-[0_0_25px_rgba(56,189,248,0.9)] ring-2 ring-cyan-300'
                    : 'border-cyan-400/80 hover:border-cyan-300 hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(56,189,248,0.6)]'
                  : isSelected
                  ? 'border-amber-400 bg-orange-500/30 shadow-[0_0_25px_rgba(245,158,11,0.9)] ring-2 ring-amber-300'
                  : 'border-orange-500/80 hover:border-amber-400 hover:bg-orange-500/20 hover:shadow-[0_0_15px_rgba(245,158,11,0.6)]'
              }`}
              title={`${c.name} (${c.diameter})`}
            >
              {/* Corner brackets */}
              <div
                className={`absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 ${
                  isLunar ? 'border-cyan-300' : 'border-amber-300'
                }`}
              />
              <div
                className={`absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 ${
                  isLunar ? 'border-cyan-300' : 'border-amber-300'
                }`}
              />
              <div
                className={`absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 ${
                  isLunar ? 'border-cyan-300' : 'border-amber-300'
                }`}
              />
              <div
                className={`absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 ${
                  isLunar ? 'border-cyan-300' : 'border-amber-300'
                }`}
              />

              {/* Pulsing indicator tag */}
              <div
                className={`absolute -top-6 left-0 px-2 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap shadow-md backdrop-blur-md ${
                  isLunar
                    ? 'bg-cyan-950/90 text-cyan-200 border border-cyan-500/60'
                    : 'bg-orange-950/90 text-amber-200 border border-amber-500/60'
                }`}
              >
                {c.diameter} • {c.confidence}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Crater Inspection Dossier */}
      {selectedCrater && (
        <div
          className={`p-5 rounded-2xl border animate-fade-in transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 ${
            selectedCrater.body === 'lunar'
              ? 'bg-gradient-to-r from-[#081528] via-[#09182E] to-[#040814] border-cyan-500/50 shadow-xl shadow-cyan-950/30'
              : 'bg-gradient-to-r from-[#211109] via-[#1B0E09] to-[#060A14] border-amber-500/50 shadow-xl shadow-orange-950/30'
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  selectedCrater.body === 'lunar'
                    ? 'bg-cyan-600/30 text-cyan-300 border-cyan-400'
                    : 'bg-orange-600/30 text-amber-300 border-amber-400'
                }`}
              >
                {selectedCrater.body.toUpperCase()} DETECTED FORMATION
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Coordinates: {selectedCrater.coord}
              </span>
            </div>

            <h3 className="text-lg font-black text-white flex items-center gap-2">
              {selectedCrater.name}
              <span className="text-sm font-mono text-emerald-400">
                (Confidence: {selectedCrater.confidence})
              </span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Rim Diameter:
                </span>
                <span className="font-bold text-white font-mono">{selectedCrater.diameter}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Rim-to-Floor Depth:
                </span>
                <span className="font-bold text-white font-mono">{selectedCrater.rimDepth}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Ejecta Morphology:
                </span>
                <span className="text-slate-300 font-medium text-[11px] truncate block">
                  {selectedCrater.ejectaPattern}
                </span>
              </div>
            </div>
          </div>

          {/* Terrestrial Analog Bridge Action */}
          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <div className="text-[11px] text-slate-300">
              Closest Earth Analog Counterpart:
            </div>
            <div className="text-xs font-bold text-amber-300 bg-black/40 px-3 py-1 rounded-lg border border-amber-500/30">
              {selectedCrater.earthAnalog}
            </div>
            {onExploreAnalog && (
              <button
                onClick={() => onExploreAnalog(selectedCrater.earthAnalogSiteId)}
                className="mt-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[#C84B31] to-[#E59840] hover:from-[#B83A20] hover:to-[#D97706] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-orange-950 cursor-pointer"
              >
                Inspect Earth Analog
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Multi-Parameter Comparative Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Lunar Surface Stats */}
        <div className="p-4 rounded-2xl bg-[#081020] border border-cyan-500/30 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-cyan-300 text-[10px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Lunar Surface Analysis (LRO)
            </span>
            <span className="font-mono text-slate-400 text-[10px]">0.5 m/px</span>
          </div>

          <div className="text-3xl font-black text-white flex items-baseline gap-2">
            1,248
            <span className="text-xs text-slate-400 font-medium font-sans">craters detected</span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800 pt-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Large (&gt;50 m):</span>
              <span className="font-bold text-white font-mono">24</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Medium (10–50 m):</span>
              <span className="font-bold text-white font-mono">156</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Small (&lt;10 m):</span>
              <span className="font-bold text-white font-mono">1,068</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800/60 text-cyan-300">
              <span>Crater Density:</span>
              <span className="font-mono font-bold">18.7 / km²</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Surface Age:</span>
              <span className="font-mono font-bold text-slate-200">3.2 Ga (Imbrian)</span>
            </div>
          </div>
        </div>

        {/* Neural Network Telemetry */}
        <div className="p-4 rounded-2xl bg-[#0B0F1C] border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-amber-300 text-[10px] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              AI Model: CraterNet v3.2
            </span>
            <span className="font-mono text-emerald-400 font-bold text-[10px]">OPERATIONAL</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Inference Batch Progress</span>
              <span className="font-bold text-amber-300 font-mono">89%</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-cyan-500 via-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                style={{ width: '89%' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800 text-slate-300">
            <div className="p-2 rounded-lg bg-black/40 border border-slate-800/80">
              <div className="text-[10px] text-slate-400">GPU Utilization</div>
              <div className="font-bold text-emerald-400 font-mono text-sm">78%</div>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-slate-800/80">
              <div className="text-[10px] text-slate-400">VRAM Load</div>
              <div className="font-bold text-slate-200 font-mono text-sm">6.2 / 8.0 GB</div>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-slate-800/80">
              <div className="text-[10px] text-slate-400">Data Throughput</div>
              <div className="font-bold text-cyan-400 font-mono text-sm">2.4 GB/s</div>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-slate-800/80">
              <div className="text-[10px] text-slate-400">Queue Depth</div>
              <div className="font-bold text-amber-300 font-mono text-sm">3 / 10</div>
            </div>
          </div>
        </div>

        {/* Martian Surface Stats */}
        <div className="p-4 rounded-2xl bg-[#1A0E08] border border-orange-500/40 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-amber-300 text-[10px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              Martian Surface Analysis (HiRISE)
            </span>
            <span className="font-mono text-slate-400 text-[10px]">0.25 m/px</span>
          </div>

          <div className="text-3xl font-black text-orange-400 flex items-baseline gap-2">
            2,193
            <span className="text-xs text-slate-400 font-medium font-sans">craters detected</span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800 pt-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Large (&gt;50 m):</span>
              <span className="font-bold text-white font-mono">37</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Medium (10–50 m):</span>
              <span className="font-bold text-white font-mono">342</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Small (&lt;10 m):</span>
              <span className="font-bold text-white font-mono">1,814</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800/60 text-amber-400">
              <span>Crater Density:</span>
              <span className="font-mono font-bold">27.3 / km²</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Surface Age:</span>
              <span className="font-mono font-bold text-slate-200">3.7 Ga (Noachian)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
