'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Badge, showToast, Loader, ErrorMessage, Skeleton, EmptyState } from '@/components/UI';
import { Allocation, Asset, Employee, Transfer } from '../../types/allocation';
import {
  getAllocationHistory,
  requestTransfer,
  approveTransfer,
  rejectTransfer,
  getPendingTransfers
} from '../../services/allocation';
import { ArrowLeftRight, Inbox } from 'lucide-react';

// Mock data as fallback
const MOCK_ASSETS: Asset[] = [
  { id: '1', name: 'Laptop-01 (Dell XPS)', status: 'Allocated' },
  { id: '2', name: 'Laptop-02 (MacBook Pro)', status: 'Allocated' },
  { id: '3', name: 'Laptop-03 (ThinkPad T14)', status: 'Available' },
  { id: '4', name: 'Monitor-01 (Dell 27")', status: 'Available' }
];

const MOCK_EMPLOYEES: Employee[] = [
  { id: 'emp-01', name: 'John Doe', email: 'john.doe@company.com' },
  { id: 'emp-02', name: 'Jane Smith', email: 'jane.smith@company.com' },
  { id: 'emp-03', name: 'Bob Johnson', email: 'bob.johnson@company.com' }
];

const MOCK_ALLOCATIONS: Allocation[] = [
  {
    id: 'alloc-01',
    assetId: '1',
    employeeId: 'emp-01',
    allocationDate: '2026-07-01',
    expectedReturn: '2026-08-01',
    status: 'Allocated'
  },
  {
    id: 'alloc-02',
    assetId: '2',
    employeeId: 'emp-02',
    allocationDate: '2026-07-05',
    expectedReturn: '2026-07-25',
    status: 'Allocated'
  }
];

