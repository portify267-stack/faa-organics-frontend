import React, { useState, useMemo, useEffect } from 'react';
import CategoryModal from '../components/CategoryModal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCategories
} from '../components/AdminIcons';
import { initialCategories } from '../data/mockData';
import { categoryService } from '../../services/api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState(null); // { type: 'success' | 'error', text: '' }
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Sort categories: Soap first, Combo second, then others
  const sortCategories = (cats) => {
    return [...cats].sort((a, b) => {
      const aName = (a?.name || '').toLowerCase();
      const bName = (b?.name || '').toLowerCase();
      if (aName === 'soap' || aName === 'soaps') return -1;
      if (bName === 'soap' || bName === 'soaps') return 1;
      if (aName === 'combo') return -1;
      if (bName === 'combo') return 1;
      return (a?.displayOrder || 99) - (b?.displayOrder || 99);
    });
  };

  // Normalize category object from backend / fallback
  const normalizeCategory = (cat) => ({
    _id: cat._id || cat.id,
    id: cat._id || cat.id,
    name: cat.name || '',
    slug: cat.slug || '',
    description: cat.description || '',
    displayOrder: cat.displayOrder || 99,
    image:
      (typeof cat.image === 'object' && cat.image?.url)
        ? cat.image.url
        : typeof cat.image === 'string' && cat.image
        ? cat.image
        : '/assets/images/img11.jpeg',
    status: cat.status
      ? cat.status.toLowerCase() === 'active'
        ? 'Active'
        : 'Inactive'
      : cat.isActive === false
      ? 'Inactive'
      : 'Active',
    productCount: cat.productCount !== undefined ? cat.productCount : 0,
  });

  // Fetch categories from backend API
  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await categoryService.getAll();
      const list = Array.isArray(data) ? data : data.categories || [];
      if (list && list.length > 0) {
        const filtered = list.filter((c) => {
          const n = (c?.name || '').toLowerCase();
          return !n.includes('lip care') && !n.includes('hair care');
        });
        setCategories(sortCategories(filtered.map(normalizeCategory)));
      } else {
        // Fallback to mock categories if backend returns empty collection
        setCategories(sortCategories(initialCategories.map(normalizeCategory)));
      }
    } catch (err) {
      console.warn('Backend categories fetch failed, using fallback:', err.message);
      if (err.response?.status === 401) {
        setError('Admin session has expired. Please log in again to manage categories.');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('token');
        setTimeout(() => {
          if (typeof window !== 'undefined') window.location.href = '/admin/login';
        }, 1500);
      } else {
        setError('Could not connect to backend categories API. Showing local data.');
      }
      setCategories(sortCategories(initialCategories.map(normalizeCategory)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const list = Array.isArray(categories) ? categories : [];
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (c) =>
        c &&
        (String(c.name || '').toLowerCase().includes(q) ||
          (c.description && String(c.description).toLowerCase().includes(q)) ||
          (c.slug && String(c.slug).toLowerCase().includes(q)))
    );
  }, [categories, searchQuery]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  // Create or Update Category via real Backend API
  const handleSaveCategory = async (catData) => {
    setSubmitting(true);
    setActionMessage(null);

    const payload = {
      name: catData.name.trim(),
      description: catData.description ? catData.description.trim() : '',
      status: catData.status ? catData.status.toLowerCase() : 'active',
      image: catData.image || '',
    };

    try {
      if (editingCategory && (editingCategory._id || editingCategory.id)) {
        const targetId = editingCategory._id || editingCategory.id;
        const updated = await categoryService.update(targetId, payload);
        const norm = normalizeCategory(updated || { ...editingCategory, ...catData });
        setCategories((prev) =>
          prev.map((c) => (c._id === targetId || c.id === targetId ? norm : c))
        );
        setActionMessage({
          type: 'success',
          text: `Category "${norm.name}" updated successfully.`,
        });
      } else {
        const created = await categoryService.create(payload);
        const norm = normalizeCategory(created || { ...catData, _id: `cat-${Date.now()}` });
        setCategories((prev) => [norm, ...prev]);
        setActionMessage({
          type: 'success',
          text: `Category "${norm.name}" created successfully.`,
        });
      }
      try {
        localStorage.removeItem('faa_live_categories_cache');
        localStorage.removeItem('faa_live_products_cache');
      } catch {}
      setIsModalOpen(false);
      // Immediately trigger fresh sync in background
      fetchCategories();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to save category to backend.';
      setActionMessage({ type: 'error', text: msg });
      // Keep optimistic UI update as fallback if user is previewing offline
      if (editingCategory) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === catData.id || c._id === catData._id ? normalizeCategory(catData) : c
          )
        );
      } else {
        setCategories((prev) => [normalizeCategory(catData), ...prev]);
      }
      setIsModalOpen(false);
    } finally {
      setSubmitting(false);
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  // Delete Category via real Backend API
  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    const targetId = deletingCategory._id || deletingCategory.id;
    setActionMessage(null);

    try {
      await categoryService.delete(targetId);
      setCategories((prev) => prev.filter((c) => c._id !== targetId && c.id !== targetId));
      setActionMessage({
        type: 'success',
        text: `Category "${deletingCategory.name}" deleted successfully.`,
      });
      try {
        localStorage.removeItem('faa_live_categories_cache');
        localStorage.removeItem('faa_live_products_cache');
      } catch {}
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        `Could not delete category "${deletingCategory.name}".`;
      setActionMessage({ type: 'error', text: msg });
      console.error('Delete category error:', err);
    } finally {
      setDeletingCategory(null);
      // Immediately trigger fresh sync in background
      fetchCategories();
      setTimeout(() => setActionMessage(null), 6000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2e2a26]">
            Category Management
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Organize products into botanical formulations: Soaps, Creams, Oils, and Herbal Powders.
          </p>
        </div>
        <div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-[#3a4d39] text-white hover:bg-[#2d3d2c] shadow-sm transition-colors inline-flex items-center gap-2"
          >
            <IconPlus className="w-4 h-4" />
            <span>Add New Category</span>
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-between transition-all ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                actionMessage.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-stone-400 hover:text-stone-700 font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Error / Connection Notice */}
      {error && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchCategories}
            className="underline font-semibold text-amber-900 ml-2 hover:text-amber-950"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Search Bar & Total */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="w-full sm:w-80 relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">
            <IconSearch className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search category name or slug..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#3a4d39]"
          />
        </div>
        <div className="text-xs text-stone-500 hidden sm:block">
          Total Categories:{' '}
          <span className="font-semibold text-stone-800">{categories.length}</span>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 animate-pulse"
            >
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-2xl bg-stone-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-stone-200 rounded w-3/4" />
                  <div className="h-3 bg-stone-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-10 bg-stone-100 rounded" />
            </div>
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FAF6F0] flex items-center justify-center text-stone-400 mb-3">
            <IconCategories className="w-7 h-7" />
          </div>
          <h3 className="text-base font-serif font-bold text-stone-800">No categories found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
            No category matched your search query. Try typing another name.
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="px-4 py-2 rounded-xl bg-[#3a4d39] text-white text-xs font-medium hover:bg-[#2d3d2c]"
          >
            Reset Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat) => (
            <div
              key={cat._id || cat.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#FAF6F0] border border-stone-200 flex-shrink-0">
                    <img
                      src={cat.image || '/uploads/img11.jpeg'}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/uploads/img1.jpeg';
                      }}
                    />
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge type="order" status={cat.status || 'Active'} />
                    <span className="text-[11px] font-mono text-stone-400">
                      /{cat.slug || cat._id || cat.id}
                    </span>
                  </div>
                </div>

                <h3 className="font-serif text-lg font-bold text-[#2e2a26] mb-1">
                  {cat.name}
                </h3>
                <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                  {cat.description || 'Natural skincare category for organic beauty solutions.'}
                </p>
              </div>

              {/* Bottom footer bar */}
              <div className="px-5 py-3.5 bg-[#FAF6F0]/60 border-t border-stone-200/70 flex items-center justify-between">
                <span className="text-xs font-medium text-stone-600">
                  <strong className="text-stone-900">{cat.productCount || 0}</strong> Products
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-white transition-colors"
                    title="Edit Category"
                  >
                    <IconEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingCategory(cat)}
                    className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Category"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
        onSave={handleSaveCategory}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete the category "${deletingCategory?.name}"? If products are linked to this category, deletion will be blocked.`}
        confirmLabel="Yes, Delete"
        isDestructive={true}
      />
    </div>
  );
}
