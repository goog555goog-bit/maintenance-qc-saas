import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import OfflineBanner from './OfflineBanner';
import { isTelegramWebApp } from '@/core/telegram';

export default function AppShell({ children, currentRole = 'tech' }) {
  const inTelegram = isTelegramWebApp();
  
  // In Telegram Mini App or screen width < 1024px, default to drawer mode so content has 100% full width and never spills out
  const [isDesktopWide, setIsDesktopWide] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 1024 && !inTelegram;
  });

  const [desktopSidebarVisible, setDesktopSidebarVisible] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 1024 && !inTelegram;
  });

  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const wide = window.innerWidth >= 1024 && !inTelegram;
      setIsDesktopWide(wide);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [inTelegram]);

  const handleToggleMenu = () => {
    if (isDesktopWide) {
      setDesktopSidebarVisible(prev => !prev);
    } else {
      setDrawerOpen(prev => !prev);
    }
  };

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-slate-50 text-slate-900 font-sans antialiased print:h-auto print:overflow-visible print:bg-white print:block">
      {/* Desktop Docked Sidebar (Hidden in Telegram Mini App or when toggled/collapsed) */}
      {isDesktopWide && desktopSidebarVisible && (
        <div className="shrink-0 print:hidden h-full transition-all duration-200">
          <Sidebar currentRole={currentRole} />
        </div>
      )}

      {/* Slide-out Drawer (Active in Telegram Mini App, mobile, or when sidebar is collapsed) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex animate-in fade-in duration-150">
          {/* Dark Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer Content */}
          <div className="relative w-64 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <Sidebar currentRole={currentRole} onClose={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area (100% full width when sidebar is drawer/hidden) */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0 w-full max-w-full print:overflow-visible print:h-auto print:block">
        <div className="print:hidden">
          <OfflineBanner />
          <Topbar 
            onToggleSidebar={handleToggleMenu} 
            sidebarVisible={isDesktopWide ? desktopSidebarVisible : drawerOpen}
          />
        </div>
        <main className="flex-1 overflow-auto w-full max-w-full p-2.5 sm:p-4 lg:p-6 print:p-0 print:m-0 print:overflow-visible print:h-auto print:block">
          {children}
        </main>
      </div>
    </div>
  );
}
