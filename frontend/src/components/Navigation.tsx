import React from 'react';
import {
  LayoutDashboard,
  Globe2,
  MapPin,
  Compass,
  GitCompare,
  Database,
  FileText,
  Settings,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { PlanetaryBodyId } from '../types';

export type NavPage =
  | 'dashboard'
  | 'planets'
  | 'regions'
  | 'map'
  | 'compare'
  | 'datasets'
  | 'reports'
  | 'settings';

interface NavigationProps {
  currentPage: NavPage;
  onSelectPage: (page: NavPage) => void;
  selectedPlanet: PlanetaryBodyId;
  onSelectPlanet: (planet: PlanetaryBodyId) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onSelectPage,
  selectedPlanet,
  onSelectPlanet,
}) => {
  const navItems: { id: NavPage; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Cosmic Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'planets', label: 'Mars & Moon Worlds', icon: <Globe2 className="w-4 h-4" /> },
    { id: 'regions', label: 'Planetary Benchmark Sites', icon: <MapPin className="w-4 h-4" /> },
    { id: 'map', label: 'Geospatial Analog Map', icon: <Compass className="w-4 h-4" />, badge: 'Live 2D' },
    { id: 'compare', label: 'Deep Analog Comparison', icon: <GitCompare className="w-4 h-4" /> },
    { id: 'datasets', label: 'Scientific Data Catalog', icon: <Database className="w-4 h-4" /> },
    { id: 'reports', label: 'Research Dossiers', icon: <FileText className="w-4 h-4" /> },
    { id: 'settings', label: 'Similarity Parameters', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-[#060A14]/90 backdrop-blur-xl border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none min-h-screen">
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-slate-800/60 bg-gradient-to-b from-[#0B1220]/70 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C84B31] via-[#E59840] to-[#06B6D4] flex items-center justify-center shadow-lg shadow-orange-950/40 border border-amber-400/30">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                TerraTwin
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  NASA 2026
                </span>
              </div>
              <div className="text-[11px] text-amber-200/60 font-medium">
                Earth • Moon • Mars Platform
              </div>
            </div>
          </div>

          {/* Planetary Target Switcher */}
          <div className="mt-4 p-1 bg-[#0A0F1E] rounded-xl border border-slate-800/80 flex gap-1 shadow-inner">
            <button
              onClick={() => onSelectPlanet('mars')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-300 ${
                selectedPlanet === 'mars'
                  ? 'bg-gradient-to-r from-[#C84B31]/40 to-[#E59840]/30 text-amber-200 border border-amber-500/50 shadow-md shadow-orange-900/30'
                  : 'text-slate-400 hover:text-amber-200 hover:bg-slate-800/40'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#C84B31] shadow-sm shadow-orange-500" />
              Mars
            </button>
            <button
              onClick={() => onSelectPlanet('moon')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-300 ${
                selectedPlanet === 'moon'
                  ? 'bg-gradient-to-r from-slate-400/30 to-slate-200/20 text-slate-100 border border-slate-300/50 shadow-md shadow-slate-700/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shadow-sm shadow-white" />
              Moon
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Exploration Hub
          </div>
          {navItems.map((item) => {
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectPage(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-[#C84B31]/20 via-[#E59840]/15 to-transparent text-amber-200 border-l-2 border-amber-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={active ? 'text-amber-400' : 'text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800/80 text-amber-300 border border-amber-500/20">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/60 bg-[#040711]/60 text-[11px] text-slate-400 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Telemetry:</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            FastAPI Live
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">ACS Model:</span>
          <span className="text-amber-300/80 font-mono text-[10px]">v1.0 Horn-Riley</span>
        </div>
        <div className="pt-2 border-t border-slate-800/60 text-[10px] text-slate-500 flex items-center justify-between">
          <span>NASA Space Apps 2026</span>
          <span className="text-amber-400/80">TerraTwin</span>
        </div>
      </div>
    </aside>
  );
};
