'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, Button, Input, Select, showToast, Modal, Loader, ErrorMessage, Skeleton, EmptyState } from '@/components/UI';
import { Wrench, Plus, ArrowRight, UserCheck, Play, CheckCircle, AlertOctagon } from 'lucide-react';
import { MaintenancePriority, MaintenanceStatus } from '@/types';

export default function MaintenancePage() {
  const {
    assets,
    maintenance,
    raiseMaintenance,
    updateMaintenanceStatus
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [priorityLevel, setPriorityLevel] = useState<MaintenancePriority>('Medium');

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Technician popover state
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [techName, setTechName] = useState('');
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId) return showToast('Please select an asset', 'error');
    if (!issueDescription.trim()) return showToast('Please describe the issue', 'error');

    const res = await raiseMaintenance(selectedAssetId, issueDescription, priorityLevel);
    if (res.success) {
      showToast(res.message, 'success');
      setSelectedAssetId('');
      setIssueDescription('');
      setPriorityLevel('Medium');
      setIsModalOpen(false);
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleAssignTechSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningId) return;
    if (!techName.trim()) return showToast('Technician name is required', 'error');

    const res = await updateMaintenanceStatus(assigningId, 'Technician Assigned', techName);
    if (res.success) {
      showToast('Technician assigned successfully', 'success');
      setAssigningId(null);
      setTechName('');
      setIsTechModalOpen(false);
    }
  };

  const handleAdvanceStatus = (id: string, currentStatus: MaintenanceStatus) => {
    if (currentStatus === 'Pending') {
      updateMaintenanceStatus(id, 'Approved');
      showToast('Request approved', 'success');
    } else if (currentStatus === 'Approved') {
      setAssigningId(id);
      setTechName('');
      setIsTechModalOpen(true);
    } else if (currentStatus === 'Technician Assigned') {
      updateMaintenanceStatus(id, 'In Progress');
      showToast('Repair work started', 'success');
    } else if (currentStatus === 'In Progress') {
      updateMaintenanceStatus(id, 'Resolved');
      showToast('Issue marked as resolved', 'success');
    }
  };

  const kanbanColumns: { key: MaintenanceStatus; label: string }[] = [
    { key: 'Pending', label: 'Pending' },
    { key: 'Approved', label: 'Approved' },
    { key: 'Technician Assigned', label: 'Technician assigned' },
    { key: 'In Progress', label: 'in progress' },
    { key: 'Resolved', label: 'Resolved' }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-display">
              <Wrench className="text-indigo-600 animate-float" size={22} />
              <span>Maintenance Management</span>
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4.5">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="space-y-3 p-3 bg-slate-900 rounded-[28px] h-[300px]">
              <Skeleton className="h-6 w-3/4 mx-auto" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
        <Loader message="Syncing Maintenance boards..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <ErrorMessage message={error} onRetry={() => { setError(null); setLoading(true); }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-display">
            <Wrench className="text-indigo-600 animate-float" size={22} />
            <span>Maintenance Management</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 font-bold uppercase tracking-wider font-sans">Kanban board workflow for approval, technician allocations, and repairs</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="primary" className="flex items-center gap-1.5 font-display uppercase tracking-wider">
          <Plus size={16} /> Raise request
        </Button>
      </div>

      {maintenance.length === 0 ? (
        <EmptyState
          title="No Maintenance Logs Yet"
          description="Every asset is performing flawlessly. Report your first asset issue if any hardware failure arises."
          icon={<Wrench size={48} className="text-slate-650" />}
          actionLabel="Raise Maintenance Request"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        /* Screen 7: Kanban Columns Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4.5 overflow-x-auto pb-4">
          
          {kanbanColumns.map(col => {
            const colRequests = maintenance.filter(m => m.status === col.key);

            return (
              <div key={col.key} className="flex flex-col min-w-[200px] p-3 bg-slate-900 rounded-[28px] shadow-inset border-none min-h-[480px]">
                
                {/* Header */}
                <div className="pb-3 mb-4 border-b border-slate-700/10 text-center">
                  <span className="text-xs font-black text-slate-300 font-display tracking-wide uppercase">
                    {col.label}
                  </span>
                  <span className="ml-1.5 text-[10px] text-slate-500 font-bold bg-slate-950 px-1.5 py-0.5 rounded-md shadow-inset-sm">
                    {colRequests.length}
                  </span>
                </div>

                {/* Cards wrapper */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                  {colRequests.length === 0 ? (
                    <div className="text-center py-8 text-slate-600 text-[10px] font-bold italic uppercase tracking-wider">
                      Empty Column
                    </div>
                  ) : (
                    colRequests.map(req => {
                      const ast = assets.find(a => a.id === req.asset_id);
                      const isResolved = req.status === 'Resolved';
                      
                      return (
                        <div
                          key={req.id}
                          className={`
                            p-4 rounded-2xl flex flex-col justify-between text-xs font-bold transition-all shadow-extruded hover:-translate-y-0.5 border-none h-[142px]
                            ${isResolved 
                              ? 'bg-emerald-900/60 border border-emerald-500/20 text-slate-100 shadow-[0_0_12px_rgba(16,185,129,0.15)]' 
                              : 'bg-slate-900 text-slate-200'}
                          `}
                        >
                          <div>
                            {/* Header: tag & issue */}
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className={`text-[10px] font-black ${isResolved ? 'text-emerald-400' : 'text-indigo-600'}`}>
                                {ast?.asset_tag || 'AF-000'}
                              </span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black border uppercase ${
                                req.priority === 'Critical' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                                req.priority === 'High' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                                req.priority === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                'bg-slate-800 border-slate-700/30 text-slate-400'
                              }`}>
                                {req.priority}
                              </span>
                            </div>
                            <p className="line-clamp-2 text-[11px] font-medium leading-relaxed text-slate-300">
                              {req.issue}
                            </p>
                          </div>

                          {/* Footer with actions */}
                          <div className="mt-3 pt-3 border-t border-slate-800/40 flex items-center justify-between">
                            <span className="text-[9px] text-slate-500">
                              {req.technician ? `Tech: ${req.technician}` : 'No Tech Assigned'}
                            </span>
                            
                            {!isResolved && (
                              <button
                                onClick={() => handleAdvanceStatus(req.id, req.status)}
                                className="text-[10px] font-extrabold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-all"
                              >
                                <span>
                                  {req.status === 'Pending' ? 'Approve' :
                                   req.status === 'Approved' ? 'Assign Tech' :
                                   req.status === 'Technician Assigned' ? 'Start Repair' : 'Resolve'}
                                </span>
                                <ArrowRight size={11} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Raise Request Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Report New Maintenance Issue">
        <form onSubmit={handleSubmitRequest} className="space-y-4">
          <Select
            label="Damaged Asset / Resource"
            options={[
              { value: '', label: '-- Select Asset --' },
              ...assets.map(a => ({ value: a.id, label: `${a.name} (${a.asset_tag})` }))
            ]}
            value={selectedAssetId}
            onChange={e => setSelectedAssetId(e.target.value)}
            required
          />

          <div className="w-full">
            <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider uppercase">Issue description</label>
            <textarea
              className="w-full px-5 py-3 rounded-2xl bg-slate-900 text-slate-100 text-sm border-none shadow-inset focus:outline-none focus:shadow-inset-deep focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-slate-900 min-h-[100px]"
              placeholder="Provide a detailed log of the fault or breakdown..."
              value={issueDescription}
              onChange={e => setIssueDescription(e.target.value)}
              required
            />
          </div>

          <Select
            label="Priority Level"
            options={[
              { value: 'Low', label: 'Low - General repairs' },
              { value: 'Medium', label: 'Medium - Operational impact' },
              { value: 'High', label: 'High - System critical' },
              { value: 'Critical', label: 'Critical - Immediate resolution required' }
            ]}
            value={priorityLevel}
            onChange={e => setPriorityLevel(e.target.value as MaintenancePriority)}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700/20">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient">
              Submit Report
            </Button>
          </div>
        </form>
      </Modal>

      {/* Tech Assignment Modal */}
      <Modal isOpen={isTechModalOpen} onClose={() => setIsTechModalOpen(false)} title="Assign Repair Technician">
        <form onSubmit={handleAssignTechSubmit} className="space-y-4">
          <Input
            label="Technician / Shop Name"
            placeholder="e.g. Carpenter Shop, Sarah Connor..."
            value={techName}
            onChange={e => setTechName(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700/20">
            <Button type="button" variant="outline" onClick={() => setIsTechModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient">
              Assign
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
