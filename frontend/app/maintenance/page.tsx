'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, Button, Input, Select, Badge, showToast } from '@/components/UI';
import { Wrench, Plus, Check, X, ShieldAlert, User, Clock, CheckCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { MaintenancePriority, MaintenanceStatus } from '@/types';

export default function MaintenancePage() {
  const {
    assets,
    maintenance,
    users,
    currentUser,
    raiseMaintenance,
    updateMaintenanceStatus
  } = useApp();

  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'view' | 'raise'>('view');

  // Request Form States
  const [assetId, setAssetId] = useState('');
  const [issue, setIssue] = useState('');
  const [priority, setPriority] = useState<MaintenancePriority>('Medium');

  // Technician assignment local state
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [technicianName, setTechnicianName] = useState('');

  // Auto-switch tabs if action=new query is passed
  useEffect(() => {
    if (searchParams && searchParams.get('action') === 'new') {
      setActiveTab('raise');
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId) return showToast('Please select an asset', 'error');
    if (!issue.trim()) return showToast('Please describe the maintenance issue', 'error');

    const res = raiseMaintenance(assetId, issue, priority);
    if (res.success) {
      showToast(res.message, 'success');
      // Reset
      setAssetId('');
      setIssue('');
      setPriority('Medium');
      setActiveTab('view');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleStatusUpdate = (requestId: string, status: MaintenanceStatus) => {
    const res = updateMaintenanceStatus(requestId, status);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleAssignTechnicianSubmit = (e: React.FormEvent, requestId: string) => {
    e.preventDefault();
    if (!technicianName.trim()) return showToast('Technician name is required', 'error');
    
    const res = updateMaintenanceStatus(requestId, 'Technician Assigned', technicianName);
    if (res.success) {
      showToast('Technician assigned successfully', 'success');
      setAssigningId(null);
      setTechnicianName('');
    }
  };

  const isManager = currentUser?.role === 'Admin' || currentUser?.role === 'Asset Manager';

  // Assets options
  const assetsOptions = [
    { value: '', label: '-- Select Asset --' },
    ...assets.map(a => ({ value: a.id, label: `${a.name} (${a.asset_tag})` }))
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Wrench className="text-indigo-400" size={22} />
          <span>Maintenance Workflows</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Track and resolve hardware failures, schedule inspections, and manage technician assignments.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 pb-px gap-2">
        <button
          onClick={() => setActiveTab('view')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'view' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Wrench size={14} /> Maintenance Pipelines
        </button>
        <button
          onClick={() => setActiveTab('raise')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'raise' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Plus size={14} /> Raise Request
        </button>
      </div>

      {/* Tab content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {activeTab === 'view' && (
            <>
              {maintenance.length === 0 ? (
                <Card className="text-center py-8 font-semibold text-slate-500 text-xs italic">
                  No maintenance records logged in the pipeline.
                </Card>
              ) : (
                maintenance.map(req => {
                  const ast = assets.find(a => a.id === req.asset_id);
                  const creator = users.find(u => u.id === req.created_by);

                  const showApproveReject = req.status === 'Pending' && isManager;
                  const showAssignTech = req.status === 'Approved' && isManager;
                  const showStartWork = req.status === 'Technician Assigned' && isManager;
                  const showResolve = req.status === 'In Progress' && isManager;

                  return (
                    <Card key={req.id} className="space-y-4 border-slate-850">
                      {/* Request Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-slate-200 text-sm">{ast?.name}</h3>
                          <p className="text-[10px] text-slate-500 font-bold mt-1">TAG: <span className="text-indigo-400">{ast?.asset_tag}</span> | SERIAL: {ast?.serial_number}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge content={req.priority} />
                          <Badge content={req.status} />
                        </div>
                      </div>

                      {/* Issue Description */}
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850 text-xs">
                        <span className="font-bold text-slate-400 block mb-1">Reported Issue:</span>
                        <span className="text-slate-200 leading-relaxed">{req.issue}</span>
                      </div>

                      {/* Details row */}
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                        <span className="flex items-center gap-1"><User size={12} className="text-indigo-400" /> Reported by {creator ? creator.name : 'Unknown'}</span>
                        <span className="flex items-center gap-1"><Clock size={12} className="text-indigo-400" /> Opened {new Date(req.created_at).toLocaleString()}</span>
                        {req.technician && <span className="text-slate-300 font-bold">Technician: {req.technician}</span>}
                      </div>

                      {/* Context-based Manager Actions */}
                      {isManager && (showApproveReject || showAssignTech || showStartWork || showResolve || assigningId === req.id) && (
                        <div className="border-t border-slate-800/80 pt-3 mt-2 flex flex-col gap-3">
                          
                          {/* Approve/Reject Buttons */}
                          {showApproveReject && (
                            <div className="flex items-center gap-2">
                              <Button 
                                onClick={() => handleStatusUpdate(req.id, 'Approved')} 
                                variant="primary" 
                                size="sm"
                                className="flex items-center gap-1 text-[11px]"
                              >
                                <Check size={12} /> Approve Repair
                              </Button>
                              <Button 
                                onClick={() => handleStatusUpdate(req.id, 'Resolved')} // Simulate rejecting by forcing status update to resolved/closed
                                variant="ghost" 
                                size="sm"
                                className="flex items-center gap-1 text-[11px] text-rose-400 hover:bg-rose-500/10"
                              >
                                <X size={12} /> Reject Request
                              </Button>
                            </div>
                          )}

                          {/* Assign Technician Button / Form trigger */}
                          {showAssignTech && assigningId !== req.id && (
                            <Button 
                              onClick={() => setAssigningId(req.id)} 
                              variant="outline" 
                              size="sm"
                              className="text-[11px]"
                            >
                              Assign Technician
                            </Button>
                          )}

                          {/* Inline assign technician form */}
                          {assigningId === req.id && (
                            <form onSubmit={(e) => handleAssignTechnicianSubmit(e, req.id)} className="flex items-end gap-2 max-w-sm">
                              <Input
                                label="Technician / Service Center Name"
                                placeholder="e.g. Electra Lab Services"
                                value={technicianName}
                                onChange={e => setTechnicianName(e.target.value)}
                                required
                              />
                              <Button type="submit" variant="gradient" size="sm" className="mb-px h-[38px] text-[11px]">
                                Assign
                              </Button>
                              <Button type="button" variant="outline" size="sm" onClick={() => setAssigningId(null)} className="mb-px h-[38px] text-[11px]">
                                Cancel
                              </Button>
                            </form>
                          )}

                          {/* Start Work button */}
                          {showStartWork && (
                            <Button 
                              onClick={() => handleStatusUpdate(req.id, 'In Progress')} 
                              variant="gradient" 
                              size="sm"
                              className="text-[11px]"
                            >
                              Mark In Progress (Start Repair)
                            </Button>
                          )}

                          {/* Resolve Repair button */}
                          {showResolve && (
                            <Button 
                              onClick={() => handleStatusUpdate(req.id, 'Resolved')} 
                              variant="primary" 
                              size="sm"
                              className="flex items-center gap-1 text-[11px] bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/10"
                            >
                              <CheckCircle size={12} /> Mark Fixed (Resolve)
                            </Button>
                          )}

                        </div>
                      )}
                    </Card>
                  );
                })
              )}
            </>
          )}

          {activeTab === 'raise' && (
            <Card>
              <h3 className="text-sm font-bold text-slate-200 mb-4">Submit Maintenance Ticket</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                  label="Select Faulty Asset"
                  options={assetsOptions}
                  value={assetId}
                  onChange={e => setAssetId(e.target.value)}
                  required
                />

                <Select
                  label="Priority Level"
                  options={[
                    { value: 'Low', label: 'Low' },
                    { value: 'Medium', label: 'Medium' },
                    { value: 'High', label: 'High' },
                    { value: 'Critical', label: 'Critical' }
                  ]}
                  value={priority}
                  onChange={e => setPriority(e.target.value as MaintenancePriority)}
                  required
                />

                <div className="w-full">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 tracking-wider uppercase">
                    Description of Issue
                  </label>
                  <textarea
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 text-sm transition-all duration-200 focus:outline-none focus:border-indigo-500 h-28 resize-none"
                    placeholder="Provide details about the malfunction or problem..."
                    value={issue}
                    onChange={e => setIssue(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" variant="gradient" className="w-full mt-2" disabled={!assetId || !issue}>
                  Submit Request
                </Button>
              </form>
            </Card>
          )}
        </div>

        {/* Informational Panel */}
        <Card className="lg:col-span-1 space-y-4 h-fit bg-slate-950/40 border-slate-800 text-xs">
          <h3 className="text-sm font-bold text-slate-300">Approval Workflow</h3>
          
          <div className="space-y-4 leading-relaxed text-slate-400">
            <div className="flex gap-2">
              <div className="w-5 h-5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0">1</div>
              <div>
                <span className="font-bold text-slate-200 block">Pending</span>
                <span>Employee raises request. Stays in Pending queue. Asset status is still Allocated.</span>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="w-5 h-5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0">2</div>
              <div>
                <span className="font-bold text-slate-200 block">Approved & Assigned</span>
                <span>Asset Manager approves. Asset transitions status automatically to <strong>Under Maintenance</strong>. Technician is assigned.</span>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="w-5 h-5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0">3</div>
              <div>
                <span className="font-bold text-slate-200 block">In Progress</span>
                <span>Repair starts. Status shifts to In Progress. Asset is blocked from bookings or checkouts.</span>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="w-5 h-5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0">4</div>
              <div>
                <span className="font-bold text-slate-200 block">Resolved</span>
                <span>Technician finishes work. Manager marks resolved. Asset automatically shifts back to <strong>Available</strong> (or Active Allocation).</span>
              </div>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
