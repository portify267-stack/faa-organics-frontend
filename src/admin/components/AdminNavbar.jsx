import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconMenu, IconLogout } from './AdminIcons';

export default function AdminNavbar({
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-stone-200 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger, desktop sidebar collapse button & official logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            aria-label="Open sidebar"
          >
            <IconMenu className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar collapse"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 6h16M4 12h10M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2.5">
            <img
              src="/assets/images/admin-logo.jpg"
              alt="Faa Organics"
              className="w-8 h-8 rounded-lg object-contain bg-white border border-stone-200 p-0.5 shadow-xs"
            />
            <div className="hidden sm:block leading-tight">
              <h1 className="text-sm font-semibold text-stone-800">FAA ORGANICS</h1>
              <p className="text-[11px] text-stone-500">Store Management Console</p>
            </div>
          </div>
        </div>

        {/* Right: Quick Logout Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-stone-600 hover:text-rose-600 hover:bg-rose-50 border border-stone-200 hover:border-rose-200 transition-colors text-xs font-medium"
            title="Log out"
            aria-label="Log out"
          >
            <IconLogout className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
