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
    { id: 'dashboard', label: 'Mission Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'planets', label: 'Target Worlds', icon: <Globe2 className="w-4 h-4" /> },
    { id: 'regions', label: 'Reference Sites', icon: <MapPin className="w-4 h-4" /> },
    { id: 'map', label: 'Analog Geospatial Map', icon: <Compass className="w-4 h-4" />, badge: '2D/3D' },
    { id: 'compare', label: 'Site Comparison', icon: <GitCompare className="w-4 h-4" /> },
    { id: 'datasets', label: 'Scientific Catalog', icon: <Database className="w-4 h-4" /> },
    { id: 'reports', label: 'Research Reports', icon: <FileText className="w-4 h-4" /> },
    { id: 'settings', label: 'Engine Parameters', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-[#0B101D] border-r border-slate-800 flex flex-col justify-between shrink-0 select-none min-h-screen">
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/40">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                TerraTwin
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-700/50">
                  v1.0
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                Earth-Moon-Mars Research
              </div>
            </div>
          </div>

          {/* Quick Planetary Target Switcher */}
          <div className="mt-4 p-1 bg-slate-900/90 rounded-lg border border-slate-800 flex gap-1">
            <button
              onClick={() => onSelectPlanet('mars')}
              className={`flex-1 py-1.5 px-2 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                selectedPlanet === 'mars'
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              Mars Target
            </button>
            <button
              onClick={() => onSelectPlanet('moon')}
              className={`flex-1 py-1.5 px-2 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                selectedPlanet === 'moon'
                  ? 'bg-slate-300/20 text-slate-100 border border-slate-400/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-300" />
              Moon Target
            </button>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Research Modules
          </div>
          {navItems.map((item) => {
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectPage(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  active
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={active ? 'text-cyan-400' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Provenance links */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-400 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">API Status:</span>
          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            FastAPI 1.0.0
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Score Engine:</span>
          <span className="text-slate-300 font-mono">ACS v1.0</span>
        </div>
        <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
          <span>NASA Space Apps 2026</span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:underline inline-flex items-center gap-0.5"
          >
            Docs <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </aside>
  );
};

