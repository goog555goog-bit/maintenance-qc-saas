import React from 'react';

export default function StatCard({ title, value, context, variant = 'default', indicatorColor }) {
  const variantStyles = {
    default: 'bg-white border-slate-200/80 text-slate-900',
    warning: 'bg-amber-50/40 border-amber-200/70 text-amber-950',
    danger: 'bg-rose-50/40 border-rose-200/70 text-rose-950',
    success: 'bg-emerald-50/40 border-emerald-200/70 text-emerald-950',
  };

  return (
    <div className={`p-4 rounded-md border transition-all duration-150 ${variantStyles[variant] || variantStyles.default}`}>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {indicatorColor && (
          <span className={`w-2 h-2 rounded-full ${indicatorColor}`} />
        )}
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-2xl font-bold tracking-tight font-mono text-slate-900">
          {value}
        </div>
        {context && (
          <span className="text-xs font-medium text-slate-500">
            {context}
          </span>
        )}
      </div>
    </div>
  );
}

