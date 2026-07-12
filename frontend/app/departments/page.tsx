'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, Button, Input, Select, Badge, Modal, showToast } from '@/components/UI';
import { Building2, Plus, Edit2, Trash2, ShieldAlert } from 'lucide-react';

export default function DepartmentsPage() {
  const { 
    currentUser, 
    departments, 
    users, 
    addDepartment, 
    updateDepartment, 
    deleteDepartment 
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [headId, setHeadId] = useState('');
  const [status, setStatus] = useState(true);
  const [parentId, setParentId] = useState('');

  // Role Gate check: Admin only (PRD screen 2)
  if (currentUser?.role !== 'Admin') {
    return (
      <Card className="max-w-xl mx-auto mt-12 text-center p-8 border-rose-500/20 bg-rose-950/5">
        <ShieldAlert size={48} className="mx-auto text-rose-400 mb-4 animate-bounce" />
        <h3 className="text-lg font-bold text-slate-100 mb-2">Access Denied</h3>
        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          The Department Management module is restricted to Admin accounts only. 
          Use the profile dropdown in the top right navbar to switch to the <strong>Admin</strong> role for testing.
        </p>
      </Card>
    );
  }

  const handleOpenNew = () => {
    setEditingId(null);
    setName('');
    setHeadId('');
    setStatus(true);
    setParentId('');
    setIsOpen(true);
  };

  const handleOpenEdit = (deptId: string) => {
    const dept = departments.find(d => d.id === deptId);
    if (dept) {
      setEditingId(deptId);
      setName(dept.name);
      setHeadId(dept.head_id || '');
      setStatus(dept.status);
      setParentId(dept.parent_id || '');
      setIsOpen(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Department Name is required', 'error');
      return;
    }

    if (editingId) {
      updateDepartment(editingId, {
        name,
        head_id: headId || undefined,
        status,
        parent_id: parentId || undefined
      });
      showToast('Department updated successfully', 'success');
    } else {
      addDepartment({
        name,
        head_id: headId || undefined,
        status,
        parent_id: parentId || undefined
      });
      showToast('Department created successfully', 'success');
    }
    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this department?')) {
      deleteDepartment(id);
      showToast('Department deleted successfully', 'success');
    }
  };

  // Filter possible heads (usually employees/managers)
  const employeeOptions = [
    { value: '', label: '-- None (Unassigned) --' },
    ...users.map(u => ({ value: u.id, label: `${u.name} (${u.role})` }))
  ];

  // Parent department options for hierarchical setups
  const parentOptions = [
    { value: '', label: '-- None (Top Level) --' },
    ...departments
      .filter(d => d.id !== editingId)
      .map(d => ({ value: d.id, label: d.name }))
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Building2 className="text-indigo-400" size={22} />
            <span>Departments List</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage organization departments, set hierarchy, and assign department heads.</p>
        </div>
        <Button onClick={handleOpenNew} variant="gradient" className="flex items-center gap-1.5">
          <Plus size={16} /> Add Department
        </Button>
      </div>

      {/* Grid of departments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {departments.map(dept => {
          const headUser = users.find(u => u.id === dept.head_id);
          const parentDept = departments.find(d => d.id === dept.parent_id);

          return (
            <Card key={dept.id} className="flex flex-col justify-between h-44">
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-slate-200 text-sm tracking-wide">{dept.name}</h3>
                  <Badge content={dept.status ? 'Active' : 'Inactive'} />
                </div>
                
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px] w-20">Dept Head:</span>
                    <span className="text-slate-300 font-semibold">{headUser ? headUser.name : 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px] w-20">Parent Dept:</span>
                    <span className="text-slate-400">{parentDept ? parentDept.name : 'Top-Level Department'}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-3 mt-auto flex items-center justify-end gap-2">
                <Button 
                  onClick={() => handleOpenEdit(dept.id)} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1 text-slate-300"
                >
                  <Edit2 size={12} /> Edit
                </Button>
                <Button 
                  onClick={() => handleDelete(dept.id)} 
                  variant="ghost" 
                  size="sm"
                  className="flex items-center gap-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                >
                  <Trash2 size={12} /> Delete
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Creation / Edit Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title={editingId ? 'Edit Department' : 'Create Department'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Department Name"
            placeholder="e.g. Engineering & IT"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />

          <Select
            label="Department Head"
            options={employeeOptions}
            value={headId}
            onChange={e => setHeadId(e.target.value)}
          />

          <Select
            label="Parent Department (Hierarchy)"
            options={parentOptions}
            value={parentId}
            onChange={e => setParentId(e.target.value)}
          />

          <Select
            label="Status"
            options={[
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' }
            ]}
            value={status ? 'true' : 'false'}
            onChange={e => setStatus(e.target.value === 'true')}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient">
              {editingId ? 'Save Changes' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
