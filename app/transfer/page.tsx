'use client';

import React, { useState, useEffect } from 'react';
import { Allocation, Asset, Employee, Transfer } from '../../types/allocation';
import {
  getAllocationHistory,
  requestTransfer,
  approveTransfer,
  rejectTransfer,
  getPendingTransfers
} from '../../services/allocation';

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

// Initial mock allocations to show "From Employee" auto-filled behavior
const MOCK_ALLOCATIONS: Allocation[] = [
  {
    id: 'alloc-01',
    assetId: '1', // Laptop-01
    employeeId: 'emp-01', // John Doe
    allocationDate: '2026-07-01',
    expectedReturn: '2026-08-01',
    status: 'Allocated'
  },
  {
    id: 'alloc-02',
    assetId: '2', // Laptop-02
    employeeId: 'emp-02', // Jane Smith
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
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auto-detect currently allocated employee when asset is selected
  useEffect(() => {
    if (!selectedAssetId) {
      setFromEmployeeId('');
      setFromEmployeeName('Select an asset to auto-detect');
      return;
    }

    // Find active allocation for this asset
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
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [pendingTransfers, history] = await Promise.all([
          getPendingTransfers(),
          getAllocationHistory()
        ]);
        setTransfers(pendingTransfers);
        setAllocations(history);
      } catch (err) {
        console.warn('API error loading transfers or history. Using local mock fallbacks.', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Handle Transfer Request Submit
  const handleTransferRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !fromEmployeeId || !toEmployeeId) {
      setMessage({ type: 'error', text: 'Please select an asset and destination employee.' });
      return;
    }

    if (fromEmployeeId === toEmployeeId) {
      setMessage({ type: 'error', text: 'Cannot transfer asset to the same employee.' });
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
      setMessage({ type: 'success', text: 'Transfer request submitted successfully!' });
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
      setMessage({ type: 'success', text: 'Transfer requested (mock fallback).' });
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

      // Perform allocation state update locally
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

      setMessage({ type: 'success', text: 'Transfer request approved!' });
    } catch (err) {
      console.warn('API error on approval, using local fallback', err);
      // Fallback
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
      setMessage({ type: 'success', text: 'Approved successfully (mock fallback).' });
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
      setMessage({ type: 'success', text: 'Transfer request rejected.' });
    } catch (err) {
      console.warn('API error on reject, using local fallback', err);
      setTransfers((prev: Transfer[]) =>
        prev.map((t: Transfer) => (t.id === id ? { ...t, status: 'Rejected' } : t))
      );
      setMessage({ type: 'success', text: 'Rejected successfully (mock fallback).' });
    } finally {
      setLoading(false);
    }
  };

  // Helpers to resolve names
  const getAssetName = (assetId: string) => {
    const asset = assets.find((a: Asset) => a.id === assetId);
    return asset ? asset.name : assetId;
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((e: Employee) => e.id === employeeId);
    return employee ? employee.name : employeeId;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'rejected':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Asset Transfer Requests
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Initiate, approve, or reject asset transfers between employees.
          </p>
        </header>

        {/* Status Messages */}
        {message && (
          <div
            className={`mb-6 rounded-lg p-4 text-sm font-medium border transition-all duration-300 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Transfer Form Panel */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                Transfer Asset
              </h2>

              <form onSubmit={handleTransferRequest} className="space-y-5">
                {/* Asset Select */}
                <div>
                  <label htmlFor="asset-select" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Asset
                  </label>
                  <select
                    id="asset-select"
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                    required
                  >
                    <option value="">Select Asset...</option>
                    {assets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name} ({asset.status})
                      </option>
                    ))}
                  </select>
                </div>

                {/* From Employee (Auto-filled) */}
                <div>
                  <label htmlFor="from-employee" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    From Employee
                  </label>
                  <input
                    id="from-employee"
                    type="text"
                    value={fromEmployeeName}
                    readOnly
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500 focus:outline-none dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>

                {/* To Employee Select */}
                <div>
                  <label htmlFor="to-employee" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    To Employee
                  </label>
                  <select
                    id="to-employee"
                    value={toEmployeeId}
                    onChange={(e) => setToEmployeeId(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                    required
                  >
                    <option value="">Select Target Employee...</option>
                    {employees
                      .filter((emp: Employee) => emp.id !== fromEmployeeId)
                      .map((emp: Employee) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading || !fromEmployeeId}
                  className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Transfer
                </button>
              </form>
            </div>
          </div>

          {/* Pending Transfers Table Panel */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Pending Transfers
            </h2>

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Asset
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      From
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      To
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Status
                    </th>
                    <th scope="col" className="relative px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                  {transfers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        No transfer requests found.
                      </td>
                    </tr>
                  ) : (
                    transfers.map((transfer: Transfer) => (
                      <tr key={transfer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {getAssetName(transfer.assetId)}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            {getEmployeeName(transfer.fromEmployee)}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            {getEmployeeName(transfer.toEmployee)}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(transfer.status)}`}>
                            {transfer.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          {transfer.status.toLowerCase() === 'pending' && (
                            <div className="flex justify-end gap-3">
                              <button
                                onClick={() => handleApprove(transfer.id)}
                                className="inline-flex items-center rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-100 transition-colors dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-900/60"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(transfer.id)}
                                className="inline-flex items-center rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
