'use client';

import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { HourlyAQIPoint } from '@/types';

interface ForecastChartProps {
  hourly: HourlyAQIPoint[];
}

export function ForecastChart({ hourly }: ForecastChartProps) {
  return (
    <section className="portal-surface rounded-xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">24-Hour NAQI Trajectory</h2>
          <p className="text-xs text-slate-500">
            Hourly India NAQI forecast from Open-Meteo atmospheric model
          </p>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-lime-600 inline-block" /> 100 Satisfactory
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-amber-500 inline-block" /> 200 Moderate
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-red-500 inline-block" /> 300 Poor
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        {hourly.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            Loading 24-hour trajectory...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourly} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="naqiArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f172a" stopOpacity={0.14} />
                  <stop offset="95%" stopColor="#0f172a" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="hourLabel"
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                interval={3}
              />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#cbd5e1',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  color: '#0f172a',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                }}
                formatter={(value: number, _name: string, props: { payload?: HourlyAQIPoint }) => [
                  `${value} (${props.payload?.category ?? ''}) · PM2.5: ${props.payload?.pm25 ?? 0} µg/m³`,
                  'India NAQI',
                ]}
              />
              <ReferenceLine y={100} stroke="#65a30d" strokeDasharray="4 4" />
              <ReferenceLine y={200} stroke="#d97706" strokeDasharray="4 4" />
              <ReferenceLine y={300} stroke="#dc2626" strokeDasharray="4 4" />
              <Area
                type="monotone"
                dataKey="naqi"
                stroke="#0f172a"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#naqiArea)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
