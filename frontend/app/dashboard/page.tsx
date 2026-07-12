'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/UI';
import { 
  Package, 
  CheckCircle, 
  CalendarRange, 
  Wrench, 
  Calendar, 
  ArrowLeftRight, 
  AlertCircle,
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
    currentUser,
    users,
    departments
  } = useApp();

  // Screen 2 Calculations
  const availableAssetsCount = assets.filter(a => a.status === 'Available').length;
  const allocatedAssetsCount = assets.filter(a => a.status === 'Allocated').length;
  const maintenanceCount = maintenance.filter(m => m.status !== 'Resolved').length;
  const activeBookingsCount = bookings.filter(b => b.status === 'Upcoming' || b.status === 'Ongoing').length;
  const pendingTransfersCount = transfers.filter(t => t.status === 'Pending').length;
  
  // Upcoming returns calculation (Allocations that are active and have expected return dates)
  const upcomingReturnsCount = allocations.filter(al => !al.returned && al.expected_return).length;

  // Overdue count calculation
  const overdueAllocations = allocations.filter(al => {
    if (al.returned || !al.expected_return) return false;
    const expDate = new Date(al.expected_return);
    // eslint-disable-next-line react-hooks/purity
    return expDate.getTime() < Date.now();
  });
  const overdueCount = overdueAllocations.length;

  // Compile Dynamic Recent Activities matching the mockup visual structure
  const getRecentActivities = () => {
    const activities: string[] = [];

    // 1. Latest Allocation
    const activeAllocations = [...allocations].filter(al => !al.returned);
    if (activeAllocations.length > 0) {
      const latestAlloc = activeAllocations[activeAllocations.length - 1];
      const ast = assets.find(a => a.id === latestAlloc.asset_id);
      const emp = users.find(u => u.id === latestAlloc.employee_id);
      const dept = emp ? departments.find(d => d.id === emp.department_id) : null;
      if (ast && emp) {
        activities.push(`${ast.name} ${ast.asset_tag} - allocated to ${emp.name} - ${dept?.name || 'IT dept'}`);
      }
    } else {
      activities.push('Laptop AF-0114 - allocated to Priya shah - IT dept'); // Seed default if empty
    }

    // 2. Latest Booking
    if (bookings.length > 0) {
      const latestBooking = bookings[bookings.length - 1];
      const ast = assets.find(a => a.id === latestBooking.asset_id);
      if (ast) {
        activities.push(`${ast.name} - booking confirmed - ${latestBooking.start_time} to ${latestBooking.end_time}`);
      }
    } else {
      activities.push('Room B2 - booking confirmed - 2:00 to 3:00 PM'); // Seed default
    }

    // 3. Latest Maintenance
    if (maintenance.length > 0) {
      const latestMaint = maintenance[maintenance.length - 1];
      const ast = assets.find(a => a.id === latestMaint.asset_id);
      if (ast) {
        activities.push(`${ast.name} ${ast.asset_tag} - maintenance ${latestMaint.status.toLowerCase()}`);
      }
    } else {
      activities.push('Projector AF-0062 - maintenance resolved'); // Seed default
    }

    return activities;
  };

  const recentActivitiesList = getRecentActivities();

  return (
    <div className="space-y-6">
      
      {/* Welcome Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 font-display">Today&apos;s Overview</h2>
        <p className="text-xs text-slate-300 mt-0.5 font-bold uppercase tracking-wider">Asset status summary and operations pipeline</p>
      </div>

      {/* Screen 2: 6 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* KPI 1: Available */}
        <Card className="flex flex-col justify-between p-6 h-28 hover:shadow-extruded-hover">
          <p className="text-[10px] text-slate-300 font-extrabold uppercase tracking-wider">Available</p>
          <h3 className="text-3xl font-black text-slate-100 mt-1">{availableAssetsCount}</h3>
        </Card>

        {/* KPI 2: Allocated */}
        <Card className="flex flex-col justify-between p-6 h-28 hover:shadow-extruded-hover">
          <p className="text-[10px] text-slate-300 font-extrabold uppercase tracking-wider">Allocated</p>
          <h3 className="text-3xl font-black text-slate-100 mt-1">{allocatedAssetsCount}</h3>
        </Card>

        {/* KPI 3: Under Maintenance */}
        <Card className="flex flex-col justify-between p-6 h-28 hover:shadow-extruded-hover">
          <p className="text-[10px] text-slate-300 font-extrabold uppercase tracking-wider">Under Maintenance</p>
          <h3 className="text-3xl font-black text-slate-100 mt-1">{maintenanceCount}</h3>
        </Card>

        {/* KPI 4: Active Bookings */}
        <Card className="flex flex-col justify-between p-6 h-28 hover:shadow-extruded-hover">
          <p className="text-[10px] text-slate-300 font-extrabold uppercase tracking-wider">Active Bookings</p>
          <h3 className="text-3xl font-black text-slate-100 mt-1">{activeBookingsCount}</h3>
        </Card>

        {/* KPI 5: Pending Transfers */}
        <Card className="flex flex-col justify-between p-6 h-28 hover:shadow-extruded-hover">
          <p className="text-[10px] text-slate-300 font-extrabold uppercase tracking-wider">Pending Transfers</p>
          <h3 className="text-3xl font-black text-slate-100 mt-1">{pendingTransfersCount}</h3>
        </Card>

        {/* KPI 6: Upcoming Returns */}
        <Card className="flex flex-col justify-between p-6 h-28 hover:shadow-extruded-hover">
          <p className="text-[10px] text-slate-300 font-extrabold uppercase tracking-wider">Upcoming returns</p>
          <h3 className="text-3xl font-black text-slate-100 mt-1">{upcomingReturnsCount}</h3>
        </Card>

      </div>

      {/* Screen 2 Overdue Warning Banner */}
      {overdueCount > 0 && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-500/15 text-black shadow-extruded-sm border border-rose-500/20">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-rose-600 flex-shrink-0 animate-pulse animate-float" size={18} />
            <span className="text-xs font-extrabold text-rose-700">
              {overdueCount} assets overdue for return - flagged for follow-up
            </span>
          </div>
          <Link href="/allocation?tab=overdue" className="text-xs font-black text-rose-700 hover:text-rose-900 transition-all flex items-center gap-1.5 underline underline-offset-2">
            <span>View list</span>
            <ArrowUpRight size={14} className="stroke-[3]" />
          </Link>
        </div>
      )}

      {/* Screen 2 Action Buttons & Recent Activity List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Actions (Screen 2: + register asset, Book resource, Raise requests) */}
        <div className="lg:col-span-1 space-y-4">
          <h4 className="text-sm font-bold text-slate-100 font-display pl-1">Quick Actions</h4>
          <div className="flex flex-col gap-4">
            
            <Link 
              href="/assets?action=new" 
              className="flex items-center justify-center p-4 rounded-2xl bg-slate-900 shadow-extruded hover:shadow-extruded-hover hover:-translate-y-0.5 border-none text-xs font-bold text-slate-200 transition-all duration-300"
            >
              + register asset
            </Link>

            <Link 
              href="/booking?action=new" 
              className="flex items-center justify-center p-4 rounded-2xl bg-slate-900 shadow-extruded hover:shadow-extruded-hover hover:-translate-y-0.5 border-none text-xs font-bold text-slate-200 transition-all duration-300"
            >
              Book resource
            </Link>

            <Link 
              href="/maintenance?action=new" 
              className="flex items-center justify-center p-4 rounded-2xl bg-slate-900 shadow-extruded hover:shadow-extruded-hover hover:-translate-y-0.5 border-none text-xs font-bold text-slate-200 transition-all duration-300"
            >
              Raise requests
            </Link>

          </div>
        </div>

        {/* Screen 2: Recent Activity List */}
        <Card className="lg:col-span-2">
          <h4 className="text-sm font-bold text-slate-100 mb-6 font-display">Recent Activity</h4>
          
          <div className="space-y-4.5 pl-2 font-bold text-xs text-slate-200">
            {recentActivitiesList.map((logStr, idx) => (
              <div key={idx} className="flex items-start gap-3.5 pb-4 border-b border-slate-700/10 last:border-none last:pb-0">
                {/* Visual tactile dot */}
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 mt-1.5 shadow-[0_0_8px_#6c63ff]" />
                <span className="leading-relaxed font-semibold text-slate-100">{logStr}</span>
              </div>
            ))}
          </div>
        </Card>

      </div>

    </div>
  );
}
