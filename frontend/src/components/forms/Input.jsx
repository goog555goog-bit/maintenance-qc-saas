import React from 'react';

export default function Input({ label, error, ...props }) {
  return (
    <div className="flex flex-col mb-4">
      {label && <label className="mb-1 text-sm font-medium text-text">{label}</label>}
      <input 
        className={`border rounded-md px-3 py-2 text-sm bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary-500 ${error ? 'border-red-500' : 'border-border'}`}
        {...props} 
      />
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
}
