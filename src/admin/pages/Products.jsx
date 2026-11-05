import React, { useState, useMemo, useEffect } from 'react';
import ProductModal from '../components/ProductModal';
import ProductIngredientsModal from '../components/ProductIngredientsModal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconEye,
  IconProducts
} from '../components/AdminIcons';
import { initialProducts, initialCategories, getStockStatus } from '../data/mockData';
import { productService, categoryService } from '../../services/api';

export default function Products() {
  const getInitialProducts = () => {
    try {
      const cached = sessionStorage.getItem('faa_admin_products_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  };

  const getInitialCategories = () => {
    try {
      const cached = sessionStorage.getItem('faa_admin_categories_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialCategories;
  };

  const [products, setProducts] = useState(getInitialProducts);
  const [categories, setCategories] = useState(getInitialCategories);
  const [loading, setLoading] = useState(() => getInitialProducts().length === 0);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [viewingIngredientsProduct, setViewingIngredientsProduct] = useState(null);

  // Map Backend Product -> Frontend Model
  const mapBackendProductToFrontend = (p) => {
    const primaryUrl =
      (Array.isArray(p.images) &&
        p.images.length > 0 &&
        (p.images.find((img) => img.isPrimary)?.url || p.images[0]?.url)) ||
      (typeof p.image === 'string' && p.image ? p.image : '') ||
      '/uploads/img11.jpeg';

    const categoryId =
      typeof p.category === 'object' && p.category?._id
        ? p.category._id
        : p.category || '';

    const categoryName =
      typeof p.category === 'object' && p.category?.name
        ? p.category.name
        : '';

    return {
      id: p._id || p.id,
      _id: p._id || p.id,
      name: p.name || '',
      category: categoryId,
      categoryName: categoryName,
      price: Number(p.price) || 0,
      weight: p.unit || p.weight || '100 g',
      unit: p.unit || p.weight || '100 g',
      stock:
        p.stockQuantity !== undefined
          ? Number(p.stockQuantity)
          : Number(p.stock) || 0,
      stockQuantity:
        p.stockQuantity !== undefined
          ? Number(p.stockQuantity)
          : Number(p.stock) || 0,
      image: primaryUrl,
      images: p.images || [{ url: primaryUrl, alt: p.name || '', isPrimary: true }],
      description: p.description || '',
      // Skincare 5 details
      subtitle: p.subtitle || '',
      keyIngredients: p.keyIngredients || '',
      benefits: p.benefits || '',
      howToUse: p.howToUse || '',
      suitability: p.suitability || '',
      status: p.status || 'active',
    };
  };

  // Build Backend Payload from form data
  const buildBackendProductPayload = (productData, categoriesList) => {
    let categoryId = productData.category;
    if (categoriesList && categoriesList.length > 0) {
      const matched = categoriesList.find(
        (c) =>
          c._id === productData.category ||
          c.id === productData.category ||
          c.slug === productData.category
      );
      if (matched?._id) {
        categoryId = matched._id;
      }
    }

    const primaryImage = productData.image || '/assets/images/img11.jpeg';

    return {
      name: productData.name.trim(),
      description:
        productData.description?.trim() ||
        `${productData.name.trim()} - Handcrafted organic botanical skincare.`,
      price: Number(productData.price),
      category: categoryId,
      stockQuantity: Number(productData.stock ?? productData.stockQuantity ?? 0),
      unit: productData.weight?.trim() || productData.unit?.trim() || '100 g',
      images: [
        {
          url: primaryImage,
          alt: productData.name.trim(),
          isPrimary: true,
        },
      ],
      // The 5 skincare formulation fields
      subtitle: productData.subtitle ? productData.subtitle.trim() : '',
      keyIngredients: productData.keyIngredients
        ? productData.keyIngredients.trim()
        : '',
      benefits: productData.benefits ? productData.benefits.trim() : '',
      howToUse: productData.howToUse ? productData.howToUse.trim() : '',
      suitability: productData.suitability ? productData.suitability.trim() : '',
    };
  };

  // Fetch Products & Categories from Backend API
  const fetchData = async () => {
    setLoading(true);
    setError('');

    // Fetch categories first or parallel
    try {
      const [prodRes, catRes] = await Promise.allSettled([
        productService.getAll({ limit: 100 }),
        categoryService.getAll(),
      ]);

      // Handle categories (Soap first, Combo second, no Lip/Hair Care)
      if (catRes.status === 'fulfilled') {
        const rawCats = Array.isArray(catRes.value)
          ? catRes.value
          : catRes.value?.categories || [];
        const filtered = rawCats.filter((c) => {
          const n = (c?.name || '').toLowerCase();
          return !n.includes('lip care') && !n.includes('hair care');
        });
        const sorted = [...filtered].sort((a, b) => {
          const aName = (a?.name || '').toLowerCase();
          const bName = (b?.name || '').toLowerCase();
          if (aName === 'soap' || aName === 'soaps') return -1;
          if (bName === 'soap' || bName === 'soaps') return 1;
          if (aName === 'combo') return -1;
          if (bName === 'combo') return 1;
          return (a?.displayOrder || 99) - (b?.displayOrder || 99);
        });

        const catList =
          sorted.length > 0
            ? sorted.map((c) => ({
                _id: c._id || c.id,
                id: c._id || c.id,
                name: c.name,
                slug: c.slug || '',
                displayOrder: c.displayOrder || 99,
              }))
            : initialCategories;
        setCategories(catList);
        try {
          sessionStorage.setItem('faa_admin_categories_cache', JSON.stringify(catList));
        } catch {}
      } else {
        setCategories(initialCategories);
      }

      // Handle products
      if (prodRes.status === 'fulfilled') {
        const prodList = Array.isArray(prodRes.value)
          ? prodRes.value
          : prodRes.value?.products || [];
        if (prodList.length > 0) {
          const mapped = prodList.map(mapBackendProductToFrontend);
          setProducts(mapped);
          try {
            sessionStorage.setItem('faa_admin_products_cache', JSON.stringify(mapped));
          } catch {}
        } else {
          setProducts(initialProducts.map(mapBackendProductToFrontend));
        }
      } else {
        console.warn('Backend products fetch failed, using fallback:', prodRes.reason?.message);
        if (prodRes.reason?.response?.status === 401) {
          setError('Admin session has expired. Please log in again to manage products.');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('token');
          setTimeout(() => {
            if (typeof window !== 'undefined') window.location.href = '/admin/login';
          }, 1500);
        } else {
          setError('Could not connect to backend products API. Showing local data.');
        }
        setProducts(initialProducts.map(mapBackendProductToFrontend));
      }
    } catch (err) {
      console.warn('Backend fetch error:', err);
      setError('Unable to load catalog from server. Local preview data active.');
      setProducts(initialProducts.map(mapBackendProductToFrontend));
      setCategories(initialCategories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper to resolve category display name
  const getCategoryName = (catIdOrSlug, fallbackName = '') => {
    if (fallbackName && typeof fallbackName === 'string') return fallbackName;
    if (!catIdOrSlug) return 'Skincare';
    const catList = Array.isArray(categories) ? categories : [];
    const found = catList.find(
      (c) =>
        c &&
        (c._id === catIdOrSlug ||
          c.id === catIdOrSlug ||
          c.slug === catIdOrSlug)
    );
    return (
      found?.name ||
      found?.label ||
      (typeof catIdOrSlug === 'string' && catIdOrSlug.length > 20
        ? 'Skincare'
        : String(catIdOrSlug))
    );
  };

  // Filtered products list
  const filteredProducts = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    const catList = Array.isArray(categories) ? categories : [];
    const query = (searchQuery || '').trim().toLowerCase();

    return list.filter((p) => {
      if (!p) return false;
      const name = String(p.name || '').toLowerCase();
      const desc = String(p.description || '').toLowerCase();
      const sub = String(p.subtitle || '').toLowerCase();

      const matchSearch =
        !query ||
        name.includes(query) ||
        desc.includes(query) ||
        sub.includes(query);

      let matchCategory = categoryFilter === 'All';
      if (!matchCategory) {
        matchCategory =
          p.category === categoryFilter ||
          p.categoryName === categoryFilter ||
          catList.some(
            (c) =>
              c &&
              (c._id === categoryFilter || c.id === categoryFilter || c.slug === categoryFilter) &&
              (c._id === p.category || c.id === p.category || c.slug === p.category)
          );
      }

      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, categoryFilter, categories]);

  // Modals Handlers
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  // Save product to real backend (Create / Update)
  const handleSaveProduct = async (productData) => {
    setActionMessage(null);
    const targetId = editingProduct ? editingProduct._id || editingProduct.id : null;
    const payload = buildBackendProductPayload(productData, categories);

    try {
      if (editingProduct && targetId) {
        const updated = await productService.update(targetId, payload);
        const norm = mapBackendProductToFrontend(
          updated || { ...editingProduct, ...productData, _id: targetId }
        );
        setProducts((prev) => {
          const nextList = prev.map((p) => (p._id === targetId || p.id === targetId ? norm : p));
          try {
            sessionStorage.setItem('faa_admin_products_cache', JSON.stringify(nextList));
          } catch {}
          return nextList;
        });
        setActionMessage({
          type: 'success',
          text: `Product "${norm.name}" updated successfully.`,
        });
      } else {
        const created = await productService.create(payload);
        const norm = mapBackendProductToFrontend(
          created || { ...productData, _id: `product-${Date.now()}` }
        );
        setProducts((prev) => {
          const nextList = [norm, ...prev];
          try {
            sessionStorage.setItem('faa_admin_products_cache', JSON.stringify(nextList));
          } catch {}
          return nextList;
        });
        setActionMessage({
          type: 'success',
          text: `Product "${norm.name}" created successfully.`,
        });
      }
      try {
        localStorage.removeItem('faa_live_products_cache');
      } catch {}
      setIsModalOpen(false);
      // Immediately trigger fresh sync in background
      fetchData();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to save product to backend.';
      setActionMessage({ type: 'error', text: msg });
      // Keep optimistic update for preview
      if (editingProduct && targetId) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === targetId || p._id === targetId
              ? mapBackendProductToFrontend({ ...productData, _id: targetId })
              : p
          )
        );
      } else {
        setProducts((prev) => [
          mapBackendProductToFrontend({ ...productData, _id: `prod-${Date.now()}` }),
          ...prev,
        ]);
      }
      setIsModalOpen(false);
    } finally {
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  // Delete product from real backend
  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    const targetId = deletingProduct._id || deletingProduct.id;
    setActionMessage(null);

    try {
      await productService.delete(targetId);
      setProducts((prev) => {
        const nextList = prev.filter((p) => p._id !== targetId && p.id !== targetId);
        try {
          sessionStorage.setItem('faa_admin_products_cache', JSON.stringify(nextList));
        } catch {}
        return nextList;
      });
      setActionMessage({
        type: 'success',
        text: `Product "${deletingProduct.name}" removed successfully.`,
      });
      try {
        localStorage.removeItem('faa_live_products_cache');
      } catch {}
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        `Could not delete product "${deletingProduct.name}".`;
      setActionMessage({ type: 'error', text: msg });
      console.error('Delete product error:', err);
    } finally {
      setDeletingProduct(null);
      // Immediately trigger fresh sync in background
      fetchData();
      setTimeout(() => setActionMessage(null), 6000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2e2a26]">
            Product Catalog
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Manage your artisanal skincare formulations, automatic stock statuses, and ingredients.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-[#3a4d39] text-white hover:bg-[#2d3d2c] shadow-sm transition-colors inline-flex items-center gap-2"
          >
            <IconPlus className="w-4 h-4" />
            <span>Add New Product</span>
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

      {/* Backend Connection Notice (genuine offline failure only) */}
      {error && !loading && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchData}
            className="underline font-semibold text-amber-900 ml-2 hover:text-amber-950"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Search, Filter & View Controls */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="w-full md:w-80 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">
              <IconSearch className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name or subtitle..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#3a4d39]"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex-1 md:flex-initial px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#3a4d39]"
            >
              <option value="All">All Categories ({Array.isArray(products) ? products.length : 0})</option>
              {(Array.isArray(categories) ? categories : []).map((c) => {
                const optVal = c?._id || c?.id || c?.slug || `cat-${c?.name}`;
                return (
                  <option key={optVal} value={optVal}>
                    {c?.name || 'Category'}
                  </option>
                );
              })}
            </select>

            {/* View Mode Toggle */}
            <div className="inline-flex rounded-xl border border-stone-200 p-1 bg-[#FAF6F0]">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-[#3a4d39] shadow-sm'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-white text-[#3a4d39] shadow-sm'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Cards
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm space-y-4 animate-pulse">
          <div className="h-6 bg-stone-200 rounded w-1/4 mb-4" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-stone-100">
              <div className="w-12 h-12 bg-stone-200 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-stone-200 rounded w-1/3" />
                <div className="h-3 bg-stone-100 rounded w-1/5" />
              </div>
              <div className="w-20 h-4 bg-stone-100 rounded" />
              <div className="w-24 h-4 bg-stone-200 rounded" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FAF6F0] flex items-center justify-center text-stone-400 mb-3">
            <IconProducts className="w-7 h-7" />
          </div>
          <h3 className="text-base font-serif font-bold text-stone-800">No products found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
            No skincare products match your search or selected category filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('All');
            }}
            className="px-4 py-2 rounded-xl bg-[#3a4d39] text-white text-xs font-medium hover:bg-[#2d3d2c]"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF6F0] text-stone-600 text-xs uppercase tracking-wider border-b border-stone-200 font-medium">
                <tr>
                  <th className="py-3.5 px-4">Product Image</th>
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Weight</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock Quantity</th>
                  <th className="py-3.5 px-4">Stock Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock);
                  return (
                    <tr key={product._id || product.id} className="hover:bg-stone-50/70 transition-colors">
                      {/* Product Image */}
                      <td className="py-3.5 px-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover border border-stone-200 bg-stone-50 flex-shrink-0 shadow-xs"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/uploads/img1.jpeg';
                          }}
                        />
                      </td>

                      {/* Product Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-stone-900 max-w-xs">{product.name}</div>
                        {product.subtitle && (
                          <div className="text-[11px] text-stone-500 font-serif italic line-clamp-1">
                            {product.subtitle}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="capitalize text-xs font-medium text-stone-700 bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200">
                          {getCategoryName(product.category, product.categoryName)}
                        </span>
                      </td>

                      {/* Weight */}
                      <td className="py-3.5 px-4 text-xs text-stone-600 whitespace-nowrap">
                        {product.weight || '100 g'}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-bold text-stone-900 whitespace-nowrap">
                        ₹{product.price}
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                        <span className={`font-semibold ${Number(product.stock) === 0 ? 'text-rose-700' : 'text-stone-800'}`}>
                          {product.stock} units
                        </span>
                      </td>

                      {/* Stock Status (Auto calculated) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge type="product" status={stockStatus} />
                      </td>

                      {/* Actions: View Ingredients & Details, Edit, Delete */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* View Ingredients & Details Button */}
                          <button
                            onClick={() => setViewingIngredientsProduct(product)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-medium text-stone-700 hover:text-[#3a4d39] hover:bg-[#FAF6F0] transition-colors"
                            title="View Ingredients & Details"
                          >
                            <IconEye className="w-3.5 h-3.5 text-[#3a4d39]" />
                            <span className="hidden xl:inline">Ingredients &amp; Details</span>
                            <span className="xl:hidden">Details</span>
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-[#FAF6F0] transition-colors"
                            title="Edit Product"
                          >
                            <IconEdit className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => setDeletingProduct(product)}
                            className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Product"
                          >
                            <IconTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product.stock);
            return (
              <div
                key={product._id || product.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="relative aspect-square bg-[#FAF6F0] overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/uploads/img1.jpeg';
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <StatusBadge type="product" status={stockStatus} />
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#8a9b7c] tracking-wider">
                      {getCategoryName(product.category, product.categoryName)}
                    </span>
                    <h4 className="font-serif font-bold text-base text-[#2e2a26] mt-0.5 line-clamp-1">
                      {product.name}
                    </h4>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-stone-100 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-base font-bold text-[#2e2a26]">₹{product.price}</span>
                        <span className="text-stone-400 ml-1">({product.weight})</span>
                      </div>
                      <span className={Number(product.stock) === 0 ? 'text-rose-600 font-semibold' : 'text-stone-600 font-medium'}>
                        {product.stock} in stock
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1.5 pt-1">
                      <button
                        onClick={() => setViewingIngredientsProduct(product)}
                        className="flex-1 py-1.5 px-2 rounded-lg border border-stone-300 text-[11px] font-medium text-stone-700 hover:bg-[#FAF6F0] inline-flex items-center justify-center gap-1"
                      >
                        <IconEye className="w-3 h-3 text-[#3a4d39]" />
                        <span>Ingredients</span>
                      </button>
                      <button
                        onClick={() => handleOpenEdit(product)}
                        className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-[#FAF6F0]"
                        title="Edit"
                      >
                        <IconEdit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingProduct(product)}
                        className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete"
                      >
                        <IconTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
        categories={categories}
        onSave={handleSaveProduct}
      />

      {/* View Ingredients & Details Modal */}
      <ProductIngredientsModal
        isOpen={!!viewingIngredientsProduct}
        onClose={() => setViewingIngredientsProduct(null)}
        product={viewingIngredientsProduct}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteProduct}
        title="Delete Product"
        message={`Are you sure you want to remove "${deletingProduct?.name}" from the product catalog?`}
        confirmLabel="Yes, Delete Product"
        isDestructive={true}
      />
    </div>
  );
}
