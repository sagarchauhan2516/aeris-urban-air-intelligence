'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { ActionCard, FamilyAirBrief, RiskLevel } from '@/types';

interface AirBriefProps {
  brief: FamilyAirBrief | null;
  loading: boolean;
  onRegenerate: () => void;
}

const RISK_STYLES: Record<RiskLevel, { badge: string; bar: string; label: string }> = {
  low: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    bar: 'bg-emerald-500',
    label: 'Low Risk',
  },
  medium: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    bar: 'bg-amber-500',
    label: 'Moderate Risk',
  },
  high: {
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    bar: 'bg-orange-500',
    label: 'High Risk',
  },
  critical: {
    badge: 'bg-red-50 text-red-700 border-red-200',
    bar: 'bg-red-600',
    label: 'Critical Risk',
  },
};

const PRIORITY_ACCENT: Record<ActionCard['priority'], string> = {
  info: 'border-l-sky-600',
  warning: 'border-l-amber-500',
  urgent: 'border-l-red-600',
};

export function AirBrief({ brief, loading, onRegenerate }: AirBriefProps) {
  return (
    <div className="space-y-6">
      {/* Executive Advisory & Household Risk Matrix */}
      <section className="portal-surface rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Household Exposure &amp; Health Advisory
            </h2>
            <p className="text-xs text-slate-500">
              Personalized daily guidance based on current pollutant load and member profiles
            </p>
          </div>
          <button
            type="button"
            onClick={onRegenerate}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Advisory
          </button>
        </div>

        {loading && !brief ? (
          <div className="animate-pulse space-y-3">
            <div className="h-11 rounded-lg bg-slate-100" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="h-24 rounded-lg bg-slate-100" />
              <div className="h-24 rounded-lg bg-slate-100" />
              <div className="h-24 rounded-lg bg-slate-100" />
            </div>
          </div>
        ) : brief ? (
          <div className="space-y-5">
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3">
              <p className="text-sm font-medium text-slate-900">{brief.headline}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {brief.memberRisks.map((mr) => {
                const style = RISK_STYLES[mr.riskLevel] ?? RISK_STYLES.medium;
                return (
                  <div
                    key={mr.memberId}
                    className="rounded-lg bg-white border border-slate-200 p-4 flex flex-col justify-between relative overflow-hidden"
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.bar}`} />
                    <div className="pl-2">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-sm font-semibold text-slate-900">{mr.name}</span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${style.badge}`}
                        >
                          {style.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{mr.summary}</p>
                      <p className="text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-100">
                        Safe outdoor window:{' '}
                        <span className="font-medium text-slate-800">{mr.safeHours}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </section>

      {/* Recommended Actions */}
      {brief && (
        <section className="portal-surface rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Recommended Daily Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {brief.actionCards.map((card) => (
              <div
                key={card.id}
                className={`rounded-lg bg-slate-50/70 border border-slate-200 border-l-4 p-4 ${
                  PRIORITY_ACCENT[card.priority]
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-slate-900">{card.title}</h4>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                    {card.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
