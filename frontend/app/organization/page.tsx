'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, Button, Input, Select, Badge, Modal, showToast } from '@/components/UI';
import { Building2, Plus, Edit2, Trash2, ShieldAlert, Tags, Users } from 'lucide-react';
import { UserRole } from '@/types';

export default function OrganizationSetupPage() {
  const { 
    currentUser, 
    departments, 
    categories,
    users, 
    addDepartment, 
    updateDepartment, 
    deleteDepartment,
    addCategory,
    updateCategory,
    deleteCategory,
    addEmployee,
    updateEmployee,
    deleteEmployee
  } = useApp();

  const [activeTab, setActiveTab] = useState<'departments' | 'categories' | 'employees'>('departments');

  // Unified modal visibility states
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);

  // Edit trackers
  const [editingId, setEditingId] = useState<string | null>(null);

  // Department form states
  const [deptName, setDeptName] = useState('');
  const [deptHeadId, setDeptHeadId] = useState('');
  const [deptStatus, setDeptStatus] = useState(true);
  const [deptParentId, setDeptParentId] = useState('');

  // Category form states
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');

  // Employee form states
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empRole, setEmpRole] = useState<UserRole>('Employee');
  const [empDeptId, setEmpDeptId] = useState('');

  // Role Gate check: Admin only (PRD Screen 3 "Organization setup (Admin only)")
  if (currentUser?.role !== 'Admin') {
    return (
      <Card className="max-w-xl mx-auto mt-12 text-center p-8 border-none bg-slate-900 shadow-extruded">
        <ShieldAlert size={48} className="mx-auto text-rose-600 mb-4 animate-bounce" />
        <h3 className="text-lg font-bold text-slate-100 mb-2 font-display">Access Denied</h3>
        <p className="text-xs text-slate-300 leading-relaxed font-bold">
          The Organization Setup module is restricted to Admin accounts only. 
          Use the profile dropdown in the top right navbar to switch to the <strong>Admin</strong> role for testing.
        </p>
      </Card>
    );
  }

  // --- Department Handlers ---
  const handleOpenNewDept = () => {
    setEditingId(null);
    setDeptName('');
    setDeptHeadId('');
    setDeptStatus(true);
    setDeptParentId('');
    setIsDeptModalOpen(true);
  };

  const handleOpenEditDept = (id: string) => {
    const dept = departments.find(d => d.id === id);
    if (dept) {
      setEditingId(id);
      setDeptName(dept.name);
      setDeptHeadId(dept.head_id || '');
      setDeptStatus(dept.status);
      setDeptParentId(dept.parent_id || '');
      setIsDeptModalOpen(true);
    }
  };

  const handleDeptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) return showToast('Department Name is required', 'error');

    if (editingId) {
      updateDepartment(editingId, {
        name: deptName,
        head_id: deptHeadId || undefined,
        status: deptStatus,
        parent_id: deptParentId || undefined
      });
      showToast('Department updated successfully', 'success');
    } else {
      addDepartment({
        name: deptName,
        head_id: deptHeadId || undefined,
        status: deptStatus,
        parent_id: deptParentId || undefined
      });
      showToast('Department created successfully', 'success');
    }
    setIsDeptModalOpen(false);
  };

  // --- Category Handlers ---
  const handleOpenNewCat = () => {
    setEditingId(null);
    setCatName('');
    setCatDescription('');
    setIsCatModalOpen(true);
  };

  const handleOpenEditCat = (id: string) => {
    const cat = categories.find(c => c.id === id);
    if (cat) {
      setEditingId(id);
      setCatName(cat.name);
      setCatDescription(cat.description || '');
      setIsCatModalOpen(true);
    }
  };

  const handleCatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return showToast('Category Name is required', 'error');

    if (editingId) {
      updateCategory(editingId, {
        name: catName,
        description: catDescription
      });
      showToast('Category updated successfully', 'success');
    } else {
      addCategory({
        name: catName,
        description: catDescription
      });
      showToast('Category created successfully', 'success');
    }
    setIsCatModalOpen(false);
  };

  // --- Employee Handlers ---
  const handleOpenNewEmp = () => {
    setEditingId(null);
    setEmpName('');
    setEmpEmail('');
    setEmpRole('Employee');
    setEmpDeptId('');
    setIsEmpModalOpen(true);
  };

  const handleOpenEditEmp = (id: string) => {
    const emp = users.find(u => u.id === id);
    if (emp) {
      setEditingId(id);
      setEmpName(emp.name);
      setEmpEmail(emp.email);
      setEmpRole(emp.role);
      setEmpDeptId(emp.department_id || '');
      setIsEmpModalOpen(true);
    }
  };

  const handleEmpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim()) return showToast('Employee Name is required', 'error');
    if (!empEmail.trim()) return showToast('Email is required', 'error');

    if (editingId) {
      updateEmployee(editingId, {
        name: empName,
        email: empEmail,
        role: empRole,
        department_id: empDeptId || undefined
      });
      showToast('Employee details updated', 'success');
    } else {
      addEmployee({
        name: empName,
        email: empEmail,
        role: empRole,
        department_id: empDeptId || undefined,
        status: true
      });
      showToast('New employee registered successfully', 'success');
    }
    setIsEmpModalOpen(false);
  };

  // --- Global Add button router based on active tab ---
  const handleAddClick = () => {
    if (activeTab === 'departments') handleOpenNewDept();
    else if (activeTab === 'categories') handleOpenNewCat();
    else if (activeTab === 'employees') handleOpenNewEmp();
  };

  // Option Mappings
  const userSelectOptions = [
    { value: '', label: 'Select Head....' },
    ...users.map(u => ({ value: u.id, label: u.name }))
  ];

  const parentDeptOptions = [
    { value: '', label: 'Select Parent Dept....' },
    ...departments.filter(d => d.id !== editingId).map(d => ({ value: d.id, label: d.name }))
  ];

  const departmentOptions = [
    { value: '', label: 'Select Department....' },
    ...departments.map(d => ({ value: d.id, label: d.name }))
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-display">
          <Building2 className="text-indigo-600 animate-float" size={22} />
          <span>Organization Setup</span>
        </h2>
        <p className="text-xs text-slate-300 mt-0.5 font-bold uppercase tracking-wider">Configure departments, asset categories, and active users</p>
      </div>

      {/* Tabs list (Matches Screen 3) */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-700/20">
        <div className="flex p-1.5 rounded-2xl bg-slate-900 shadow-inset gap-2 border-none">
          <button
            onClick={() => setActiveTab('departments')}
            className={`py-2 px-5 text-xs font-bold rounded-xl transition-all border-none ${activeTab === 'departments' ? 'bg-slate-900 text-indigo-600 shadow-extruded' : 'text-slate-300 hover:text-slate-100'}`}
          >
            Departments
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-2 px-5 text-xs font-bold rounded-xl transition-all border-none ${activeTab === 'categories' ? 'bg-slate-900 text-indigo-600 shadow-extruded' : 'text-slate-300 hover:text-slate-100'}`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`py-2 px-5 text-xs font-bold rounded-xl transition-all border-none ${activeTab === 'employees' ? 'bg-slate-900 text-indigo-600 shadow-extruded' : 'text-slate-300 hover:text-slate-100'}`}
          >
            Employee
          </button>
        </div>

        {/* Dynamic add button (Screen 3) */}
        <Button onClick={handleAddClick} variant="primary" className="flex items-center gap-1.5 px-6 font-display uppercase tracking-wider">
          <Plus size={16} /> Add
        </Button>
      </div>

      {/* Tables Dashboard */}
      <Card className="p-0 overflow-hidden border-none shadow-extruded">
        
        {activeTab === 'departments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-700/20 bg-slate-850/40 text-slate-300 font-extrabold uppercase tracking-wider">
                  <th className="py-4 px-6 font-display">Department</th>
                  <th className="py-4 px-6 font-display">Head</th>
                  <th className="py-4 px-6 font-display">Parent Dept</th>
                  <th className="py-4 px-6 font-display text-center">Status</th>
                  <th className="py-4 px-6 text-right font-display">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/10 text-slate-100 font-bold">
                {departments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 italic">No departments registered.</td>
                  </tr>
                ) : (
                  departments.map(dept => {
                    const headUser = users.find(u => u.id === dept.head_id);
                    const parent = departments.find(d => d.id === dept.parent_id);
                    
                    return (
                      <tr key={dept.id} className="hover:bg-slate-850/20 transition-all">
                        <td className="py-4 px-6 text-slate-100">{dept.name}</td>
                        <td className="py-4 px-6">{headUser ? headUser.name : '--'}</td>
                        <td className="py-4 px-6 text-slate-300">{parent ? parent.name : '--'}</td>
                        <td className="py-4 px-6 text-center">
                          <Badge content={dept.status ? 'Active' : 'Inactive'} />
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <button 
                            onClick={() => handleOpenEditDept(dept.id)}
                            className="p-2 text-indigo-600 hover:text-indigo-500 hover:shadow-extruded-sm active:shadow-inset-sm rounded-full transition-all border-none bg-slate-900"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm('Delete department?')) {
                                deleteDepartment(dept.id);
                                showToast('Department deleted', 'success');
                              }
                            }}
                            className="p-2 text-rose-600 hover:text-rose-500 hover:shadow-extruded-sm active:shadow-inset-sm rounded-full transition-all border-none bg-slate-900"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-700/20 bg-slate-850/40 text-slate-300 font-extrabold uppercase tracking-wider">
                  <th className="py-4 px-6 font-display">Category Name</th>
                  <th className="py-4 px-6 font-display">Description</th>
                  <th className="py-4 px-6 text-right font-display">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/10 text-slate-100 font-bold">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400 italic">No asset categories registered.</td>
                  </tr>
                ) : (
                  categories.map(cat => (
                    <tr key={cat.id} className="hover:bg-slate-850/20 transition-all">
                      <td className="py-4 px-6 text-slate-100">{cat.name}</td>
                      <td className="py-4 px-6 text-slate-300 max-w-xs truncate">{cat.description || '--'}</td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button 
                          onClick={() => handleOpenEditCat(cat.id)}
                          className="p-2 text-indigo-600 hover:text-indigo-500 hover:shadow-extruded-sm active:shadow-inset-sm rounded-full transition-all border-none bg-slate-900"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm('Delete category?')) {
                              deleteCategory(cat.id);
                              showToast('Category deleted', 'success');
                            }
                          }}
                          className="p-2 text-rose-600 hover:text-rose-500 hover:shadow-extruded-sm active:shadow-inset-sm rounded-full transition-all border-none bg-slate-900"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-700/20 bg-slate-850/40 text-slate-300 font-extrabold uppercase tracking-wider">
                  <th className="py-4 px-6 font-display">Name</th>
                  <th className="py-4 px-6 font-display">Email</th>
                  <th className="py-4 px-6 font-display">Department</th>
                  <th className="py-4 px-6 font-display">Role</th>
                  <th className="py-4 px-6 text-right font-display">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/10 text-slate-100 font-bold">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 italic">No users registered.</td>
                  </tr>
                ) : (
                  users.map(u => {
                    const dept = departments.find(d => d.id === u.department_id);
                    return (
                      <tr key={u.id} className="hover:bg-slate-850/20 transition-all">
                        <td className="py-4 px-6 text-slate-100">{u.name}</td>
                        <td className="py-4 px-6 text-slate-300">{u.email}</td>
                        <td className="py-4 px-6">{dept ? dept.name : 'Corporate Admin'}</td>
                        <td className="py-4 px-6">
                          <Badge content={u.role} />
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <button 
                            onClick={() => handleOpenEditEmp(u.id)}
                            className="p-2 text-indigo-600 hover:text-indigo-500 hover:shadow-extruded-sm active:shadow-inset-sm rounded-full transition-all border-none bg-slate-900"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm('Delete employee?')) {
                                deleteEmployee(u.id);
                                showToast('Employee deleted', 'success');
                              }
                            }}
                            className="p-2 text-rose-600 hover:text-rose-500 hover:shadow-extruded-sm active:shadow-inset-sm rounded-full transition-all border-none bg-slate-900"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

      </Card>

      {/* Info Warning notice below table (Matches Screen 3) */}
      <p className="text-[11px] text-slate-300 font-bold italic pl-1">
        * Editing a department here also drives the picklist in Screen 4 & 5
      </p>

      {/* --- Department Modal --- */}
      <Modal isOpen={isDeptModalOpen} onClose={() => setIsDeptModalOpen(false)} title={editingId ? 'Edit Department' : 'Create Department'}>
        <form onSubmit={handleDeptSubmit} className="space-y-4">
          <Input
            label="Department Name"
            placeholder="e.g. Engineering"
            value={deptName}
            onChange={e => setDeptName(e.target.value)}
            required
          />
          <Select
            label="Department Head"
            options={userSelectOptions}
            value={deptHeadId}
            onChange={e => setDeptHeadId(e.target.value)}
          />
          <Select
            label="Parent Department"
            options={parentDeptOptions}
            value={deptParentId}
            onChange={e => setDeptParentId(e.target.value)}
          />
          <Select
            label="Status"
            options={[
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' }
            ]}
            value={deptStatus ? 'true' : 'false'}
            onChange={e => setDeptStatus(e.target.value === 'true')}
          />
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700/20">
            <Button type="button" variant="outline" onClick={() => setIsDeptModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gradient">{editingId ? 'Save Changes' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      {/* --- Category Modal --- */}
      <Modal isOpen={isCatModalOpen} onClose={() => setIsCatModalOpen(false)} title={editingId ? 'Edit Category' : 'Create Category'}>
        <form onSubmit={handleCatSubmit} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Electronics"
            value={catName}
            onChange={e => setCatName(e.target.value)}
            required
          />
          <div className="w-full">
            <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider uppercase">Description</label>
            <textarea
              className="w-full px-5 py-3 rounded-2xl bg-slate-900 text-slate-100 text-sm border-none shadow-inset focus:outline-none focus:shadow-inset-deep focus:ring-2 focus:ring-indigo-600 h-24 resize-none"
              placeholder="Provide a description of the category..."
              value={catDescription}
              onChange={e => setCatDescription(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700/20">
            <Button type="button" variant="outline" onClick={() => setIsCatModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gradient">{editingId ? 'Save Changes' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      {/* --- Employee Modal --- */}
      <Modal isOpen={isEmpModalOpen} onClose={() => setIsEmpModalOpen(false)} title={editingId ? 'Edit Employee' : 'Register Employee'}>
        <form onSubmit={handleEmpSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. John Doe"
            value={empName}
            onChange={e => setEmpName(e.target.value)}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. john@company.com"
            value={empEmail}
            onChange={e => setEmpEmail(e.target.value)}
            required
          />
          <Select
            label="Role"
            options={[
              { value: 'Employee', label: 'Employee' },
              { value: 'Department Head', label: 'Department Head' },
              { value: 'Asset Manager', label: 'Asset Manager' },
              { value: 'Admin', label: 'Admin' }
            ]}
            value={empRole}
            onChange={e => setEmpRole(e.target.value as UserRole)}
          />
          <Select
            label="Assigned Department"
            options={departmentOptions}
            value={empDeptId}
            onChange={e => setEmpDeptId(e.target.value)}
          />
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700/20">
            <Button type="button" variant="outline" onClick={() => setIsEmpModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gradient">{editingId ? 'Save' : 'Register'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
