import React, { useState, useEffect } from 'react';
import { User, Lock, Save, Briefcase, Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/core/auth';
import { apiCall } from '@/core/api';

export default function UserProfile() {
  const { user } = useAuth() || {};

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
    if (user && user.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess('');
    setEmailLoading(true);

    try {
      await apiCall('auth.updateProfile', { email: email.trim() });
      setEmailSuccess('บันทึกอีเมลสำหรับรับรหัส OTP เรียบร้อยแล้ว');
      
      // Update local storage user profile
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        u.email = email.trim();
        localStorage.setItem('auth_user', JSON.stringify(u));
      }
    } catch (err) {
      setEmailError(err.message || 'ไม่สามารถบันทึกอีเมลได้');
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
      // Direct update
      await apiCall('auth.resetPassword', {
        user_id: user?.user_id,
        otp_code: 'DIRECT_AUTH',
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
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900">ข้อมูลผู้ใช้งานส่วนบุคคล</h1>
        <p className="text-xs text-slate-500 mt-0.5">จัดการข้อมูลโปรไฟล์ อีเมลรับ OTP และความปลอดภัยของบัญชี</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 text-center">
            <div className="w-20 h-20 bg-slate-900 rounded-full mx-auto mb-4 flex items-center justify-center text-white shadow-sm">
              <User className="h-9 w-9 text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">{user?.username || user?.user_id || 'ผู้ใช้งาน'}</h2>
            <p className="text-slate-500 font-mono text-xs mb-3">{user?.user_id || 'EMP-0001'}</p>
            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold border border-slate-200 inline-block">
              {getRoleLabel(user?.role)}
            </span>
            
            <div className="mt-6 pt-6 border-t border-slate-100 text-left space-y-3">
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">สถานะสังกัด</p>
                <p className="text-xs font-medium text-slate-800 mt-1 flex items-center gap-2">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400" /> 
                  <span>Active Operation Member</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          {/* Email for OTP Recovery */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">ผูกอีเมลสำหรับกู้คืนรหัสผ่าน (รับ OTP)</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              อีเมลนี้จะใช้สำหรับรับรหัสยืนยัน OTP 6 หลัก เมื่อคุณลืมรหัสผ่านในหน้าเข้าสู่ระบบ
            </p>

            {emailError && (
              <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-md flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{emailError}</span>
              </div>
            )}

            {emailSuccess && (
              <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-md flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{emailSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdateEmail} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">อีเมลของคุณ</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="เช่น your.name@company.com"
                    required 
                    className="pl-9 w-full rounded border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-slate-900 outline-none" 
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={emailLoading}
                className="bg-slate-900 text-white px-4 py-2 rounded text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {emailLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                <span>บันทึกอีเมล</span>
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5 text-slate-700" />
              <h3 className="text-base font-bold text-slate-900">เปลี่ยนรหัสผ่าน</h3>
            </div>

            {passError && (
              <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-md flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{passError}</span>
              </div>
            )}

            {passSuccess && (
              <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-md flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{passSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">รหัสผ่านใหม่</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="อย่างน้อย 4 ตัวอักษร"
                  required 
                  className="w-full rounded border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-slate-900 outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                  required 
                  className="w-full rounded border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-slate-900 outline-none" 
                />
              </div>
              <button 
                type="submit" 
                disabled={passLoading}
                className="bg-slate-900 text-white px-4 py-2 rounded text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {passLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                <span>บันทึกรหัสผ่านใหม่</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

