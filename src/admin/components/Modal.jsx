import React, { useEffect } from 'react';
import { IconClose } from './AdminIcons';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${maxWidth} bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden transform transition-all my-3 sm:my-8 z-10 flex flex-col max-h-[92vh] sm:max-h-[88vh]`}
      >
        <div className="flex items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 border-b border-stone-100 bg-[#FAF6F0] flex-shrink-0">
          <h3 className="text-base sm:text-lg font-serif font-bold text-[#2e2a26] truncate pr-2">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 -mr-1 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-200/50 transition-colors flex-shrink-0 active:scale-95"
            aria-label="Close modal"
          >
            <IconClose className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
