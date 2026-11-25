'use client';

import React, { useState } from 'react';
import {
  AlertOctagon,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  History,
  TrendingDown,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { HistoricalDay, HistoricalTelemetry } from '@/types';

interface HistoryRecordsViewProps {
  history?: HistoricalTelemetry;
  city: string;
}

export function HistoryRecordsView({ history, city }: HistoryRecordsViewProps) {
  const [expanded, setExpanded] = useState(true);

  if (!history || !history.days || history.days.length === 0) {
    return null;
  }

  return (
    <section className="portal-surface rounded-xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              7-Day Historical Records &amp; Exposure Log
            </h2>
            <p className="text-xs text-slate-500">
              Past 168-hour atmospheric measurements and daily cumulative pollution records
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 tabular-nums">
            Weekly Avg NAQI: {history.weeklyAvgNaqi}
          </span>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-4">
          {/* Trend Banner */}
          <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 flex items-start gap-3">
            <div className="p-1 rounded bg-slate-200/80 text-slate-700 mt-0.5">
              {history.severeDaysCount > 2 ? (
                <TrendingUp className="w-4 h-4 text-rose-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-emerald-600" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 leading-snug">
                {history.trendSummary}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {history.severeDaysCount > 0
                  ? `Identified ${history.severeDaysCount} day(s) exceeding the CPCB Severe threshold (>300 NAQI) this week in ${city}.`
                  : `Zero Severe-grade smog spikes recorded in ${city} over the past 7 days.`}
              </p>
            </div>
          </div>

          {/* Historical Days Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 pr-4">Date</th>
                  <th className="py-2.5 px-3">Peak NAQI</th>
                  <th className="py-2.5 px-3">Avg NAQI</th>
                  <th className="py-2.5 px-3">Daily Avg PM2.5</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 pl-3 text-right">Estimated Inhalation Dose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.days.map((day) => (
                  <tr key={day.date} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 pr-4 font-semibold text-slate-900 whitespace-nowrap">
                      {day.dayLabel}
                    </td>
                    <td className="py-3 px-3 font-bold tabular-nums text-slate-900">
                      {day.maxNaqi}
                    </td>
                    <td className="py-3 px-3 text-slate-600 tabular-nums">{day.avgNaqi}</td>
                    <td className="py-3 px-3 text-slate-700 tabular-nums">
                      {day.avgPm25} µg/m³
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded text-white"
                        style={{ backgroundColor: day.color }}
                      >
                        {day.category}
                      </span>
                    </td>
                    <td className="py-3 pl-3 text-right tabular-nums text-slate-800 font-medium">
                      ~{day.doseEstimateUg} µg/day
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
