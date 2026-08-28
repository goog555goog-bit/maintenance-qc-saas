import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Ticket, 
  PlusCircle,
  Users, 
  Building2, 
  Package,
  Fuel, 
  FileText, 
  Archive, 
  Bell, 
  Settings, 
  User, 
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/core/auth';

export default function Sidebar({ currentRole = 'tech' }) {
  const location = useLocation();
  const { logout, user } = useAuth() || {};

  const storedUser = (() => {
    try {
      const raw = localStorage.getItem('auth_user');
      return raw ? JSON.parse(raw) : (user || {});
    } catch {
      return user || {};
    }
  })();

  // Role normalized
  const role = (() => {
    const r = String(storedUser.role || currentRole || '').toUpperCase();
    if (r === 'CENTRAL_ADMIN' || r === 'ADMIN') return 'admin';
    if (r === 'BRANCH_MANAGER' || r === 'MANAGER') return 'manager';
    if (r === 'TECHNICIAN' || r === 'TECH') return 'tech';
    return 'tech';
  })();

  // Navigation Items per Role
  const navItems = [
    { label: 'ภาพรวมแดชบอร์ด', icon: LayoutDashboard, path: `/dashboard/${role}`, roles: ['admin', 'manager', 'tech'] },
    { label: 'สร้างใบแจ้งซ่อม', icon: PlusCircle, path: '/tickets/new', roles: ['manager'] },
    { label: 'รายการใบงานแจ้งซ่อม', icon: Ticket, path: '/tickets', roles: ['admin', 'manager', 'tech'] },
    { label: 'จัดสรรทีมช่าง', icon: Users, path: '/assignments', roles: ['admin'] },
    { label: 'จัดการทีมช่าง', icon: Users, path: '/teams', roles: ['admin'] },
    { label: 'ข้อมูลสาขา', icon: Building2, path: '/branches', roles: ['admin'] },
    { label: 'จัดการอะไหล่', icon: Package, path: '/spare-parts', roles: ['admin'] },
    { label: 'กำหนดเรทน้ำมัน', icon: Fuel, path: '/fuel/rates', roles: ['admin'] },
    { label: 'ตรวจสอบค่าน้ำมัน', icon: Fuel, path: '/fuel/review', roles: ['admin', 'manager'] },
    { label: 'รายงานสถิติ', icon: FileText, path: '/reports', roles: ['admin'] },
    { label: 'คลังประวัติใบงาน', icon: Archive, path: '/archive', roles: ['admin', 'manager'] },
    { label: 'การแจ้งเตือน', icon: Bell, path: '/notifications', roles: ['admin', 'manager', 'tech'] },
    { label: 'ตั้งค่าระบบ', icon: Settings, path: '/settings', roles: ['admin'] },
  ];

  const roleLabels = {
    admin: { title: 'ผู้ดูแลระบบส่วนกลาง', tag: 'CENTRAL_ADMIN', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    manager: { title: 'ผู้จัดการสาขา', tag: 'BRANCH_MANAGER', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    tech: { title: 'ช่างเทคนิคภาคสนาม', tag: 'TECHNICIAN', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  };

  const roleInfo = roleLabels[role] || roleLabels.tech;

  return (
    <aside className="w-60 bg-white border-r border-slate-200/90 flex flex-col select-none shrink-0">
      {/* Brand Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 tracking-tight leading-none">QC SAAS</div>
            <div className="text-[10px] text-slate-500 font-mono leading-tight">ระบบบริหารงานซ่อม</div>
          </div>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10" title="System Online" />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          เมนูหลัก
        </div>
        {navItems.filter(item => item.roles.includes(role)).map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname === item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.label + item.path}
              to={item.path}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-slate-200/80 bg-slate-50/50">
        <div className="flex items-center justify-between gap-2">
          <Link to="/profile" className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded bg-slate-200 text-slate-700 flex items-center justify-center font-semibold text-xs shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-800 truncate">
                {storedUser.username || storedUser.user_id || 'ผู้ใช้งาน'}
              </div>
              <div className="text-[10px] text-slate-500 truncate font-mono">
                {storedUser.user_id || ''}
              </div>
            </div>
          </Link>
          <button
            onClick={() => {
              if (logout) logout();
              else {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                window.location.href = '/login';
              }
            }}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="ออกจากระบบ"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-2">
          <span className={`inline-block px-1.5 py-0.5 text-[9px] font-semibold rounded border ${roleInfo.color}`}>
            {roleInfo.tag}
          </span>
        </div>
      </div>
    </aside>
  );
}
