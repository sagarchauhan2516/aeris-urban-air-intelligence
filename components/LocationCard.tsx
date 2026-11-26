'use client';

import React from 'react';
import { BookOpen, Info } from 'lucide-react';
import { AQISummary } from '@/types';

interface LocationCardProps {
  aqi: AQISummary | null;
  loading: boolean;
  onOpenPollutantGuide?: (pollutant: string) => void;
}

export function LocationCard({ aqi, loading, onOpenPollutantGuide }: LocationCardProps) {
  if (loading && !aqi) {
    return (
      <section className="portal-surface rounded-xl p-6 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 h-32 rounded-lg bg-slate-100" />
          <div className="lg:col-span-8 h-32 rounded-lg bg-slate-100" />
        </div>
      </section>
    );
  }

  if (!aqi) return null;

  const scalePct = Math.min(100, Math.max(2, (aqi.currentNaqi / 500) * 100));
  const coMgM3 = Math.round((aqi.co / 1000) * 100) / 100;

  return (
    <section className="portal-surface rounded-xl p-6">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-center">
        {/* Primary NAQI Readout */}
        <div className="xl:col-span-4 xl:border-r xl:border-slate-200 xl:pr-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              India NAQI (CPCB)
            </span>
            <span
              className="text-xs font-semibold px-2.5 py-0.5 rounded-md text-white"
              style={{ backgroundColor: aqi.color }}
            >
              {aqi.category}
            </span>
          </div>

          <div className="flex items-baseline gap-2.5 my-1">
            <span className="text-5xl font-bold tracking-tight text-slate-900 tabular-nums">
              {aqi.currentNaqi}
            </span>
            <span className="text-sm text-slate-400 tabular-nums">/ 500</span>
          </div>

          {/* 0-500 Scale Bar */}
          <div className="mt-3 mb-2">
            <div className="relative h-2 w-full rounded-full overflow-hidden bg-slate-100 flex">
              <div className="h-full bg-emerald-500" style={{ width: '10%' }} />
              <div className="h-full bg-lime-500" style={{ width: '10%' }} />
              <div className="h-full bg-amber-500" style={{ width: '20%' }} />
              <div className="h-full bg-orange-500" style={{ width: '20%' }} />
              <div className="h-full bg-red-500" style={{ width: '20%' }} />
              <div className="h-full bg-red-900" style={{ width: '20%' }} />
              <div
                className="absolute top-0 bottom-0 w-1 bg-slate-950 ring-2 ring-white"
                style={{ left: `calc(${scalePct}% - 2px)` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 tabular-nums">
              <span>0</span>
              <span>100</span>
              <span>200</span>
              <span>300</span>
              <span>400</span>
              <span>500</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
            <p>
              Primary: <strong className="text-slate-800">{aqi.dominantPollutant}</strong>
              {' · '}
              <span className="tabular-nums">
                {aqi.latitude.toFixed(2)}°N, {aqi.longitude.toFixed(2)}°E
              </span>
            </p>
            {onOpenPollutantGuide && (
              <button
                type="button"
                onClick={() => onOpenPollutantGuide(aqi.dominantPollutant || 'PM2.5')}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 underline underline-offset-2"
              >
                <BookOpen className="w-3 h-3" /> Guide
              </button>
            )}
          </div>
        </div>

        {/* Pollutant Breakdown Tiles (Clickable to open clinical guide) */}
        <div className="xl:col-span-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { key: 'PM2.5', label: 'PM2.5', value: aqi.pm25, unit: 'µg/m³', limit: '24h Std ≤ 60' },
            { key: 'PM10', label: 'PM10', value: aqi.pm10, unit: 'µg/m³', limit: '24h Std ≤ 100' },
            { key: 'NO2', label: 'NO₂', value: aqi.no2, unit: 'µg/m³', limit: '24h Std ≤ 80' },
            { key: 'O3', label: 'O₃', value: aqi.o3, unit: 'µg/m³', limit: '8h Std ≤ 100' },
            { key: 'CO', label: 'CO', value: coMgM3, unit: 'mg/m³', limit: '8h Std ≤ 2.0' },
          ].map((item) => (
            <div
              key={item.label}
              role="button"
              tabIndex={0}
              aria-label={`View clinical guide and health standards for ${item.label}`}
              onClick={() => onOpenPollutantGuide?.(item.key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpenPollutantGuide?.(item.key);
                }
              }}
              title={`Click for clinical dossier on ${item.label}`}
              className="group rounded-lg bg-slate-50/90 border border-slate-200/80 p-3.5 flex flex-col justify-between hover:bg-slate-100/80 hover:border-slate-300 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition">
                  {item.label}
                </span>
                <Info className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition" aria-hidden="true" />
              </div>
              <div className="my-2">
                <span className="text-2xl font-bold text-slate-900 tabular-nums">
                  {item.value}
                </span>
                <span className="text-[11px] text-slate-500 ml-1">{item.unit}</span>
              </div>
              <span className="text-[11px] text-slate-400 tabular-nums">{item.limit}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
