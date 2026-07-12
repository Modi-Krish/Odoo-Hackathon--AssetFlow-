'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, Button, Badge, showToast } from '@/components/UI';
import { BarChart3, Download, FileText, Table, PieChart } from 'lucide-react';

export default function ReportsPage() {
  const { 
    assets, 
    departments, 
    maintenance, 
    allocations,
    users 
  } = useApp();

  const [reportType, setReportType] = useState<'assets' | 'departments' | 'maintenance'>('assets');

  // Calculations for CSV generation and tabular display
  const getAssetsReportData = () => {
    return assets.map(a => {
      const allocs = allocations.filter(al => al.asset_id === a.id);
      return {
        tag: a.asset_tag,
        name: a.name,
        serial: a.serial_number,
        condition: a.condition,
        status: a.status,
        cost: `$${a.purchase_cost}`,
        utilizationCount: allocs.length
      };
    });
  };

  const getDepartmentsReportData = () => {
    return departments.map(d => {
      const deptAssets = assets.filter(a => a.department_id === d.id);
      const head = users.find(u => u.id === d.head_id);
      const totalCost = deptAssets.reduce((sum, a) => sum + a.purchase_cost, 0);
      return {
        name: d.name,
        head: head ? head.name : 'Unassigned',
        assetCount: deptAssets.length,
        totalValue: `$${totalCost.toLocaleString()}`,
        status: d.status ? 'Active' : 'Inactive'
      };
    });
  };

  const getMaintenanceReportData = () => {
    return maintenance.map(m => {
      const ast = assets.find(a => a.id === m.asset_id);
      const reporter = users.find(u => u.id === m.created_by);
      return {
        tag: ast?.asset_tag || 'N/A',
        name: ast?.name || 'N/A',
        issue: m.issue,
        priority: m.priority,
        status: m.status,
        date: new Date(m.created_at).toLocaleDateString(),
        reportedBy: reporter ? reporter.name : 'Unknown'
      };
    });
  };

  // CSV Generation Engine (Functional Client-Side Download)
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: any[] = [];
    let filename = '';

    if (reportType === 'assets') {
      headers = ['Asset Tag', 'Asset Name', 'Serial Number', 'Condition', 'Status', 'Acquisition Cost', 'Allocation Cycles'];
      rows = getAssetsReportData().map(d => [d.tag, d.name, d.serial, d.condition, d.status, d.cost, d.utilizationCount]);
      filename = 'Asset_Utilization_Report.csv';
    } else if (reportType === 'departments') {
      headers = ['Department Name', 'Department Head', 'Total Assets Hold', 'Total Valuation', 'Status'];
      rows = getDepartmentsReportData().map(d => [d.name, d.head, d.assetCount, d.totalValue, d.status]);
      filename = 'Department_Asset_Allocation_Report.csv';
    } else {
      headers = ['Asset Tag', 'Asset Name', 'Reported Issue', 'Priority', 'Workflow Status', 'Report Date', 'Reported By'];
      rows = getMaintenanceReportData().map(d => [d.tag, d.name, d.issue, d.priority, d.status, d.date, d.reportedBy]);
      filename = 'Maintenance_History_Report.csv';
    }

    const csvContent = 
      'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.map((val: any) => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`${filename} exported successfully!`, 'success');
  };

  const handleExportPDF = () => {
    // Print window to generate PDF or trigger download dialog
    window.print();
  };

  // SVGs Chart data derivations
  // Dept allocation bar heights
  const maxDeptAssetCount = Math.max(...departments.map(d => assets.filter(a => a.department_id === d.id).length), 1);
  const totalCostValuation = assets.reduce((sum, a) => sum + a.purchase_cost, 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="text-indigo-400" size={22} />
            <span>Reports & Analytics Dashboard</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Generate operational summary grids, track asset capitalization, and export audits spreadsheets.</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline" size="sm" className="flex items-center gap-1.5 text-xs">
            <Download size={14} /> Export CSV
          </Button>
          <Button onClick={handleExportPDF} variant="primary" size="sm" className="flex items-center gap-1.5 text-xs bg-indigo-600">
            <FileText size={14} /> Export PDF / Print
          </Button>
        </div>
      </div>

      {/* Dynamic Graph Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
        
        {/* Custom SVG Bar Chart - Department asset allocations */}
        <Card className="flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Asset Allocation by Department</h4>
            <p className="text-[10px] text-slate-500 mb-4">Total number of physical items assigned to departments</p>
          </div>

          <div className="h-44 w-full flex items-end gap-5 px-4 mt-2">
            {departments.map(dept => {
              const count = assets.filter(a => a.department_id === dept.id).length;
              const percent = (count / maxDeptAssetCount) * 100;
              return (
                <div key={dept.id} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[10px] font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {count}
                  </div>
                  <div 
                    className="w-full bg-gradient-to-t from-indigo-600 to-indigo-500 hover:from-indigo-400 hover:to-indigo-300 rounded-t-lg transition-all duration-500 shadow-lg shadow-indigo-600/10 cursor-pointer"
                    style={{ height: `${percent || 10}%` }}
                  />
                  <span className="text-[9px] text-slate-500 font-bold truncate max-w-full text-center w-full uppercase select-none" title={dept.name}>
                    {dept.name.substring(0, 4)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Custom SVG Bar Chart - Maintenance Frequency */}
        <Card className="flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Valuation Breakdown</h4>
            <p className="text-[10px] text-slate-500 mb-4">Asset capitalization value holding per category</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span>Capitalization Value</span>
              <span className="text-indigo-400 font-black text-sm">${totalCostValuation.toLocaleString()} USD</span>
            </div>
            
            <div className="space-y-2">
              {['Electronics', 'Furniture', 'Vehicles', 'Lab Equipment'].map((catName, idx) => {
                const catId = `c-${idx + 1}`;
                const catVal = assets.filter(a => a.category_id === catId).reduce((s, a) => s + a.purchase_cost, 0);
                const percent = (catVal / (totalCostValuation || 1)) * 100;
                
                const bgColors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-pink-500'];

                return (
                  <div key={catName} className="space-y-1.5 text-xs font-semibold">
                    <div className="flex justify-between">
                      <span className="text-slate-400">{catName}</span>
                      <span className="text-slate-200">${catVal.toLocaleString()} ({percent.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full h-2 rounded bg-slate-950 overflow-hidden">
                      <div className={`h-full ${bgColors[idx]} rounded`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Report selector tabs */}
      <div className="flex border-b border-slate-800 pb-px gap-2 pt-2 print:hidden">
        <button
          onClick={() => setReportType('assets')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${reportType === 'assets' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Table size={14} /> Asset Utilization Report
        </button>
        <button
          onClick={() => setReportType('departments')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${reportType === 'departments' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Table size={14} /> Department Capitalization Report
        </button>
        <button
          onClick={() => setReportType('maintenance')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${reportType === 'maintenance' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Table size={14} /> Maintenance Incident Report
        </button>
      </div>

      {/* Grid Table Display */}
      <Card className="p-0 overflow-hidden border-slate-800">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between print:hidden">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
            {reportType === 'assets' && 'Asset utilization cycles & catalog list'}
            {reportType === 'departments' && 'Department assets allocation statistics'}
            {reportType === 'maintenance' && 'Maintenance pipelines ticket history'}
          </span>
          <Badge content="Audited" />
        </div>

        <div className="overflow-x-auto">
          {reportType === 'assets' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Asset Tag</th>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Serial Number</th>
                  <th className="py-4 px-6">Condition</th>
                  <th className="py-4 px-6">Acquisition Cost</th>
                  <th className="py-4 px-6 text-center">Allocations</th>
                  <th className="py-4 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300 font-medium">
                {getAssetsReportData().map(row => (
                  <tr key={row.tag} className="hover:bg-slate-900/20 transition-all">
                    <td className="py-4 px-6 font-bold text-indigo-400">{row.tag}</td>
                    <td className="py-4 px-6 font-bold text-slate-100">{row.name}</td>
                    <td className="py-4 px-6 text-slate-400">{row.serial}</td>
                    <td className="py-4 px-6">{row.condition}</td>
                    <td className="py-4 px-6 text-slate-400 font-semibold">{row.cost}</td>
                    <td className="py-4 px-6 text-center font-bold">{row.utilizationCount} cycles</td>
                    <td className="py-4 px-6 text-center"><Badge content={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'departments' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Department Name</th>
                  <th className="py-4 px-6">Department Head</th>
                  <th className="py-4 px-6 text-center">Total Assets Assigned</th>
                  <th className="py-4 px-6">Valuation Sum</th>
                  <th className="py-4 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300 font-medium">
                {getDepartmentsReportData().map(row => (
                  <tr key={row.name} className="hover:bg-slate-900/20 transition-all">
                    <td className="py-4 px-6 font-bold text-slate-100">{row.name}</td>
                    <td className="py-4 px-6 font-semibold">{row.head}</td>
                    <td className="py-4 px-6 text-center font-bold text-indigo-400">{row.assetCount} assets</td>
                    <td className="py-4 px-6 text-slate-400 font-bold">{row.totalValue}</td>
                    <td className="py-4 px-6 text-center"><Badge content={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'maintenance' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Asset Tag</th>
                  <th className="py-4 px-6">Asset Name</th>
                  <th className="py-4 px-6">Reported Issue</th>
                  <th className="py-4 px-6">Priority</th>
                  <th className="py-4 px-6">Report Date</th>
                  <th className="py-4 px-6">Reported By</th>
                  <th className="py-4 px-6 text-center">Workflow Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300 font-medium">
                {getMaintenanceReportData().map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/20 transition-all">
                    <td className="py-4 px-6 font-bold text-indigo-400">{row.tag}</td>
                    <td className="py-4 px-6 font-bold text-slate-100">{row.name}</td>
                    <td className="py-4 px-6 text-slate-400 truncate max-w-[200px]" title={row.issue}>{row.issue}</td>
                    <td className="py-4 px-6"><Badge content={row.priority} /></td>
                    <td className="py-4 px-6 text-slate-500 font-semibold">{row.date}</td>
                    <td className="py-4 px-6 font-semibold">{row.reportedBy}</td>
                    <td className="py-4 px-6 text-center"><Badge content={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
