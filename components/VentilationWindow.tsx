'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { VentilationWindow } from '@/types';

interface VentilationWindowProps {
  windowData: VentilationWindow | null;
}

const STATUS_MAP = {
  safe: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    label: 'Safe to Ventilate',
    accent: 'text-emerald-700',
  },
  caution: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    label: 'Brief Ventilation Only',
    accent: 'text-amber-700',
  },
  avoid: {
    badge: 'bg-red-50 text-red-700 border-red-200',
    label: 'Keep Windows Sealed',
    accent: 'text-red-700',
  },
};

export function VentilationWindowCard({ windowData }: VentilationWindowProps) {
  if (!windowData) return null;
  const style = STATUS_MAP[windowData.status];

  return (
    <section className="portal-surface rounded-xl p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Indoor Ventilation Window</h2>
            <p className="text-xs text-slate-500">Lowest 2-hour outdoor particulate slot</p>
          </div>
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded border ${style.badge}`}>
            {style.label}
          </span>
        </div>

        <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Recommended Window</span>
          </div>
          <div className={`text-2xl font-bold tabular-nums ${style.accent}`}>
            {windowData.label}
          </div>
          <p className="text-xs text-slate-500 mt-1 tabular-nums">
            Forecast average NAQI: <strong className="text-slate-800">{windowData.avgNaqi}</strong>{' '}
            (min {windowData.minNaqi})
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed">{windowData.advice}</p>
    </section>
  );
}
