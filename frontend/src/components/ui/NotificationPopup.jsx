import React from 'react';
import { X } from 'lucide-react';

export default function NotificationPopup({ message, type = 'info', onClose }) {
  const bg = type === 'error' ? 'bg-red-500' : 'bg-primary-600';
  return (
    <div className={`fixed bottom-4 right-4 ${bg} text-white px-4 py-3 rounded shadow-lg flex items-center space-x-3 z-50`}>
      <span className="text-sm">{message}</span>
      <button onClick={onClose} className="text-white/80 hover:text-white"><X size={16} /></button>
    </div>
  );
}
