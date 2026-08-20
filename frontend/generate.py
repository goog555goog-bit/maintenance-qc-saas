import os

base_dir = r"c:\Users\User\.gemini\antigravity\scratch\Master System Specification\frontend"

dirs = [
    "",
    "src",
    "src/core",
    "src/components",
    "src/components/layout",
    "src/components/ui",
    "src/components/forms"
]

for d in dirs:
    os.makedirs(os.path.join(base_dir, d), exist_ok=True)

files = {}

files["package.json"] = """{
  "name": "maintenance-qc-saas",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tailwindcss/forms": "^0.5.7",
    "clsx": "^2.1.0",
    "lucide-react": "^0.368.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwind-merge": "^2.2.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "vite": "^5.2.8"
  }
}
"""

files["vite.config.js"] = """import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
"""

files["tailwind.config.js"] = """/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          900: 'var(--primary-900)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          muted: 'var(--surface-muted)',
        },
        border: 'var(--border)',
        text: {
          DEFAULT: 'var(--text-main)',
          muted: 'var(--text-muted)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Thai', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
"""

files["wrangler.toml"] = """name = "maintenance-qc-saas"
pages_build_output_dir = "dist"
compatibility_date = "2024-03-20"
"""

files["index.html"] = """<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Maintenance & Quality Control</title>
    <meta name="theme-color" content="#ffffff" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
"""

files["src/index.css"] = """@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --primary-50: oklch(97% 0.01 240);
    --primary-100: oklch(93% 0.02 240);
    --primary-500: oklch(55% 0.12 250);
    --primary-600: oklch(45% 0.1 250);
    --primary-900: oklch(25% 0.05 250);

    --surface: oklch(100% 0 0);
    --surface-muted: oklch(98% 0 0);
    --border: oklch(90% 0 0);
    --text-main: oklch(20% 0 0);
    --text-muted: oklch(50% 0 0);
    
    --bg-main: oklch(99% 0 0);
  }

  [data-theme='dark'] {
    --primary-50: oklch(20% 0.02 240);
    --primary-100: oklch(25% 0.03 240);
    --primary-500: oklch(65% 0.12 250);
    --primary-600: oklch(75% 0.1 250);
    --primary-900: oklch(95% 0.05 250);

    --surface: oklch(15% 0 0);
    --surface-muted: oklch(20% 0 0);
    --border: oklch(25% 0 0);
    --text-main: oklch(95% 0 0);
    --text-muted: oklch(70% 0 0);
    
    --bg-main: oklch(10% 0 0);
  }

  body {
    background-color: var(--bg-main);
    color: var(--text-main);
    font-family: 'Inter', 'Noto Sans Thai', sans-serif;
  }
}
"""

files["src/core/api.js"] = """export const GAS_URL = 'YOUR_GAS_URL_HERE';

export async function apiCall(action, payload) {
  const token = localStorage.getItem('auth_token');
  try {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload, token })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.result;
  } catch (err) {
    if (!navigator.onLine) {
      // offline fallback handling logic here
      throw new Error('Offline. Request queued.');
    }
    throw err;
  }
}
"""

files["src/core/auth.js"] = """import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    if (token && storedUser) setUser(JSON.parse(storedUser));
  }, []);
  
  const login = (userData, token, remember) => {
    setUser(userData);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(userData));
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
"""

files["src/core/db.js"] = """// IndexedDB wrapper
const DB_NAME = 'MaintenanceQCDB';
const DB_VERSION = 1;

export async function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
"""

files["src/core/sync.js"] = """import { openDB } from './db';
import { apiCall } from './api';

export async function processSyncQueue() {
  if (!navigator.onLine) return;
  const db = await openDB();
  const tx = db.transaction('syncQueue', 'readwrite');
  const store = tx.objectStore('syncQueue');
  const req = store.getAll();
  
  req.onsuccess = async () => {
    const items = req.result;
    for (const item of items) {
      try {
        await apiCall(item.action, item.payload);
        const delTx = db.transaction('syncQueue', 'readwrite');
        delTx.objectStore('syncQueue').delete(item.id);
      } catch (e) {
        console.error('Sync failed for item', item, e);
      }
    }
  };
}

window.addEventListener('online', processSyncQueue);
"""

files["src/core/sanitizer.js"] = """export function sanitizeText(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/[&<>"']/g, function(m) {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return m;
    }
  });
}
"""

files["src/components/layout/AppShell.jsx"] = """import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import OfflineBanner from './OfflineBanner';

export default function AppShell({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-main)]">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <OfflineBanner />
        <Topbar />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
"""

