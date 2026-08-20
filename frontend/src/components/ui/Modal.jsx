import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-surface rounded-lg shadow-xl w-full max-w-md border border-border overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-border">
          <h3 className="font-medium text-text">{title}</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text"><X size={20} /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
