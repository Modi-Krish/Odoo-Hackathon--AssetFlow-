import React from 'react';
import { Maintenance } from '../../types/maintenance';
import { Asset } from '../../types/allocation';

interface MaintenanceTableProps {
  tickets: Maintenance[];
  assets: Asset[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  loading?: boolean;
}

export const MaintenanceTable: React.FC<MaintenanceTableProps> = ({
  tickets,
  assets,
  onApprove,
  onReject,
  loading = false
}) => {
  const getAssetName = (assetId: string) => {
    const asset = assets.find((a: Asset) => a.id === assetId);
    return asset ? asset.name : assetId;
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10 dark:bg-red-950/20 dark:text-red-400 dark:ring-red-900/30';
      case 'medium':
        return 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/10 dark:bg-amber-950/20 dark:text-amber-400 dark:ring-amber-900/30';
      default:
        return 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'; // Yellow
      case 'approved':
      case 'in progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400'; // Blue
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400'; // Green
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-800/50">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Asset
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Issue Description
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Priority
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
          {tickets.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No maintenance reports found.
              </td>
            </tr>
          ) : (
            tickets.map((ticket: Maintenance) => (
              <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {getAssetName(ticket.assetId)}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  <div className="max-w-xs truncate">{ticket.issue}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getPriorityBadgeClass(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  {ticket.status.toLowerCase() === 'pending' && (
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => onApprove(ticket.id)}
                        disabled={loading}
                        className="inline-flex items-center rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-100 transition-colors dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-900/60 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onReject(ticket.id)}
                        disabled={loading}
                        className="inline-flex items-center rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60 disabled:opacity-50"
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
  );
};
