'use client';

import React from 'react';
import { FamilyAirBrief } from '@/types';

interface CommuteAdvisorProps {
  commuteAdvice: FamilyAirBrief['commuteAdvice'] | null;
}

const EXPOSURE_BADGE = {
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-red-50 text-red-700 border-red-200',
};

export function CommuteAdvisor({ commuteAdvice }: CommuteAdvisorProps) {
  if (!commuteAdvice) return null;

  return (
    <section className="portal-surface rounded-xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Commute Exposure Comparison</h2>
          <p className="text-xs text-slate-500">
            Estimated inhalation risk and CO₂ savings per 10 km trip
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-900 text-white">
          Recommended: {commuteAdvice.bestMode}
        </span>
      </div>

      <p className="text-xs text-slate-600 mb-4 leading-relaxed">{commuteAdvice.summary}</p>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="py-2.5 pr-4">Transit Mode</th>
              <th className="py-2.5 px-4">Exposure</th>
              <th className="py-2.5 px-4">CO₂ Saved</th>
              <th className="py-2.5 pl-4">Guidance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {commuteAdvice.options.map((opt) => (
              <tr key={opt.mode} className="hover:bg-slate-50/70">
                <td className="py-3 pr-4 font-semibold text-slate-900 whitespace-nowrap">
                  {opt.label}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                      EXPOSURE_BADGE[opt.exposureLevel]
                    }`}
                  >
                    {opt.exposureLevel}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-700 tabular-nums whitespace-nowrap">
                  {opt.co2SavedKg > 0 ? `${opt.co2SavedKg} kg` : 'Baseline'}
                </td>
                <td className="py-3 pl-4 text-slate-600">{opt.recommendation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
