'use client';

import React, { use, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, Button, Badge } from '@/components/UI';
import { 
  ArrowLeft, 
  CalendarRange, 
  Wrench, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Tag, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';
import Link from 'next/link';

export default function AssetDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { 
    assets, 
    categories, 
    allocations, 
    maintenance, 
    bookings, 
    users, 
    departments 
  } = useApp();

  const asset = assets.find(a => a.id === id);
  const [activeTab, setActiveTab] = useState<'allocations' | 'maintenance' | 'bookings'>('allocations');

  if (!asset) {
    return (
      <Card className="max-w-xl mx-auto mt-12 text-center p-8 border-rose-500/20 bg-rose-950/5">
        <AlertTriangle size={48} className="mx-auto text-rose-400 mb-4" />
        <h3 className="text-lg font-bold text-slate-100 mb-2">Asset Not Found</h3>
        <p className="text-xs text-slate-400 mb-6">The asset you are looking for does not exist or has been removed.</p>
        <Link href="/assets">
          <Button variant="outline">Back to Catalog</Button>
        </Link>
      </Card>
    );
  }

  const category = categories.find(c => c.id === asset.category_id);
  const currentHolder = asset.assigned_to_id ? users.find(u => u.id === asset.assigned_to_id) : null;
  const currentDept = asset.department_id ? departments.find(d => d.id === asset.department_id) : null;

  // Filter histories
  const assetAllocations = allocations
    .filter(al => al.asset_id === asset.id)
    .sort((a, b) => new Date(b.allocation_date).getTime() - new Date(a.allocation_date).getTime());

  const assetMaintenance = maintenance
    .filter(m => m.asset_id === asset.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const assetBookings = bookings
    .filter(b => b.asset_id === asset.id)
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link href="/assets" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-all font-semibold mb-2">
          <ArrowLeft size={14} /> Back to Catalog
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-100">{asset.name}</h2>
              <Badge content={asset.status} />
            </div>
            <p className="text-xs text-slate-400 mt-1">Asset Tag: <span className="font-bold text-indigo-400">{asset.asset_tag}</span> | Serial Number: <span className="font-bold text-slate-300">{asset.serial_number}</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Specifications panel */}
        <Card className="lg:col-span-1 space-y-6 h-fit">
          <h3 className="text-sm font-bold text-slate-300 border-b border-slate-800 pb-3 flex items-center gap-1.5">
            <Tag size={16} className="text-indigo-400" />
            <span>Specifications & Details</span>
          </h3>

          <div className="space-y-4 text-xs font-semibold">
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Category</span>
              <span className="text-slate-200">{category?.name || 'Unknown'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Current Location</span>
              <span className="text-slate-200 flex items-center gap-1">
                <MapPin size={12} className="text-indigo-400" /> {asset.location}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Acquisition Cost</span>
              <span className="text-slate-200 flex items-center">
                <DollarSign size={12} className="text-indigo-400" /> {asset.purchase_cost.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Purchase Date</span>
              <span className="text-slate-200 flex items-center gap-1">
                <Calendar size={12} className="text-indigo-400" /> {new Date(asset.purchase_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Condition</span>
              <Badge content={asset.condition} />
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Shared Resource</span>
              <span className="text-slate-200">{asset.bookable ? 'Yes (Bookable)' : 'No (Assigned Only)'}</span>
            </div>
          </div>

          {/* Current Allocation state */}
          <div className="mt-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2.5">Current Holder</h4>
            {currentHolder ? (
              <div className="text-xs space-y-2">
                <p className="font-bold text-slate-200">{currentHolder.name}</p>
                <p className="text-[10px] text-slate-400">{currentHolder.email}</p>
                <p className="text-[10px] text-slate-400">Department: <span className="font-semibold text-slate-300">{currentDept?.name || 'HQ'}</span></p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-semibold italic">Unallocated - Currently in Inventory</p>
            )}
          </div>
        </Card>

        {/* History Log panel */}
        <Card className="lg:col-span-2 flex flex-col min-h-[400px]">
          {/* History selection tabs */}
          <div className="flex border-b border-slate-800 pb-3 mb-4">
            <button
              onClick={() => setActiveTab('allocations')}
              className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'allocations' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              <CalendarRange size={14} /> Allocation History ({assetAllocations.length})
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'maintenance' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              <Wrench size={14} /> Maintenance Logs ({assetMaintenance.length})
            </button>
            {asset.bookable && (
              <button
                onClick={() => setActiveTab('bookings')}
                className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'bookings' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                <Calendar size={14} /> Bookings Calendar ({assetBookings.length})
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Tab: Allocations */}
            {activeTab === 'allocations' && (
              <div className="space-y-4">
                {assetAllocations.length === 0 ? (
                  <p className="text-slate-500 text-xs italic py-8 text-center font-semibold">No allocation records for this asset.</p>
                ) : (
                  assetAllocations.map(al => {
                    const emp = users.find(u => u.id === al.employee_id);
                    return (
                      <div key={al.id} className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/40 text-xs flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-200">Allocated to {emp ? emp.name : 'Unknown Employee'}</p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                            <Clock size={12} className="text-indigo-400" />
                            <span>Date: {new Date(al.allocation_date).toLocaleDateString()}</span>
                            {al.expected_return && <span>- Expected Return: {new Date(al.expected_return).toLocaleDateString()}</span>}
                          </p>
                          {al.condition_check && <p className="text-[10px] text-slate-500 mt-1">Return Notes: &quot;{al.condition_check}&quot;</p>}
                        </div>
                        <Badge content={al.returned ? 'Returned' : 'Active'} />
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Tab: Maintenance */}
            {activeTab === 'maintenance' && (
              <div className="space-y-4">
                {assetMaintenance.length === 0 ? (
                  <p className="text-slate-400 text-xs text-center p-8 bg-slate-900/50 rounded-xl border border-slate-800/50">
                    No maintenance records found. The asset is in good condition!
                  </p>
                ) : (
                  assetMaintenance.map(req => (
                    <div key={req.id} className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/40 text-xs space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-slate-200">Issue: {req.issue}</p>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                            <Clock size={12} className="text-indigo-400" /> Opened on {new Date(req.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-1.5">
                          <Badge content={req.priority} />
                          <Badge content={req.status} />
                        </div>
                      </div>
                      {req.technician && <p className="text-[10px] text-slate-400">Assigned Technician: <span className="font-bold text-slate-300">{req.technician}</span></p>}
                      {req.resolved_at && (
                        <p className="text-[10px] text-emerald-400 bg-emerald-500/5 px-2 py-1 border border-emerald-500/10 rounded w-max">
                          Resolved on {new Date(req.resolved_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Bookings */}
            {activeTab === 'bookings' && (
              <div className="space-y-4">
                {assetBookings.length === 0 ? (
                  <p className="text-slate-500 text-xs italic py-8 text-center font-semibold">No booking calendar listings found.</p>
                ) : (
                  assetBookings.map(b => {
                    const emp = users.find(u => u.id === b.booked_by);
                    return (
                      <div key={b.id} className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/40 text-xs flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-200">Booked by {emp ? emp.name : 'Unknown Employee'}</p>
                          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                            {new Date(b.start_time).toLocaleString()} to {new Date(b.end_time).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge content={b.status} />
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </Card>

      </div>
    </div>
  );
}
