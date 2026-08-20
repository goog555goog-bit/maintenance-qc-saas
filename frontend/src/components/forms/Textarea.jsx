import React, { useState } from 'react';

export default function Textarea({ label, error, maxLength, value, onChange, ...props }) {
  const valStr = value || '';
  return (
    <div className="flex flex-col mb-4">
      {label && <label className="mb-1 text-sm font-medium text-text">{label}</label>}
      <textarea 
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        className={`border rounded-md px-3 py-2 text-sm bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary-500 ${error ? 'border-red-500' : 'border-border'}`}
        {...props}
      />
      <div className="flex justify-between items-center mt-1">
        <span className="text-xs text-red-500">{error}</span>
        {maxLength && <span className="text-xs text-text-muted">{valStr.length}/{maxLength}</span>}
      </div>
    </div>
  );
}
