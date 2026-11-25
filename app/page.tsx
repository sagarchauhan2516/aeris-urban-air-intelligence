'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Check,
  Compass,
  Loader2,
  MapPin,
  Menu,
  Navigation,
  RefreshCw,
  Search,
  Wind,
  X,
} from 'lucide-react';
import { AQISummary, CityPreset, FamilyAirBrief, FamilyMember } from '@/types';
import { CITY_PRESETS } from '@/lib/openmeteo';
import { LocationCard } from '@/components/LocationCard';
import { FamilyProfiles } from '@/components/FamilyProfiles';
import { AirBrief } from '@/components/AirBrief';
import { ForecastChart } from '@/components/ForecastChart';
import { VentilationWindowCard } from '@/components/VentilationWindow';
import { CommuteAdvisor } from '@/components/CommuteAdvisor';
import { ShareReportButton } from '@/components/ReportCardModal';
import { MitigationSimulator } from '@/components/MitigationSimulator';
import { PollutantGuideModal } from '@/components/PollutantGuideModal';
import { HistoryRecordsView } from '@/components/HistoryRecordsView';
import { HealthPrescriptionCard } from '@/components/HealthPrescriptionCard';

const STORAGE_KEY = 'aeris_family_profiles_v1';
const AUTO_REFRESH_MS = 5 * 60 * 1000;

const DEFAULT_MEMBERS: FamilyMember[] = [
  { id: 'm-1', name: 'Aarav', ageGroup: 'child', conditions: ['asthma'] },
  { id: 'm-2', name: 'Meera', ageGroup: 'adult', conditions: ['outdoor_worker'] },
  { id: 'm-3', name: 'Dadi', ageGroup: 'elderly', conditions: ['heart'] },
];

interface SearchResultItem {
  id: number;
  name: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
}

