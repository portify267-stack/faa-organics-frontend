import axios from 'axios';

// Vite environment variable with fallback to local backend server
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Direct /api fallback base derived dynamically from API_BASE_URL (never hardcodes localhost in production)
const FALLBACK_API_BASE = API_BASE_URL.replace(/\/v1\/?$/, '') || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor: attach admin JWT token from localStorage if present
api.interceptors.request.use(
  (config) => {
    try {
      const token =
        localStorage.getItem('adminToken') ||
        localStorage.getItem('token');

      if (token && token !== 'demo-token' && token !== 'demo-admin-token') {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Unable to access localStorage for auth token:', e);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized & 404 fallback
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized: clear expired credentials and redirect to login if on admin route
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('token');
        if (
          typeof window !== 'undefined' &&
          window.location.pathname.startsWith('/admin') &&
          window.location.pathname !== '/admin/login'
        ) {
          window.location.href = '/admin/login';
        }
      } catch (e) {
        console.warn('Error clearing credentials on 401:', e);
      }
    }

    // If /api/v1 returned 404, retry against direct /api base
    if (
      error.response?.status === 404 &&
      originalRequest &&
      !originalRequest._retried &&
      originalRequest.url &&
      !originalRequest.url.startsWith('http')
    ) {
      originalRequest._retried = true;
      try {
        const retryUrl = `${FALLBACK_API_BASE}${
          originalRequest.url.startsWith('/') ? '' : '/'
        }${originalRequest.url}`;
        return await axios({
          ...originalRequest,
          url: retryUrl,
        });
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Category API Service
 */
export const categoryService = {
  // Public categories for customer storefront (never requires admin auth)
  getPublic: async (params = {}) => {
    const res = await api.get('/categories', {
      params: { ...params, _t: Date.now() },
    });
    return res.data?.data?.categories || res.data?.data || res.data || [];
  },

  // Fetch all admin categories (with graceful fallback to public endpoint)
  getAll: async (params = {}) => {
    try {
      const res = await api.get('/admin/categories', {
        params: { ...params, _t: Date.now() },
      });
      return res.data?.data?.categories || res.data?.data || res.data || [];
    } catch (err) {
      // If 401/403 or network error, fallback to public categories to preserve live counts
      if (!err.response || err.response.status === 401 || err.response.status === 403) {
        try {
          const publicRes = await api.get('/categories', {
            params: { ...params, _t: Date.now() },
          });
          return publicRes.data?.data?.categories || publicRes.data?.data || publicRes.data || [];
        } catch (pubErr) {
          console.warn('Public category fallback error:', pubErr);
        }
      }
      throw err;
    }
  },

  // Create category
  create: async (categoryData) => {
    const res = await api.post('/admin/categories', categoryData);
    return res.data?.data || res.data;
  },

  // Update category
  update: async (id, categoryData) => {
    const res = await api.put(`/admin/categories/${id}`, categoryData);
    return res.data?.data || res.data;
  },

  // Delete category
  delete: async (id) => {
    const res = await api.delete(`/admin/categories/${id}`);
    return res.data?.data || res.data;
  },

  // Update status (active/inactive)
  updateStatus: async (id, status) => {
    const res = await api.patch(`/admin/categories/${id}/status`, { status });
    return res.data?.data || res.data;
  },
};

/**
 * Product API Service
 */
export const productService = {
  // Public active products for customer storefront (never requires admin auth)
  getPublic: async (params = { limit: 100 }) => {
    const res = await api.get('/products', {
      params: { limit: 100, ...params, _t: Date.now() },
    });
    return res.data?.data?.products || res.data?.data || res.data || [];
  },

  // Fetch all admin products (supports limit=100 with graceful fallback to public endpoint)
  getAll: async (params = { limit: 100 }) => {
    try {
      const res = await api.get('/admin/products', {
        params: { limit: 100, ...params, _t: Date.now() },
      });
      return res.data?.data?.products || res.data?.data || res.data || [];
    } catch (err) {
      // If 401/403 or network error, fallback to public products to preserve live counts
      if (!err.response || err.response.status === 401 || err.response.status === 403) {
        try {
          const publicRes = await api.get('/products', {
            params: { limit: 100, ...params, _t: Date.now() },
          });
          return publicRes.data?.data?.products || publicRes.data?.data || publicRes.data || [];
        } catch (pubErr) {
          console.warn('Public product fallback error:', pubErr);
        }
      }
      throw err;
    }
  },

  // Create product
  create: async (productData) => {
    const res = await api.post('/admin/products', productData);
    return res.data?.data || res.data;
  },

  // Update product
  update: async (id, productData) => {
    const res = await api.put(`/admin/products/${id}`, productData);
    return res.data?.data || res.data;
  },

  // Delete product
  delete: async (id) => {
    const res = await api.delete(`/admin/products/${id}`);
    return res.data?.data || res.data;
  },

  // Update product status
  updateStatus: async (id, status) => {
    const res = await api.patch(`/admin/products/${id}/status`, { status });
    return res.data?.data || res.data;
  },
};

/**
 * Order API Service
 */
export const orderService = {
  // Create a new order (Customer checkout / custom order)
  create: async (orderData) => {
    const res = await api.post('/orders', orderData);
    return res.data?.data || res.data;
  },

  // View all orders with optional search, filters & pagination
  getAll: async (params = {}) => {
    const res = await api.get('/admin/orders', { params });
    return res.data?.data?.orders || res.data?.data || res.data || [];
  },

  // Get complete details of an individual order
  getById: async (id) => {
    const res = await api.get(`/admin/orders/${id}`);
    return res.data?.data || res.data;
  },

  // Get order statistics breakdown (counts by status, payment & type)
  getStats: async () => {
    const res = await api.get('/admin/orders/stats');
    return res.data?.data || res.data;
  },

  // Update order status with state machine transitions
  updateStatus: async (id, orderStatus, comment = '') => {
    const res = await api.patch(`/admin/orders/${id}/status`, { orderStatus, comment });
    return res.data?.data || res.data;
  },

  // Update payment status (pending / paid / failed) and optional transaction reference
  updatePayment: async (id, paymentStatus, transactionReference = '') => {
    const payload = { paymentStatus };
    if (transactionReference) {
      payload.transactionReference = transactionReference;
    }
    const res = await api.patch(`/admin/orders/${id}/payment`, payload);
    return res.data?.data || res.data;
  },
};

/**
 * Sales Analytics API Service
 */
export const salesService = {
  // Get 6-month chronological sales analytics for Admin Panel
  getAnalytics: async (params = {}) => {
    const res = await api.get('/admin/sales', { params });
    return res.data?.data || res.data;
  },
};

export default api;
