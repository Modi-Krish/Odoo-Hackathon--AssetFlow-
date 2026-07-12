'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, Button, Badge, showToast } from '@/components/UI';
import { 
  Package, 
  CheckCircle, 
  CalendarRange, 
  Wrench, 
  Calendar, 
  ArrowLeftRight, 
  AlertCircle,
  PlusCircle,
  Play,
  FileText,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { 
    assets, 
    allocations, 
    bookings, 
    transfers, 
    maintenance, 
    notifications,
    currentUser,
    users
  } = useApp();

  // Calculations
  const totalAssetsCount = assets.length;
  const availableAssetsCount = assets.filter(a => a.status === 'Available').length;
  const allocatedAssetsCount = assets.filter(a => a.status === 'Allocated').length;
  const maintenanceCount = maintenance.filter(m => m.status !== 'Resolved').length;
  const activeBookingsCount = bookings.filter(b => b.status === 'Upcoming' || b.status === 'Ongoing').length;
  const pendingTransfersCount = transfers.filter(t => t.status === 'Pending').length;

  // Overdue Returns Calculation (Expected return date is past and returned = false)
  const overdueAllocations = allocations.filter(al => {
    if (al.returned || !al.expected_return) return false;
    const expDate = new Date(al.expected_return);
    return expDate.getTime() < Date.now();
  });
  const overdueCount = overdueAllocations.length;

  // Category counts for charts
  const categoryCounts = assets.reduce((acc, curr) => {
    acc[curr.category_id] = (acc[curr.category_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const electronicsCount = categoryCounts['c-1'] || 0;
  const furnitureCount = categoryCounts['c-2'] || 0;
  const vehiclesCount = categoryCounts['c-3'] || 0;
  const labsCount = categoryCounts['c-4'] || 0;

  // Quick Action Handlers (simulate logs or triggers)
  const quickActions = [
    { name: 'Register Asset', path: '/assets?action=new', icon: PlusCircle, color: 'text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/10' },
    { name: 'Book Resource', path: '/booking?action=new', icon: Calendar, color: 'text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10' },
    { name: 'Raise Maintenance', path: '/maintenance?action=new', icon: Wrench, color: 'text-rose-400 border-rose-500/20 hover:bg-rose-500/10' },
    { name: 'New Allocation', path: '/allocation?action=new', icon: CalendarRange, color: 'text-sky-400 border-sky-500/20 hover:bg-sky-500/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Welcome Back, {currentUser?.name}</h2>
          <p className="text-xs text-slate-400 mt-0.5">Here is a real-time snapshot of the organization assets and resource activities.</p>
        </div>
        <div className="text-xs text-slate-500 font-semibold bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800 flex items-center gap-2 w-max self-start md:self-auto">
          <Clock size={14} className="text-indigo-400" />
          <span>Portal Session Validated (JWT Simulation)</span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI: Total Assets */}
        <Card className="flex items-center gap-4 p-5 bg-gradient-to-br from-slate-900/60 to-slate-950/60">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 shadow-md">
            <Package size={22} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Assets</p>
            <h3 className="text-2xl font-black text-slate-100 mt-0.5">{totalAssetsCount}</h3>
          </div>
        </Card>

        {/* KPI: Available Assets */}
        <Card className="flex items-center gap-4 p-5 bg-gradient-to-br from-slate-900/60 to-slate-950/60">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shadow-md">
            <CheckCircle size={22} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Available Assets</p>
            <h3 className="text-2xl font-black text-slate-100 mt-0.5">{availableAssetsCount}</h3>
          </div>
        </Card>

        {/* KPI: Allocated Assets */}
        <Card className="flex items-center gap-4 p-5 bg-gradient-to-br from-slate-900/60 to-slate-950/60">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 shadow-md">
            <CalendarRange size={22} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Allocated Assets</p>
            <h3 className="text-2xl font-black text-slate-100 mt-0.5">{allocatedAssetsCount}</h3>
          </div>
        </Card>

        {/* KPI: Maintenance */}
        <Card className="flex items-center gap-4 p-5 bg-gradient-to-br from-slate-900/60 to-slate-950/60">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-orange-400 shadow-md">
            <Wrench size={22} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Maintenance</p>
            <h3 className="text-2xl font-black text-slate-100 mt-0.5">{maintenanceCount}</h3>
          </div>
        </Card>
      </div>

      {/* Overdue alert card banner if overdue returns exist */}
      {overdueCount > 0 && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-rose-500/20 bg-rose-950/10 text-rose-200 shadow-md">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-rose-400 flex-shrink-0" size={20} />
            <div className="text-xs">
              <span className="font-bold">Overdue Returns Detected:</span> There are {overdueCount} assets currently overdue. Please review allocations and notify respective employees.
            </div>
          </div>
          <Link href="/allocation?tab=overdue" className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-all flex items-center gap-1">
            <span>View list</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      )}

      {/* Mid sections: Charts and quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Actions widget */}
        <Card className="lg:col-span-1">
          <h4 className="text-sm font-bold text-slate-100 mb-4 font-display">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map(act => {
              const Icon = act.icon;
              const textColor = act.color.split(' ')[0]; // E.g., text-indigo-600
              return (
                <Link 
                  key={act.name} 
                  href={act.path} 
                  className={`
                    p-4 rounded-2xl bg-slate-900 shadow-extruded flex flex-col justify-between h-[100px] transition-all duration-300 hover:shadow-extruded-hover hover:-translate-y-0.5 border-none group cursor-pointer
                    ${textColor}
                  `}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-900 shadow-inset flex items-center justify-center text-slate-200 group-hover:text-indigo-600 transition-colors duration-300">
                    <Icon size={16} className="transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <span className="text-xs font-bold text-slate-200 mt-2">{act.name}</span>
                </Link>
              );
            })}
          </div>
        </Card>

        {/* Dynamic Chart SVG block */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-300 mb-1">Asset Categories Distribution</h4>
            <p className="text-[10px] text-slate-500 mb-4">Total breakdown of cataloged assets by category</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-2">
            {/* Custom SVG Pie Chart */}
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#1e293b" strokeWidth="3" />
                
                {/* Electronics Segment */}
                <circle 
                  cx="18" cy="18" r="15.915" fill="transparent" stroke="#6366f1" strokeWidth="4.2" 
                  strokeDasharray={`${(electronicsCount/totalAssetsCount)*100} ${100 - (electronicsCount/totalAssetsCount)*100}`} 
                  strokeDashoffset="0"
                />
                
                {/* Furniture Segment */}
                <circle 
                  cx="18" cy="18" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="4.2" 
                  strokeDasharray={`${(furnitureCount/totalAssetsCount)*100} ${100 - (furnitureCount/totalAssetsCount)*100}`} 
                  strokeDashoffset={`-${(electronicsCount/totalAssetsCount)*100}`}
                />

                {/* Vehicles Segment */}
                <circle 
                  cx="18" cy="18" r="15.915" fill="transparent" stroke="#f59e0b" strokeWidth="4.2" 
                  strokeDasharray={`${(vehiclesCount/totalAssetsCount)*100} ${100 - (vehiclesCount/totalAssetsCount)*100}`} 
                  strokeDashoffset={`-${((electronicsCount + furnitureCount)/totalAssetsCount)*100}`}
                />

                {/* Lab Segment */}
                <circle 
                  cx="18" cy="18" r="15.915" fill="transparent" stroke="#ec4899" strokeWidth="4.2" 
                  strokeDasharray={`${(labsCount/totalAssetsCount)*100} ${100 - (labsCount/totalAssetsCount)*100}`} 
                  strokeDashoffset={`-${((electronicsCount + furnitureCount + vehiclesCount)/totalAssetsCount)*100}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-slate-100">{totalAssetsCount}</span>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Assets</span>
              </div>
            </div>

            {/* Chart Legend */}
            <div className="flex-1 space-y-2.5 w-full md:w-auto">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-indigo-500" />
                  <span className="text-slate-400">Electronics</span>
                </div>
                <span className="text-slate-200">{electronicsCount} assets ({((electronicsCount/totalAssetsCount)*100 || 0).toFixed(0)}%)</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-500" />
                  <span className="text-slate-400">Furniture</span>
                </div>
                <span className="text-slate-200">{furnitureCount} assets ({((furnitureCount/totalAssetsCount)*100 || 0).toFixed(0)}%)</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-amber-500" />
                  <span className="text-slate-400">Vehicles</span>
                </div>
                <span className="text-slate-200">{vehiclesCount} assets ({((vehiclesCount/totalAssetsCount)*100 || 0).toFixed(0)}%)</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-pink-500" />
                  <span className="text-slate-400">Lab Equipment</span>
                </div>
                <span className="text-slate-200">{labsCount} assets ({((labsCount/totalAssetsCount)*100 || 0).toFixed(0)}%)</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom section: Recent activities log & pending actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Activity Stream */}
        <Card>
          <h4 className="text-sm font-bold text-slate-300 mb-4">System Activity Stream</h4>
          <div className="space-y-4">
            {notifications.slice(0, 4).map(notif => (
              <div key={notif.id} className="flex gap-3 text-xs border-b border-slate-800/40 pb-3 last:border-b-0 last:pb-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
                  <Clock size={14} />
                </div>
                <div>
                  <h5 className="font-bold text-slate-200">{notif.title}</h5>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">{notif.description}</p>
                  <span className="text-[9px] text-slate-600 block mt-1">{new Date(notif.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Operational Queues KPI card */}
        <Card className="flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-300 mb-1">Operational Pipeline Queues</h4>
            <p className="text-[10px] text-slate-500 mb-4">Pending actions waiting for authorization</p>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <ArrowLeftRight size={16} className="text-indigo-400" />
                <span className="font-semibold text-slate-300">Pending Transfers</span>
              </div>
              <Badge content={`${pendingTransfersCount} Requests`} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-emerald-400" />
                <span className="font-semibold text-slate-300">Active Bookings</span>
              </div>
              <Badge content={`${activeBookingsCount} Ongoing`} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Wrench size={16} className="text-orange-400" />
                <span className="font-semibold text-slate-300">Unresolved Maintenance</span>
              </div>
              <Badge content={`${maintenanceCount} Tasks`} />
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 mt-4 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Operational Health</span>
            <span className="text-[10px] text-emerald-400 font-bold">100% Client-Side Sync Ready</span>
          </div>
        </Card>
      </div>

    </div>
  );
}
