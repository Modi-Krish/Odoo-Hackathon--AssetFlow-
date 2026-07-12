'use client';

import React, { useState, useEffect } from 'react';
import { Report } from '../../types/report';
import { getReports } from '../../services/reports';
import { ReportCard } from '../../components/operations/ReportCard';

// Fallback/Mock reports if the API is offline
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
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await getReports();
        if (data && data.length > 0) {
          setReports(data);
        }
      } catch (err) {
        console.warn('API error fetching reports, displaying mockup templates', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            System Reports
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Monitor asset distributions, departmental allocations, maintenance overheads, and allocation histories.
          </p>
        </header>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        )}

        {/* Report Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {reports.map((report: Report) => (
            <ReportCard
              key={report.id}
              report={report}
              onClick={() => setSelectedReport(report)}
            />
          ))}
        </div>

        {/* Interactive Modal */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-all duration-300">
            <div className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex flex-col">
              
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedReport.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {selectedReport.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body / Table View */}
              <div className="flex-1 overflow-y-auto py-6">
                {selectedReport.data && selectedReport.data.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                      <thead className="bg-gray-50 dark:bg-gray-800/60">
                        <tr>
                          {Object.keys(selectedReport.data[0]).map((key: string) => (
                            <th
                              key={key}
                              scope="col"
                              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                        {selectedReport.data.map((row: Record<string, any>, rowIndex: number) => (
                          <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                            {Object.values(row).map((val: any, valIndex: number) => (
                              <td
                                key={valIndex}
                                className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300"
                              >
                                {val}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
                    No report data found.
                  </p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800/60">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Audit Timestamp: {new Date(selectedReport.generatedAt).toLocaleString()}
                </span>
                
                <div className="flex items-center gap-3">
                  {selectedReport.csvUrl && (
                    <a
                      href={selectedReport.csvUrl}
                      download
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download CSV
                    </a>
                  )}
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
