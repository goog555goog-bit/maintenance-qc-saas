import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import OfflineBanner from './OfflineBanner';

export default function AppShell({ children, currentRole = 'tech' }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans antialiased print:h-auto print:overflow-visible print:bg-white print:block">
      <div className="print:hidden shrink-0">
        <Sidebar currentRole={currentRole} />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden min-w-0 print:overflow-visible print:h-auto print:block">
        <div className="print:hidden">
          <OfflineBanner />
          <Topbar />
        </div>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 print:p-0 print:m-0 print:overflow-visible print:h-auto print:block">
          {children}
        </main>
      </div>
    </div>
  );
}
