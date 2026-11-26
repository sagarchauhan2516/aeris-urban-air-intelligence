'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('AERIS Client Error Boundary caught:', error);
  }, [error]);

  return (
    <div
      role="alert"
      className="min-h-screen flex items-center justify-center p-6 bg-slate-50 text-slate-900 font-sans"
    >
      <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 p-6 shadow-xl text-center space-y-4">
        <div
          className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto"
          aria-hidden="true"
        >
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            Atmospheric Intelligence Feed Interrupted
          </h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            A temporary client rendering error occurred while computing real-time environmental models.
            Your stored profiles and preferences remain safely preserved.
          </p>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            Reload Intelligence Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
