import React, { useState, useEffect } from 'react';
import { User, Key, Mail, Shield, AlertCircle, CheckCircle2, Loader2, Save, Lock, Briefcase } from 'lucide-react';
import { useAuth } from '@/core/auth';
import { apiCall } from '@/core/api';

export default function UserProfile() {
  const { user, login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailError, setEmailError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess('');

    if (!email || !email.includes('@')) {
      setEmailError('กรุณากรอกอีเมลให้ถูกต้อง');
      return;
    }

    setEmailLoading(true);
    try {
      await apiCall('auth.updateProfile', { email: email.trim() });
      
      const stored = localStorage.getItem('auth_user');
      if (stored) {
        const u = JSON.parse(stored);
        u.email = email.trim();
        localStorage.setItem('auth_user', JSON.stringify(u));
      }
      
      setEmailSuccess('บันทึกอีเมลสำหรับรับรหัส OTP เรียบร้อยแล้ว');
    } catch (err) {
      setEmailError(err.message || 'ไม่สามารถบันทึกข้อมูลได้');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (newPassword !== confirmPassword) {
      setPassError('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    if (newPassword.length < 4) {
      setPassError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
      return;
    }

    setPassLoading(true);

    try {
      await apiCall('auth.changePassword', {
        current_password: currentPassword,
        new_password: newPassword
      });

      setPassSuccess('เปลี่ยนรหัสผ่านใหม่เรียบร้อยแล้ว');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassError(err.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
    } finally {
      setPassLoading(false);
    }
  };

  const getRoleLabel = (role) => {
    if (role === 'CENTRAL_ADMIN' || role === 'admin') return 'ผู้ดูแลระบบส่วนกลาง (Central Admin)';
    if (role === 'BRANCH_MANAGER' || role === 'manager') return 'ผู้จัดการสาขา (Branch Manager)';
    return 'ช่างเทคนิคภาคสนาม (Technician)';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">ข้อมูลผู้ใช้งานส่วนบุคคล</h1>
        <p className="text-xs text-slate-500 mt-0.5">จัดการข้อมูลโปรไฟล์ อีเมลรับ OTP กู้คืนรหัสผ่าน และความปลอดภัยของบัญชี</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-900 rounded-full mx-auto flex items-center justify-center text-white shadow-xs">
              <User className="h-10 w-10 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">{user?.username || user?.user_id || 'ผู้ใช้งาน'}</h2>
              <p className="text-slate-400 font-mono text-xs mt-0.5">{user?.user_id || 'EMP-0001'}</p>
            </div>
            
            <div>
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[11px] font-semibold border border-blue-200 inline-block">
                {getRoleLabel(user?.role)}
              </span>
            </div>
            
            <div className="pt-4 border-t border-slate-100 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span>สถานะระบบ:</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>พร้อมใช้งาน</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>รหัสสังกัด:</span>
                <span className="font-mono font-medium text-slate-700">{user?.branch_id || user?.team_id || 'HQ'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Email for OTP Recovery */}
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <span>ผูกอีเมลสำหรับกู้คืนรหัสผ่าน (รับ OTP)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                ใช้อีเมลนี้สำหรับรับรหัส OTP 6 หลัก เมื่อต้องการรีเซ็ตรหัสผ่านในหน้าแรก
              </p>
            </div>

            {emailError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{emailError}</span>
              </div>
            )}

            {emailSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{emailSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ที่อยู่อีเมล (Email Address)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="example@company.co.th"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={emailLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:bg-blue-300"
                >
                  {emailLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>บันทึกอีเมล</span>
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Lock className="h-4 w-4 text-slate-700" />
                <span>เปลี่ยนรหัสผ่านเข้าสู่ระบบ</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                กำหนดรหัสผ่านใหม่เพื่อความปลอดภัยในการเข้าใช้งานบัญชีของคุณ
              </p>
            </div>

            {passError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            {passSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รหัสผ่านปัจจุบัน
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="กรอกรหัสผ่านปัจจุบัน"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    รหัสผ่านใหม่ *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="อย่างน้อย 4 ตัวอักษร"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ยืนยันรหัสผ่านใหม่ *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={passLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:bg-blue-300"
                >
                  {passLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>อัปเดตรหัสผ่าน</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
