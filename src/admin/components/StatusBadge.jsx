import React from 'react';

export default function StatusBadge({ type = 'product', status = '' }) {
  const norm = String(status).trim().toLowerCase();

  let styles = 'bg-stone-100 text-stone-700 border-stone-200';
  let dotColor = 'bg-stone-400';

  if (type === 'payment') {
    if (norm === 'paid') {
      styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      dotColor = 'bg-emerald-500';
    } else if (norm === 'pending') {
      styles = 'bg-amber-50 text-amber-800 border-amber-200';
      dotColor = 'bg-amber-500';
    } else if (norm === 'failed') {
      styles = 'bg-rose-50 text-rose-800 border-rose-200';
      dotColor = 'bg-rose-500';
    }
  } else {
    // Stock status or category status
    if (norm === 'in stock' || norm === 'active' || norm === 'delivered') {
      styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      dotColor = 'bg-emerald-500';
    } else if (norm === 'out of stock' || norm === 'cancelled' || norm === 'inactive') {
      styles = 'bg-rose-50 text-rose-800 border-rose-200';
      dotColor = 'bg-rose-500';
    } else if (norm === 'shipped') {
      styles = 'bg-sky-50 text-sky-800 border-sky-200';
      dotColor = 'bg-sky-500';
    } else if (norm === 'processing') {
      styles = 'bg-amber-50 text-amber-800 border-amber-200';
      dotColor = 'bg-amber-500';
    } else if (norm === 'pending' || norm === 'draft') {
      styles = 'bg-stone-100 text-stone-700 border-stone-300';
      dotColor = 'bg-stone-500';
    }
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles} whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {status}
    </span>
  );
}
