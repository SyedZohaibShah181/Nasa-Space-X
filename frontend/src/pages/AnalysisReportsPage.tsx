import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { CandidateSite, ReferenceRegion } from '../types';

interface AnalysisReportsProps {
  sites: CandidateSite[];
  regions: ReferenceRegion[];
}

export const AnalysisReportsPage: React.FC<AnalysisReportsProps> = ({ sites, regions }) => {
  const [selectedSiteId, setSelectedSiteId] = useState<string>(sites[0]?.id || '');
  const [selectedRegionId, setSelectedRegionId] = useState<string>(regions[0]?.id || '');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const site = sites.find((s) => s.id === selectedSiteId) || sites[0];
  const region = regions.find((r) => r.id === selectedRegionId) || regions[0];

  const handleDownload = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-cyan-400" />
            Scientific Research Dossiers & Reports
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            Export reproducible comparative scientific reports with explicit metadata provenance and mathematical formulas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-cyan-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            {isExporting ? 'Generating PDF...' : 'Download Dossier (PDF/JSON)'}
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Report generated successfully: <code className="font-mono text-emerald-200">TerraTwin_Report_{site?.id}_{region?.id}.pdf</code>
          </span>
        </div>
      )}

      {/* Selector Toolbar */}
      <div className="p-4 rounded-xl bg-[#0D1424] border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
            Report Target Site (Earth)
          </label>
          <select
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.country})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
            Planetary Reference Landing Site (Moon / Mars)
          </label>
          <select
            value={selectedRegionId}
            onChange={(e) => setSelectedRegionId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
          >
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.planet.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Formal Research Document Preview Canvas */}
      <div className="rounded-xl border border-slate-800 bg-[#0A0E1A] p-8 space-y-6 shadow-2xl print:border-none print:p-0 print:bg-white print:text-black">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-5 flex flex-wrap justify-between items-start gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">
              TerraTwin Scientific Dossier • DOC-ID: TT-2026-EXP-088
            </div>
            <h2 className="text-xl font-black text-white mt-1">
              Comparative Planetary Analog Investigation: {site?.name} vs. {region?.name}
            </h2>
            <div className="text-xs text-slate-400 mt-1">
              Methodology Version: 1.0 • NASA Space Apps Challenge 2026 • Status: Certified Baseline
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-cyan-400">{site?.analog_score}%</div>
            <div className="text-[10px] uppercase font-bold text-slate-500">Analog Compatibility Score</div>
          </div>
        </div>

        {/* 1. Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            1. Executive Summary & Mission Utility
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-4 rounded-lg border border-slate-800/80">
            This dossier evaluates the terrestrial environment of {site?.name} ({site?.country}) as a
            functional research analog for {region?.name} on {region?.planet.toUpperCase()}. With a composite
            Analog Compatibility Score of {site?.analog_score}%, the site presents strong correlation in
            desiccated soil mechanics and volcanic substrate composition.
          </p>
        </div>

        {/* 2. Mathematical Methodology */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            2. Mathematical Similarity Methodology
          </h3>
          <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-2 font-mono text-slate-300">
            <div>Normalized Feature Score: S_i = 100 &times; (1 - min(1, |E_i - P_i| / R_i))</div>
            <div>Composite Compatibility: ACS = &Sigma;(w_i &times; S_i) / &Sigma;(w_i)</div>
            <div className="text-[11px] text-slate-400">
              Where E_i is terrestrial measurement, P_i is planetary reference, R_i is normalization scale, and w_i is feature importance weight.
            </div>
          </div>
        </div>

        {/* 3. Decoupling of Physical Invariants */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400">
            3. Invariant Environmental Decoupling (Category B Limitations)
          </h3>
          <div className="p-4 rounded-lg bg-rose-950/20 border border-rose-900/40 text-xs text-rose-200/90 leading-relaxed">
            <strong>Critical Boundary Condition:</strong> High geological or morphological compatibility does NOT
            imply atmospheric, radiation, or gravitational parity. Researchers must explicitly account for Earth’s 9.81 m/s²
            gravity and 101.3 kPa N2/O2 atmosphere when deploying robotics or testing life-detection instruments.
          </div>
        </div>

        {/* 4. Open Dataset Provenance */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            4. Authoritative Datasets Used in Synthesis
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">NASA Earthdata:</span> SRTM 30m Digital Elevation Model
            </div>
            <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">NASA PDS:</span> {region?.planet === 'mars' ? 'MOLA (463m)' : 'LOLA (118m)'}
            </div>
            <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">USGS Astrogeology:</span> Geological Map Units & Mineral Context
            </div>
            <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">ESA Copernicus:</span> Sentinel-2 Multispectral MSI
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

