'use client';

import React from 'react';
import { Card, Button, showToast } from '@/components/UI';
import { BarChart3, Download } from 'lucide-react';

export default function ReportsPage() {
  const handleExportClick = () => {
    showToast('Analytics summary exported as CSV successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-display">
          <BarChart3 className="text-indigo-600 animate-float" size={22} />
          <span>Reports & Analytics</span>
        </h2>
        <p className="text-xs text-slate-300 mt-0.5 font-bold uppercase tracking-wider">Acquisition costs, utilization metrics, and hardware retirement forecasts</p>
      </div>

      {/* Screen 9 Chart Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Chart: Utilization by department */}
        <Card className="p-6">
          <h4 className="text-xs font-black text-slate-300 mb-6 font-display uppercase tracking-wide">
            Utilization by department
          </h4>
          
          {/* Vertical Bar Chart in Neumorphic Well */}
          <div className="h-40 rounded-2xl bg-slate-900 shadow-inset flex items-end justify-between p-6 gap-3">
            <div className="flex flex-col items-center gap-1.5 w-8 h-full justify-end">
              <div className="w-full bg-indigo-600/80 rounded-t-lg shadow-extruded-sm transition-all hover:bg-indigo-600 h-[45%]" />
            </div>
            <div className="flex flex-col items-center gap-1.5 w-8 h-full justify-end">
              <div className="w-full bg-indigo-600/80 rounded-t-lg shadow-extruded-sm transition-all hover:bg-indigo-600 h-[85%]" />
            </div>
            <div className="flex flex-col items-center gap-1.5 w-8 h-full justify-end">
              <div className="w-full bg-indigo-600/80 rounded-t-lg shadow-extruded-sm transition-all hover:bg-indigo-600 h-[65%]" />
            </div>
            <div className="flex flex-col items-center gap-1.5 w-8 h-full justify-end">
              <div className="w-full bg-indigo-600/80 rounded-t-lg shadow-extruded-sm transition-all hover:bg-indigo-600 h-[35%]" />
            </div>
            <div className="flex flex-col items-center gap-1.5 w-8 h-full justify-end">
              <div className="w-full bg-indigo-600/80 rounded-t-lg shadow-extruded-sm transition-all hover:bg-indigo-600 h-[75%]" />
            </div>
          </div>
        </Card>

        {/* Right Chart: Maintenance Frequency */}
        <Card className="p-6">
          <h4 className="text-xs font-black text-slate-300 mb-6 font-display uppercase tracking-wide">
            Maintenance Frequency
          </h4>

          {/* Line Chart in Neumorphic Well */}
          <div className="h-40 rounded-2xl bg-slate-900 shadow-inset flex items-center justify-center p-6">
            <svg viewBox="0 0 100 40" className="w-full h-24 text-rose-600 fill-none stroke-current stroke-[2.5] stroke-linecap-round stroke-linejoin-round drop-shadow-[0_0_6px_rgba(225,29,72,0.2)]">
              <path d="M 5,32 L 20,12 L 38,28 L 56,10 L 74,20 L 95,6" />
            </svg>
          </div>
        </Card>

      </div>

      {/* Screen 9 Data lists (Most used, Idle) */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-bold text-slate-200">
          
          {/* Most used assets */}
          <div className="space-y-4">
            <h4 className="text-sm font-extrabold text-slate-100 font-display">Most used assets</h4>
            <ul className="space-y-3 pl-1">
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                <span>Room B2: 34 booking this month</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                <span>Van AF-343: 21 trips this month</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                <span>Projector AF-335: 18 uses</span>
              </li>
            </ul>
          </div>

          {/* Idle assets */}
          <div className="space-y-4">
            <h4 className="text-sm font-extrabold text-slate-100 font-display">Idle assets</h4>
            <ul className="space-y-3 pl-1">
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                <span>Camera AF-0301 : unused 60+ days</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                <span>chair AF-0410 : unused 45 days</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Screen 9 Horizontal divider */}
        <hr className="border-slate-700/20 my-6" />

        {/* Screen 9 Nearing retirement section */}
        <div className="space-y-4 text-xs font-bold text-slate-250">
          <h4 className="text-sm font-extrabold text-slate-100 font-display">
            Assets due for maintenance / nearing retirement
          </h4>
          <ul className="space-y-3 pl-1">
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Forklift AF-0087 : service due in 5 days</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Laptop AF-0020 : 4 years old : nearing retirement</span>
            </li>
          </ul>
        </div>

        {/* Screen 9 Action Button */}
        <div className="mt-8 border-t border-slate-700/20 pt-6">
          <Button onClick={handleExportClick} variant="primary" className="flex items-center gap-1.5 px-8 py-3.5 uppercase tracking-wider font-extrabold text-xs">
            <Download size={14} /> Export report
          </Button>
        </div>

      </Card>

    </div>
  );
}