export default function TransferPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [assets] = useState<Asset[]>(MOCK_ASSETS);
  const [employees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [allocations, setAllocations] = useState<Allocation[]>(MOCK_ALLOCATIONS);

  // Form State
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [toEmployeeId, setToEmployeeId] = useState<string>('');
  const [fromEmployeeId, setFromEmployeeId] = useState<string>('');
  const [fromEmployeeName, setFromEmployeeName] = useState<string>('Auto-detected');

  // UI State
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-detect currently allocated employee when asset is selected
  useEffect(() => {
    if (!selectedAssetId) {
      setFromEmployeeId('');
      setFromEmployeeName('Select an asset to auto-detect');
      return;
    }

    const activeAlloc = allocations.find(
      (a: Allocation) => a.assetId === selectedAssetId && a.status.toLowerCase() === 'allocated'
    );

    if (activeAlloc) {
      const emp = employees.find((e: Employee) => e.id === activeAlloc.employeeId);
      if (emp) {
        setFromEmployeeId(emp.id);
        setFromEmployeeName(emp.name);
      } else {
        setFromEmployeeId(activeAlloc.employeeId);
        setFromEmployeeName(activeAlloc.employeeId);
      }
    } else {
      setFromEmployeeId('');
      setFromEmployeeName('Asset not currently allocated');
    }
  }, [selectedAssetId, allocations, employees]);

  // Load initial data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [pendingTransfers, history] = await Promise.all([
        getPendingTransfers(),
        getAllocationHistory()
      ]);
      setTransfers(pendingTransfers);
      setAllocations(history);
    } catch (err) {
      console.warn('API error loading transfers or history. Using local mock fallbacks.', err);
      // Fallback
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Transfer Request Submit
  const handleTransferRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !fromEmployeeId || !toEmployeeId) {
      showToast('Please select an asset and destination employee.', 'error');
      return;
    }

    if (fromEmployeeId === toEmployeeId) {
      showToast('Cannot transfer asset to the same employee.', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        assetId: selectedAssetId,
        fromEmployee: fromEmployeeId,
        toEmployee: toEmployeeId
      };

      const newTransfer = await requestTransfer(payload);
      setTransfers((prev: Transfer[]) => [newTransfer, ...prev]);
      showToast('Transfer request submitted successfully!', 'success');
      setSelectedAssetId('');
      setToEmployeeId('');
    } catch (err) {
      console.warn('API transfer submit error, using local fallback', err);
      const fallbackTransfer: Transfer = {
        id: Math.random().toString(36).substring(2, 9),
        assetId: selectedAssetId,
        fromEmployee: fromEmployeeId,
        toEmployee: toEmployeeId,
        status: 'Pending'
      };
      setTransfers((prev: Transfer[]) => [fallbackTransfer, ...prev]);
      showToast('Transfer requested (mock fallback).', 'success');
      setSelectedAssetId('');
      setToEmployeeId('');
    } finally {
      setLoading(false);
    }
  };

  // Handle Approve Transfer
  const handleApprove = async (id: string) => {
    try {
      setLoading(true);
      const updated = await approveTransfer(id);
      setTransfers((prev: Transfer[]) =>
        prev.map((t: Transfer) => (t.id === id ? updated : t))
      );

      const approvedTransfer = transfers.find((t: Transfer) => t.id === id);
      if (approvedTransfer) {
        setAllocations((prev: Allocation[]) =>
          prev.map((alloc: Allocation) =>
            alloc.assetId === approvedTransfer.assetId && alloc.status.toLowerCase() === 'allocated'
              ? { ...alloc, employeeId: approvedTransfer.toEmployee }
              : alloc
          )
        );
      }

      showToast('Transfer request approved!', 'success');
    } catch (err) {
      console.warn('API error on approval, using local fallback', err);
      setTransfers((prev: Transfer[]) =>
        prev.map((t: Transfer) => (t.id === id ? { ...t, status: 'Approved' } : t))
      );

      const approvedTransfer = transfers.find((t: Transfer) => t.id === id);
      if (approvedTransfer) {
        setAllocations((prev: Allocation[]) =>
          prev.map((alloc: Allocation) =>
            alloc.assetId === approvedTransfer.assetId && alloc.status.toLowerCase() === 'allocated'
              ? { ...alloc, employeeId: approvedTransfer.toEmployee }
              : alloc
          )
        );
      }
      showToast('Approved successfully (mock fallback).', 'success');
    } finally {
      setLoading(false);
    }
  };

  // Handle Reject Transfer
  const handleReject = async (id: string) => {
    try {
      setLoading(true);
      const updated = await rejectTransfer(id);
      setTransfers((prev: Transfer[]) =>
        prev.map((t: Transfer) => (t.id === id ? updated : t))
      );
      showToast('Transfer request rejected.', 'success');
    } catch (err) {
      console.warn('API error on reject, using local fallback', err);
      setTransfers((prev: Transfer[]) =>
        prev.map((t: Transfer) => (t.id === id ? { ...t, status: 'Rejected' } : t))
      );
      showToast('Rejected successfully (mock fallback).', 'success');
    } finally {
      setLoading(false);
    }
  };

  const getAssetName = (assetId: string) => {
    const asset = assets.find((a: Asset) => a.id === assetId);
    return asset ? asset.name : assetId;
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((e: Employee) => e.id === employeeId);
    return employee ? employee.name : employeeId;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-display">
            <ArrowLeftRight className="text-indigo-600 animate-float" size={22} />
            <span>Asset Transfer Requests</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 font-bold uppercase tracking-wider font-sans">Initiate, approve, or reject asset transfers between employees.</p>
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
        <Loader message="Syncing device transfer protocols..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <ErrorMessage message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-display">
          <ArrowLeftRight className="text-indigo-600 animate-float" size={22} />
          <span>Asset Transfer Requests</span>
        </h2>
        <p className="text-xs text-slate-300 mt-0.5 font-bold uppercase tracking-wider font-sans">
          Initiate, approve, or reject asset transfers between employees.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Transfer Form Panel */}
        <div className="lg:col-span-1">
          <Card>
            <h3 className="text-sm font-bold text-slate-100 mb-4 font-display">
              Transfer Asset
            </h3>

            <form onSubmit={handleTransferRequest} className="space-y-4">
              <Select
                label="Asset to transfer"
                options={[
                  { value: '', label: 'Select Asset...' },
                  ...assets.map(a => ({ value: a.id, label: `${a.name} (${a.status})` }))
                ]}
                value={selectedAssetId}
                onChange={e => setSelectedAssetId(e.target.value)}
                required
              />

              <Input
                label="From Employee (Auto-filled)"
                type="text"
                value={fromEmployeeName}
                disabled
              />

              <Select
                label="Transfer to Employee"
                options={[
                  { value: '', label: 'Select Target Employee...' },
                  ...employees.filter(emp => emp.id !== fromEmployeeId).map(emp => ({ value: emp.id, label: emp.name }))
                ]}
                value={toEmployeeId}
                onChange={e => setToEmployeeId(e.target.value)}
                required
                disabled={!fromEmployeeId}
              />

              <Button
                type="submit"
                variant="gradient"
                className="w-full mt-2 font-display uppercase tracking-wider text-xs"
                disabled={!fromEmployeeId || !toEmployeeId}
              >
                Transfer
              </Button>
            </form>
          </Card>
        </div>

        {/* Pending Transfers Table Panel */}
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden">
            <div className="p-5 border-b border-slate-700/25">
              <h3 className="text-sm font-bold text-slate-100 font-display">
                Pending Transfers
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-700/20 bg-slate-850/40 text-slate-300 font-extrabold uppercase tracking-wider">
                    <th className="py-4 px-6 font-display">Asset</th>
                    <th className="py-4 px-6 font-display">From</th>
                    <th className="py-4 px-6 font-display">To</th>
                    <th className="py-4 px-6 text-center font-display">Status</th>
                    <th className="py-4 px-6 text-right font-display">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/10 text-slate-100 font-bold">
                  {transfers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8">
                        <EmptyState
                          title="No Pending Transfers"
                          description="No device transfers are currently requiring authorization."
                          icon={<Inbox size={36} className="text-slate-600" />}
                        />
                      </td>
                    </tr>
                  ) : (
                    transfers.map((transfer: Transfer) => (
                      <tr key={transfer.id} className="hover:bg-slate-850/20 transition-all">
                        <td className="py-4 px-6 font-extrabold text-slate-200">
                          {getAssetName(transfer.assetId)}
                        </td>
                        <td className="py-4 px-6 text-slate-300">
                          {getEmployeeName(transfer.fromEmployee)}
                        </td>
                        <td className="py-4 px-6 text-slate-300">
                          {getEmployeeName(transfer.toEmployee)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <Badge content={transfer.status} />
                        </td>
                        <td className="py-4 px-6 text-right">
                          {transfer.status.toLowerCase() === 'pending' && (
                            <div className="flex justify-end gap-2.5">
                              <Button
                                onClick={() => handleApprove(transfer.id)}
                                variant="primary"
                                size="sm"
                              >
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleReject(transfer.id)}
                                variant="ghost"
                                className="text-rose-600 font-bold hover:bg-rose-500/10"
                                size="sm"
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
