import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';

// Customer-facing website pages (Preserved 100%)
import Home from './pages/Home';
import OrderSuccess from './pages/OrderSuccess';

// Admin Panel Layout & Pages
import AdminLayout from './admin/layouts/AdminLayout';
import AdminErrorBoundary from './admin/components/AdminErrorBoundary';
import AdminPrivateRoute from './admin/components/AdminPrivateRoute';
import AdminLogin from './admin/pages/AdminLogin';
import Dashboard from './admin/pages/Dashboard';
import Orders from './admin/pages/Orders';
import Products from './admin/pages/Products';
import Categories from './admin/pages/Categories';

export default function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* Customer Storefront Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/order-success" element={<OrderSuccess />} />

          {/* Admin Authentication Route */}
          <Route
            path="/admin/login"
            element={
              <AdminErrorBoundary>
                <AdminLogin />
              </AdminErrorBoundary>
            }
          />

          {/* Protected Admin Panel Routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminPrivateRoute>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </AdminPrivateRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminPrivateRoute>
                <AdminLayout>
                  <Orders />
                </AdminLayout>
              </AdminPrivateRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminPrivateRoute>
                <AdminLayout>
                  <Products />
                </AdminLayout>
              </AdminPrivateRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <AdminPrivateRoute>
                <AdminLayout>
                  <Categories />
                </AdminLayout>
              </AdminPrivateRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Home />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}
