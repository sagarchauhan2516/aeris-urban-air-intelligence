'use client';

import React, { useEffect } from 'react';
import { Activity, AlertTriangle, BookOpen, HeartPulse, ShieldAlert, X } from 'lucide-react';

interface PollutantInfo {
  name: string;
  formula: string;
  sizeDesc: string;
  cpcbStandard: string;
  whoStandard: string;
  sources: string;
  healthEffects: string;
  vulnerableGroups: string;
}

const POLLUTANTS: Record<string, PollutantInfo> = {
  'PM2.5': {
    name: 'Fine Particulate Matter',
    formula: 'PM2.5',
    sizeDesc: 'Particles ≤ 2.5 micrometers in diameter (approx. 1/30th the width of a human hair).',
    cpcbStandard: '60 µg/m³ (24-hour average) / 40 µg/m³ (Annual)',
    whoStandard: '15 µg/m³ (24-hour average) / 5 µg/m³ (Annual)',
    sources: 'Combustion engines, biomass burning, coal-fired power plants, stubble burning, and secondary sulfate/nitrate formation.',
    healthEffects: 'Bypasses upper airway cilia, penetrates deep into alveolar sacs, enters systemic bloodstream; increases risks of ischemic heart disease, stroke, lung cancer, and asthma exacerbations.',
    vulnerableGroups: 'Infants, asthmatic children, pregnant women, elderly individuals with cardiovascular disease.',
  },
  'PM10': {
    name: 'Respirable Suspended Particulate Matter',
    formula: 'PM10',
    sizeDesc: 'Coarse dust particles ≤ 10 micrometers in diameter.',
    cpcbStandard: '100 µg/m³ (24-hour average) / 60 µg/m³ (Annual)',
    whoStandard: '45 µg/m³ (24-hour average) / 15 µg/m³ (Annual)',
    sources: 'Road dust resuspension, construction & demolition activities, industrial crushing, and agricultural operations.',
    healthEffects: 'Irritates nasal passages, pharynx, and upper bronchi; causes coughing, wheezing, and aggravated chronic bronchitis.',
    vulnerableGroups: 'COPD patients, outdoor manual laborers, pedestrians along unpaved arterial roads.',
  },
  'NO2': {
    name: 'Nitrogen Dioxide',
    formula: 'NO₂',
    sizeDesc: 'Toxic, reddish-brown reactive gaseous oxidant formed from high-temperature fossil combustion.',
    cpcbStandard: '80 µg/m³ (24-hour average) / 40 µg/m³ (Annual)',
    whoStandard: '25 µg/m³ (24-hour average) / 10 µg/m³ (Annual)',
    sources: 'High-temperature diesel & petrol vehicle exhaust, thermal power generation, and natural gas heating.',
    healthEffects: 'Induces significant airway inflammation, reduces lung function in school-age children, and serves as a photochemical precursor to ground-level ozone.',
    vulnerableGroups: 'Children living near transit corridors, daily auto/bike commuters, asthmatics.',
  },
  'O3': {
    name: 'Ground-Level Ozone',
    formula: 'O₃',
    sizeDesc: 'Secondary photochemical oxidant formed when VOCs and NOx react in presence of intense sunlight.',
    cpcbStandard: '100 µg/m³ (8-hour average) / 180 µg/m³ (1-hour)',
    whoStandard: '100 µg/m³ (8-hour peak season)',
    sources: 'Not emitted directly; formed via solar irradiation of automotive exhaust, industrial solvent vapors, and urban VOCs.',
    healthEffects: 'Powerful biological oxidizer; damages airway epithelial cells, induces chest tightness, and triggers acute asthma attacks on hot, sunny afternoons.',
    vulnerableGroups: 'Active outdoor runners, athletes, elderly citizens during midday hours (12 PM - 5 PM).',
  },
  'CO': {
    name: 'Carbon Monoxide',
    formula: 'CO',
    sizeDesc: 'Colorless, odorless, non-irritating toxic gas produced by incomplete combustion of carbon-based fuels.',
    cpcbStandard: '2.0 mg/m³ (8-hour average) / 4.0 mg/m³ (1-hour)',
    whoStandard: '4.0 mg/m³ (24-hour average) / 10 mg/m³ (8-hour)',
    sources: 'Incomplete combustion in idling vehicle engines, poorly ventilated gas stoves, kerosene heaters, and solid fuel chulhas.',
    healthEffects: 'Binds with hemoglobin to form carboxyhemoglobin (COHb), drastically reducing oxygen delivery to myocardial and cerebral tissues; causes headaches, fatigue, and cardiac ischemia.',
    vulnerableGroups: 'Individuals with coronary artery disease, fetuses (crosses placental barrier), traffic police.',
  },
};

