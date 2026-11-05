import React, { useState, useMemo, useEffect } from 'react';
import Pagination from '../components/Pagination';
import OrderDetailsModal from '../components/OrderDetailsModal';
import {
  IconSearch,
  IconEye,
  IconOrders
} from '../components/AdminIcons';
import { orderService } from '../../services/api';

export default function Orders() {
  const getInitialOrders = () => {
    try {
      const cached = sessionStorage.getItem('faa_admin_orders_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  };

  const [orders, setOrders] = useState(getInitialOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(() => getInitialOrders().length === 0);
  const [errorMessage, setErrorMessage] = useState('');

  const pageSize = 10;

  // Map Backend Order to Frontend Format (Preserving all rich order details)
  const mapBackendOrder = (order) => ({
    id: order.orderId || order._id,
    _id: order._id,
    customerName: order.customerName || 'Customer',
    email: order.customerEmail || '',
    phone: order.customerPhone || '',
    orderDate: order.orderDate
      ? new Date(order.orderDate).toISOString().split('T')[0]
      : 'N/A',
    subtotal: order.subtotal || 0,
    shippingCharge: order.deliveryCharges || 0,
    totalAmount: order.finalTotal !== undefined ? order.finalTotal : order.subtotal || 0,
    deliveryAddress: {
      street: order.deliveryAddress?.street || '',
      city: order.deliveryAddress?.city || '',
      state: order.deliveryAddress?.state || '',
      pincode:
        order.deliveryAddress?.postalCode ||
        order.deliveryAddress?.pincode ||
        '',
    },
    items: (order.orderedProducts || []).map((item) => ({
      id: item.product?._id || item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      weight: item.product?.unit || '1 unit',
      image: item.product?.images?.[0]?.url || item.image || '/uploads/img11.jpeg',
    })),
  });

  // Fetch real orders from Backend API
  const fetchOrders = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await orderService.getAll({ limit: 100 });
      const list = Array.isArray(data) ? data : data.orders || [];
      const mapped = list.map(mapBackendOrder);
      setOrders(mapped);
      try {
        sessionStorage.setItem('faa_admin_orders_cache', JSON.stringify(mapped));
      } catch {}
    } catch (err) {
      console.warn('Orders fetch error:', err);
      setErrorMessage(
        'Could not connect to backend orders API. Please ensure the backend server is running.'
      );
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filtered orders (Search filter)
  const filteredOrders = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    const query = (searchQuery || '').trim().toLowerCase();

    return list.filter((order) => {
      if (!order) return false;
      const orderId = String(order.id || order._id || '').toLowerCase();
      const customer = String(order.customerName || '').toLowerCase();
      const phone = String(order.phone || '');

      return (
        !query ||
        orderId.includes(query) ||
        customer.includes(query) ||
        phone.includes(query)
      );
    });
  }, [orders, searchQuery]);

  // Pagination slice
  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2e2a26]">
            Orders Management
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Track customer orders, delivery addresses, and ordered products.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl text-xs font-medium border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 transition-colors inline-flex items-center gap-1.5"
          >
            <svg
              className={`w-3.5 h-3.5 text-stone-500 ${isLoading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isLoading ? 'Refreshing...' : 'Refresh List'}</span>
          </button>
        </div>
      </div>

      {/* Error state alert (genuine failure only) */}
      {errorMessage && !isLoading && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage('')}
            className="font-bold ml-4 text-amber-600 hover:text-amber-800"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search Controls */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">
              <IconSearch className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Order ID (FAO-...), customer name, or phone..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#3a4d39]"
            />
          </div>
          {searchQuery && (
            <button
              onClick={handleResetFilters}
              title="Clear search"
              className="py-2.5 px-4 rounded-xl text-xs font-medium text-stone-600 hover:text-stone-900 border border-stone-200 hover:bg-stone-50 transition-colors whitespace-nowrap"
            >
              Clear Search
            </button>
          )}
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-[#3a4d39] border-t-transparent rounded-full mb-3" />
            <p className="text-sm font-medium text-stone-600">Loading order records...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FAF6F0] flex items-center justify-center text-stone-400 mb-3">
              <IconOrders className="w-7 h-7" />
            </div>
            <h3 className="text-base font-serif font-bold text-stone-800">No orders found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
              We couldn't find any orders matching your search query.
            </p>
            {searchQuery && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-[#3a4d39] text-white text-xs font-medium hover:bg-[#2d3d2c] transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF6F0] text-stone-600 text-xs uppercase tracking-wider border-b border-stone-200 font-medium">
                <tr>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {paginatedOrders.map((order) => (
                  <tr key={order._id || order.id} className="hover:bg-stone-50/80 transition-colors group">
                    <td className="py-4 px-4 font-mono font-medium text-xs text-stone-900">
                      {order.id}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-stone-900 text-sm">{order.customerName}</div>
                      <div className="text-xs text-stone-500">{order.phone}</div>
                      <div className="text-[11px] text-stone-400 truncate max-w-xs">{order.email}</div>
                    </td>
                    <td className="py-4 px-4 text-xs text-stone-600 whitespace-nowrap">
                      {order.orderDate}
                    </td>
                    <td className="py-4 px-4 font-bold text-stone-900 whitespace-nowrap">
                      ₹{Number(order?.totalAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF6F0] border border-stone-300 text-xs font-medium text-stone-800 hover:bg-[#f2ebe0] hover:text-[#3a4d39] transition-colors"
                      >
                        <IconEye className="w-3.5 h-3.5 text-[#3a4d39]" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {!isLoading && filteredOrders.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredOrders.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Order Details Modal (Read-Only) */}
      <OrderDetailsModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </div>
  );
}
