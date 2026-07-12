'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Next.js Global Error Boundary
 * Catches unhandled runtime errors in the app and shows a friendly recovery screen.
 * The 'reset' function re-renders the subtree to recover without a full page reload.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 flex items-center justify-center p-4 antialiased">
        <div className="max-w-md w-full text-center">
          {/* Glow effect */}
          <div className="absolute w-64 h-64 bg-rose-500/10 rounded-full blur-3xl -z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />

          <div className="inline-flex w-16 h-16 rounded-2xl bg-rose-600/10 border border-rose-500/20 items-center justify-center text-rose-400 mb-6">
            <AlertTriangle size={32} />
          </div>

          <h1 className="text-2xl font-black text-slate-100 tracking-wide mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed mb-2">
            An unexpected error occurred in the application.
          </p>
          {process.env.NODE_ENV === 'development' && error?.message && (
            <p className="text-xs text-rose-400 font-mono bg-rose-900/20 rounded-lg px-3 py-2 mb-6 text-left break-all">
              {error.message}
            </p>
          )}

          <div className="flex gap-3 justify-center mt-6">
            <button
              onClick={reset}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors"
            >
              <RefreshCw size={14} />
              Try again
            </button>
            <a
              href="/dashboard"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-sm font-semibold hover:bg-slate-700 transition-colors border border-slate-700"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
