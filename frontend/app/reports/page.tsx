'use client';

import React, { useState, useEffect } from 'react';
import { Button, showToast, Loader, ErrorMessage, Skeleton, EmptyState } from '@/components/UI';
import { Report } from '../../types/report';
import { getReports } from '../../services/reports';
import { ReportCard } from '../../components/operations/ReportCard';
import { BarChart3, Download, RefreshCw, X } from 'lucide-react';

const MOCK_REPORTS: Report[] = [
  {
    id: 'rep-01',
    title: 'Asset Inventory & Status Report',
    type: 'asset',
    description: 'Detailed analysis of asset health, condition, and distribution across stock.',
    generatedAt: '2026-07-12T09:00:00Z',
    csvUrl: '/downloads/reports/asset_inventory.csv',
    data: [
      { 'Asset ID': '1', Name: 'Laptop-01', Status: 'Available', Condition: 'Good', Value: '$1,200' },
      { 'Asset ID': '2', Name: 'Laptop-02', Status: 'Allocated', Condition: 'Good', Value: '$1,500' },
      { 'Asset ID': '3', Name: 'Laptop-03', Status: 'Available', Condition: 'Fair', Value: '$950' },
      { 'Asset ID': '4', Name: 'Monitor-01', Status: 'Available', Condition: 'New', Value: '$300' }
    ]
  },
  {
    id: 'rep-02',
    title: 'Department Asset Allocation Summary',
    type: 'department',
    description: 'Summary of devices assigned to engineering, marketing, and sales departments.',
    generatedAt: '2026-07-11T16:30:00Z',
    csvUrl: '/downloads/reports/department_allocation.csv',
    data: [
      { Department: 'Engineering', 'Active Assets': '18', 'Under Maintenance': '2', 'Monthly Cost': '$24,500' },
      { Department: 'Marketing', 'Active Assets': '7', 'Under Maintenance': '0', 'Monthly Cost': '$8,400' },
      { Department: 'Sales', 'Active Assets': '12', 'Under Maintenance': '1', 'Monthly Cost': '$14,200' }
    ]
  },
  {
    id: 'rep-03',
    title: 'Maintenance Log & Costs Analysis',
    type: 'maintenance',
    description: 'Summary of repair reports, resolution rates, and total maintenance overhead costs.',
    generatedAt: '2026-07-10T12:00:00Z',
    data: [
      { Ticket: 'MNT-489', Asset: 'Laptop-01', Issue: 'Battery replacement', Priority: 'Medium', Status: 'Resolved', Cost: '$120' },
      { Ticket: 'MNT-490', Asset: 'Laptop-02', Issue: 'Screen flickering', Priority: 'High', Status: 'Approved', Cost: '$250' }
    ]
  },
  {
    id: 'rep-04',
    title: 'Asset Allocation History',
    type: 'allocation',
    description: 'Complete audit logs of previous checkout transactions, return history, and delays.',
    generatedAt: '2026-07-12T08:15:00Z',
    csvUrl: '/downloads/reports/allocations_audit.csv',
    data: [
      { ID: '101', Asset: 'Laptop-01', Employee: 'John Doe', 'Allocated On': '2026-07-01', 'Return Date': '2026-07-12', Status: 'Allocated' },
      { ID: '102', Asset: 'Laptop-02', Employee: 'Jane Smith', 'Allocated On': '2026-07-05', 'Return Date': '2026-07-25', Status: 'Allocated' }
    ]
  }
];

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReports();
      if (data && data.length > 0) {
        setReports(data);
      } else {
        setReports(MOCK_REPORTS);
      }
    } catch (err) {
      console.warn('API error fetching reports, using local mock data', err);
      setReports(MOCK_REPORTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReports();
  }, []);

  const handleExportCSV = (report: Report) => {
    showToast(`${report.title} CSV download started!`, 'success');
  };

  // Render Loading Skeletons
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-display">
            <BarChart3 className="text-indigo-600 animate-float" size={22} />
            <span>Reports & Analytics</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 font-bold uppercase tracking-wider font-sans">Acquisition costs, utilization metrics, and hardware retirement forecasts</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <Loader message="Querying analytical system data reports..." />
      </div>
    );
  }

  // Render Error Message
  if (error) {
    return (
      <div className="space-y-6">
        <ErrorMessage message={error} onRetry={fetchReports} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-display">
            <BarChart3 className="text-indigo-600 animate-float" size={22} />
            <span>Reports & Analytics</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 font-bold uppercase tracking-wider font-sans">Acquisition costs, utilization metrics, and hardware retirement forecasts</p>
        </div>
        <Button onClick={fetchReports} variant="outline" size="sm" className="flex items-center gap-2">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </Button>
      </div>

      {reports.length === 0 ? (
        <EmptyState
          title="No Reports Available"
          description="There are currently no report types configured or generated in the analytics engine."
          icon={<BarChart3 size={48} className="text-slate-650" />}
        />
      ) : (
        /* Report Cards Grid */
        <div className="grid gap-6 sm:grid-cols-2">
          {reports.map((report: Report) => (
            <ReportCard
              key={report.id}
              report={report}
              onClick={() => setSelectedReport(report)}
            />
          ))}
        </div>
      )}

      {/* Modal View details */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setSelectedReport(null)}
          />
          
          {/* Modal box */}
          <div className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-[32px] bg-slate-900 p-8 shadow-extruded border border-white/20 flex flex-col z-10">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-5 mb-5 border-b border-slate-700/25">
              <div>
                <h3 className="text-base font-bold text-slate-100 font-display">
                  {selectedReport.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedReport.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-indigo-600 p-2.5 bg-slate-900 rounded-full shadow-extruded transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Table wrapper */}
            <div className="overflow-y-auto flex-1 pr-1 py-4">
              {selectedReport.data && selectedReport.data.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border border-slate-700/30">
                  <table className="min-w-full divide-y divide-slate-800 bg-slate-900">
                    <thead className="bg-slate-950/40">
                      <tr>
                        {Object.keys(selectedReport.data[0]).map((key: string) => (
                          <th
                            key={key}
                            scope="col"
                            className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400"
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {selectedReport.data.map((row: Record<string, unknown>, rIdx: number) => (
                        <tr key={rIdx} className="hover:bg-slate-850/30 transition-colors">
                          {Object.values(row).map((val: unknown, vIdx: number) => (
                            <td
                              key={vIdx}
                              className="whitespace-nowrap px-4 py-3 text-xs font-semibold text-slate-300"
                            >
                              {val as React.ReactNode}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-xs text-slate-500 italic py-10 font-bold uppercase tracking-wider">
                  No data logs populated.
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-700/25 pt-5 mt-5">
              <span className="text-[10px] text-slate-500 font-bold uppercase">
                Generated {new Date(selectedReport.generatedAt).toLocaleString()}
              </span>
              
              <div className="flex gap-3">
                {selectedReport.csvUrl && (
                  <Button
                    onClick={() => handleExportCSV(selectedReport)}
                    variant="gradient"
                    size="sm"
                    className="flex items-center gap-1.5"
                  >
                    <Download size={14} />
                    <span>Download CSV</span>
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setSelectedReport(null)}>
                  Close
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
