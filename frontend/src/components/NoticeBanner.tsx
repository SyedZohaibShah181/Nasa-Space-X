import React from 'react';
import { Sparkles, Satellite, Compass } from 'lucide-react';

export const NoticeBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-[#170E08]/90 via-[#0B101D]/90 to-[#0A1220]/90 border-b border-amber-500/25 px-4 py-2 text-xs text-amber-200/90 flex flex-wrap items-center justify-between gap-2 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse shadow-sm shadow-amber-400" />
        <span className="font-extrabold tracking-wide uppercase text-amber-400 text-[11px]">
          Planetary Research Environment:
        </span>
        <span className="text-slate-300">
          Earth-Moon-Mars Analog Discovery Pipeline active with NASA Earthdata & PDS telemetry.
        </span>
      </div>
      <div className="flex items-center gap-4 text-slate-400 text-[11px]">
        <span className="inline-flex items-center gap-1.5 text-amber-300">
          <Satellite className="w-3.5 h-3.5 text-amber-400" />
          NASA Space Apps Challenge 2026
        </span>
        <span className="inline-flex items-center gap-1.5 text-slate-400">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          Category B Physical Invariants Decoupled
        </span>
      </div>
    </div>
  );
};
