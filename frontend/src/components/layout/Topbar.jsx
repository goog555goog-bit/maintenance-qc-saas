import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, Shield, User, Menu, Maximize2, ExternalLink } from 'lucide-react';
import { useAuth } from '@/core/auth';
import { isTelegramWebApp, openInExternalBrowser } from '@/core/telegram';

export default function Topbar({ onToggleSidebar, sidebarVisible }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth() || {};

  const getPageTitle = (path) => {
    if (path.startsWith('/dashboard/admin')) return 'แดชบอร์ดผู้ดูแลระบบ';
    if (path.startsWith('/dashboard/manager')) return 'แดชบอร์ดผู้จัดการสาขา';
    if (path.startsWith('/dashboard/tech')) return 'แดชบอร์ดช่างเทคนิค';
    if (path.startsWith('/tickets/new')) return 'สร้างใบแจ้งซ่อมใหม่';
    if (path.includes('/report')) return 'ใบรายงานผลการปฏิบัติงาน (Service Report)';
    if (path.startsWith('/tickets/') && path !== '/tickets') return 'รายละเอียดใบแจ้งซ่อม';
    if (path === '/tickets') return 'รายการใบงานแจ้งซ่อม';
    if (path === '/assignments') return 'คิวจัดสรรและมอบหมายทีมช่าง';
    if (path === '/teams') return 'จัดการทีมช่าง';
    if (path === '/branches') return 'ข้อมูลสาขา';
    if (path === '/spare-parts') return 'จัดการฐานข้อมูลอะไหล่';
    if (path === '/fuel/rates') return 'กำหนดเรทค่าน้ำมัน';
    if (path === '/fuel/review') return 'ตรวจสอบและอนุมัติค่าน้ำมัน';
    if (path === '/reports') return 'รายงานสรุปและสถิติ';
    if (path === '/archive') return 'คลังประวัติใบงาน';
    if (path === '/notifications') return 'ศูนย์การแจ้งเตือน';
    if (path === '/settings') return 'ตั้งค่าระบบ';
    if (path === '/profile') return 'ข้อมูลโปรไฟล์ผู้ใช้';
    return 'ระบบบริหารงานซ่อมบำรุง';
  };

  const storedUser = (() => {
    try {
      const raw = localStorage.getItem('auth_user');
      return raw ? JSON.parse(raw) : (user || {});
    } catch {
      return user || {};
    }
  })();

  const currentTitle = getPageTitle(location.pathname);

  return (
    <header className="h-14 border-b border-slate-200/90 bg-white flex items-center justify-between px-3 sm:px-6 shrink-0 select-none">
      {/* Left: Mobile Hamburger + Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0 mr-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg shrink-0 transition-colors"
          title="เปิด/ปิดเมนูนำทาง"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 text-xs truncate">
          <span className="text-slate-400 font-medium hidden sm:inline shrink-0">ระบบงานซ่อม</span>
          <span className="text-slate-300 hidden sm:inline shrink-0">/</span>
          <span className="text-slate-800 font-semibold truncate">{currentTitle}</span>
        </div>
      </div>

      {/* Action Center (with safety padding on the right for Telegram Mini App close button) */}
      <div className={`flex items-center gap-2 sm:gap-3 ${isTelegramWebApp() ? 'pr-12 sm:pr-14' : ''}`}>
        {/* Open in Browser / Fullscreen Button (Especially useful for Telegram Desktop) */}
        <button
          onClick={() => {
            const tg = window.Telegram?.WebApp;
            if (tg && typeof tg.requestFullscreen === 'function') {
              try { tg.requestFullscreen(); } catch (e) {}
            }
            if (isTelegramWebApp()) {
              openInExternalBrowser();
            } else if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen().catch(() => {});
            } else {
              document.exitFullscreen().catch(() => {});
            }
          }}
          className="p-2 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
          title={isTelegramWebApp() ? "เปิดในเบราว์เซอร์ปกติ (Chrome/Edge)" : "ขยายเต็มจอ"}
        >
          {isTelegramWebApp() ? (
            <span className="flex items-center gap-1 text-xs text-blue-600 font-medium">
              <ExternalLink className="w-4 h-4" />
              <span className="hidden md:inline text-[11px]">เปิดในเบราว์เซอร์</span>
            </span>
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>

        {/* Notifications Button */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          title="ศูนย์การแจ้งเตือน"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
        </button>

        {/* User Pill Button */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-colors text-left"
          title="ดูโปรไฟล์"
        >
          <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
            {(storedUser.username || storedUser.user_id || 'U').slice(0, 1).toUpperCase()}
          </div>
          <span className="text-xs font-semibold text-slate-700 max-w-[100px] truncate">
            {storedUser.username || storedUser.user_id || 'ผู้ใช้งาน'}
          </span>
        </button>
      </div>
    </header>
  );
}

