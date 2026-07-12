'use client';

import React, { useState, useEffect } from 'react';
import { Allocation, Asset, Employee } from '../../types/allocation';
import { allocateAsset, returnAsset, getAllocationHistory } from '../../services/allocation';
import { AllocationTable } from '../../components/operations/AllocationTable';

// Mock data to act as fallback or initial list
const MOCK_ASSETS: Asset[] = [
  { id: '1', name: 'Laptop-01 (Dell XPS)', status: 'Available' },
  { id: '2', name: 'Laptop-02 (MacBook Pro)', status: 'Allocated' },
  { id: '3', name: 'Laptop-03 (ThinkPad T14)', status: 'Available' },
  { id: '4', name: 'Monitor-01 (Dell 27")', status: 'Available' }
];

const MOCK_EMPLOYEES: Employee[] = [
  { id: 'emp-01', name: 'John Doe', email: 'john.doe@company.com' },
  { id: 'emp-02', name: 'Jane Smith', email: 'jane.smith@company.com' },
  { id: 'emp-03', name: 'Bob Johnson', email: 'bob.johnson@company.com' }
];

export default function AllocationPage() {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [employees] = useState<Employee[]>(MOCK_EMPLOYEES);

  // Form State
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [expectedReturn, setExpectedReturn] = useState<string>('');

  // Status & UI State
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load Allocation History
  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getAllocationHistory();
      setAllocations(data);
    } catch (err) {
      console.warn('API error fetching history, using local state/mocks', err);
      // Fallback: keeping whatever was in state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Find selected asset details to verify business rule
  const selectedAsset = assets.find((a: Asset) => a.id === selectedAssetId);
  const isAssetUnavailable = selectedAsset ? selectedAsset.status !== 'Available' : false;

  // Handle Asset Allocation Submit
  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !selectedEmployeeId || !expectedReturn) {
      setMessage({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }

    if (isAssetUnavailable) {
      setMessage({ type: 'error', text: 'Selected asset is not available.' });
      return;
    }

    try {
      setLoading(true);
      const allocationPayload = {
        assetId: selectedAssetId,
        employeeId: selectedEmployeeId,
        expectedReturn
      };

      // Call API
      const newAllocation = await allocateAsset(allocationPayload);

      // Update local states
      setAllocations((prev: Allocation[]) => [newAllocation, ...prev]);
      setAssets((prev: Asset[]) =>
        prev.map((asset: Asset) =>
          asset.id === selectedAssetId ? { ...asset, status: 'Allocated' } : asset
        )
      );

      // Reset form
      setSelectedAssetId('');
      setSelectedEmployeeId('');
      setExpectedReturn('');
      setMessage({ type: 'success', text: 'Asset allocated successfully!' });
    } catch (err: any) {
      console.error(err);
      // Fallback implementation in case API fails
      const fallbackAllocation: Allocation = {
        id: Math.random().toString(36).substring(2, 9),
        assetId: selectedAssetId,
        employeeId: selectedEmployeeId,
        allocationDate: new Date().toISOString().split('T')[0],
        expectedReturn,
        status: 'Allocated'
      };

      setAllocations((prev: Allocation[]) => [fallbackAllocation, ...prev]);
      setAssets((prev: Asset[]) =>
        prev.map((asset: Asset) =>
          asset.id === selectedAssetId ? { ...asset, status: 'Allocated' } : asset
        )
      );

      setSelectedAssetId('');
      setSelectedEmployeeId('');
      setExpectedReturn('');
      setMessage({
        type: 'success',
        text: 'Allocated successfully (mock fallback due to backend status).'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Asset Return
  const handleReturn = async (id: string) => {
    try {
      setLoading(true);
      const updatedAllocation = await returnAsset(id);

      // Update local allocation list
      setAllocations((prev: Allocation[]) =>
        prev.map((alloc: Allocation) => (alloc.id === id ? updatedAllocation : alloc))
      );

      // Update asset availability
      const returnedAllocation = allocations.find((a: Allocation) => a.id === id);
      if (returnedAllocation) {
        setAssets((prev: Asset[]) =>
          prev.map((asset: Asset) =>
            asset.id === returnedAllocation.assetId ? { ...asset, status: 'Available' } : asset
          )
        );
      }

      setMessage({ type: 'success', text: 'Asset returned successfully!' });
    } catch (err) {
      console.error(err);
      // Fallback for returning asset
      const returnedAllocation = allocations.find((a: Allocation) => a.id === id);
      if (returnedAllocation) {
        setAllocations((prev: Allocation[]) =>
          prev.map((alloc: Allocation) => (alloc.id === id ? { ...alloc, status: 'Returned' } : alloc))
        );
        setAssets((prev: Asset[]) =>
          prev.map((asset: Asset) =>
            asset.id === returnedAllocation.assetId ? { ...asset, status: 'Available' } : asset
          )
        );
        setMessage({ type: 'success', text: 'Asset returned (mock fallback).' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Clear message banner after 4 seconds
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
            Asset Allocation Module
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Allocate devices to team members and monitor returning schedules.
          </p>
        </header>

        {/* Status Messages */}
        {message && (
          <div
            className={`mb-6 rounded-lg p-4 text-sm font-medium transition-all duration-300 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Allocate Asset Form Panel */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                Allocate Asset
              </h2>

              <form onSubmit={handleAllocate} className="space-y-5">
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

                {/* Employee Select */}
                <div>
                  <label htmlFor="employee-select" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Employee
                  </label>
                  <select
                    id="employee-select"
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                    required
                  >
                    <option value="">Select Employee...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Picker */}
                <div>
                  <label htmlFor="return-date" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Expected Return Date
                  </label>
                  <input
                    id="return-date"
                    type="date"
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                    required
                  />
                </div>

                {/* Allocate Button */}
                <button
                  type="submit"
                  disabled={loading || isAssetUnavailable}
                  className={`w-full rounded-xl py-3 text-sm font-semibold text-white shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    isAssetUnavailable
                      ? 'bg-rose-600 hover:bg-rose-700 cursor-not-allowed opacity-80'
                      : 'bg-indigo-600 hover:bg-indigo-700 focus-visible:outline-indigo-600'
                  }`}
                >
                  {isAssetUnavailable ? 'Already Allocated' : 'Allocate Asset'}
                </button>
              </form>
            </div>
          </div>

          {/* Allocated Assets Table Panel */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Allocated Assets History
            </h2>
            <AllocationTable
              allocations={allocations}
              assets={assets}
              employees={employees}
              onReturn={handleReturn}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
