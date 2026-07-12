'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, Button, Input, Select, Badge, Modal, showToast } from '@/components/UI';
import { Users, Plus, Edit2, Trash2, ShieldAlert } from 'lucide-react';
import { UserRole } from '@/types';

export default function EmployeesPage() {
  const { 
    currentUser, 
    users, 
    departments, 
    addEmployee, 
    updateEmployee, 
    deleteEmployee 
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Employee');
  const [departmentId, setDepartmentId] = useState('');
  const [status, setStatus] = useState(true);

  // Role Gate check: Admin only (PRD screen 2)
  if (currentUser?.role !== 'Admin') {
    return (
      <Card className="max-w-xl mx-auto mt-12 text-center p-8 border-rose-500/20 bg-rose-950/5">
        <ShieldAlert size={48} className="mx-auto text-rose-400 mb-4 animate-bounce" />
        <h3 className="text-lg font-bold text-slate-100 mb-2">Access Denied</h3>
        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          The Employee Directory administration module is restricted to Admin accounts only. 
          Use the profile dropdown in the top right navbar to switch to the <strong>Admin</strong> role for testing.
        </p>
      </Card>
    );
  }

  const handleOpenNew = () => {
    setEditingId(null);
    setName('');
    setEmail('');
    setRole('Employee');
    setDepartmentId('');
    setStatus(true);
    setIsOpen(true);
  };

  const handleOpenEdit = (empId: string) => {
    const emp = users.find(u => u.id === empId);
    if (emp) {
      setEditingId(empId);
      setName(emp.name);
      setEmail(emp.email);
      setRole(emp.role);
      setDepartmentId(emp.department_id || '');
      setStatus(emp.status);
      setIsOpen(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name is required', 'error');
      return;
    }
    if (!email.trim()) {
      showToast('Email is required', 'error');
      return;
    }

    // Email validation
    if (!email.includes('@')) {
      showToast('Invalid email format', 'error');
      return;
    }

    if (editingId) {
      updateEmployee(editingId, {
        name,
        email,
        role,
        department_id: departmentId || undefined,
        status
      });
      showToast('Employee profile updated', 'success');
    } else {
      // Check for unique email (TRD validation rule 13)
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        showToast('Email must be unique. This email is already registered.', 'error');
        return;
      }

      addEmployee({
        name,
        email,
        role,
        department_id: departmentId || undefined,
        status
      });
      showToast('Employee added to directory', 'success');
    }
    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    if (currentUser.id === id) {
      showToast('Cannot delete yourself!', 'error');
      return;
    }
    if (confirm('Are you sure you want to delete this employee?')) {
      deleteEmployee(id);
      showToast('Employee deleted from directory', 'success');
    }
  };

  const deptOptions = [
    { value: '', label: '-- None (Unassigned) --' },
    ...departments.map(d => ({ value: d.id, label: d.name }))
  ];

  const roleOptions = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Asset Manager', label: 'Asset Manager' },
    { value: 'Department Head', label: 'Department Head' },
    { value: 'Employee', label: 'Employee' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="text-indigo-400" size={22} />
            <span>Employee Directory</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage personnel profiles, assign roles, departments, and active statuses.</p>
        </div>
        <Button onClick={handleOpenNew} variant="gradient" className="flex items-center gap-1.5">
          <Plus size={16} /> Add Employee
        </Button>
      </div>

      {/* Directory Table */}
      <Card className="overflow-hidden p-0 border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Department</th>
                <th className="py-4 px-6">System Role</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300 font-medium">
              {users.map(emp => {
                const dept = departments.find(d => d.id === emp.department_id);
                return (
                  <tr key={emp.id} className="hover:bg-slate-900/20 transition-all">
                    <td className="py-4 px-6 font-bold text-slate-100">{emp.name}</td>
                    <td className="py-4 px-6 text-slate-400">{emp.email}</td>
                    <td className="py-4 px-6 font-semibold">{dept ? dept.name : <span className="text-slate-500 font-normal">Unassigned</span>}</td>
                    <td className="py-4 px-6">
                      <Badge content={emp.role} />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Badge content={emp.status ? 'Active' : 'Inactive'} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleOpenEdit(emp.id)}
                          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-all"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button 
                          onClick={() => handleDelete(emp.id)}
                          className="p-1.5 hover:bg-rose-500/10 rounded-lg text-rose-400 hover:text-rose-300 transition-all"
                        >
                          <Trash2 size={13} />
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editingId ? 'Edit Employee Profile' : 'Add Employee'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Priyal Patel"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="email@company.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <Select
            label="Department"
            options={deptOptions}
            value={departmentId}
            onChange={e => setDepartmentId(e.target.value)}
          />

          <Select
            label="System Role (Admin Promotion)"
            options={roleOptions}
            value={role}
            onChange={e => setRole(e.target.value as UserRole)}
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
