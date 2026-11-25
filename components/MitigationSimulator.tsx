'use client';

import React, { useState } from 'react';
import {
  Cigarette,
  Clock,
  Gauge,
  Home,
  Info,
  Leaf,
  Shield,
  Sliders,
  Train,
  Wind,
} from 'lucide-react';
import { AQISummary } from '@/types';

interface MitigationSimulatorProps {
  aqi: AQISummary | null;
}

export function MitigationSimulator({ aqi }: MitigationSimulatorProps) {
  // Simulator toggles
  const [hepaPurifier, setHepaPurifier] = useState(true);
  const [n95Mask, setN95Mask] = useState(true);
  const [shiftVentilation, setShiftVentilation] = useState(false);
  const [metroTransit, setMetroTransit] = useState(true);

  // CADR sizing calculator state
  const [roomArea, setRoomArea] = useState(180); // sq ft
  const [ceilingHeight, setCeilingHeight] = useState(10); // ft

  const pm25 = aqi?.pm25 ?? 60;
  const minNaqi = aqi?.ventilationWindow?.minNaqi ?? pm25;
  const ratio = aqi?.currentNaqi && aqi.currentNaqi > 0 ? minNaqi / aqi.currentNaqi : 0.7;
  const shiftedOutdoorPm25 = Math.max(15, Math.round(pm25 * Math.min(1, Math.max(0.4, ratio))));

  // Scientific Inhalation Dose Model:
  // Adult resting respiration ~ 0.55 m3/h (sleep 8h, indoor wake 14h)
  // Commute / outdoor respiration ~ 0.85 m3/h (active movement 2h)
  const indoorHours = 22;
  const outdoorHours = 2;

  // Baseline scenario (Unfiltered home ~70% outdoor ambient, open air commute)
  const baselineIndoorConc = pm25 * 0.72;
  const baselineOutdoorConc = pm25;
  const baselineDoseUg = Math.round(
    indoorHours * 0.55 * baselineIndoorConc + outdoorHours * 0.85 * baselineOutdoorConc
  );

  // Mitigated scenario
  const effectiveOutdoorConc = shiftVentilation ? shiftedOutdoorPm25 : baselineOutdoorConc;
  const mitigatedOutdoorConc = n95Mask ? effectiveOutdoorConc * 0.05 : effectiveOutdoorConc;
  const finalOutdoorConc = metroTransit ? mitigatedOutdoorConc * 0.55 : mitigatedOutdoorConc;
  const finalIndoorConc = hepaPurifier ? 12 : baselineIndoorConc;

  const mitigatedDoseUg = Math.round(
    indoorHours * 0.55 * finalIndoorConc + outdoorHours * 0.85 * finalOutdoorConc
  );

  const doseSavedUg = Math.max(0, baselineDoseUg - mitigatedDoseUg);
  const pctReduction = baselineDoseUg > 0 ? Math.round((doseSavedUg / baselineDoseUg) * 100) : 0;

  // Berkeley Earth Epidemiological Equivalence:
  // Continuous 24h exposure to 22 µg/m³ PM2.5 ≈ 1 cigarette/day (~300 µg inhaled particulate equivalent)
  const cigarettesAvoided = Math.round((doseSavedUg / 280) * 10) / 10;
  const co2SavedKg = metroTransit ? 2.4 : 0;

  // CADR Calculations
  // Room Volume = Area * Height (ft3)
  // Required CADR (CFM) for 4.8 Air Changes/Hour (AHAM certified target): (Vol * 4.8) / 60
  // CADR (m3/h) = CFM * 1.699
  const roomVolumeFt3 = roomArea * ceilingHeight;
  const requiredCadrCfm = Math.round((roomVolumeFt3 * 4.8) / 60);
  const requiredCadrM3h = Math.round(requiredCadrCfm * 1.699);

  return (
    <section className="portal-surface rounded-xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Personal Exposure &amp; Mitigation Simulator
            </h2>
            <p className="text-xs text-slate-500">
              Model real-world intervention efficacy and inhaled biological dose reduction
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 tabular-nums">
          {pctReduction}% Toxic Dose Prevented
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Action Toggles */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Simulate Protective Actions
          </h3>

          {/* Toggle 1: True HEPA Purifier */}
          <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50/70 transition cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-sky-50 text-sky-700 mt-0.5">
                <Home className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-900 block">
                  Run True HEPA Filter Indoors
                </span>
                <p className="text-xs text-slate-500">
                  Cuts ambient indoor leakage from ~{Math.round(baselineIndoorConc)} µg/m³ down to
                  clean room baseline (12 µg/m³).
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={hepaPurifier}
              onChange={(e) => setHepaPurifier(e.target.checked)}
              className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900 cursor-pointer"
            />
          </label>

          {/* Toggle 2: N95 Mask */}
          <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50/70 transition cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 mt-0.5">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-900 block">
                  Wear Certified N95 Mask Outdoors
                </span>
                <p className="text-xs text-slate-500">
                  Sealed respirator removes 95% of fine particulates during road travel &amp; errands.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={n95Mask}
              onChange={(e) => setN95Mask(e.target.checked)}
              className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900 cursor-pointer"
            />
          </label>

          {/* Toggle 3: Shift to Safe Window */}
          <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50/70 transition cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-700 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-900 block">
                  Shift Errands to Cleanest Window
                </span>
                <p className="text-xs text-slate-500">
                  Reschedules outdoor tasks to {aqi?.ventilationWindow?.label || 'midday trough'},
                  reducing ambient intake by ~{Math.round((1 - ratio) * 100)}%.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={shiftVentilation}
              onChange={(e) => setShiftVentilation(e.target.checked)}
              className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900 cursor-pointer"
            />
          </label>

          {/* Toggle 4: Metro Transit */}
          <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50/70 transition cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 mt-0.5">
                <Train className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-900 block">
                  Switch Commute to Metro / AC Rail
                </span>
                <p className="text-xs text-slate-500">
                  Eliminates direct bumper-to-bumper vehicle exhaust ingestion and prevents 2.4 kg
                  CO₂.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={metroTransit}
              onChange={(e) => setMetroTransit(e.target.checked)}
              className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900 cursor-pointer"
            />
          </label>
        </div>

        {/* Right Column: Calculated Biological Impact & CADR Sizing */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl bg-slate-900 text-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Biological Exposure Impact
              </span>
              <Gauge className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
                <span className="text-[11px] text-slate-400 block">Baseline Inhaled Dose</span>
                <span className="text-2xl font-bold tabular-nums text-slate-200">
                  {baselineDoseUg}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">µg PM2.5/day</span>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40">
                <span className="text-[11px] text-emerald-300 block">Mitigated Daily Dose</span>
                <span className="text-2xl font-bold tabular-nums text-emerald-400">
                  {mitigatedDoseUg}
                </span>
                <span className="text-[10px] text-emerald-300 ml-1">µg PM2.5/day</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Cigarette className="w-3.5 h-3.5 text-amber-400" /> Toxic Equivalence
                  Avoided:
                </span>
                <span className="font-bold text-white tabular-nums">
                  {cigarettesAvoided > 0 ? `${cigarettesAvoided} cigarettes/day` : '0'}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" /> Carbon Saved (per 10 km):
                </span>
                <span className="font-bold text-white tabular-nums">
                  {co2SavedKg > 0 ? `${co2SavedKg} kg CO₂` : '0 kg'}
                </span>
              </div>
            </div>
          </div>

          {/* Room CADR Sizing Tool */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-slate-700" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Air Purifier CADR Sizing Helper
                </h4>
              </div>
              <span className="text-[10px] font-semibold text-slate-500">4.8 ACH Standard</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Room Area (sq ft)</label>
                <input
                  type="number"
                  min="50"
                  max="1000"
                  value={roomArea}
                  onChange={(e) => setRoomArea(Math.max(20, Number(e.target.value)))}
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Ceiling Height (ft)</label>
                <input
                  type="number"
                  min="7"
                  max="20"
                  value={ceilingHeight}
                  onChange={(e) => setCeilingHeight(Math.max(6, Number(e.target.value)))}
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
              <span className="text-slate-600">Recommended Purifier CADR:</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {requiredCadrM3h} m³/h ({requiredCadrCfm} CFM)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Position purifier ≥ 2 feet away from walls; keep bedroom doors and windows latched
              during runtime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
