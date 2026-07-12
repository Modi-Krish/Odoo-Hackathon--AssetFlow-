'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, Button, Input, Select, Badge, showToast, Modal } from '@/components/UI';
import { Package, Plus, Edit2, Trash2, Search, ArrowUpDown, QrCode } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { AssetCondition, AssetStatus } from '@/types';
import Link from 'next/link';

export default function AssetsPage() {
  const { 
    assets, 
    categories, 
    departments,
    addAsset, 
    deleteAsset, 
    currentUser 
  } = useApp();

  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [sortBy, setSortBy] = useState('asset_tag'); // asset_tag, name
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Form States
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [condition, setCondition] = useState<AssetCondition>('New');
  const [location, setLocation] = useState('');
  const [bookable, setBookable] = useState(false);
  const [assetDeptId, setAssetDeptId] = useState('');

  // Open modal if action=new query parameter is present (Quick Action click helper)
  useEffect(() => {
    if (searchParams && searchParams.get('action') === 'new') {
      setIsOpen(true);
    }
  }, [searchParams]);

  // Permission Gate: Asset Managers and Admins can register assets
  const canRegister = currentUser?.role === 'Admin' || currentUser?.role === 'Asset Manager';

  const handleOpenNew = () => {
    if (!canRegister) {
      showToast('Only Admins or Asset Managers can register new assets', 'error');
      return;
    }
    setName('');
    setCategoryId(categories[0]?.id || '');
    setSerialNumber('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setPurchaseCost('');
    setCondition('New');
    setLocation('');
    setBookable(false);
    setAssetDeptId('');
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return showToast('Asset Name is required', 'error');
    if (!categoryId) return showToast('Category is required', 'error');
    if (!serialNumber.trim()) return showToast('Serial Number is required', 'error');

    // Serial unique check
    if (assets.some(a => a.serial_number.toLowerCase() === serialNumber.toLowerCase())) {
      return showToast('Serial Number must be unique', 'error');
    }

    addAsset({
      name,
      category_id: categoryId,
      serial_number: serialNumber,
      purchase_date: purchaseDate,
      purchase_cost: Number(purchaseCost) || 0,
      condition,
      location,
      bookable,
      department_id: assetDeptId || undefined
    });

    showToast('Asset registered successfully', 'success');
    setIsOpen(false);
  };

  // Filter & Sort Logic (Screen 4: Filters categories, status, and departments)
  const filteredAssets = assets
    .filter(asset => {
      const matchQuery = 
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        asset.asset_tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.serial_number.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchCat = categoryFilter ? asset.category_id === categoryFilter : true;
      const matchStatus = statusFilter ? asset.status === statusFilter : true;
      const matchDept = departmentFilter ? asset.department_id === departmentFilter : true;

      return matchQuery && matchCat && matchStatus && matchDept;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'asset_tag') {
        comparison = a.asset_tag.localeCompare(b.asset_tag);
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Select dropdown option arrays formatted matching Screen 4 layout
  const categoryOptions = [
    { value: '', label: 'Category' },
    ...categories.map(c => ({ value: c.id, label: c.name }))
  ];

  const statusOptions = [
    { value: '', label: 'Status' },
    { value: 'Available', label: 'Available' },
    { value: 'Allocated', label: 'Allocated' },
    { value: 'Under Maintenance', label: 'Maintenance' },
    { value: 'Lost', label: 'Lost' }
  ];

  const departmentOptions = [
    { value: '', label: 'Department' },
    ...departments.map(d => ({ value: d.id, label: d.name }))
  ];

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-display">
            <Package className="text-indigo-600 animate-float" size={22} />
            <span>Asset registrations and directory</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 font-bold uppercase tracking-wider">Directory list of company hardware, furniture, tools, and workspaces</p>
        </div>
        {canRegister && (
          <Button onClick={handleOpenNew} variant="primary" className="flex items-center gap-1.5 font-display uppercase tracking-wider">
            + Register Asset
          </Button>
        )}
      </div>

      {/* Screen 4: Search and Filters (Neumorphic) */}
      <div className="p-5 rounded-[24px] bg-slate-900 shadow-extruded flex flex-col md:flex-row gap-4 border-none items-center justify-between">
        {/* Search Input well */}
        <div className="w-full md:max-w-md relative">
          <Search size={15} className="absolute left-4.5 top-3.5 text-slate-400" />
          <input
            type="text"
            className="w-full pl-11 pr-5 py-3 rounded-2xl bg-slate-900 text-slate-100 text-xs font-bold border-none shadow-inset focus:outline-none focus:shadow-inset-deep focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-slate-900 placeholder:text-slate-400"
            placeholder="Search by tag, serial, or QR code.."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Screen 4 Filters list */}
        <div className="flex gap-3 w-full md:w-auto overflow-x-auto py-1 justify-end">
          <select
            className="px-4 py-2.5 rounded-2xl bg-slate-900 text-slate-100 text-xs font-bold border-none shadow-inset focus:outline-none focus:shadow-inset-deep focus:ring-2 focus:ring-indigo-600"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            {categoryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <select
            className="px-4 py-2.5 rounded-2xl bg-slate-900 text-slate-100 text-xs font-bold border-none shadow-inset focus:outline-none focus:shadow-inset-deep focus:ring-2 focus:ring-indigo-600"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <select
            className="px-4 py-2.5 rounded-2xl bg-slate-900 text-slate-100 text-xs font-bold border-none shadow-inset focus:outline-none focus:shadow-inset-deep focus:ring-2 focus:ring-indigo-600"
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
          >
            {departmentOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Screen 4 Directory Table */}
      <Card className="p-0 overflow-hidden border-none shadow-extruded">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-700/20 bg-slate-850/40 text-slate-300 font-extrabold uppercase tracking-wider select-none">
                <th className="py-4 px-6 cursor-pointer hover:text-slate-100 font-display" onClick={() => toggleSort('asset_tag')}>
                  <span className="flex items-center gap-1">Tag <ArrowUpDown size={12} /></span>
                </th>
                <th className="py-4 px-6 cursor-pointer hover:text-slate-100 font-display" onClick={() => toggleSort('name')}>
                  <span className="flex items-center gap-1">Name <ArrowUpDown size={12} /></span>
                </th>
                <th className="py-4 px-6 font-display">Category</th>
                <th className="py-4 px-6 font-display">Status</th>
                <th className="py-4 px-6 font-display">Location</th>
                {canRegister && <th className="py-4 px-6 text-right font-display">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/10 text-slate-100 font-bold">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">No assets match your current catalog filters.</td>
                </tr>
              ) : (
                filteredAssets.map(asset => {
                  const cat = categories.find(c => c.id === asset.category_id);
                  const isMaintenance = asset.status === 'Under Maintenance';
                  const displayStatus = isMaintenance ? 'Maintenance' : asset.status;
                  
                  return (
                    <tr key={asset.id} className="hover:bg-slate-850/20 transition-all">
                      <td className="py-4 px-6 text-indigo-600 font-extrabold">
                        <Link href={`/assets/${asset.id}`} className="hover:underline flex items-center gap-1.5">
                          <span>{asset.asset_tag}</span>
                          <QrCode size={12} className="text-slate-400" />
                        </Link>
                      </td>
                      <td className="py-4 px-6 text-slate-100">
                        <Link href={`/assets/${asset.id}`} className="hover:underline">{asset.name}</Link>
                      </td>
                      <td className="py-4 px-6 text-slate-300">{cat ? cat.name : 'Uncategorized'}</td>
                      <td className="py-4 px-6">
                        <Badge content={displayStatus} />
                      </td>
                      <td className="py-4 px-6 text-slate-300">{asset.location || 'HQ Floor 2'}</td>
                      {canRegister && (
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => {
                              if (confirm('Delete this asset from registry?')) {
                                deleteAsset(asset.id);
                                showToast('Asset removed from inventory', 'success');
                              }
                            }}
                            className="p-2 text-rose-600 hover:text-rose-500 hover:shadow-extruded-sm active:shadow-inset-sm rounded-full transition-all border-none bg-slate-900"
                            title="Delete Asset"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Creation Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Register New Asset">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Asset Name"
            placeholder="e.g. Dell Monitor 27 inch"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />

          <Select
            label="Asset Category"
            options={categories.map(c => ({ value: c.id, label: c.name }))}
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            required
          />

          <Input
            label="Serial Number"
            placeholder="e.g. SN-DELL-MON27"
            value={serialNumber}
            onChange={e => setSerialNumber(e.target.value)}
            required
          />

          <Input
            label="Purchase Date"
            type="date"
            value={purchaseDate}
            onChange={e => setPurchaseDate(e.target.value)}
          />

          <Input
            label="Purchase Cost ($)"
            type="number"
            placeholder="e.g. 299"
            value={purchaseCost}
            onChange={e => setPurchaseCost(e.target.value)}
          />

          <Select
            label="Current Condition"
            options={[
              { value: 'New', label: 'New' },
              { value: 'Good', label: 'Good' },
              { value: 'Fair', label: 'Fair' },
              { value: 'Poor', label: 'Poor' },
              { value: 'Broken', label: 'Broken' }
            ]}
            value={condition}
            onChange={e => setCondition(e.target.value as AssetCondition)}
          />

          <Select
            label="Assigned Department"
            options={departmentOptions}
            value={assetDeptId}
            onChange={e => setAssetDeptId(e.target.value)}
          />

          <Input
            label="Storage Location"
            placeholder="e.g. IT Inventory Room"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />

          <div className="flex items-center gap-2 pt-1 pl-0.5">
            <input
              type="checkbox"
              id="bookable"
              className="w-4 h-4 rounded bg-slate-900 border-none shadow-inset focus:ring-2 focus:ring-indigo-600"
              checked={bookable}
              onChange={e => setBookable(e.target.checked)}
            />
            <label htmlFor="bookable" className="text-xs font-bold text-slate-300 select-none">
              Mark as Bookable Shared Resource
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700/20">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient">
              Register
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
