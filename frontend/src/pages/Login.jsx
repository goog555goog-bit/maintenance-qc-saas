import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldCheck, ArrowRight, KeyRound } from 'lucide-react';

export default function Login({ setRole }) {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('admin');

  const handleLogin = (e) => {
    e.preventDefault();
    setRole(selectedRole);
    navigate(`/dashboard/${selectedRole}`);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-slate-50 p-4 antialiased">
      {/* Background Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-50" />

      <div className="w-full max-w-[420px] relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-slate-900 text-white shadow-sm mb-3">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Maintenance & Quality Control
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise Operations & Dispatch Platform
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-lg border border-slate-200/90 shadow-sm p-6 sm:p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Employee ID / Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  defaultValue="EMP-0001"
                  className="pl-9 w-full rounded border border-slate-300 py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  defaultValue="password123"
                  className="pl-9 w-full rounded border border-slate-300 py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Role Switcher Demo */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Sign in As (Role Demo)
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { key: 'admin', label: 'Central Admin' },
                  { key: 'manager', label: 'Branch Mgr' },
                  { key: 'tech', label: 'Technician' }
                ].map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setSelectedRole(r.key)}
                    className={`py-1.5 px-2 rounded text-[11px] font-semibold border transition-all text-center ${
                      selectedRole === r.key
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-3.5 h-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-xs text-slate-600 font-medium">Remember Session</span>
              </label>
              <a href="#" className="text-xs text-slate-500 hover:text-slate-900 font-medium">
                Reset Credentials
              </a>
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-slate-900 text-white py-2.5 px-4 rounded text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Authenticate & Enter Workspace</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </form>
        </div>

        {/* Security Footer */}
        <div className="text-center mt-6 text-[11px] text-slate-400 flex items-center justify-center gap-2">
          <KeyRound className="w-3.5 h-3.5" />
          <span>Historical RBAC & Multi-layer Audit Enabled</span>
        </div>
      </div>
    </div>
  );
}

