import React, { useEffect, useState } from 'react';
import { Navigation, NavPage } from './components/Navigation';
import { NoticeBanner } from './components/NoticeBanner';
import { DashboardPage } from './pages/DashboardPage';
import { PlanetSelectionPage } from './pages/PlanetSelectionPage';
import { ReferenceRegionsPage } from './pages/ReferenceRegionsPage';
import { AnalogDiscoveryMapPage } from './pages/AnalogDiscoveryMapPage';
import { SiteDetailsPage } from './pages/SiteDetailsPage';
import { SiteComparisonPage } from './pages/SiteComparisonPage';
import { ScientificDataCatalogPage } from './pages/ScientificDataCatalogPage';
import { AnalysisReportsPage } from './pages/AnalysisReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import {
  fetchPlanets,
  fetchReferenceRegions,
  fetchCandidateSites,
  fetchDatasets,
  fetchHealth,
} from './services/api';
import { PlanetaryBodyId, CandidateSite, ReferenceRegion, DatasetItem, Planet } from './types';
import { Loader2, AlertCircle } from 'lucide-react';

export function App() {
  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard');
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetaryBodyId>('mars');
  const [selectedSite, setSelectedSite] = useState<CandidateSite | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [regions, setRegions] = useState<ReferenceRegion[]>([]);
  const [sites, setSites] = useState<CandidateSite[]>([]);
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [apiOnline, setApiOnline] = useState<boolean>(false);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const health = await fetchHealth();
        setApiOnline(health.status === 'healthy');

        const [pData, rData, sData, dData] = await Promise.all([
          fetchPlanets(),
          fetchReferenceRegions(),
          fetchCandidateSites(),
          fetchDatasets(),
        ]);

        setPlanets(pData);
        setRegions(rData);
        setSites(sData);
        setDatasets(dData);
        if (sData.length > 0) setSelectedSite(sData[0]);
      } catch (err) {
        console.error('Failed to load application initial state:', err);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  const handleSelectSite = (site: CandidateSite) => {
    setSelectedSite(site);
    // Open Site Details view
    setCurrentPage('compare');
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col font-sans">
      {/* Notice Banner */}
      <NoticeBanner />

      {/* Main Layout Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Navigation
          currentPage={currentPage}
          onSelectPage={setCurrentPage}
          selectedPlanet={selectedPlanet}
          onSelectPlanet={setSelectedPlanet}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              <div className="text-xs font-semibold tracking-wider uppercase">
                Loading Planetary Analog Datasets...
              </div>
            </div>
          ) : (
            <>
              {currentPage === 'dashboard' && (
                <DashboardPage
                  selectedPlanet={selectedPlanet}
                  onNavigate={setCurrentPage}
                  onSelectSite={handleSelectSite}
                  sites={sites}
                  regions={regions}
                />
              )}

              {currentPage === 'planets' && (
                <PlanetSelectionPage
                  selectedPlanet={selectedPlanet}
                  onSelectPlanet={setSelectedPlanet}
                  onNavigate={setCurrentPage}
                />
              )}

              {currentPage === 'regions' && (
                <ReferenceRegionsPage
                  selectedPlanet={selectedPlanet}
                  onSelectPlanet={setSelectedPlanet}
                  regions={regions}
                  onNavigate={setCurrentPage}
                />
              )}

              {currentPage === 'map' && (
                <AnalogDiscoveryMapPage
                  selectedPlanet={selectedPlanet}
                  sites={sites}
                  onSelectSite={handleSelectSite}
                />
              )}

              {currentPage === 'compare' && (
                <SiteComparisonPage sites={sites} regions={regions} />
              )}

              {currentPage === 'datasets' && (
                <ScientificDataCatalogPage datasets={datasets} />
              )}

              {currentPage === 'reports' && (
                <AnalysisReportsPage sites={sites} regions={regions} />
              )}

              {currentPage === 'settings' && <SettingsPage />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
