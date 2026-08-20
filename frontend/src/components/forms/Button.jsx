import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function Button({ children, variant = 'primary', loading, className, ...props }) {
  const baseStyle = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
    secondary: "bg-surface-muted text-text border border-border hover:bg-border",
    outline: "bg-transparent text-primary-600 border border-primary-600 hover:bg-primary-50",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
  };

  const classes = twMerge(clsx(baseStyle, variants[variant], className));

  return (
    <button className={classes} disabled={loading} {...props}>
      {loading ? <span className="mr-2 animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></span> : null}
      {children}
    </button>
  );
}
