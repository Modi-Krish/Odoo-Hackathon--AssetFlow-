'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, Button, Input, Select, Badge, showToast } from '@/components/UI';
import { ClipboardCheck, Play, Check, AlertCircle, AlertTriangle } from 'lucide-react';

export default function AuditPage() {
  const {
    currentUser,
    assets,
    users,
    departments,
    audits,
    auditItems,
    createAuditCycle,
    updateAuditItem,
    closeAuditCycle
  } = useApp();

  const [cycleName, setCycleName] = useState('');
  const [scopeType, setScopeType] = useState<'department' | 'location'>('department');
  const [scopeValue, setScopeValue] = useState('');
  const [auditorId, setAuditorId] = useState('');

  // Active audits
  const activeCycle = audits.find(a => a.status === 'Active');
  const activeAuditItems = auditItems.filter(item => item.audit_cycle_id === activeCycle?.id);

  // Verification Counts
  const flaggedCount = activeAuditItems.filter(item => item.status === 'Missing' || item.status === 'Damaged').length;

  const handleStartAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cycleName.trim()) return showToast('Audit Name is required', 'error');
    if (!scopeValue) return showToast('Scope target value is required', 'error');
    if (!auditorId) return showToast('Auditor is required', 'error');

    const res = await createAuditCycle(cycleName, scopeType, scopeValue, auditorId);
    if (res.success) {
      showToast(res.message, 'success');
      setCycleName('');
      setScopeValue('');
      setAuditorId('');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleVerifyStatus = (itemId: string, status: 'Verified' | 'Missing' | 'Damaged') => {
    updateAuditItem(itemId, status, `Checked - status changed to ${status}`);
    showToast(`Asset marked as ${status}`, 'info');
  };

  const handleCloseAudit = (cycleId: string) => {
    closeAuditCycle(cycleId);
    showToast('Audit cycle closed and discrepancy report generated', 'success');
  };

  // Scope options
  const scopeValueOptions = [
    { value: '', label: 'Select Scope Target....' },
    ...(scopeType === 'department'
      ? departments.map(d => ({ value: d.name, label: d.name }))
      : Array.from(new Set(assets.map(a => a.location || 'HQ Floor 2'))).map(loc => ({ value: loc, label: loc }))
    )
  ];

  const auditorOptions = [
    { value: '', label: 'Select Auditor....' },
    ...users.map(u => ({ value: u.id, label: `${u.name} (${u.role})` }))
  ];

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-display">
          <ClipboardCheck className="text-indigo-600 animate-float" size={22} />
          <span>Audit</span>
        </h2>
        <p className="text-xs text-slate-300 mt-0.5 font-bold uppercase tracking-wider">Scheduled inventory reviews, checks, and compliance logs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Area (Screen 8: Active Audit Checklist takes primary focus) */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeCycle ? (
            <div className="space-y-6">
              
              {/* Screen 8 Header Notice Box (recessed reddish-brown well) */}
              <div className="p-5.5 rounded-[28px] bg-slate-900 shadow-inset border border-indigo-500/10 text-xs font-bold text-slate-150 space-y-1.5">
                <p className="text-sm font-extrabold text-slate-100">{activeCycle.name}</p>
                <p className="text-slate-300 font-medium">Auditors: A. Rao, S, Iqbal</p>
              </div>

              {/* Screen 8 Checklist Table */}
              <Card className="p-0 overflow-hidden border-none shadow-extruded">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-700/20 bg-slate-850/40 text-slate-300 font-extrabold uppercase tracking-wider select-none">
                        <th className="py-4 px-6 font-display">Asset</th>
                        <th className="py-4 px-6 font-display">Expected location</th>
                        <th className="py-4 px-6 text-center font-display">Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/10 text-slate-100 font-bold">
                      {activeAuditItems.map(item => {
                        const assetObj = assets.find(a => a.id === item.asset_id);
                        return (
                          <tr key={item.id} className="hover:bg-slate-850/20 transition-all">
                            <td className="py-4 px-6 text-slate-100 font-bold uppercase tracking-wide">
                              {assetObj?.asset_tag} {assetObj?.name}
                            </td>
                            <td className="py-4 px-6 text-slate-300">{assetObj?.location || 'Desk E12'}</td>
                            <td className="py-4 px-6 text-center">
                              
                              {/* Screen 8 verification statuses */}
                              <div className="inline-flex p-1 rounded-2xl bg-slate-950/20 shadow-inset-sm gap-2">
                                <button
                                  onClick={() => handleVerifyStatus(item.id, 'Verified')}
                                  className={`py-1 px-3 text-[10px] font-black rounded-xl transition-all border-none ${item.status === 'Verified' ? 'bg-emerald-500/15 text-emerald-500 shadow-extruded-sm border border-emerald-500/10' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                  Verified
                                </button>
                                <button
                                  onClick={() => handleVerifyStatus(item.id, 'Missing')}
                                  className={`py-1 px-3 text-[10px] font-black rounded-xl transition-all border-none ${item.status === 'Missing' ? 'bg-rose-500/15 text-rose-500 shadow-extruded-sm border border-rose-500/10' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                  Missing
                                </button>
                                <button
                                  onClick={() => handleVerifyStatus(item.id, 'Damaged')}
                                  className={`py-1 px-3 text-[10px] font-black rounded-xl transition-all border-none ${item.status === 'Damaged' ? 'bg-slate-800 text-slate-200 shadow-extruded-sm border border-slate-700' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                  Damaged
                                </button>
                              </div>

                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Screen 8 Warning Banner if items are flagged */}
              {flaggedCount > 0 && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/15 text-amber-700 shadow-extruded-sm border border-amber-500/20 text-xs font-extrabold animate-pulse">
                  <AlertTriangle className="flex-shrink-0 animate-float" size={16} />
                  <span>{flaggedCount} assets flagged - discrepancy report generated automatically</span>
                </div>
              )}

              {/* Screen 8 Action Button */}
              <div className="pt-2">
                <Button 
                  onClick={() => handleCloseAudit(activeCycle.id)} 
                  variant="primary" 
                  className="px-8 py-3.5 uppercase tracking-wider font-extrabold text-xs"
                >
                  Close audit cycle
                </Button>
              </div>

            </div>
          ) : (
            <Card className="text-center py-12 p-6">
              <ClipboardCheck size={48} className="mx-auto text-indigo-600 mb-4 animate-float" />
              <h3 className="text-sm font-bold text-slate-100 mb-2 font-display uppercase tracking-wider">No Active Audit Cycle</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-bold max-w-sm mx-auto">
                All inventory schedules are currently verified and clear. Use the right panel to initialize a new physical audit cycle scope.
              </p>
            </Card>
          )}

        </div>

        {/* Right Panel: Start Audit Cycle & Reports (Admin / Manager only) */}
        <div className="lg:col-span-1 space-y-6">
          {currentUser?.role === 'admin' || currentUser?.role === 'asset_manager' ? (
            <Card>
              <h3 className="text-sm font-bold text-slate-100 mb-4 font-display">Create Audit Cycle</h3>
              
              <form onSubmit={handleStartAudit} className="space-y-4">
                <Input
                  label="Audit Cycle Name"
                  placeholder="e.g. Q3 audit: Engineering dept - 1-15 jul"
                  value={cycleName}
                  onChange={e => setCycleName(e.target.value)}
                  required
                />

                <Select
                  label="Scope Type"
                  options={[
                    { value: 'department', label: 'By Department' },
                    { value: 'location', label: 'By Physical Location' }
                  ]}
                  value={scopeType}
                  onChange={e => {
                    setScopeType(e.target.value as 'department' | 'location');
                    setScopeValue('');
                  }}
                />

                <Select
                  label="Scope Value"
                  options={scopeValueOptions}
                  value={scopeValue}
                  onChange={e => setScopeValue(e.target.value)}
                  required
                />

                <Select
                  label="Assign Auditor"
                  options={auditorOptions}
                  value={auditorId}
                  onChange={e => setAuditorId(e.target.value)}
                  required
                />

                <Button type="submit" variant="gradient" className="w-full mt-2 font-display uppercase tracking-wider">
                  <Play size={15} className="mr-1 inline" /> Start Audit
                </Button>
              </form>
            </Card>
          ) : (
            <Card className="text-center p-6 bg-slate-900 border-none shadow-extruded text-xs font-bold text-slate-300 leading-relaxed">
              Audit initiation tools are restricted to Administrators and Asset Managers.
            </Card>
          )}

          {/* Audit compliance guidelines card */}
          <Card className="bg-slate-900 shadow-extruded border-none text-xs leading-relaxed text-slate-200 space-y-3 font-bold">
            <h4 className="font-extrabold text-indigo-600 font-display">Compliance Standards</h4>
            <p className="font-medium text-slate-300">Annual or quarterly hardware audits verify physical asset placement. Misplaced items generate system discrepancy logs automatically.</p>
          </Card>
        </div>

      </div>

    </div>
  );
}
