import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldCheck, ArrowRight, KeyRound, AlertCircle, Loader2, Settings2 } from 'lucide-react';
import { apiCall, getGasUrl, setGasUrl } from '@/core/api';
import { useAuth } from '@/core/auth';

export default function Login({ setRole }) {
  const navigate = useNavigate();
  const { login } = useAuth() || {};

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // API Config modal state
  const [showConfig, setShowConfig] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState(getGasUrl() || '');
  const [configSaved, setConfigSaved] = useState(false);

  const handleSaveApiUrl = (e) => {
    e.preventDefault();
    setGasUrl(customApiUrl);
    setConfigSaved(true);
    setTimeout(() => {
      setConfigSaved(false);
      setShowConfig(false);
    }, 1200);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const currentUrl = getGasUrl();
    if (!currentUrl) {
      setError('กรุณาตั้งค่า Google Apps Script Web App URL ก่อนเข้าสู่ระบบ (กดไอคอนเฟืองด้านล่าง)');
      setShowConfig(true);
      return;
    }

    setLoading(true);

    try {
      const result = await apiCall('auth.login', {
        username: username.trim(),
        password: password
      });

      if (result && result.user) {
        const userRole = result.user.role;
        
        // Map backend role to router role
        let normalizedRole = 'tech';
        if (userRole === 'CENTRAL_ADMIN' || userRole === 'admin') {
          normalizedRole = 'admin';
        } else if (userRole === 'BRANCH_MANAGER' || userRole === 'manager') {
          normalizedRole = 'manager';
        } else {
          normalizedRole = 'tech';
        }

        if (setRole) setRole(normalizedRole);
        if (login) login(result.user, result.token, remember);

        navigate(`/dashboard/${normalizedRole}`);
      } else {
        throw new Error('ไม่พบข้อมูลผู้ใช้งาน');
      }
    } catch (err) {
      setError(err.message || 'รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-slate-50 p-4 antialiased">
      {/* Background Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-50" />

      <div className="w-full max-w-[400px] relative z-10">
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
          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-md flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Username / Employee ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="เช่น admin หรือ EMP-0001"
                  className="pl-9 w-full rounded border border-slate-300 py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านของคุณ"
                  className="pl-9 w-full rounded border border-slate-300 py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-xs text-slate-600 font-medium">Remember Session</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-slate-900 text-white py-2.5 px-4 rounded text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
                  <span>กำลังตรวจสอบสิทธิ์...</span>
                </>
              ) : (
                <>
                  <span>Authenticate & Enter Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </>
              )}
            </button>
          </form>

          {/* API URL Config Collapsible */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="w-full flex items-center justify-between text-[11px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 text-slate-400" />
                <span>API Endpoint Configuration</span>
              </span>
              <span className="text-[10px] text-slate-400">
                {getGasUrl() ? 'Configured' : 'Required'}
              </span>
            </button>

            {showConfig && (
              <form onSubmit={handleSaveApiUrl} className="mt-3 p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-2">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Google Apps Script Web App URL
                  </label>
                  <input
                    type="url"
                    value={customApiUrl}
                    onChange={(e) => setCustomApiUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none font-mono"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-3 py-1 bg-slate-900 text-white rounded text-[11px] font-semibold hover:bg-slate-800 transition-colors"
                  >
                    {configSaved ? 'Saved!' : 'Save URL'}
                  </button>
                </div>
              </form>
            )}
          </div>
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


