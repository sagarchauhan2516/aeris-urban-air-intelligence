import React from 'react';

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-screen w-full flex flex-col lg:flex-row bg-[#f4f6f9] text-slate-900 animate-pulse"
    >
      {/* Sidebar Skeleton */}
      <div className="w-80 bg-white border-r border-slate-200 p-5 space-y-6 hidden lg:block shrink-0">
        <div className="h-8 w-32 bg-slate-200 rounded-lg" />
        <div className="space-y-3">
          <div className="h-4 w-24 bg-slate-100 rounded" />
          <div className="h-9 w-full bg-slate-100 rounded-md" />
        </div>
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="h-4 w-36 bg-slate-100 rounded" />
          <div className="h-20 w-full bg-slate-100 rounded-lg" />
          <div className="h-20 w-full bg-slate-100 rounded-lg" />
        </div>
      </div>

      {/* Main Workspace Skeleton */}
      <div className="flex-1 p-6 space-y-6">
        <div className="h-12 bg-white rounded-xl border border-slate-200 p-4" />
        <div className="h-40 bg-white rounded-xl border border-slate-200 p-6" />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 h-72 bg-white rounded-xl border border-slate-200" />
          <div className="h-72 bg-white rounded-xl border border-slate-200" />
        </div>
      </div>
      <span className="sr-only">Loading AERIS Urban Air Quality Platform...</span>
    </div>
  );
}
