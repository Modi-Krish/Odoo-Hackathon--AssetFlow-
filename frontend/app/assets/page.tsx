'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, Button, Input, Select, Badge, Modal, showToast } from '@/components/UI';
import { Package, Search, Filter, ArrowUpDown, Plus, Eye, Wrench, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AssetCondition, Asset, AssetCategory } from '@/types';
import { getAssets, createAsset } from '../../services/assets';
import { getCategories } from '../../services/categories';

export default function AssetsPage() {
  const { currentUser } = useApp();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('asset_tag'); // asset_tag, name, purchase_cost
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

  // Open modal if action=new query parameter is present (Quick Action click helper)
  useEffect(() => {
    if (searchParams && searchParams.get('action') === 'new') {
      setIsOpen(true);
    }
  }, [searchParams]);

  // Permission Gate: Asset Managers and Admins can register assets
  const canRegister = currentUser?.role === 'admin' || currentUser?.role === 'asset_manager' || currentUser?.role === 'Admin' || currentUser?.role === 'Asset Manager';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assetsData, catsData] = await Promise.all([
        getAssets(),
        getCategories()
      ]);
      setAssets(assetsData);
      setCategories(catsData);
    } catch (err) {
      showToast('Failed to load asset data', 'error');
    } finally {
      setLoading(false);
    }
  };

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
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return showToast('Asset Name is required', 'error');
    if (!categoryId) return showToast('Category is required', 'error');
    if (!serialNumber.trim()) return showToast('Serial Number is required', 'error');

    try {
      await createAsset({
        name,
        category_id: categoryId,
        serial_number: serialNumber,
        purchase_date: purchaseDate,
        purchase_cost: Number(purchaseCost) || 0,
        condition,
        location,
        bookable
      });

      showToast('Asset registered successfully', 'success');
      setIsOpen(false);
      loadData(); // Refresh table
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to register asset', 'error');
    }
  };

  // Filter & Sort Logic
  const filteredAssets = assets
    .filter(asset => {
      const matchQuery = 
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        asset.asset_tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.serial_number.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchCat = categoryFilter ? asset.category_id === categoryFilter : true;
      const matchStatus = statusFilter ? asset.status === statusFilter : true;

      return matchQuery && matchCat && matchStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'asset_tag') {
        comparison = a.asset_tag.localeCompare(b.asset_tag);
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'purchase_cost') {
        comparison = a.purchase_cost - b.purchase_cost;
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

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Available', label: 'Available' },
    { value: 'Allocated', label: 'Allocated' },
    { value: 'Reserved', label: 'Reserved' },
    { value: 'Under Maintenance', label: 'Under Maintenance' },
    { value: 'Lost', label: 'Lost' },
    { value: 'Retired', label: 'Retired' },
    { value: 'Disposed', label: 'Disposed' }
  ];

  const catOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map(c => ({ value: c.id, label: c.name }))
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Package className="text-indigo-400" size={22} />
            <span>Asset Catalog</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Directory list of company hardware, furniture, tools, and bookable spaces.</p>
        </div>
        {canRegister && (
          <Button onClick={handleOpenNew} variant="gradient" className="flex items-center gap-1.5">
            <Plus size={16} /> Register Asset
          </Button>
        )}
      </div>

      {/* Search and Filters Card */}
      <Card className="p-4 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
          <input
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 text-xs font-semibold focus:outline-none focus:border-indigo-500"
            placeholder="Search by tag, name, or serial number..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <select
            className="px-4 py-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 text-xs font-semibold focus:outline-none"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            {catOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <select
            className="px-4 py-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 text-xs font-semibold focus:outline-none"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </Card>

      {/* Directory Table */}
      <Card className="p-0 overflow-hidden border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 font-bold uppercase tracking-wider select-none">
                <th className="py-4 px-6 cursor-pointer hover:text-slate-200" onClick={() => toggleSort('asset_tag')}>
                  <span className="flex items-center gap-1">Asset Tag <ArrowUpDown size={12} /></span>
                </th>
                <th className="py-4 px-6 cursor-pointer hover:text-slate-200" onClick={() => toggleSort('name')}>
                  <span className="flex items-center gap-1">Name <ArrowUpDown size={12} /></span>
                </th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Condition</th>
                <th className="py-4 px-6">Location</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-sm font-semibold">
                    Loading assets...
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-sm font-semibold">
                    No assets matched search queries.
                  </td>
                </tr>
              ) : (
                filteredAssets.map(asset => {
                  const cat = categories.find(c => c.id === asset.category_id);
                  return (
                    <tr key={asset.id} className="hover:bg-slate-900/20 transition-all">
                      <td className="py-4 px-6 font-bold text-indigo-400">{asset.asset_tag}</td>
                      <td className="py-4 px-6 font-bold text-slate-100">{asset.name}</td>
                      <td className="py-4 px-6 text-slate-400">{cat ? cat.name : 'Unknown'}</td>
                      <td className="py-4 px-6">{asset.condition}</td>
                      <td className="py-4 px-6 text-slate-400">{asset.location}</td>
                      <td className="py-4 px-6 text-center">
                        <Badge content={asset.status} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link 
                          href={`/assets/${asset.id}`} 
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-300 hover:text-indigo-400 bg-slate-900 px-3 py-1.5 border border-slate-800 hover:border-indigo-500/30 rounded-lg transition-all"
                        >
                          <Eye size={12} /> Detail
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Asset Registration Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Register Asset">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Asset Name"
            placeholder="e.g. Dell Curved 34-inch Monitor"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />

          <Select
            label="Category"
            options={categories.map(c => ({ value: c.id, label: c.name }))}
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            required
          />

          <Input
            label="Serial Number (Unique)"
            placeholder="e.g. SN-8822-CURV"
            value={serialNumber}
            onChange={e => setSerialNumber(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Acquisition Date"
              type="date"
              value={purchaseDate}
              onChange={e => setPurchaseDate(e.target.value)}
            />
            <Input
              label="Purchase Cost ($)"
              type="number"
              placeholder="e.g. 599"
              value={purchaseCost}
              onChange={e => setPurchaseCost(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Initial Condition"
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
            <Input
              label="Location"
              placeholder="e.g. Floor 2 Cabinet C"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              id="bookable"
              className="w-4 h-4 text-indigo-600 border-slate-800 bg-slate-950 rounded focus:ring-indigo-500"
              checked={bookable}
              onChange={e => setBookable(e.target.checked)}
            />
            <label htmlFor="bookable" className="text-xs text-slate-300 font-semibold cursor-pointer">
              Shared resource (Available for calendar slot booking)
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
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