files["src/components/layout/Sidebar.jsx"] = """import React from 'react';
import { useAuth } from '@/core/auth';
import { LayoutDashboard, Ticket, Settings } from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth() || {};
  return (
    <aside className="w-64 bg-surface border-r border-border p-4 flex flex-col">
      <div className="text-xl font-bold mb-8 text-primary-600">QC SaaS</div>
      <nav className="flex-1 space-y-2">
        <a href="#" className="flex items-center p-2 rounded hover:bg-surface-muted text-text">
          <LayoutDashboard className="mr-2" size={20} /> Dashboard
        </a>
        <a href="#" className="flex items-center p-2 rounded hover:bg-surface-muted text-text">
          <Ticket className="mr-2" size={20} /> Tickets
        </a>
      </nav>
      <div className="mt-auto">
        <a href="#" className="flex items-center p-2 rounded hover:bg-surface-muted text-text">
          <Settings className="mr-2" size={20} /> Settings
        </a>
      </div>
    </aside>
  );
}
"""

files["src/components/layout/Topbar.jsx"] = """import React from 'react';
import { Search, Bell, Moon, Sun, User } from 'lucide-react';

export default function Topbar() {
  const toggleTheme = () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  };

  return (
    <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-6">
      <div className="flex items-center text-text-muted">
        <span className="text-sm">Home / Dashboard</span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-2 top-2 text-text-muted" size={16} />
          <input type="text" placeholder="Search..." className="pl-8 pr-4 py-1.5 rounded-md border border-border bg-bg-main text-sm" />
        </div>
        <button className="text-text-muted hover:text-text"><Bell size={20} /></button>
        <button className="text-text-muted hover:text-text" onClick={toggleTheme}><Moon size={20} /></button>
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
          <User size={16} />
        </div>
      </div>
    </header>
  );
}
"""

files["src/components/layout/OfflineBanner.jsx"] = """import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const setOffline = () => setIsOffline(true);
    const setOnline = () => setIsOffline(false);
    window.addEventListener('offline', setOffline);
    window.addEventListener('online', setOnline);
    return () => {
      window.removeEventListener('offline', setOffline);
      window.removeEventListener('online', setOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-yellow-500 text-white px-4 py-2 flex items-center justify-center text-sm">
      <WifiOff size={16} className="mr-2" />
      You are currently offline. Changes will be synced when you reconnect.
    </div>
  );
}
"""

files["src/components/ui/StatusBadge.jsx"] = """import React from 'react';

const statusConfig = {
  'NEW': { label: 'New', color: 'bg-blue-100 text-blue-800' },
  'ASSIGNED': { label: 'Assigned', color: 'bg-indigo-100 text-indigo-800' },
  'IN_PROGRESS': { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  'PENDING_PARTS': { label: 'Pending Parts', color: 'bg-orange-100 text-orange-800' },
  'RESOLVED': { label: 'Resolved', color: 'bg-green-100 text-green-800' },
  'QC_PENDING': { label: 'QC Pending', color: 'bg-purple-100 text-purple-800' },
  'QC_PASSED': { label: 'QC Passed', color: 'bg-emerald-100 text-emerald-800' },
  'QC_FAILED': { label: 'QC Failed', color: 'bg-red-100 text-red-800' },
  'CLOSED': { label: 'Closed', color: 'bg-gray-100 text-gray-800' },
  'CANCELLED': { label: 'Cancelled', color: 'bg-zinc-100 text-zinc-800' }
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
"""

files["src/components/ui/StatCard.jsx"] = """import React from 'react';

export default function StatCard({ title, value, icon: Icon, trend }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-text-muted text-sm font-medium">{title}</h3>
        {Icon && <Icon className="text-primary-500" size={20} />}
      </div>
      <div className="mt-2 text-2xl font-semibold text-text">{value}</div>
      {trend && <div className="mt-2 text-xs text-green-600">{trend}</div>}
    </div>
  );
}
"""

files["src/components/ui/TicketCard.jsx"] = """import React from 'react';
import StatusBadge from './StatusBadge';
import { MapPin, Clock } from 'lucide-react';

export default function TicketCard({ ticket }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-text">{ticket.title}</h4>
        <StatusBadge status={ticket.status} />
      </div>
      <p className="text-sm text-text-muted mb-4 line-clamp-2">{ticket.description}</p>
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span className="flex items-center"><MapPin size={14} className="mr-1" /> {ticket.location}</span>
        <span className="flex items-center"><Clock size={14} className="mr-1" /> {ticket.updatedAt}</span>
      </div>
    </div>
  );
}
"""

