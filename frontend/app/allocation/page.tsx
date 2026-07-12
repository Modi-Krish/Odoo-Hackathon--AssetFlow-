/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, Button, Input, Select, Badge, showToast, Loader, ErrorMessage, Skeleton, EmptyState } from '@/components/UI';
import { ArrowLeftRight, CalendarRange, Clock, CheckCircle, Search, Filter, AlertCircle, Trash2, CheckSquare, History, Inbox } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { AssetCondition } from '@/types';

export default function AllocationPage() {
  const {
    assets,
    users,
    departments,
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
  
  // Transfer request inline fields (Screen 5 workflow)
  const [transferReason, setTransferReason] = useState('');

  // Return Form States
  const [returnAssetId, setReturnAssetId] = useState('');
  const [returnCondition, setReturnCondition] = useState<AssetCondition>('Good');
  const [returnNotes, setReturnNotes] = useState('');

  // Tabbed Transfer Request view states (approvals)
  const [transferAssetId, setTransferAssetId] = useState('');
  const [transferToEmployeeId, setTransferToEmployeeId] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Handle Quick Action trigger
  useEffect(() => {
    if (searchParams && searchParams.get('action') === 'new') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab('allocate');
    } else if (searchParams && searchParams.get('tab') === 'overdue') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab('history');
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-display">
            <CalendarRange className="text-indigo-600 animate-float" size={22} />
            <span>Asset Allocation & Transfers</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 font-bold uppercase tracking-wider font-sans">Checkout logistics, check-ins, and direct device transfers</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
        <Loader message="Loading allocation profiles..." />
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

  // Derived state for the selected asset under checkout
  const selectedAsset = assets.find(a => a.id === allocAssetId);
  const isAlreadyAllocated = selectedAsset && (selectedAsset.status === 'Allocated' || selectedAsset.status === 'Under Maintenance');
  
  // Get active allocation details for the selected asset
  const activeAlloc = isAlreadyAllocated ? allocations.find(al => al.asset_id === allocAssetId && !al.returned) : null;
  const activeHolder = activeAlloc ? users.find(u => u.id === activeAlloc.employee_id) : null;
  const activeHolderDept = activeHolder ? departments.find(d => d.id === activeHolder.department_id) : null;

  // Filter allocations history for the selected asset (newest first)
  const selectedAssetHistory = allocations
    .filter(al => al.asset_id === allocAssetId)
    .sort((a, b) => new Date(b.allocation_date).getTime() - new Date(a.allocation_date).getTime());

  // Submit allocation
  const handleAllocateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocAssetId) return showToast('Please select an asset', 'error');
    if (!allocEmployeeId) return showToast('Please select an employee', 'error');

    const res = allocateAsset(allocAssetId, allocEmployeeId, expectedReturn || undefined);
    if (res.success) {
      showToast(res.message, 'success');
      setAllocAssetId('');
      setAllocEmployeeId('');
      setExpectedReturn('');
    } else {
      showToast(res.message, 'error');
    }
  };

  // Submit inline transfer request (Screen 5)
  const handleInlineTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocAssetId) return showToast('Asset is missing', 'error');
    if (!allocEmployeeId) return showToast('Please select the employee to transfer to', 'error');

    const res = requestTransfer(allocAssetId, allocEmployeeId);
    if (res.success) {
      showToast(`Transfer request created. Reason: "${transferReason || 'Standard transfer'}"`, 'success');
      setAllocAssetId('');
      setAllocEmployeeId('');
      setTransferReason('');
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

  // Submit tabbed transfer request
  const handleTabbedTransferSubmit = (e: React.FormEvent) => {
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
    { value: '', label: 'Select Employee....' },
    ...users.map(u => ({ value: u.id, label: `${u.name} (${u.role})` }))
  ];

  const allAssetsOptions = [
    { value: '', label: 'Select Asset....' },
    ...assets.map(a => ({ value: a.id, label: `${a.name} (${a.asset_tag} - ${a.status})` }))
  ];

  const allocatedAssetsOptions = [
    { value: '', label: '-- Select Allocated Asset --' },
    ...assets.filter(a => a.status === 'Allocated' || a.status === 'Under Maintenance').map(a => ({ value: a.id, label: `${a.name} (${a.asset_tag})` }))
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-display">
          <CalendarRange className="text-indigo-600 animate-float" size={22} />
          <span>Asset Allocation & Transfers</span>
        </h2>
        <p className="text-xs text-slate-300 mt-0.5 font-bold uppercase tracking-wider">Checkout logistics, check-ins, and direct device transfers</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700/20 pb-px gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('allocate')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${activeTab === 'allocate' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-300 hover:text-slate-100'}`}
        >
          <CalendarRange size={14} /> Allocate Asset
        </button>
        <button
          onClick={() => setActiveTab('return')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${activeTab === 'return' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-300 hover:text-slate-100'}`}
        >
          <CheckSquare size={14} /> Return Asset
        </button>
        <button
          onClick={() => setActiveTab('transfers')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${activeTab === 'transfers' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-300 hover:text-slate-100'}`}
        >
          <ArrowLeftRight size={14} /> Transfer Requests
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${activeTab === 'history' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-300 hover:text-slate-100'}`}
        >
          <History size={14} /> Allocation History
        </button>
      </div>

      {/* Tab Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main interactive Tab Form panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeTab === 'allocate' && (
            <Card className="space-y-6">
              <h3 className="text-sm font-bold text-slate-200 mb-4 font-display">Allocate Asset</h3>
              
              <div className="space-y-4">
                <Select
                  label="Asset"
                  options={allAssetsOptions}
                  value={allocAssetId}
                  onChange={e => setAllocAssetId(e.target.value)}
                  required
                />

                {/* DOUBLE ALLOCATION DETECTED WORKFLOW (Screen 5) */}
                {isAlreadyAllocated ? (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* Error Banner */}
                    <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-rose-500/15 text-black border border-rose-500/20">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="text-rose-600 flex-shrink-0" size={16} />
                        <span className="font-extrabold text-rose-700">Already Allocated to {activeHolder ? activeHolder.name : 'Another Employee'} ({activeHolderDept ? activeHolderDept.name : 'Engineering'})</span>
                      </div>
                      <p className="text-xs font-medium ml-6">Direct re-allocation is blocked - submit a transfer request below</p>
                    </div>

                    {/* Transfer Request Form */}
                    <div className="pt-4 border-t border-slate-700/20 space-y-4">
                      <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Transfer Request</h4>
                      
                      <form onSubmit={handleInlineTransferSubmit} className="space-y-4">
                        <Input
                          label="From"
                          type="text"
                          value={activeHolder ? activeHolder.name : 'Current Owner'}
                          disabled
                        />

                        <Select
                          label="To"
                          options={employeeOptions}
                          value={allocEmployeeId}
                          onChange={e => setAllocEmployeeId(e.target.value)}
                          required
                        />

                        <div className="w-full">
                          <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider uppercase">
                            Reason
                          </label>
                          <textarea
                            className="w-full px-5 py-3 rounded-2xl bg-slate-900 text-slate-100 text-sm border-none shadow-inset focus:outline-none focus:shadow-inset-deep focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-slate-900 h-24 resize-none"
                            placeholder="Enter the reason for device transfer..."
                            value={transferReason}
                            onChange={e => setTransferReason(e.target.value)}
                          />
                        </div>

                        <Button 
                          type="submit" 
                          variant="gradient" 
                          className="w-full mt-2 font-display uppercase tracking-wider"
                          disabled={!allocEmployeeId}
                        >
                          Submit Request
                        </Button>
                      </form>
                    </div>

                    {/* Allocation History sub-table */}
                    <div className="pt-6 border-t border-slate-700/20 space-y-4">
                      <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-display">Allocation history</h4>
                      {selectedAssetHistory.length === 0 ? (
                        <p className="text-slate-400 text-xs italic">No prior checkout history found for this device.</p>
                      ) : (
                        <div className="space-y-3.5 pl-2 text-xs font-bold text-slate-200">
                          {selectedAssetHistory.map(al => {
                            const emp = users.find(u => u.id === al.employee_id);
                            const dept = emp ? departments.find(d => d.id === emp.department_id) : null;
                            const formattedDate = new Date(al.allocation_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
                            const returnDate = al.return_date ? new Date(al.return_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) : '';
                            
                            return (
                              <div key={al.id} className="flex flex-col gap-1">
                                {al.returned ? (
                                  <p className="text-slate-300 font-semibold">
                                    {returnDate} - Returned by <span className="text-slate-100 font-bold">{emp?.name || 'employee'}</span> - condition: <span className="text-indigo-600 font-extrabold uppercase">{al.condition_check || 'Good'}</span>
                                  </p>
                                ) : (
                                  <p className="text-slate-200 font-semibold">
                                    {formattedDate} - Allocated to <span className="text-slate-100 font-bold">{emp?.name || 'employee'}</span> - {dept?.name || 'Engineering'}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                  </div>
                ) : (
                  /* Standard Allocation form when Available */
                  <form onSubmit={handleAllocateSubmit} className="space-y-4 pt-2">
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
                    />

                    <Button 
                      type="submit" 
                      variant="primary" 
                      className="w-full mt-2 font-display"
                      disabled={!allocAssetId || !allocEmployeeId}
                    >
                      Confirm Allocation
                    </Button>
                  </form>
                )}
              </div>
            </Card>
          )}

          {activeTab === 'return' && (
            <Card>
              <h3 className="text-sm font-bold text-slate-100 mb-4 font-display">Process Asset Check-In (Return)</h3>
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
                  <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider uppercase">
                    Condition Check-in Notes
                  </label>
                  <textarea
                    className="w-full px-5 py-3 rounded-2xl bg-slate-900 text-slate-100 text-sm border-none shadow-inset focus:outline-none focus:shadow-inset-deep focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-slate-900 h-24 resize-none"
                    placeholder="Describe wear details or check-in verification logs..."
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
              {/* Request Transfer */}
              <Card>
                <h3 className="text-sm font-bold text-slate-100 mb-4 font-display">Request Asset Transfer</h3>
                <form onSubmit={handleTabbedTransferSubmit} className="space-y-4">
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

              {/* Pending approvals */}
              <Card>
                <h3 className="text-sm font-bold text-slate-100 mb-4 font-display">Pending Transfer Authorizations</h3>
                <div className="space-y-4">
                  {transfers.filter(t => t.status === 'Pending').length === 0 ? (
                    <p className="text-slate-300 text-xs italic py-4 text-center font-bold">No pending transfer requests.</p>
                  ) : (
                    transfers.filter(t => t.status === 'Pending').map(req => {
                      const assetObj = assets.find(a => a.id === req.asset_id);
                      const fromUser = users.find(u => u.id === req.from_employee_id);
                      const toUser = users.find(u => u.id === req.to_employee_id);

                      const canApprove = currentUser?.role === 'admin' || currentUser?.role === 'asset_manager';

                      return (
                        <div key={req.id} className="p-5 rounded-[24px] bg-slate-900 shadow-extruded flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs">
                          <div className="space-y-1 text-slate-150">
                            <p className="font-extrabold text-sm text-slate-100">{assetObj?.name} ({assetObj?.asset_tag})</p>
                            <p className="font-bold">
                              Transfer: <span className="text-rose-600 font-extrabold">{fromUser?.name}</span> → <span className="text-emerald-500 font-extrabold">{toUser?.name}</span>
                            </p>
                            <span className="text-[10px] text-slate-300 block font-semibold">Requested: {new Date(req.created_at).toLocaleString()}</span>
                          </div>
                          
                          {canApprove ? (
                            <div className="flex items-center gap-2">
                              <Button onClick={() => handleApproveTransfer(req.id)} variant="primary" size="sm">
                                Approve
                              </Button>
                              <Button onClick={() => handleRejectTransfer(req.id)} variant="ghost" className="text-rose-600 font-bold hover:bg-rose-500/10" size="sm">
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
            allocations.length === 0 ? (
              <EmptyState
                title="No Allocations Yet"
                description="No assets have been checked out to employees. Start by allocating an asset on the first tab."
                icon={<Inbox size={48} className="text-slate-650" />}
              />
            ) : (
              <Card className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-700/20 bg-slate-850/40 text-slate-300 font-extrabold uppercase tracking-wider">
                        <th className="py-4 px-6 font-display">Asset Tag</th>
                        <th className="py-4 px-6 font-display">Asset Name</th>
                        <th className="py-4 px-6 font-display">Employee</th>
                        <th className="py-4 px-6 font-display">Allocation Date</th>
                        <th className="py-4 px-6 font-display">Expected Return</th>
                        <th className="py-4 px-6 text-center font-display">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/10 text-slate-100 font-bold">
                      {allocations.map(al => {
                        const ast = assets.find(a => a.id === al.asset_id);
                        const emp = users.find(u => u.id === al.employee_id);
                        // eslint-disable-next-line react-hooks/purity
                        const isOverdue = !al.returned && al.expected_return && new Date(al.expected_return).getTime() < Date.now();

                        return (
                          <tr key={al.id} className={`hover:bg-slate-850/20 transition-all ${isOverdue ? 'bg-rose-500/5' : ''}`}>
                            <td className="py-4 px-6 text-indigo-600 font-extrabold">{ast?.asset_tag}</td>
                            <td className="py-4 px-6 text-slate-100">{ast?.name}</td>
                            <td className="py-4 px-6">{emp?.name}</td>
                            <td className="py-4 px-6 text-slate-300">{new Date(al.allocation_date).toLocaleDateString()}</td>
                            <td className="py-4 px-6 text-slate-300">
                              {al.expected_return ? (
                                <span className={isOverdue ? 'text-rose-600 font-extrabold animate-pulse' : ''}>
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
            )
          )}

        </div>

        {/* Side Panel informational help cards */}
        <Card className="lg:col-span-1 space-y-5 h-fit bg-slate-900 shadow-extruded border-none">
          <h3 className="text-sm font-bold text-slate-100 font-display">Allocation Rules</h3>
          
          <div className="space-y-4.5 text-xs leading-relaxed text-slate-200 font-bold">
            <div className="p-3.5 rounded-2xl bg-slate-900 shadow-inset-sm">
              <span className="text-indigo-600 font-extrabold block mb-1">Double Allocation Block</span>
              <span className="text-slate-300 font-medium">Selecting checked-out assets will automatically route you to submit a Transfer Request. Direct checkouts are blocked.</span>
            </div>
            
            <div className="p-3.5 rounded-2xl bg-slate-900 shadow-inset-sm">
              <span className="text-indigo-600 font-extrabold block mb-1">Device Returns</span>
              <span className="text-slate-300 font-medium">Returns trigger audit check logs. Managers inspect the condition and release the asset back into inventory availability.</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 shadow-inset-sm">
              <span className="text-indigo-600 font-extrabold block mb-1">Authorization Logs</span>
              <span className="text-slate-300 font-medium">All device handovers are tracked with a timestamp history. Transfers require manager validation.</span>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
