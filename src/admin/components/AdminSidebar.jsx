import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  IconDashboard,
  IconOrders,
  IconProducts,
  IconCategories,
  IconLogout,
  IconClose
} from './AdminIcons';

export default function AdminSidebar({
  isMobileOpen,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed
}) {
  const navigate = useNavigate();

  // Exactly four sidebar menu items as required
  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <IconDashboard /> },
    { name: 'Orders', path: '/admin/orders', icon: <IconOrders /> },
    { name: 'Products', path: '/admin/products', icon: <IconProducts /> },
    { name: 'Categories', path: '/admin/categories', icon: <IconCategories /> }
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    setIsMobileOpen(false);
    navigate('/admin/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#1e2a1d] text-stone-200 border-r border-[#2d3d2c]">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-[#2d3d2c]/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-white p-1 flex-shrink-0 shadow-sm flex items-center justify-center">
            <img
              src="/assets/images/admin-logo.jpg"
              alt="Faa Organics"
              className="w-full h-full object-contain"
            />
          </div>
          {!isCollapsed && (
            <div className="leading-tight transition-opacity duration-200">
              <h2 className="font-serif font-bold text-base tracking-wider text-[#FAF6F0] whitespace-nowrap">
                FAA ORGANICS
              </h2>
              <p className="text-[10px] uppercase tracking-widest text-[#a8b79a]">Admin Portal</p>
            </div>
          )}
        </div>
        
        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10"
          aria-label="Close menu"
        >
          <IconClose className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links - 4 items only */}
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[#8a9b7c]/80">
          {!isCollapsed ? 'Main Menu' : '•••'}
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-[#3a4d39] text-white shadow-sm font-semibold'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              } ${isCollapsed ? 'justify-center px-0' : ''}`
            }
            title={isCollapsed ? item.name : undefined}
          >
            <span className="flex-shrink-0 text-current">
              {item.icon}
            </span>
            {!isCollapsed && (
              <span className="flex-1 whitespace-nowrap truncate">{item.name}</span>
            )}
          </NavLink>
        ))}
      </div>

      {/* Customer Website Quick Link */}
      <div className="px-3 py-2 border-t border-[#2d3d2c]/60">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-stone-400 hover:text-stone-100 hover:bg-white/5 transition-colors ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title={isCollapsed ? 'View Storefront' : undefined}
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          {!isCollapsed && <span>View Storefront</span>}
        </a>
      </div>

      {/* Admin User Profile & Logout */}
      <div className="p-3 border-t border-[#2d3d2c]">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 transition-colors ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title={isCollapsed ? 'Log Out' : undefined}
        >
          <IconLogout className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Log Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:block fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
