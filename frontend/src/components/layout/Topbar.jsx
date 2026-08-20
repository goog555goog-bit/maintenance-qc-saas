import React from 'react';
import { Search, Bell, Moon, Sun, Shield, Command } from 'lucide-react';

export default function Topbar() {
  const toggleTheme = () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  };

  return (
    <header className="h-14 border-b border-slate-200/80 bg-white flex items-center justify-between px-6 shrink-0">
      {/* Breadcrumb / Location context */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">Workspace</span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 font-semibold">Field Operations</span>
      </div>

      {/* Action Center */}
      <div className="flex items-center gap-3">
        {/* Command Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets, branch, tech..."
            className="pl-8 pr-12 py-1.5 w-64 rounded text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
          />
          <kbd className="absolute right-2 top-2 text-[10px] font-mono text-slate-400 bg-white px-1 py-0.2 rounded border border-slate-200 shadow-2xs">
            ⌘K
          </kbd>
        </div>

        {/* Notifications */}
        <button
          className="relative p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
        </button>

        {/* Dark/Light Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
          title="Toggle Theme"
        >
          <Moon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

