'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, Button, Input, Select, Badge, showToast } from '@/components/UI';
import { CalendarRange, ArrowLeftRight, CheckSquare, History, AlertTriangle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { AssetCondition } from '@/types';

export default function AllocationPage() {
  const {
    assets,
    users,
    allocations,
    transfers,
    currentUser,
    allocateAsset,
    returnAsset,
    requestTransfer,
    approveTransfer,
    rejectTransfer
  } = useApp();

  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'allocate' | 'return' | 'transfers' | 'history'>('allocate');

  // Allocation Form States
  const [allocAssetId, setAllocAssetId] = useState('');
  const [allocEmployeeId, setAllocEmployeeId] = useState('');
  const [expectedReturn, setExpectedReturn] = useState('');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Return Form States
  const [returnAssetId, setReturnAssetId] = useState('');
  const [returnCondition, setReturnCondition] = useState<AssetCondition>('Good');
  const [returnNotes, setReturnNotes] = useState('');

  // Transfer Form States
  const [transferAssetId, setTransferAssetId] = useState('');
  const [transferToEmployeeId, setTransferToEmployeeId] = useState('');

  // Handle Quick Action trigger
  useEffect(() => {
    if (searchParams && searchParams.get('action') === 'new') {
      setActiveTab('allocate');
    } else if (searchParams && searchParams.get('tab') === 'overdue') {
      setActiveTab('history');
    }
  }, [searchParams]);

  // Asset validation check for allocation conflicts
  useEffect(() => {
    if (!allocAssetId) {
      setConflictWarning(null);
      return;
    }

    const selectedAsset = assets.find(a => a.id === allocAssetId);
    if (selectedAsset && selectedAsset.status !== 'Available') {
      // Find active allocation holder
      const activeAlloc = allocations.find(al => al.asset_id === allocAssetId && !al.returned);
      const holder = activeAlloc ? users.find(u => u.id === activeAlloc.employee_id) : null;
      const holderName = holder ? holder.name : 'another employee';
      setConflictWarning(`Already Allocated: This asset is currently held by ${holderName}. You cannot allocate it directly.`);
    } else {
      setConflictWarning(null);
    }
  }, [allocAssetId, assets, allocations, users]);

  // Submit allocation
  const handleAllocateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocAssetId) return showToast('Please select an asset', 'error');
    if (!allocEmployeeId) return showToast('Please select an employee', 'error');

    const res = allocateAsset(allocAssetId, allocEmployeeId, expectedReturn || undefined);
    if (res.success) {
      showToast(res.message, 'success');
      // Reset
      setAllocAssetId('');
      setAllocEmployeeId('');
      setExpectedReturn('');
    } else {
      showToast(res.message, 'error');
    }
  };

  // Submit return
  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnAssetId) return showToast('Please select an asset to return', 'error');
    if (!returnNotes.trim()) return showToast('Please enter return condition notes', 'error');

    const res = returnAsset(returnAssetId, returnCondition, returnNotes);
    if (res.success) {
      showToast(res.message, 'success');
      setReturnAssetId('');
      setReturnNotes('');
    } else {
      showToast(res.message, 'error');
    }
  };

  // Submit transfer request
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferAssetId) return showToast('Please select an asset to transfer', 'error');
    if (!transferToEmployeeId) return showToast('Please select the receiving employee', 'error');

    const res = requestTransfer(transferAssetId, transferToEmployeeId);
    if (res.success) {
      showToast(res.message, 'success');
      setTransferAssetId('');
      setTransferToEmployeeId('');
    } else {
      showToast(res.message, 'error');
    }
  };

  // Managers/Admin approval triggers
  const handleApproveTransfer = (id: string) => {
    const res = approveTransfer(id);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleRejectTransfer = (id: string) => {
    const res = rejectTransfer(id);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  // Options lists
  const employeeOptions = [
    { value: '', label: '-- Select Employee --' },
    ...users.map(u => ({ value: u.id, label: `${u.name} (${u.role})` }))
  ];

  const allAssetsOptions = [
    { value: '', label: '-- Select Asset --' },
    ...assets.map(a => ({ value: a.id, label: `${a.name} (${a.asset_tag} - ${a.status})` }))
  ];

  const availableAssetsOptions = [
    { value: '', label: '-- Select Available Asset --' },
    ...assets.filter(a => a.status === 'Available').map(a => ({ value: a.id, label: `${a.name} (${a.asset_tag})` }))
  ];

  const allocatedAssetsOptions = [
    { value: '', label: '-- Select Allocated Asset --' },
    ...assets.filter(a => a.status === 'Allocated' || a.status === 'Under Maintenance').map(a => ({ value: a.id, label: `${a.name} (${a.asset_tag})` }))
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <CalendarRange className="text-indigo-400" size={22} />
          <span>Asset Allocation & Transfers</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Manage asset checkouts, process device check-ins, and authorize transfers between employees.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 pb-px gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('allocate')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${activeTab === 'allocate' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <CalendarRange size={14} /> Allocate Asset
        </button>
        <button
          onClick={() => setActiveTab('return')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${activeTab === 'return' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <CheckSquare size={14} /> Return Asset
        </button>
        <button
          onClick={() => setActiveTab('transfers')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${activeTab === 'transfers' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <ArrowLeftRight size={14} /> Transfer Requests
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${activeTab === 'history' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <History size={14} /> Allocation History
        </button>
      </div>

      {/* Tab Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main interactive Tab Form panel */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'allocate' && (
            <Card>
              <h3 className="text-sm font-bold text-slate-200 mb-4">Allocate Asset to Employee</h3>
              <form onSubmit={handleAllocateSubmit} className="space-y-4">
                <Select
                  label="Select Asset (All Catalog)"
                  options={allAssetsOptions}
                  value={allocAssetId}
                  onChange={e => setAllocAssetId(e.target.value)}
                  required
                />

                {/* Conflict banner */}
                {conflictWarning && (
                  <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-950/15 text-rose-300 flex items-start gap-2.5 text-xs">
                    <AlertTriangle size={16} className="text-rose-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <p className="font-semibold">{conflictWarning}</p>
                      <p className="text-slate-400">If you want this asset, submit a <strong>Transfer Request</strong> under the "Transfer Requests" tab instead.</p>
                    </div>
                  </div>
                )}

                <Select
                  label="Assign to Employee"
                  options={employeeOptions}
                  value={allocEmployeeId}
                  onChange={e => setAllocEmployeeId(e.target.value)}
                  required
                />

                <Input
                  label="Expected Return Date (Optional)"
                  type="date"
                  value={expectedReturn}
                  onChange={e => setExpectedReturn(e.target.value)}
                  disabled={!!conflictWarning}
                />

                <Button 
                  type="submit" 
                  variant="gradient" 
                  className="w-full mt-2"
                  disabled={!!conflictWarning || !allocAssetId || !allocEmployeeId}
                >
                  Confirm Allocation
                </Button>
              </form>
            </Card>
          )}

          {activeTab === 'return' && (
            <Card>
              <h3 className="text-sm font-bold text-slate-200 mb-4">Process Asset Check-In (Return)</h3>
              <form onSubmit={handleReturnSubmit} className="space-y-4">
                <Select
                  label="Select Currently Allocated Asset"
                  options={allocatedAssetsOptions}
                  value={returnAssetId}
                  onChange={e => setReturnAssetId(e.target.value)}
                  required
                />

                <Select
                  label="Return Condition Rating"
                  options={[
                    { value: 'New', label: 'New' },
                    { value: 'Good', label: 'Good' },
                    { value: 'Fair', label: 'Fair' },
                    { value: 'Poor', label: 'Poor' },
                    { value: 'Broken', label: 'Broken' }
                  ]}
                  value={returnCondition}
                  onChange={e => setReturnCondition(e.target.value as AssetCondition)}
                />

                <div className="w-full">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 tracking-wider uppercase">
                    Condition Check-in Notes
                  </label>
                  <textarea
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 text-sm transition-all duration-200 focus:outline-none focus:border-indigo-500 h-24 resize-none"
                    placeholder="Describe any wear and tear or verification checks..."
                    value={returnNotes}
                    onChange={e => setReturnNotes(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" variant="gradient" className="w-full mt-2" disabled={!returnAssetId}>
                  Register Return
                </Button>
              </form>
            </Card>
          )}

          {activeTab === 'transfers' && (
            <div className="space-y-6">
              {/* Transfer request form */}
              <Card>
                <h3 className="text-sm font-bold text-slate-200 mb-4">Request Asset Transfer</h3>
                <form onSubmit={handleTransferSubmit} className="space-y-4">
                  <Select
                    label="Select Asset (Must be currently allocated)"
                    options={allocatedAssetsOptions}
                    value={transferAssetId}
                    onChange={e => setTransferAssetId(e.target.value)}
                    required
                  />

                  <Select
                    label="Transfer to Employee"
                    options={employeeOptions}
                    value={transferToEmployeeId}
                    onChange={e => setTransferToEmployeeId(e.target.value)}
                    required
                  />

                  <Button type="submit" variant="primary" className="w-full mt-2" disabled={!transferAssetId || !transferToEmployeeId}>
                    Submit Transfer Request
                  </Button>
                </form>
              </Card>

              {/* Pending transfers listing */}
              <Card>
                <h3 className="text-sm font-bold text-slate-200 mb-4">Pending Transfer Authorizations</h3>
                <div className="space-y-4">
                  {transfers.filter(t => t.status === 'Pending').length === 0 ? (
                    <p className="text-slate-500 text-xs italic py-4 text-center font-semibold">No pending transfer requests.</p>
                  ) : (
                    transfers.filter(t => t.status === 'Pending').map(req => {
                      const assetObj = assets.find(a => a.id === req.asset_id);
                      const fromUser = users.find(u => u.id === req.from_employee_id);
                      const toUser = users.find(u => u.id === req.to_employee_id);

                      const canApprove = currentUser?.role === 'Admin' || currentUser?.role === 'Asset Manager';

                      return (
                        <div key={req.id} className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs">
                          <div>
                            <p className="font-bold text-slate-200">{assetObj?.name} ({assetObj?.asset_tag})</p>
                            <p className="text-slate-400 mt-1">
                              Transfer: <span className="text-rose-400 font-bold">{fromUser?.name}</span> → <span className="text-emerald-400 font-bold">{toUser?.name}</span>
                            </p>
                            <span className="text-[10px] text-slate-600 mt-1 block">Requested: {new Date(req.created_at).toLocaleString()}</span>
                          </div>
                          
                          {canApprove ? (
                            <div className="flex items-center gap-2">
                              <Button onClick={() => handleApproveTransfer(req.id)} variant="primary" size="sm">
                                Approve
                              </Button>
                              <Button onClick={() => handleRejectTransfer(req.id)} variant="ghost" className="text-rose-400 hover:bg-rose-500/10" size="sm">
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <Badge content="Manager Review" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'history' && (
            <Card className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Asset Tag</th>
                      <th className="py-4 px-6">Asset Name</th>
                      <th className="py-4 px-6">Employee</th>
                      <th className="py-4 px-6">Allocation Date</th>
                      <th className="py-4 px-6">Expected Return</th>
                      <th className="py-4 px-6 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300 font-medium">
                    {allocations.map(al => {
                      const ast = assets.find(a => a.id === al.asset_id);
                      const emp = users.find(u => u.id === al.employee_id);
                      
                      // Identify if overdue
                      const isOverdue = !al.returned && al.expected_return && new Date(al.expected_return).getTime() < Date.now();

                      return (
                        <tr key={al.id} className={`hover:bg-slate-900/10 transition-all ${isOverdue ? 'bg-rose-500/5' : ''}`}>
                          <td className="py-4 px-6 font-bold text-indigo-400">{ast?.asset_tag}</td>
                          <td className="py-4 px-6 font-bold text-slate-200">{ast?.name}</td>
                          <td className="py-4 px-6 font-semibold">{emp?.name}</td>
                          <td className="py-4 px-6 text-slate-400">{new Date(al.allocation_date).toLocaleDateString()}</td>
                          <td className="py-4 px-6 text-slate-400">
                            {al.expected_return ? (
                              <span className={isOverdue ? 'text-rose-400 font-bold' : ''}>
                                {new Date(al.expected_return).toLocaleDateString()}
                              </span>
                            ) : (
                              '--'
                            )}
                          </td>
                          <td className="py-4 px-6 text-center">
                            {al.returned ? (
                              <Badge content="Returned" />
                            ) : isOverdue ? (
                              <Badge content="Overdue" />
                            ) : (
                              <Badge content="Active" />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {/* Side Panel informational help cards */}
        <Card className="lg:col-span-1 space-y-5 h-fit bg-slate-950/40 border-slate-800">
          <h3 className="text-sm font-bold text-slate-300">Allocation Rules</h3>
          
          <div className="space-y-4 text-xs leading-relaxed text-slate-400">
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/30">
              <span className="font-bold text-slate-200 block mb-1">Conflict Prevention</span>
              <span>The ERP system strictly blocks direct allocations to assets that are already checked out. If an item is in use, you must request a transfer.</span>
            </div>
            
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/30">
              <span className="font-bold text-slate-200 block mb-1">Check-in Verification</span>
              <span>Upon device return, Asset Managers verify the condition (New, Good, Fair, Poor, Broken) and log wear remarks. The asset immediately enters "Available" status.</span>
            </div>

            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/30">
              <span className="font-bold text-slate-200 block mb-1">Transfer Workflows</span>
              <span>Transferring allows changing the current holder of an asset directly without checking it back into inventory first. A transfer requires approval by an Asset Manager or Admin.</span>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
