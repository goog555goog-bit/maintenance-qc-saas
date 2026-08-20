import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import OfflineBanner from './OfflineBanner';

export default function AppShell({ children, currentRole = 'tech' }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans antialiased">
      <Sidebar currentRole={currentRole} />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <OfflineBanner />
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