function formatRelativeTime(isoDate: string, nowMs: number): string {
  const diffSec = Math.max(0, Math.floor((nowMs - new Date(isoDate).getTime()) / 1000));
  if (diffSec < 60) return 'Updated just now';
  const mins = Math.floor(diffSec / 60);
  if (mins === 1) return 'Updated 1 min ago';
  if (mins < 60) return `Updated ${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  return hrs === 1 ? 'Updated 1 hr ago' : `Updated ${hrs} hrs ago`;
}

export default function HomePage() {
  const [coords, setCoords] = useState<{ lat: number; lon: number; city: string }>({
    lat: CITY_PRESETS[0].latitude,
    lon: CITY_PRESETS[0].longitude,
    city: CITY_PRESETS[0].name,
  });
  const [members, setMembers] = useState<FamilyMember[]>(DEFAULT_MEMBERS);
  const [profilesLoaded, setProfilesLoaded] = useState(false);

  const [aqi, setAqi] = useState<AQISummary | null>(null);
  const [brief, setBrief] = useState<FamilyAirBrief | null>(null);
  const [loadingAqi, setLoadingAqi] = useState(true);
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  // Universal Geocoding Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Pollutant Clinical Guide Modal State
  const [guideOpen, setGuideOpen] = useState(false);
  const [selectedPollutant, setSelectedPollutant] = useState('PM2.5');

  // Debounced search for cities
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = (await res.json()) as { results: SearchResultItem[] };
          setSearchResults(data.results || []);
          setSearchOpen(true);
        }
      } catch (err) {
        console.warn('Geocoding search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside search container to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as FamilyMember[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMembers(parsed);
        }
      }
    } catch {
      // ignore storage errors
    } finally {
      setProfilesLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!profilesLoaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    } catch {
      // ignore storage errors
    }
  }, [members, profilesLoaded]);

  const loadAQI = useCallback(async (lat: number, lon: number, city: string) => {
    setLoadingAqi(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/aqi?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&city=${encodeURIComponent(city)}`,
        { cache: 'no-store' }
      );
      if (!res.ok) {
        throw new Error(`AQI request failed (${res.status})`);
      }
      const data = (await res.json()) as AQISummary;
      setAqi(data);
      setNowMs(Date.now());
    } catch (err) {
      setError((err as Error).message || 'Unable to load air quality data.');
    } finally {
      setLoadingAqi(false);
    }
  }, []);

  const loadBrief = useCallback(async (aqiData: AQISummary, familyMembers: FamilyMember[]) => {
    setLoadingBrief(true);
    try {
      const res = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aqi: aqiData, members: familyMembers }),
      });
      if (!res.ok) {
        throw new Error(`Brief request failed (${res.status})`);
      }
      const data = (await res.json()) as FamilyAirBrief;
      setBrief(data);
    } catch (err) {
      setError((err as Error).message || 'Unable to generate household advisory.');
    } finally {
      setLoadingBrief(false);
    }
  }, []);

  useEffect(() => {
    loadAQI(coords.lat, coords.lon, coords.city);
  }, [coords, loadAQI]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const refreshTimer = window.setInterval(() => {
      loadAQI(coords.lat, coords.lon, coords.city);
    }, AUTO_REFRESH_MS);
    return () => window.clearInterval(refreshTimer);
  }, [coords, loadAQI]);

  // Keep relative timestamp fresh every 30s
  useEffect(() => {
    const tick = window.setInterval(() => setNowMs(Date.now()), 30_000);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    if (aqi && profilesLoaded) {
      loadBrief(aqi, members);
    }
  }, [aqi, members, profilesLoaded, loadBrief]);

  const handleSelectPreset = (preset: CityPreset) => {
    setCoords({ lat: preset.latitude, lon: preset.longitude, city: preset.name });
    setMobileNavOpen(false);
  };

  const handleSelectSearchResult = (result: SearchResultItem) => {
    const displayName = result.state ? `${result.name}, ${result.state}` : result.name;
    setCoords({ lat: result.latitude, lon: result.longitude, city: displayName });
    setSearchQuery('');
    setSearchOpen(false);
    setMobileNavOpen(false);
  };

  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLoadingAqi(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          city: 'Current GPS Location',
        });
        setMobileNavOpen(false);
      },
      () => {
        setLoadingAqi(false);
        setError('Location permission denied. Select a city from the sidebar instead.');
      },
      { timeout: 8000 }
    );
  };

  const handleOpenPollutantGuide = (pollutant: string) => {
    setSelectedPollutant(pollutant);
    setGuideOpen(true);
  };

  const lastUpdatedText = aqi ? formatRelativeTime(aqi.updatedAt, nowMs) : 'Connecting...';

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#f4f6f9] text-slate-900">
      {/* Mobile Backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-[1px] lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Left Control Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-80 bg-white border-r border-slate-200 flex flex-col justify-between transform transition-transform duration-200 ease-out lg:static lg:translate-x-0 shrink-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Brand */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-slate-900 leading-none">
                  AERIS
                </h1>
                <p className="text-[11px] text-slate-500 mt-1">
                  Air Quality &amp; Exposure Portal
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close sidebar"
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Universal City Search & Location Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="search-location"
                className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1"
              >
                <Compass className="w-3 h-3" /> Location &amp; Station
              </label>
              <button
                type="button"
                onClick={() => loadAQI(coords.lat, coords.lon, coords.city)}
                disabled={loadingAqi}
                title="Refresh live data"
                className="text-slate-500 hover:text-slate-900 p-1 rounded transition disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAqi ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Universal Autocomplete Search Box */}
            <div ref={searchContainerRef} className="relative">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="search-location"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search city, town or district..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-md pl-8 pr-7 py-1.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition"
                />
                {isSearching ? (
                  <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />
                ) : searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setSearchOpen(false);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                ) : null}
              </div>

              {/* Floating Autocomplete Dropdown */}
              {searchOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {searchResults.length > 0 ? (
                    searchResults.map((item) => (
                      <button
                        key={`${item.id}-${item.latitude}`}
                        type="button"
                        onClick={() => handleSelectSearchResult(item)}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 transition flex items-center justify-between group"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="font-semibold text-slate-900 block truncate">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {[item.state, item.country].filter(Boolean).join(', ')}
                          </span>
                        </div>
                        <MapPin className="w-3 h-3 text-slate-300 group-hover:text-slate-700 shrink-0" />
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-3 text-center text-[11px] text-slate-400">
                      No matching locations found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Metro Presets Dropdown */}
            <div>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block mb-1">
                Quick Regional Presets
              </span>
              <select
                id="city-select"
                value={coords.city}
                onChange={(e) => {
                  const found = CITY_PRESETS.find((p) => p.name === e.target.value);
                  if (found) handleSelectPreset(found);
                }}
                className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {CITY_PRESETS.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}, {p.country}
                  </option>
                ))}
                {!CITY_PRESETS.some((p) => p.name === coords.city) && (
                  <option value={coords.city}>{coords.city}</option>
                )}
              </select>
            </div>

            {/* GPS Geolocation Button */}
            <button
              type="button"
              onClick={handleUseGeolocation}
              disabled={loadingAqi}
              className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 px-3 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition disabled:opacity-50"
            >
              <Navigation className="w-3.5 h-3.5" />
              Use Current GPS Location
            </button>
          </div>

          {/* Household Profiles */}
          <div className="pt-2 border-t border-slate-200">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Household Profiles ({members.length})
            </h2>
            <FamilyProfiles members={members} onChange={setMembers} />
          </div>
        </div>

        {/* Sidebar Footer Status */}
        <div className="px-5 py-4 border-t border-slate-200 bg-slate-50/70 text-[11px] text-slate-500 space-y-1">
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Open-Meteo Live Atmospheric Feed
          </div>
          <p className="text-slate-400">CPCB India NAQI Standard · Auto-refreshes 5m</p>
        </div>
      </aside>

      {/* Main Full-Screen Portal Workspace */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Utility Bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open station & household controls"
              className="p-2 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 leading-tight">{coords.city}</h2>
              <p className="text-xs text-slate-500 tabular-nums">
                Live atmospheric telemetry · {lastUpdatedText}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>Pollutant Guide</span>
            </button>
            <ShareReportButton aqi={aqi} brief={brief} />
          </div>
        </header>

        {/* Scrollable Full-Width Canvas */}
        <main className="flex-1 p-4 sm:p-6 space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 flex items-center justify-between gap-3 text-xs text-red-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="font-semibold text-red-700 hover:text-red-900"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Live NAQI Hero Strip with clickable pollutant guide cards */}
          <LocationCard
            aqi={aqi}
            loading={loadingAqi}
            onOpenPollutantGuide={handleOpenPollutantGuide}
          />

          {/* Interactive What-If Personal Exposure & Mitigation Simulator */}
          <MitigationSimulator aqi={aqi} />

          {/* 24-Hr Forecast + Ventilation Window */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <ForecastChart hourly={aqi?.hourly ?? []} />
            </div>
            <VentilationWindowCard windowData={aqi?.ventilationWindow ?? null} />
          </div>

          {/* Clinical Health & Nutrition Prescription (What to consume, medicines & future roadmap) */}
          <HealthPrescriptionCard prescription={brief?.healthPrescription} />

          {/* 7-Day Historical Records & Weekly Pollution Log */}
          <HistoryRecordsView history={aqi?.history} city={coords.city} />

          {/* Household Risk & Action Plan */}
          <AirBrief
            brief={brief}
            loading={loadingBrief}
            onRegenerate={() => aqi && loadBrief(aqi, members)}
          />

          {/* Commute Exposure Table */}
          <CommuteAdvisor commuteAdvice={brief?.commuteAdvice ?? null} />
        </main>

        {/* Portal Footer */}
        <footer className="bg-white border-t border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>Data: Open-Meteo Atmospheric Feed · Standard: CPCB India NAQI</span>
          <span>© 2026 AERIS · Urban Air Quality &amp; Exposure Intelligence</span>
        </footer>
      </div>

      {/* Atmospheric Pollutant Clinical Guide Modal */}
      <PollutantGuideModal
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
        initialPollutant={selectedPollutant}
      />
    </div>
  );
}
