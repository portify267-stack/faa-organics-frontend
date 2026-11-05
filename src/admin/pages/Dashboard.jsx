import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardCard from '../components/DashboardCard';
import {
  IconProducts,
  IconCategories,
  IconOrders
} from '../components/AdminIcons';
import { productService, categoryService } from '../../services/api';
import { initialProducts, initialCategories } from '../data/mockData';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
  });

  // Fetch actual backend product and category counts
  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      const [productsRes, categoriesRes] = await Promise.allSettled([
        productService.getAll({ limit: 100 }),
        categoryService.getAll(),
      ]);

      let totalProducts = 0;
      if (productsRes.status === 'fulfilled' && productsRes.value) {
        const pList = Array.isArray(productsRes.value)
          ? productsRes.value
          : productsRes.value?.products || [];
        totalProducts = pList.length;
      } else {
        totalProducts = initialProducts.length;
      }

      let totalCategories = 0;
      if (categoriesRes.status === 'fulfilled' && categoriesRes.value) {
        const cList = Array.isArray(categoriesRes.value)
          ? categoriesRes.value
          : categoriesRes.value?.categories || [];
        totalCategories = cList.length;
      } else {
        totalCategories = initialCategories.length;
      }

      setStats({
        totalProducts,
        totalCategories,
      });

      if (productsRes.status === 'rejected' || categoriesRes.status === 'rejected') {
        const prodErr = productsRes.status === 'rejected' ? productsRes.reason : null;
        const catErr = categoriesRes.status === 'rejected' ? categoriesRes.reason : null;
        const errObj = prodErr || catErr;

        if (errObj?.response?.status === 401) {
          setError('Admin session has expired. Please log in again to sync live data.');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('token');
          setTimeout(() => {
            if (typeof window !== 'undefined') window.location.href = '/admin/login';
          }, 1500);
        } else {
          setError('Using local catalog preview. Backend connection will auto-sync when online.');
        }
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
      setError('Unable to load live catalog counts from server. Showing local preview.');
      setStats({
        totalProducts: initialProducts.length,
        totalCategories: initialCategories.length,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2e2a26]">
            Store Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Overview of your handcrafted skincare boutique.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/products"
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-[#FAF6F0] text-[#3a4d39] border border-stone-300 hover:bg-[#f3ece2] transition-colors"
          >
            Manage Products
          </Link>
          <Link
            to="/admin/categories"
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-[#FAF6F0] text-[#3a4d39] border border-stone-300 hover:bg-[#f3ece2] transition-colors"
          >
            Manage Categories
          </Link>
          <Link
            to="/admin/orders"
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-[#3a4d39] text-white hover:bg-[#2d3d2c] shadow-sm transition-colors"
          >
            View Orders
          </Link>
        </div>
      </div>

      {/* Backend Connection Notice if offline */}
      {error && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchDashboardData}
            className="underline font-semibold text-amber-900 ml-2 hover:text-amber-950"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Exactly TWO Summary Cards as required */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Card 1: Total Number of Products */}
        <DashboardCard
          title="Total Number of Products"
          value={loading ? '...' : stats.totalProducts}
          subtext="Artisanal skincare formulations"
          icon={<IconProducts className="w-5 h-5 text-[#3a4d39]" />}
        />

        {/* Card 2: Total Number of Categories */}
        <DashboardCard
          title="Total Number of Categories"
          value={loading ? '...' : stats.totalCategories}
          subtext="Handcrafted botanical lines"
          icon={<IconCategories className="w-5 h-5 text-[#3a4d39]" />}
        />
      </div>

      {/* Quick Navigation Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-serif font-bold text-stone-800">
          Quick Management
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Products Shortcut */}
          <Link
            to="/admin/products"
            className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-[#3a4d39]/40 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FAF6F0] flex items-center justify-center text-[#3a4d39] group-hover:bg-[#3a4d39] group-hover:text-white transition-colors">
                <IconProducts className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-stone-900 group-hover:text-[#3a4d39] transition-colors">
                  Product Catalog
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Add new products, adjust stock quantities, and edit ingredients.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-medium text-[#3a4d39]">
              <span>Go to Products</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          {/* Categories Shortcut */}
          <Link
            to="/admin/categories"
            className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-[#3a4d39]/40 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FAF6F0] flex items-center justify-center text-[#3a4d39] group-hover:bg-[#3a4d39] group-hover:text-white transition-colors">
                <IconCategories className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-stone-900 group-hover:text-[#3a4d39] transition-colors">
                  Product Categories
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Manage skincare categories, herbal lines, and category banners.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-medium text-[#3a4d39]">
              <span>Go to Categories</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          {/* Orders Shortcut */}
          <Link
            to="/admin/orders"
            className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-[#3a4d39]/40 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FAF6F0] flex items-center justify-center text-[#3a4d39] group-hover:bg-[#3a4d39] group-hover:text-white transition-colors">
                <IconOrders className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-stone-900 group-hover:text-[#3a4d39] transition-colors">
                  Customer Orders
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Review customer details, ordered products, and delivery addresses.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-medium text-[#3a4d39]">
              <span>Go to Orders</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
