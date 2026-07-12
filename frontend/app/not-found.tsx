'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Button } from '@/components/UI';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Decorative Glow */}
      <div className="absolute w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl -z-10" />

      <Card className="max-w-md w-full text-center p-8 border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-2xl">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 items-center justify-center text-indigo-400 mb-6 animate-bounce">
          <HelpCircle size={32} />
        </div>
        
        <h2 className="text-3xl font-black text-slate-100 tracking-wide mb-2">404</h2>
        <h3 className="text-lg font-bold text-slate-200 mb-3">Page Not Found</h3>
        <p className="text-xs text-slate-400 leading-relaxed mb-8">
          The page you are looking for does not exist, has been moved, or you might not have authorization to view it.
        </p>

        <Link href="/dashboard" className="w-full inline-block">
          <Button variant="gradient" className="w-full flex items-center gap-1.5 justify-center">
            <ArrowLeft size={16} /> Return to Dashboard
          </Button>
        </Link>
      </Card>
    </div>
  );
}
