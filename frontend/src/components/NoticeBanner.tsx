import React from 'react';
import { AlertTriangle, Satellite, Info } from 'lucide-react';

export const NoticeBanner: React.FC = () => {
  return (
    <div className="bg-amber-950/40 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-200/90 flex flex-wrap items-center justify-between gap-2 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="font-semibold tracking-wide uppercase text-amber-400">Development Baseline:</span>
        <span>Demonstration datasets active. Actual NASA Earthdata CMR & PDS raster ingestion pipelines in staging.</span>
      </div>
      <div className="flex items-center gap-4 text-slate-400">
        <span className="inline-flex items-center gap-1">
          <Satellite className="w-3.5 h-3.5 text-cyan-400" />
          NASA Space Apps 2026
        </span>
        <span className="inline-flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          Category B Differences Decoupled
        </span>
      </div>
    </div>
  );
};