files["src/components/ui/DataTable.jsx"] = """import React from 'react';

export default function DataTable({ columns, data }) {
  if (!data || data.length === 0) {
    return <div className="p-8 text-center text-text-muted border border-border rounded-lg bg-surface">No data available</div>;
  }
  return (
    <div className="overflow-x-auto border border-border rounded-lg bg-surface">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-surface-muted">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-surface divide-y divide-border">
          {data.map((row, i) => (
            <tr key={i}>
              {columns.map((col, j) => (
                <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-text">
                  {col.cell ? col.cell(row) : row[col.accessorKey]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
"""

files["src/components/ui/KanbanBoard.jsx"] = """import React from 'react';

export default function KanbanBoard({ columns }) {
  return (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {columns.map((col, i) => (
        <div key={i} className="flex-shrink-0 w-80 bg-surface-muted rounded-lg p-4 border border-border">
          <h3 className="font-medium text-text mb-4">{col.title} ({col.items.length})</h3>
          <div className="space-y-3">
            {col.items.map((item, j) => (
              <div key={j} className="bg-surface p-3 rounded shadow-sm border border-border">
                {item.content}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
"""

files["src/components/ui/Timeline.jsx"] = """import React from 'react';

export default function Timeline({ events }) {
  return (
    <div className="space-y-4">
      {events.map((evt, i) => (
        <div key={i} className="flex items-start">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center border border-primary-500 z-10">
            {/* icon space */}
          </div>
          <div className="ml-4 flex-1">
            <h4 className="text-sm font-semibold text-text">{evt.title}</h4>
            <p className="text-xs text-text-muted">{evt.time}</p>
            <p className="text-sm text-text mt-1">{evt.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
"""

files["src/components/ui/ReviewHistory.jsx"] = """import React from 'react';

export default function ReviewHistory({ reviews }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden bg-surface">
      <div className="bg-surface-muted px-4 py-2 border-b border-border font-medium">Review History</div>
      <div className="p-4 space-y-4">
        {reviews.map((rev, i) => (
          <div key={i} className="border-l-2 border-primary-500 pl-4">
            <div className="flex justify-between">
              <span className="font-medium text-sm text-text">Round {rev.round}</span>
              <span className="text-xs text-text-muted">{rev.date}</span>
            </div>
            <p className="text-sm mt-1 text-text">{rev.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
"""

files["src/components/ui/Modal.jsx"] = """import React from 'react';
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
"""

files["src/components/ui/NotificationPopup.jsx"] = """import React from 'react';

export default function NotificationPopup({ message, type = 'info', onClose }) {
  const bg = type === 'error' ? 'bg-red-500' : 'bg-primary-600';
  return (
    <div className={`fixed bottom-4 right-4 ${bg} text-white px-4 py-3 rounded shadow-lg flex items-center space-x-3 z-50`}>
      <span className="text-sm">{message}</span>
      <button onClick={onClose} className="text-white/80 hover:text-white">✕</button>
    </div>
  );
}
"""

files["src/components/ui/FileUploader.jsx"] = """import React, { useRef } from 'react';
import { UploadCloud } from 'lucide-react';

export default function FileUploader({ onFileSelect }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div 
      className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center bg-surface cursor-pointer hover:bg-surface-muted transition-colors"
      onClick={() => fileInputRef.current?.click()}
    >
      <UploadCloud className="text-text-muted mb-2" size={32} />
      <span className="text-sm text-text-muted">Click or drag file to upload</span>
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
    </div>
  );
}
"""

files["src/components/ui/MapView.jsx"] = """import React from 'react';

export default function MapView({ lat, lng }) {
  // Placeholder for real map implementation like Leaflet or Google Maps
  return (
    <div className="bg-surface-muted border border-border rounded-lg p-4 flex flex-col items-center justify-center h-48">
      <span className="text-sm text-text-muted">Map View</span>
      <span className="text-xs text-text-muted mt-2">Coordinates: {lat}, {lng}</span>
    </div>
  );
}
"""

files["src/components/forms/Input.jsx"] = """import React from 'react';

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
"""

files["src/components/forms/Select.jsx"] = """import React from 'react';

export default function Select({ label, options, error, ...props }) {
  return (
    <div className="flex flex-col mb-4">
      {label && <label className="mb-1 text-sm font-medium text-text">{label}</label>}
      <select 
        className={`border rounded-md px-3 py-2 text-sm bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary-500 ${error ? 'border-red-500' : 'border-border'}`}
        {...props}
      >
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
}
"""

files["src/components/forms/Textarea.jsx"] = """import React, { useState } from 'react';

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
"""

files["src/components/forms/Button.jsx"] = """import React from 'react';
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
"""

for filepath, content in files.items():
    full_path = os.path.join(base_dir, filepath)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("All files created successfully!")
