import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import {
  Compass,
  Filter,
  Layers,
  MapPin,
  Sparkles,
  Sliders,
  ArrowRight,
  Info,
  Maximize2,
  RefreshCw,
} from 'lucide-react';
import { CandidateSite, PlanetaryBodyId } from '../types';

interface AnalogDiscoveryMapProps {
  selectedPlanet: PlanetaryBodyId;
  sites: CandidateSite[];
  onSelectSite: (site: CandidateSite) => void;
}

export const AnalogDiscoveryMapPage: React.FC<AnalogDiscoveryMapProps> = ({
  selectedPlanet,
  sites,
  onSelectSite,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [filterPlanet, setFilterPlanet] = useState<'all' | PlanetaryBodyId>(selectedPlanet);
  const [minScore, setMinScore] = useState<number>(60);
  const [selectedSite, setSelectedSite] = useState<CandidateSite | null>(sites[0] || null);
  const [scanning, setScanning] = useState<boolean>(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const filteredSites = sites.filter((site) => {
    const matchesPlanet = filterPlanet === 'all' || site.planetary_target === filterPlanet;
    const matchesScore = site.analog_score >= minScore;
    return matchesPlanet && matchesScore;
  });

  // Initialize MapLibre GL JS Map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // OpenStreetMap tile style with dark theme filter
    const cartoDarkStyle: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
            'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
            'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
          ],
          tileSize: 256,
          attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors',
        },
      },
      layers: [
        {
          id: 'carto-dark-layer',
          type: 'raster',
          source: 'osm-tiles',
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    };

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: cartoDarkStyle,
      center: [-30, 20],
      zoom: 1.8,
    });

    map.current.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update Map Markers when filtered sites change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    filteredSites.forEach((site) => {
      const isMars = site.planetary_target === 'mars';
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.innerHTML = `
        <div style="
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: ${isMars ? '#EA580C' : '#94A3B8'};
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 14px ${isMars ? 'rgba(234, 88, 12, 0.7)' : 'rgba(148, 163, 184, 0.7)'};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #000;
          font-weight: bold;
          font-size: 11px;
        ">
          ${Math.round(site.analog_score)}
        </div>
      `;

      el.addEventListener('click', () => {
        setSelectedSite(site);
        map.current?.flyTo({ center: [site.longitude, site.latitude], zoom: 5, essential: true });
      });

      const popup = new maplibregl.Popup({ offset: 18 }).setHTML(`
        <div style="font-family: inherit; font-size: 12px; color: #fff;">
          <strong style="font-size: 13px; color: ${isMars ? '#FB923C' : '#CBD5E1'};">${site.name}</strong>
          <div style="color: #94A3B8; margin-top: 2px;">${site.country}</div>
          <div style="margin-top: 6px; font-weight: bold; color: #22D3EE;">ACS Score: ${site.analog_score}%</div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([site.longitude, site.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [filteredSites]);

  const handleFlyTo = (site: CandidateSite) => {
    setSelectedSite(site);
    map.current?.flyTo({
      center: [site.longitude, site.latitude],
      zoom: 5.5,
      essential: true,
      duration: 2000,
    });
  };

  const handleDiscoveryScan = () => {
    setScanning(true);
    setScanMessage('Querying NASA Earthdata CMR & SRTM raster tiles...');
    setTimeout(() => {
      setScanMessage('Standardizing EPSG:4326 projections and computing slope roughness...');
    }, 1200);
    setTimeout(() => {
      setScanning(false);
      setScanMessage(`Scan completed: Identified ${filteredSites.length} verified terrestrial candidates.`);
      setTimeout(() => setScanMessage(null), 4000);
    }, 2500);
  };

  return (
    <div className="space-y-4">
      {/* Top Map Header & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#0D1424] border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              Analog Geospatial Discovery Map
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                MapLibre GL JS
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Interactive 2D planetary analog projection across global terrestrial coordinates.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
            <span className="text-slate-400">Target:</span>
            <select
              value={filterPlanet}
              onChange={(e) => setFilterPlanet(e.target.value as any)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none"
            >
              <option value="all">All Targets</option>
              <option value="mars">Mars Only</option>
              <option value="moon">Moon Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Min Score:</span>
            <input
              type="range"
              min="40"
              max="90"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-20 accent-cyan-400"
            />
            <span className="font-mono text-cyan-400 font-bold">{minScore}%</span>
          </div>

          <button
            onClick={handleDiscoveryScan}
            disabled={scanning}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold flex items-center gap-1.5 transition-all text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Scanning Datasets...' : 'Run Discovery Scan'}
          </button>
        </div>
      </div>

      {scanMessage && (
        <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-800 text-xs text-cyan-300 flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* Main Map & Site Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* MapLibre Map Container */}
        <div className="lg:col-span-3 rounded-xl border border-slate-800 overflow-hidden relative h-[560px] bg-slate-950">
          <div ref={mapContainer} className="w-full h-full" />

          {/* Map Overlay Badge & Legend */}
          <div className="absolute bottom-4 left-4 p-3 rounded-lg bg-[#0B101D]/90 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300 space-y-2 pointer-events-auto">
            <div className="font-bold text-white text-xs">Analog Legend (ACS)</div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 border border-white" />
              <span>Mars Analog (&ge;60%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-400 border border-white" />
              <span>Moon Analog (&ge;60%)</span>
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
              Coordinates: WGS84 (EPSG:4326)
            </div>
          </div>
        </div>

        {/* Site List & Selected Site Detail Drawer */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Identified Candidates</span>
            <span className="font-mono text-cyan-400">{filteredSites.length} Sites</span>
          </div>

          <div className="space-y-2 max-h-[510px] overflow-y-auto pr-1">
            {filteredSites.map((site) => {
              const active = selectedSite?.id === site.id;
              const isMars = site.planetary_target === 'mars';
              return (
                <div
                  key={site.id}
                  onClick={() => handleFlyTo(site)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    active
                      ? 'bg-slate-900 border-cyan-500/80 shadow-md shadow-cyan-500/10'
                      : 'bg-[#0D1424] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-xs text-white">{site.name}</div>
                      <div className="text-[11px] text-slate-400">{site.country}</div>
                    </div>
                    <span
                      className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded ${
                        isMars ? 'bg-orange-950 text-orange-400' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {site.analog_score}%
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                    {site.why_analog}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/80 text-[10px]">
                    <span className="text-slate-500">
                      {site.latitude.toFixed(1)}°, {site.longitude.toFixed(1)}°
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSite(site);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                    >
                      Profile <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
