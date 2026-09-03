import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import OfflineBanner from './OfflineBanner';

export default function AppShell({ children, currentRole = 'tech' }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans antialiased print:h-auto print:overflow-visible print:bg-white print:block">
      {/* Desktop Docked Sidebar (Hidden on mobile < 768px) */}
      <div className="hidden md:flex shrink-0 print:hidden h-full">
        <Sidebar currentRole={currentRole} />
      </div>

      {/* Mobile Drawer (Slide-out menu with backdrop on mobile / Telegram Mini App) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Dark Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer content */}
          <div className="relative w-64 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <Sidebar currentRole={currentRole} onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area (Full 100% width on mobile) */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0 print:overflow-visible print:h-auto print:block">
        <div className="print:hidden">
          <OfflineBanner />
          <Topbar onToggleSidebar={() => setMobileMenuOpen(prev => !prev)} />
        </div>
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 print:p-0 print:m-0 print:overflow-visible print:h-auto print:block">
          {children}
        </main>
      </div>
    </div>
  );
}
