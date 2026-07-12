'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, Button, Input, Select, showToast, Modal } from '@/components/UI';
import { Wrench, Plus, ArrowRight, UserCheck, Play, CheckCircle } from 'lucide-react';
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

  // Technician popover state
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [techName, setTechName] = useState('');
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId) return showToast('Please select an asset', 'error');
    if (!issueDescription.trim()) return showToast('Please describe the issue', 'error');

    const res = raiseMaintenance(selectedAssetId, issueDescription, priorityLevel);
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

  const handleAssignTechSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningId) return;
    if (!techName.trim()) return showToast('Technician name is required', 'error');

    const res = updateMaintenanceStatus(assigningId, 'Technician Assigned', techName);
    if (res.success) {
      showToast('Technician assigned successfully', 'success');
      setAssigningId(null);
      setTechName('');
      setIsTechModalOpen(false);
    }
  };

  // Drag-and-drop or click handlers to transition requests between columns
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

  // Columns list matching Screen 7 exactly
  const kanbanColumns: { key: MaintenanceStatus; label: string }[] = [
    { key: 'Pending', label: 'Pending' },
    { key: 'Approved', label: 'Approved' },
    { key: 'Technician Assigned', label: 'Technician assigned' },
    { key: 'In Progress', label: 'in progress' },
    { key: 'Resolved', label: 'Resolved' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-display">
            <Wrench className="text-indigo-600 animate-float" size={22} />
            <span>Maintenance Management</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 font-bold uppercase tracking-wider">Kanban board workflow for approval, technician allocations, and repairs</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="primary" className="flex items-center gap-1.5 font-display uppercase tracking-wider">
          <Plus size={16} /> Raise request
        </Button>
      </div>

      {/* Screen 7: Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4.5 overflow-x-auto pb-4">
        
        {kanbanColumns.map(col => {
          const colRequests = maintenance.filter(m => {
            // Match custom labels mapping type-safe properties
            if (col.key === 'Technician Assigned') {
              return m.status === 'Technician Assigned';
            }
            return m.status === col.key;
          });

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
                {colRequests.map(req => {
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
                            req.priority === 'High' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                            'bg-slate-950/20 border-slate-800 text-slate-300'
                          }`}>
                            {req.priority}
                          </span>
                        </div>
                        
                        <p className="line-clamp-2 text-slate-100 font-bold leading-normal mt-1 text-[11px] normal-case">
                          {req.issue}
                        </p>

                        {/* Extra stats like tech names */}
                        {req.technician && (
                          <p className={`text-[9px] font-medium mt-1.5 flex items-center gap-1 ${isResolved ? 'text-emerald-300' : 'text-slate-300'}`}>
                            <span>tech:</span>
                            <span className="font-extrabold">{req.technician}</span>
                          </p>
                        )}
                      </div>

                      {/* Interactive Transitions button */}
                      {!isResolved && (
                        <button
                          onClick={() => handleAdvanceStatus(req.id, req.status)}
                          className="w-full mt-2 py-1.5 px-3 bg-slate-950/30 rounded-xl hover:bg-indigo-600/10 text-[10px] font-black tracking-wide uppercase transition-colors flex items-center justify-center gap-1 text-slate-300 hover:text-indigo-600 hover:shadow-inset-sm border-none shadow-none"
                        >
                          {req.status === 'Pending' && (
                            <><span>Approve</span><ArrowRight size={10} /></>
                          )}
                          {req.status === 'Approved' && (
                            <><span>Assign Tech</span><UserCheck size={10} /></>
                          )}
                          {req.status === 'Technician Assigned' && (
                            <><span>Start Repair</span><Play size={10} /></>
                          )}
                          {req.status === 'In Progress' && (
                            <><span>Resolve</span><CheckCircle size={10} /></>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}

      </div>

      {/* Screen 7 Bottom notice */}
      <p className="text-xs text-slate-300 font-bold italic tracking-wide text-center pt-2">
        * Approving a card moves the asset to under maintenance, resolving return it to available
      </p>

      {/* Raise Maintenance Request modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Raise Maintenance Ticket">
        <form onSubmit={handleSubmitRequest} className="space-y-4">
          <Select
            label="Select Asset requiring repair"
            options={[
              { value: '', label: 'Select Asset....' },
              ...assets.map(a => ({ value: a.id, label: `${a.name} (${a.asset_tag})` }))
            ]}
            value={selectedAssetId}
            onChange={e => setSelectedAssetId(e.target.value)}
            required
          />

          <Select
            label="Priority Level"
            options={[
              { value: 'Low', label: 'Low Priority' },
              { value: 'Medium', label: 'Medium Priority' },
              { value: 'High', label: 'High Priority' },
              { value: 'Critical', label: 'Critical / Breakdown' }
            ]}
            value={priorityLevel}
            onChange={e => setPriorityLevel(e.target.value as MaintenancePriority)}
          />

          <div className="w-full">
            <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider uppercase">Problem details</label>
            <textarea
              className="w-full px-5 py-3 rounded-2xl bg-slate-900 text-slate-100 text-sm border-none shadow-inset focus:outline-none focus:shadow-inset-deep focus:ring-2 focus:ring-indigo-600 h-24 resize-none"
              placeholder="Describe the failure, error warning lights, or damage..."
              value={issueDescription}
              onChange={e => setIssueDescription(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700/20">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gradient">Submit Request</Button>
          </div>
        </form>
      </Modal>

      {/* Assign Technician sub-modal */}
      <Modal isOpen={isTechModalOpen} onClose={() => setIsTechModalOpen(false)} title="Assign Technician">
        <form onSubmit={handleAssignTechSubmit} className="space-y-4">
          <Input
            label="Technician / Service Name"
            placeholder="e.g. R varma"
            value={techName}
            onChange={e => setTechName(e.target.value)}
            required
          />
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700/20">
            <Button type="button" variant="outline" onClick={() => setIsTechModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gradient">Assign</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
