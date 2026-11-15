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
  FileJson,
  Layers,
} from 'lucide-react';
import { CandidateSite, ReferenceRegion } from '../types';
import { generateScientificReport } from '../services/api';

interface AnalysisReportsProps {
  sites: CandidateSite[];
  regions: ReferenceRegion[];
}

export const AnalysisReportsPage: React.FC<AnalysisReportsProps> = ({ sites, regions }) => {
  const [selectedSiteId, setSelectedSiteId] = useState<string>(sites[0]?.id || 'atacama_desert');
  const [selectedRegionId, setSelectedRegionId] = useState<string>(regions[0]?.id || 'jezero_crater');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const site = sites.find((s) => s.id === selectedSiteId) || sites[0];
  const region = regions.find((r) => r.id === selectedRegionId) || regions[0];

  const handleDownloadDossier = async () => {
    setIsExporting(true);
    try {
      await generateScientificReport({
        site_id: site.id,
        region_id: region.id,
        include_methodology: true,
      });

      // Construct Complete Scientific Dossier
      const dossierPayload = {
        title: `TerraTwin Scientific Dossier: ${site.name} vs ${region.name}`,
        mission: 'NASA Space Apps Challenge 2026',
        generated_at: new Date().toISOString(),
        site: {
          id: site.id,
          name: site.name,
          country: site.country,
          latitude: site.latitude,
          longitude: site.longitude,
          environment_type: site.environment_type,
          features: site.features,
          analog_compatibility_score: site.analog_score,
          why_analog: site.why_analog,
        },
        reference_region: {
          id: region.id,
          name: region.name,
          planet: region.planet,
          latitude: region.latitude,
          longitude: region.longitude,
          diameter_km: region.diameter_km,
          elevation_m: region.elevation_m,
          mission_relevance: region.mission_relevance,
        },
        methodology: {
          model: 'Horn-Riley Normalized ACS Model v1.0',
          normalized_formula: 'S_i = 100 * (1 - min(1, |E_i - P_i| / R_i))',
          composite_formula: 'ACS = SUM(w_i * S_i) / SUM(w_i)',
          category_b_decoupled: true,
          category_b_notes: 'Gravity (0.38g / 0.16g), hard vacuum, and solar ionizing radiation cannot be reproduced on Earth and are explicitly excluded from ACS.',
        },
        provenance_datasets: [
          'NASA SRTM 30m Digital Elevation Model',
          'NASA PDS MOLA (463m) / LOLA (118m)',
          'NASA MODIS Land Surface Temperature (MOD11A2)',
          'USGS Astrogeology Planetary GIS Maps',
        ],
      };

      const blob = new Blob([JSON.stringify(dossierPayload, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `TerraTwin_Dossier_${site.id}_${region.id}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            NASA Space Apps Challenge 2026 Documentation
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-white flex items-center gap-3">
            <FileText className="w-7 h-7 text-amber-400" />
            Scientific Research Dossiers & Reports
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1 max-w-2xl">
            Export reproducible comparative scientific reports with explicit metadata provenance, Horn-Riley slope metrics, and mathematical formulas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-[#0B101E] hover:bg-[#131B32] text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Dossier
          </button>
          <button
            onClick={handleDownloadDossier}
            disabled={isExporting}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C84B31] to-[#E59840] hover:from-[#B83A20] hover:to-[#D97706] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-orange-950/50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            {isExporting ? 'Packaging Dossier...' : 'Download Dossier (JSON/PDF)'}
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-600 text-xs text-emerald-200 flex items-center gap-2.5 animate-fade-in shadow-lg">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Research dossier compiled and downloaded: <code className="font-mono text-emerald-100 font-bold">TerraTwin_Dossier_{site?.id}_{region?.id}.json</code>
          </span>
        </div>
      )}

      {/* Selector Toolbar */}
      <div className="p-5 rounded-2xl bg-[#090E1D] border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-5 shadow-xl">
        <div>
          <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
            Target Analog Site (Earth)
          </label>
          <select
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            className="w-full bg-[#060A14] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-semibold cursor-pointer"
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#0A0F1E]">
                {s.name} ({s.country})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
            Planetary Reference Landing Site (Moon / Mars)
          </label>
          <select
            value={selectedRegionId}
            onChange={(e) => setSelectedRegionId(e.target.value)}
            className="w-full bg-[#060A14] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-semibold cursor-pointer"
          >
            {regions.map((r) => (
              <option key={r.id} value={r.id} className="bg-[#0A0F1E]">
                {r.name} ({r.planet.toUpperCase()}) — {r.mission_relevance}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Formal Research Document Preview Canvas */}
      <div className="rounded-2xl border border-slate-800 bg-[#070B16] p-8 lg:p-10 space-y-7 shadow-2xl print:border-none print:p-0 print:bg-white print:text-black">
        {/* Document Header */}
        <div className="border-b border-slate-800/80 pb-6 flex flex-wrap justify-between items-start gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
              TerraTwin Scientific Dossier • DOC-ID: TT-2026-EXP-088
            </div>
            <h2 className="text-2xl font-black text-white mt-1">
              Comparative Planetary Analog Investigation: {site?.name} vs. {region?.name}
            </h2>
            <div className="text-xs text-slate-400 mt-1">
              Methodology Version: 1.0 • NASA Space Apps Challenge 2026 • Status: Certified Baseline
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-black text-amber-400 glow-butterscotch">{site?.analog_score}%</div>
            <div className="text-[10px] uppercase font-bold text-amber-300/80">Analog Compatibility Score</div>
          </div>
        </div>

        {/* 1. Executive Summary */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
            1. Executive Summary & Mission Utility
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed bg-[#0A0F1E] p-4 rounded-xl border border-slate-800/80">
            This dossier evaluates the terrestrial environment of {site?.name} ({site?.country}) as a
            functional research analog for {region?.name} on {region?.planet.toUpperCase()}. With a composite
            Analog Compatibility Score of {site?.analog_score}%, the site presents strong correlation in
            desiccated soil mechanics and volcanic substrate composition.
          </p>
        </div>

        {/* 2. Mathematical Methodology */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
            2. Mathematical Similarity Methodology
          </h3>
          <div className="p-4 rounded-xl bg-[#090E1D] border border-slate-800 text-xs space-y-2 font-mono text-slate-300">
            <div>Normalized Feature Score: S_i = 100 &times; (1 - min(1, |E_i - P_i| / R_i))</div>
            <div>Composite Compatibility: ACS = &Sigma;(w_i &times; S_i) / &Sigma;(w_i)</div>
            <div className="text-[11px] text-slate-400 font-sans">
              Where E_i is terrestrial measurement, P_i is planetary reference, R_i is normalization scale, and w_i is feature importance weight.
            </div>
          </div>
        </div>

        {/* 3. Decoupling of Physical Invariants */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-orange-400" />
            3. Invariant Environmental Decoupling (Category B Limitations)
          </h3>
          <div className="p-4 rounded-xl bg-[#1A0E08] border border-orange-700/50 text-xs text-orange-200/90 leading-relaxed">
            <strong>Critical Boundary Condition:</strong> High geological or morphological compatibility does NOT
            imply atmospheric, radiation, or gravitational parity. Researchers must explicitly account for Earth’s 9.81 m/s²
            gravity and 101.3 kPa N2/O2 atmosphere when deploying robotics or testing life-detection instruments.
          </div>
        </div>

        {/* 4. Open Dataset Provenance */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
            4. Authoritative Datasets Used in Synthesis
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#0A0F1E] border border-slate-800">
              <span className="text-amber-400 font-bold block">NASA Earthdata:</span> SRTM 30m Digital Elevation Model
            </div>
            <div className="p-3 rounded-xl bg-[#0A0F1E] border border-slate-800">
              <span className="text-amber-400 font-bold block">NASA PDS:</span> {region?.planet === 'mars' ? 'MOLA (463m)' : 'LOLA (118m)'}
            </div>
            <div className="p-3 rounded-xl bg-[#0A0F1E] border border-slate-800">
              <span className="text-amber-400 font-bold block">USGS Astrogeology:</span> Geological Map Units & Mineral Context
            </div>
            <div className="p-3 rounded-xl bg-[#0A0F1E] border border-slate-800">
              <span className="text-amber-400 font-bold block">ESA Copernicus:</span> Sentinel-2 Multispectral MSI
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
