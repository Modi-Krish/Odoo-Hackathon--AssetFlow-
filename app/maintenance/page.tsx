'use client';

import React, { useState, useEffect } from 'react';
import { Maintenance } from '../../types/maintenance';
import { Asset } from '../../types/allocation';
import { createMaintenance, getMaintenance, approveMaintenance, rejectMaintenance } from '../../services/maintenance';
import { MaintenanceTable } from '../../components/operations/MaintenanceTable';

// Mock list of assets for maintenance reporter
const MOCK_ASSETS: Asset[] = [
  { id: '1', name: 'Laptop-01 (Dell XPS)', status: 'Available' },
  { id: '2', name: 'Laptop-02 (MacBook Pro)', status: 'Allocated' },
  { id: '3', name: 'Laptop-03 (ThinkPad T14)', status: 'Available' },
  { id: '4', name: 'Monitor-01 (Dell 27")', status: 'Available' }
];

export default function MaintenancePage() {
  const [tickets, setTickets] = useState<Maintenance[]>([]);
  const [assets] = useState<Asset[]>(MOCK_ASSETS);

  // Form State
  const [assetId, setAssetId] = useState<string>('');
  const [issue, setIssue] = useState<string>('');
  const [priority, setPriority] = useState<string>('Low');

  // UI State
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch tickets
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await getMaintenance();
      setTickets(data);
    } catch (err) {
      console.warn('API error fetching maintenance logs, using local state/mocks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Handle Form Submission
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId || !issue || !priority) {
      setToast({ type: 'error', message: 'Please fill in all fields.' });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        assetId,
        issue,
        priority
      };

      const newTicket = await createMaintenance(payload);
      setTickets((prev: Maintenance[]) => [newTicket, ...prev]);
      setToast({ type: 'success', message: 'Maintenance report submitted!' });

      // Reset
      setAssetId('');
      setIssue('');
      setPriority('Low');
    } catch (err) {
      console.warn('API error submitting ticket, using local fallback', err);
      const fallbackTicket: Maintenance = {
        id: Math.random().toString(36).substring(2, 9),
        assetId,
        issue,
        priority,
        status: 'Pending'
      };
      setTickets((prev: Maintenance[]) => [fallbackTicket, ...prev]);
      setToast({ type: 'success', message: 'Report submitted (mock fallback).' });
      
      // Reset
      setAssetId('');
      setIssue('');
      setPriority('Low');
    } finally {
      setLoading(false);
    }
  };

  // Handle Approve Ticket
  const handleApprove = async (id: string) => {
    try {
      setLoading(true);
      const updated = await approveMaintenance(id);
      setTickets((prev: Maintenance[]) =>
        prev.map((t: Maintenance) => (t.id === id ? updated : t))
      );
      setToast({ type: 'success', message: 'Ticket approved successfully!' });
    } catch (err) {
      console.warn('API error on approval, using local fallback', err);
      setTickets((prev: Maintenance[]) =>
        prev.map((t: Maintenance) => (t.id === id ? { ...t, status: 'Approved' } : t))
      );
      setToast({ type: 'success', message: 'Approved successfully (mock fallback).' });
    } finally {
      setLoading(false);
    }
  };

  // Handle Reject Ticket
  const handleReject = async (id: string) => {
    try {
      setLoading(true);
      const updated = await rejectMaintenance(id);
      setTickets((prev: Maintenance[]) =>
        prev.map((t: Maintenance) => (t.id === id ? updated : t))
      );
      setToast({ type: 'success', message: 'Ticket rejected.' });
    } catch (err) {
      console.warn('API error on reject, using local fallback', err);
      setTickets((prev: Maintenance[]) =>
        prev.map((t: Maintenance) => (t.id === id ? { ...t, status: 'Rejected' } : t))
      );
      setToast({ type: 'success', message: 'Rejected successfully (mock fallback).' });
    } finally {
      setLoading(false);
    }
  };

  // Toast auto-clear
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Asset Maintenance Module
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Log maintenance issues, request repairs, and update hardware statuses.
          </p>
        </header>

        {/* Notifications */}
        {toast && (
          <div
            className={`mb-6 rounded-lg p-4 text-sm font-medium border transition-all duration-300 ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
            }`}
          >
            {toast.message}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Maintenance Form Panel */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                Report Issue
              </h2>

              <form onSubmit={handleSubmitTicket} className="space-y-5">
                {/* Asset selector */}
                <div>
                  <label htmlFor="asset-select" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Asset
                  </label>
                  <select
                    id="asset-select"
                    value={assetId}
                    onChange={(e) => setAssetId(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                    required
                  >
                    <option value="">Select Asset...</option>
                    {assets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Issue text field */}
                <div>
                  <label htmlFor="issue-desc" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Issue Description
                  </label>
                  <textarea
                    id="issue-desc"
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    placeholder="Describe the issue in detail"
                    rows={4}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                    required
                  />
                </div>

                {/* Priority Selector */}
                <div>
                  <label htmlFor="priority-select" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Priority
                  </label>
                  <select
                    id="priority-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                    required
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                >
                  Submit Report
                </button>
              </form>
            </div>
          </div>

          {/* Maintenance Table Panel */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Maintenance Log
            </h2>
            <MaintenanceTable
              tickets={tickets}
              assets={assets}
              onApprove={handleApprove}
              onReject={handleReject}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
