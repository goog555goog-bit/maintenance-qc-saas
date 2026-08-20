import React from 'react';

const statusConfig = {
  'SUBMITTED': { label: 'Submitted', dot: 'bg-slate-400', bg: 'bg-slate-50 text-slate-700 border-slate-200' },
  'WAITING_ASSIGNMENT': { label: 'Waiting Assignment', dot: 'bg-amber-500', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
  'ASSIGNED': { label: 'Assigned', dot: 'bg-blue-500', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  'CHECKED_IN': { label: 'Checked In', dot: 'bg-cyan-500', bg: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
  'IN_PROGRESS': { label: 'In Progress', dot: 'bg-blue-600 animate-pulse', bg: 'bg-blue-50 text-blue-800 border-blue-200' },
  'WAITING_REVIEW': { label: 'Waiting Review', dot: 'bg-amber-500', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
  'REWORK': { label: 'Rework Required', dot: 'bg-rose-500', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  'COMPLETED': { label: 'Completed', dot: 'bg-emerald-500', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  'CLOSED': { label: 'Closed', dot: 'bg-slate-400', bg: 'bg-slate-100 text-slate-600 border-slate-200' },
  'CANCELLED': { label: 'Cancelled', dot: 'bg-zinc-400', bg: 'bg-zinc-100 text-zinc-600 border-zinc-200' }
};

export default function StatusBadge({ status, size = 'sm' }) {
  const config = statusConfig[status] || {
    label: status || 'Unknown',
    dot: 'bg-slate-400',
    bg: 'bg-slate-50 text-slate-700 border-slate-200'
  };

  const sizeClasses = size === 'xs'
    ? 'text-[11px] py-0.5 px-2 gap-1.5'
    : 'text-xs py-1 px-2.5 gap-1.5';

  return (
    <span className={`inline-flex items-center font-medium rounded border ${config.bg} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}

