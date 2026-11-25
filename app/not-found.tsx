import Link from 'next/link';
import { Wind } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-col items-center justify-center p-6 text-center">
      <div className="portal-surface rounded-xl p-8 max-w-md w-full space-y-4">
        <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center mx-auto">
          <Wind className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">404</p>
          <h1 className="text-xl font-bold text-slate-900 mt-1">Page not found</h1>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            The requested monitoring route does not exist. Return to the main AERIS portal to view live air quality telemetry.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition"
        >
          Back to Portal
        </Link>
      </div>
    </div>
  );
}
