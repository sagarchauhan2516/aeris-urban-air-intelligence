'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Apple,
  Ban,
  CheckCircle2,
  Droplet,
  HeartPulse,
  Milestone,
  Pill,
  ShieldCheck,
  Sparkles,
  Utensils,
  Waves,
} from 'lucide-react';
import { HealthPrescription } from '@/types';

interface HealthPrescriptionCardProps {
  prescription?: HealthPrescription;
}

export function HealthPrescriptionCard({ prescription }: HealthPrescriptionCardProps) {
  const [activeTab, setActiveTab] = useState<'nutrition' | 'medical' | 'roadmap'>('nutrition');

  if (!prescription) {
    return null;
  }

  const { hydration, nutrition, medical, futureRoadmap } = prescription;

  return (
    <section className="portal-surface rounded-xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
            <HeartPulse className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Household Health &amp; Clinical Prescription
            </h2>
            <p className="text-xs text-slate-500">
              Personalized dietary intake, medical countermeasures &amp; future resilience planning
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('nutrition')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'nutrition'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            What to Consume
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('medical')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'medical'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Medical Protocols
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('roadmap')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'roadmap'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Future Roadmap
          </button>
        </div>
      </div>

      {/* TAB 1: What to Consume (Nutrition & Hydration) */}
      {activeTab === 'nutrition' && (
        <div className="space-y-6">
          {/* Hydration Banner */}
          <div className="rounded-xl bg-sky-50/70 border border-sky-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Droplet className="w-5 h-5 text-sky-600" />
                <h3 className="text-sm font-bold text-sky-950">
                  Target Daily Hydration: {hydration.dailyTargetLiters} Liters
                </h3>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                Mucociliary Clearance Support
              </span>
            </div>
            <p className="text-xs text-sky-900 leading-relaxed mb-3">{hydration.protocol}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {hydration.tips.map((tip, idx) => (
                <div
                  key={idx}
                  className="rounded-lg bg-white/90 border border-sky-200/80 p-2.5 text-sky-950 leading-snug flex items-start gap-2"
                >
                  <Waves className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Foods & Herbs */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Apple className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Recommended Antioxidant &amp; Anti-Inflammatory Foods
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {nutrition.recommended.map((food, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-slate-50/80 border border-slate-200 p-3.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-xs font-bold text-slate-900">{food.name}</h4>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {food.category}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-emerald-800 mb-1.5">{food.benefit}</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {food.scientificReason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Foods to Avoid */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Ban className="w-4 h-4 text-rose-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Dietary Aggravators to Strictly Avoid During High Smog
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {nutrition.avoid.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-rose-50/60 border border-rose-200 p-3.5 space-y-1"
                >
                  <h4 className="text-xs font-bold text-rose-950">{item.name}</h4>
                  <p className="text-[11px] text-rose-900 leading-relaxed">{item.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Medical Protocols & Precautions */}
      {activeTab === 'medical' && (
        <div className="space-y-5">
          {/* Member Specific Guidance */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Tailored Medical Care for Household Members
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {medical.memberSpecific.map((care, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 p-4 bg-slate-50/70 flex flex-col justify-between space-y-2.5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-900">{care.memberName}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        {care.condition}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{care.precautions}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/80 text-[11px] font-medium text-amber-800 flex items-start gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{care.medicationAlert}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* General Household Precautions */}
          <div className="rounded-xl bg-slate-900 text-white p-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              General In-Home Environmental Protection
            </h4>
            <ul className="divide-y divide-slate-800 text-xs text-slate-300">
              {medical.generalPrecautions.map((prec, idx) => (
                <li key={idx} className="py-2 flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{prec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* TAB 3: Future Implementation Roadmap */}
      {activeTab === 'roadmap' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Smog is not an acute 1-day event; it is an annual meteorological reality in urban India.
            Here is a structured engineering and lifestyle roadmap to permanently insulate your family.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {futureRoadmap.map((step, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 p-4.5 bg-slate-50/80 flex flex-col justify-between space-y-3"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 inline-block mb-2">
                    {step.timeframe}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{step.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">{step.action}</p>
                </div>
                <div className="pt-2 border-t border-slate-200 text-[11px] text-emerald-700 font-medium flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Expected Impact: {step.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
