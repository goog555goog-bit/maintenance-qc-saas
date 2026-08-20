import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  Building2, 
  Fuel, 
  FileText, 
  Archive, 
  Bell, 
  Settings, 
  User, 
  LogOut,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar({ currentRole = 'tech' }) {
  const location = useLocation();

  const navItems = [
    { label: 'Overview', icon: LayoutDashboard, path: `/dashboard/${currentRole}` },
    { label: 'Work Orders', icon: Ticket, path: '/tickets', badge: '3' },
    { label: 'Assignments', icon: Users, path: '/assignments', adminOnly: true },
    { label: 'Branches', icon: Building2, path: '/branches', adminOnly: true },
    { label: 'Fuel & Mileage', icon: Fuel, path: '/fuel/review', adminOnly: true },
    { label: 'Reports', icon: FileText, path: '/reports', adminOnly: true },
    { label: 'Archive', icon: Archive, path: '/archive' },
    { label: 'Notifications', icon: Bell, path: '/notifications', badge: '2' },
    { label: 'Settings', icon: Settings, path: '/settings', adminOnly: true },
  ];

  const roleLabels = {
    admin: { title: 'Central Admin', tag: 'ADMIN', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    manager: { title: 'Branch Manager', tag: 'MANAGER', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    tech: { title: 'Field Technician', tag: 'TECH-A', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  };

  const roleInfo = roleLabels[currentRole] || roleLabels.tech;

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
            <div className="text-[10px] text-slate-500 font-mono leading-tight">Enterprise Ops</div>
          </div>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10" title="System Online" />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Operations
        </div>
        {navItems.map((item) => {
          if (item.adminOnly && currentRole !== 'admin') return null;

          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
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
              {item.badge && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                  isActive ? 'bg-slate-800 text-blue-300' : 'bg-slate-100 text-slate-600'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-slate-200/80 bg-slate-50/50">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded bg-slate-200 text-slate-700 flex items-center justify-center font-semibold text-xs shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 truncate leading-tight">EMP-0012</div>
              <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded border ${roleInfo.color}`}>
                {roleInfo.tag}
              </span>
            </div>
          </div>
          <Link
            to="/login"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors shrink-0"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

