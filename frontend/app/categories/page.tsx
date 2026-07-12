/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, Button, Input, Modal, showToast } from '@/components/UI';
import { Tags, Plus, Edit2, Trash2, ShieldAlert } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory as deleteCatAPI } from '../../services/categories';
import { AssetCategory } from '@/types';

export default function CategoriesPage() {
  const { currentUser } = useApp();
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Role Gate check: Admin / Asset Manager only
  const isAuthorized = currentUser?.role === 'admin' || currentUser?.role === 'asset_manager';

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch {
      showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadCategories();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthorized]);

  if (!isAuthorized) {
    return (
      <Card className="max-w-xl mx-auto mt-12 text-center p-8 border-rose-500/20 bg-rose-950/5">
        <ShieldAlert size={48} className="mx-auto text-rose-400 mb-4 animate-bounce" />
        <h3 className="text-lg font-bold text-slate-100 mb-2">Access Denied</h3>
        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          The Asset Category Configuration module is restricted to Admin & Asset Manager accounts only. 
          Use the profile dropdown in the top right navbar to switch to a higher role for testing.
        </p>
      </Card>
    );
  }

  const handleOpenNew = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setIsOpen(true);
  };

  const handleOpenEdit = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    if (cat) {
      setEditingId(catId);
      setName(cat.name);
      setDescription(cat.description || '');
      setIsOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Category Name is required', 'error');
      return;
    }

    try {
      if (editingId) {
        await updateCategory(editingId, { name, description });
        showToast('Category updated successfully', 'success');
      } else {
        await createCategory({ name, description });
        showToast('Category created successfully', 'success');
      }
      setIsOpen(false);
      loadCategories(); // Refresh list
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showToast(error.response?.data?.message || 'Action failed', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCatAPI(id);
        showToast('Category deleted successfully', 'success');
        loadCategories(); // Refresh list
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        showToast(error.response?.data?.message || 'Delete failed', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Tags className="text-indigo-400" size={22} />
            <span>Asset Categories</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Define classifications for registering company physical assets and bookable spaces.</p>
        </div>
        <Button onClick={handleOpenNew} variant="gradient" className="flex items-center gap-1.5">
          <Plus size={16} /> Add Category
        </Button>
      </div>

      {/* Categories Grid List */}
      {loading ? (
        <div className="text-slate-400 p-8 text-center">Loading categories...</div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <Card key={cat.id} className="flex flex-col justify-between h-40">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs uppercase">
                  {cat.name.substring(0, 2)}
                </div>
                <h3 className="font-bold text-slate-200 text-sm">{cat.name}</h3>
              </div>
              <p className="text-xs text-slate-400 mt-3.5 leading-relaxed line-clamp-2">
                {cat.description || 'No description provided.'}
              </p>
            </div>

            <div className="border-t border-slate-800/80 pt-3 mt-auto flex items-center justify-end gap-2">
              <Button 
                onClick={() => handleOpenEdit(cat.id)} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1 text-slate-300"
              >
                <Edit2 size={11} /> Edit
              </Button>
              <Button 
                onClick={() => handleDelete(cat.id)} 
                variant="ghost" 
                size="sm"
                className="flex items-center gap-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
              >
                <Trash2 size={11} /> Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
      )}

      {/* Add/Edit Category Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title={editingId ? 'Edit Asset Category' : 'Create Asset Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Electronics, Furniture"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />

          <div className="w-full">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 tracking-wider uppercase">
              Description
            </label>
            <textarea
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 text-sm transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 h-24 resize-none"
              placeholder="Provide detail about what this category includes..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

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
