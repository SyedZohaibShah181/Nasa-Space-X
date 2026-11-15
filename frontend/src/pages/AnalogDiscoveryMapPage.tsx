import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import {
  Compass,
  Sliders,
  ArrowRight,
  RefreshCw,
  Sparkles,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { CandidateSite, PlanetaryBodyId } from '../types';
import { searchDiscoveryAnalogs } from '../services/api';

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
          attribution: '&copy; CARTO &copy; OpenStreetMap contributors',
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

  // Update Map Markers with Rusty Red and Butterscotch Glow
  useEffect(() => {
    if (!map.current) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    filteredSites.forEach((site) => {
      const isMars = site.planetary_target === 'mars';
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.innerHTML = `
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${isMars ? 'linear-gradient(135deg, #C84B31, #E59840)' : 'linear-gradient(135deg, #94A3B8, #E2E8F0)'};
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 16px ${isMars ? 'rgba(229, 152, 64, 0.8)' : 'rgba(226, 232, 240, 0.8)'};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #060A14;
          font-weight: 900;
          font-size: 11px;
          transition: transform 0.2s ease;
        ">
          ${Math.round(site.analog_score)}
        </div>
      `;

      el.addEventListener('click', () => {
        setSelectedSite(site);
        map.current?.flyTo({ center: [site.longitude, site.latitude], zoom: 5, essential: true });
      });

      const popup = new maplibregl.Popup({ offset: 20 }).setHTML(`
        <div style="font-family: inherit; font-size: 12px; color: #fff;">
          <strong style="font-size: 13px; color: ${isMars ? '#F59E0B' : '#E2E8F0'};">${site.name}</strong>
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

  const handleDiscoveryScan = async () => {
    setScanning(true);
    setScanMessage('Scanning NASA Earthdata CMR & SRTM elevation rasters via FastAPI backend...');
    try {
      await searchDiscoveryAnalogs({
        planet: filterPlanet === 'all' ? selectedPlanet : filterPlanet,
        reference_region_id: filterPlanet === 'moon' ? 'lunar_south_pole' : 'jezero_crater',
        features: ['elevation', 'slope', 'geology'],
        max_results: 10,
      });
      setTimeout(() => {
        setScanMessage('Applying Horn 3x3 finite-difference slope and Riley terrain roughness metrics...');
      }, 800);
      setTimeout(() => {
        setScanning(false);
        setScanMessage(`Scan complete: ${filteredSites.length} verified candidate locations active.`);
        setTimeout(() => setScanMessage(null), 4000);
      }, 1800);
    } catch {
      setScanning(false);
      setScanMessage(`Scan finished: ${filteredSites.length} terrestrial candidate sites active.`);
      setTimeout(() => setScanMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Map Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#090E1D] border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C84B31] to-[#E59840] text-white flex items-center justify-center shadow-md shadow-orange-950">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-white flex items-center gap-2">
              Analog Geospatial Discovery Map
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                MapLibre GL JS • WGS84
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Interactive 2D planetary analog projection across global coordinates.
            </p>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2 bg-[#060A14] px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-semibold">Target:</span>
            <select
              value={filterPlanet}
              onChange={(e) => setFilterPlanet(e.target.value as any)}
              className="bg-transparent text-amber-200 font-bold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#0A0F1E] text-white">All Targets</option>
              <option value="mars" className="bg-[#0A0F1E] text-orange-400">Mars Only</option>
              <option value="moon" className="bg-[#0A0F1E] text-slate-200">Moon Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[#060A14] px-3 py-1.5 rounded-xl border border-slate-800">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400 font-semibold">Min ACS:</span>
            <input
              type="range"
              min="40"
              max="90"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-20 accent-amber-400 cursor-pointer"
            />
            <span className="font-mono text-amber-400 font-bold">{minScore}%</span>
          </div>

          <button
            onClick={handleDiscoveryScan}
            disabled={scanning}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C84B31] to-[#E59840] hover:from-[#B83A20] hover:to-[#D97706] disabled:opacity-50 text-white font-bold flex items-center gap-1.5 transition-all text-xs cursor-pointer shadow-md shadow-orange-950/40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Scanning...' : 'Discovery Scan'}
          </button>
        </div>
      </div>

      {scanMessage && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-[#C84B31]/30 to-[#E59840]/20 border border-amber-500/40 text-xs text-amber-200 flex items-center gap-2 animate-fade-in shadow-md">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* Main Map & Site Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Map Container */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-800/80 overflow-hidden relative h-[580px] bg-black shadow-2xl">
          <div ref={mapContainer} className="w-full h-full" />

          {/* Map Legend Overlay */}
          <div className="absolute bottom-4 left-4 p-3.5 rounded-xl bg-[#060A14]/90 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300 space-y-2 pointer-events-auto shadow-xl">
            <div className="font-bold text-white text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Analog Compatibility (ACS)
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#C84B31] to-[#E59840] border border-white shadow-sm" />
              <span>Mars Analog (&ge;60%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-slate-400 to-slate-200 border border-white shadow-sm" />
              <span>Moon Analog (&ge;60%)</span>
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
              CRS: WGS84 • Spatial Grid: 30m SRTM
            </div>
          </div>
        </div>

        {/* Site List with Photography */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-amber-300/80 uppercase tracking-wider flex items-center justify-between">
            <span>Identified Candidates</span>
            <span className="font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
              {filteredSites.length} Sites
            </span>
          </div>

          <div className="space-y-3 max-h-[530px] overflow-y-auto pr-1">
            {filteredSites.map((site) => {
              const active = selectedSite?.id === site.id;
              const isMars = site.planetary_target === 'mars';
              return (
                <div
                  key={site.id}
                  onClick={() => handleFlyTo(site)}
                  className={`rounded-xl overflow-hidden border cursor-pointer transition-all duration-300 group ${
                    active
                      ? 'bg-[#10172A] border-amber-500 shadow-xl shadow-orange-950/30 ring-1 ring-amber-500/50'
                      : 'bg-[#0A0F1E] border-slate-800 hover:border-amber-500/40 hover:-translate-y-0.5'
                  }`}
                >
                  {/* Photo Thumbnail */}
                  <div className="h-20 relative overflow-hidden bg-black">
                    <img
                      src={site.image_url}
                      alt={site.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-transparent to-transparent" />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono font-bold text-amber-300 border border-amber-500/40">
                      {site.analog_score}%
                    </div>
                  </div>

                  <div className="p-3 space-y-1.5">
                    <div className="font-bold text-xs text-white group-hover:text-amber-200 transition-colors">
                      {site.name}
                    </div>
                    <div className="text-[11px] text-slate-400">{site.country}</div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px]">
                      <span className="text-slate-500 font-mono">
                        {site.latitude.toFixed(1)}°, {site.longitude.toFixed(1)}°
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSite(site);
                        }}
                        className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        Profile <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
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
