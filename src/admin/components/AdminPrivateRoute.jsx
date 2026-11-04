import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Route guard for Admin Panel:
 * Checks whether an admin authentication JWT token exists in localStorage.
 * Redirects unauthenticated visitors directly to /admin/login.
 */
export default function AdminPrivateRoute({ children }) {
  const location = useLocation();
  const token =
    localStorage.getItem('adminToken') || localStorage.getItem('token');

  // Verify token presence and that it is not a dummy placeholder
  if (!token || token === 'demo-token' || token === 'demo-admin-token') {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}

