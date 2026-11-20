import axios from 'axios';

// Vite environment variable with fallback to new Render production backend (or localhost in dev)
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? 'https://faa-organics-backend-2uei.onrender.com/api/v1'
    : 'http://localhost:5000/api/v1');

// Direct /api fallback base derived dynamically from API_BASE_URL (never hardcodes localhost in production)
const FALLBACK_API_BASE =
  API_BASE_URL.replace(/\/v1\/?$/, '') ||
  (import.meta.env.PROD
    ? 'https://faa-organics-backend-2uei.onrender.com/api'
    : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// In-flight request deduplication cache to eliminate duplicate simultaneous network roundtrips
const inFlightGetRequests = new Map();

export const deduplicatedGet = (url, config = {}) => {
  const paramKey = config.params ? JSON.stringify(config.params) : '';
  const key = `GET:${url}:${paramKey}`;

  if (inFlightGetRequests.has(key)) {
    return inFlightGetRequests.get(key);
  }

  const promise = api.get(url, config).finally(() => {
    inFlightGetRequests.delete(key);
  });

  inFlightGetRequests.set(key, promise);
  return promise;
};

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
    const res = await deduplicatedGet('/categories', { params });
    return res.data?.data?.categories || res.data?.data || res.data || [];
  },

  // Fetch all admin categories (with graceful fallback to public endpoint)
  getAll: async (params = {}) => {
    try {
      const res = await deduplicatedGet('/admin/categories', { params });
      return res.data?.data?.categories || res.data?.data || res.data || [];
    } catch (err) {
      // If 401/403 or network error, fallback to public categories to preserve live counts
      if (!err.response || err.response.status === 401 || err.response.status === 403) {
        try {
          const publicRes = await deduplicatedGet('/categories', { params });
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
    broadcastCatalogUpdate({ entity: 'category', action: 'create' });
    return res.data?.data || res.data;
  },

  // Update category
  update: async (id, categoryData) => {
    const res = await api.put(`/admin/categories/${id}`, categoryData);
    broadcastCatalogUpdate({ entity: 'category', action: 'update', id });
    return res.data?.data || res.data;
  },

  // Delete category
  delete: async (id) => {
    const res = await api.delete(`/admin/categories/${id}`);
    broadcastCatalogUpdate({ entity: 'category', action: 'delete', id });
    return res.data?.data || res.data;
  },

  // Update status (active/inactive)
  updateStatus: async (id, status) => {
    const res = await api.patch(`/admin/categories/${id}/status`, { status });
    broadcastCatalogUpdate({ entity: 'category', action: 'status', id, status });
    return res.data?.data || res.data;
  },
};

/**
 * Product API Service
 */
export const productService = {
  // Public active products for customer storefront (never requires admin auth)
  getPublic: async (params = { limit: 100 }) => {
    const res = await deduplicatedGet('/products', {
      params: { limit: 100, ...params },
    });
    return res.data?.data?.products || res.data?.data || res.data || [];
  },

  // Fetch all admin products (supports limit=100 with graceful fallback to public endpoint)
  getAll: async (params = { limit: 100 }) => {
    try {
      const res = await deduplicatedGet('/admin/products', {
        params: { limit: 100, ...params },
      });
      return res.data?.data?.products || res.data?.data || res.data || [];
    } catch (err) {
      // If 401/403 or network error, fallback to public products to preserve live counts
      if (!err.response || err.response.status === 401 || err.response.status === 403) {
        try {
          const publicRes = await deduplicatedGet('/products', {
            params: { limit: 100, ...params },
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
    broadcastCatalogUpdate({ entity: 'product', action: 'create' });
    return res.data?.data || res.data;
  },

  // Update product
  update: async (id, productData) => {
    const res = await api.put(`/admin/products/${id}`, productData);
    broadcastCatalogUpdate({ entity: 'product', action: 'update', id });
    return res.data?.data || res.data;
  },

  // Delete product
  delete: async (id) => {
    const res = await api.delete(`/admin/products/${id}`);
    broadcastCatalogUpdate({ entity: 'product', action: 'delete', id });
    return res.data?.data || res.data;
  },

  // Update product status
  updateStatus: async (id, status) => {
    const res = await api.patch(`/admin/products/${id}/status`, { status });
    broadcastCatalogUpdate({ entity: 'product', action: 'status', id, status });
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

/**
 * Dashboard Overview API Service (< 20ms metadata queries)
 */
export const dashboardService = {
  getStats: async () => {
    try {
      const res = await deduplicatedGet('/admin/dashboard/stats');
      return res.data?.data || res.data;
    } catch {
      return null;
    }
  },
};

/**
 * Real-time cross-tab & cross-window synchronization helper
 */
export const broadcastCatalogUpdate = (data = {}) => {
  try {
    localStorage.removeItem('faa_live_products_cache');
    localStorage.removeItem('faa_live_categories_cache');
    localStorage.setItem('faa_catalog_sync_timestamp', String(Date.now()));
    window.dispatchEvent(new Event('faa_catalog_updated'));
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('faa_catalog_channel');
      channel.postMessage({ type: 'catalog_updated', ...data, timestamp: Date.now() });
      channel.close();
    }
  } catch {}
};

export { API_BASE_URL, FALLBACK_API_BASE };
export default api;