interface PollutantGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPollutant?: string;
}

export function PollutantGuideModal({
  isOpen,
  onClose,
  initialPollutant = 'PM2.5',
}: PollutantGuideModalProps) {
  const [selectedKey, setSelectedKey] = React.useState<string>(initialPollutant);

  React.useEffect(() => {
    if (initialPollutant && POLLUTANTS[initialPollutant]) {
      setSelectedKey(initialPollutant);
    }
  }, [initialPollutant]);

  // Handle Escape key to close accessible dialog
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const current = POLLUTANTS[selectedKey] || POLLUTANTS['PM2.5'];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pollutant-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
    >
      <div
        className="portal-surface bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center" aria-hidden="true">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 id="pollutant-modal-title" className="text-base font-bold text-slate-900">
                Atmospheric Pollutant Clinical Guide
              </h2>
              <p className="text-xs text-slate-500">
                Official health standards, biological mechanisms &amp; urban sources
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close atmospheric pollutant clinical guide"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Pollutant Tabs */}
        <div
          role="tablist"
          aria-label="Select atmospheric pollutant"
          className="flex items-center gap-2 overflow-x-auto pb-1"
        >
          {Object.keys(POLLUTANTS).map((key) => {
            const isSelected = key === selectedKey;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                id={`pollutant-tab-${key}`}
                aria-selected={isSelected}
                aria-controls="pollutant-tabpanel"
                onClick={() => setSelectedKey(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {key}
              </button>
            );
          })}
        </div>

        {/* Selected Pollutant Dossier */}
        <div
          role="tabpanel"
          id="pollutant-tabpanel"
          aria-labelledby={`pollutant-tab-${selectedKey}`}
          className="space-y-4"
        >
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <div className="flex items-baseline justify-between mb-1">
              <h3 className="text-base font-bold text-slate-900">{current.name}</h3>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                {current.formula}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{current.sizeDesc}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 p-3.5 bg-white">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 mb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                <span>India CPCB Standard</span>
              </div>
              <p className="text-xs text-slate-600 tabular-nums">{current.cpcbStandard}</p>
            </div>

            <div className="rounded-xl border border-slate-200 p-3.5 bg-white">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 mb-1">
                <Activity className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                <span>WHO Air Quality Guideline</span>
              </div>
              <p className="text-xs text-slate-600 tabular-nums">{current.whoStandard}</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="rounded-xl border border-slate-200 p-3.5 bg-white">
              <span className="font-semibold text-slate-800 block mb-1">Primary Urban Sources</span>
              <p className="text-slate-600 leading-relaxed">{current.sources}</p>
            </div>

            <div className="rounded-xl border border-slate-200 p-3.5 bg-white">
              <div className="flex items-center gap-1 font-semibold text-slate-800 mb-1">
                <HeartPulse className="w-3.5 h-3.5 text-rose-500" aria-hidden="true" />
                <span>Biological Mechanism &amp; Health Impact</span>
              </div>
              <p className="text-slate-600 leading-relaxed">{current.healthEffects}</p>
            </div>

            <div className="rounded-xl border border-slate-200 p-3.5 bg-rose-50/50">
              <div className="flex items-center gap-1 font-semibold text-rose-900 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" aria-hidden="true" />
                <span>High-Risk Demographics</span>
              </div>
              <p className="text-rose-800 leading-relaxed">{current.vulnerableGroups}</p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
