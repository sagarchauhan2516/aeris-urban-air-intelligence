'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { AgeGroup, FamilyMember, HealthCondition } from '@/types';

interface FamilyProfilesProps {
  members: FamilyMember[];
  onChange: (members: FamilyMember[]) => void;
}

const AGE_LABELS: Record<AgeGroup, string> = {
  infant: 'Infant (0–2)',
  child: 'Child (3–12)',
  adult: 'Adult (13–59)',
  elderly: 'Elderly (60+)',
};

const CONDITION_OPTIONS: Array<{ value: HealthCondition; label: string }> = [
  { value: 'none', label: 'No conditions' },
  { value: 'asthma', label: 'Asthma' },
  { value: 'copd', label: 'COPD / Bronchitis' },
  { value: 'heart', label: 'Heart Condition' },
  { value: 'pregnant', label: 'Pregnant' },
  { value: 'outdoor_worker', label: 'Outdoor Commuter' },
];

export function FamilyProfiles({ members, onChange }: FamilyProfilesProps) {
  const [name, setName] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('adult');
  const [condition, setCondition] = useState<HealthCondition>('none');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    const newMember: FamilyMember = {
      id: `member-${Date.now()}`,
      name: trimmed,
      ageGroup,
      conditions: [condition],
    };
    onChange([...members, newMember]);
    setName('');
    setAgeGroup('adult');
    setCondition('none');
  };

  const handleRemove = (id: string) => {
    if (members.length <= 1) return;
    onChange(members.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-900 truncate">
                  {member.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-600 shrink-0">
                  {AGE_LABELS[member.ageGroup]}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {member.conditions
                  .map((c) => CONDITION_OPTIONS.find((o) => o.value === c)?.label ?? c)
                  .join(', ')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleRemove(member.id)}
              disabled={members.length <= 1}
              title={
                members.length <= 1
                  ? 'At least one profile is required'
                  : `Remove ${member.name}`
              }
              className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-30 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="pt-3 border-t border-slate-200 space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Add Member
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (e.g. Aarav)"
          maxLength={32}
          className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
        <div className="grid grid-cols-2 gap-1.5">
          <select
            aria-label="Age group"
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
            className="bg-white border border-slate-300 rounded-md px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            {Object.entries(AGE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
          <select
            aria-label="Health condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value as HealthCondition)}
            className="bg-white border border-slate-300 rounded-md px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            {CONDITION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 px-3 rounded-md bg-slate-900 hover:bg-slate-800 text-white transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Add to Household
        </button>
      </form>
    </div>
  );
}
