import React, { useState, useEffect } from 'react';
import { User, Key, Mail, Shield, AlertCircle, CheckCircle2, Loader2, Save, Lock, Briefcase, Send, Bell, Unlink, ExternalLink } from 'lucide-react';
import { useAuth } from '@/core/auth';
import { apiCall } from '@/core/api';
import { isTelegramWebApp, getTelegramUser } from '@/core/telegram';

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

  // Telegram States
  const [tgStatus, setTgStatus] = useState(null);
  const [tgLoading, setTgLoading] = useState(false);
  const [tgSuccess, setTgSuccess] = useState('');
  const [tgError, setTgError] = useState('');
  const [manualChatId, setManualChatId] = useState('');
  const inMiniApp = isTelegramWebApp();
  const currentTgUser = getTelegramUser();

  const fetchTgStatus = async () => {
    try {
      const res = await apiCall('telegram.status', {});
      setTgStatus(res || null);
      if (res && res.telegram_chat_id) {
        setManualChatId(res.telegram_chat_id);
      }
    } catch (e) {
      console.warn('Could not fetch telegram status:', e);
    }
  };

  useEffect(() => {
    fetchTgStatus();
  }, []);

  const handleBindTelegram = async (chatIdToUse) => {
    const targetId = chatIdToUse || manualChatId;
    if (!targetId || !targetId.trim()) {
      setTgError('กรุณาระบุ Telegram Chat ID');
      return;
    }
    setTgLoading(true);
    setTgError('');
    setTgSuccess('');
    try {
      await apiCall('telegram.bind', {
        telegram_chat_id: String(targetId).trim(),
        username: currentTgUser?.username || '',
        first_name: currentTgUser?.first_name || ''
      });
      setTgSuccess('เชื่อมต่อบัญชี Telegram สำหรับรับแจ้งเตือนสำเร็จ');
      fetchTgStatus();
    } catch (err) {
      setTgError(err.message || 'ไม่สามารถเชื่อมต่อ Telegram ได้');
    } finally {
      setTgLoading(false);
    }
  };

  const handleUnbindTelegram = async () => {
    if (!window.confirm('คุณต้องการยกเลิกการเชื่อมต่อ Telegram ใช่หรือไม่?')) return;
    setTgLoading(true);
    setTgError('');
    setTgSuccess('');
    try {
      await apiCall('telegram.unbind', {});
      setTgSuccess('ยกเลิกการเชื่อมต่อ Telegram เรียบร้อยแล้ว');
      fetchTgStatus();
    } catch (err) {
      setTgError(err.message || 'ไม่สามารถยกเลิกการเชื่อมต่อได้');
    } finally {
      setTgLoading(false);
    }
  };

  const handleTestTelegramNotification = async () => {
    setTgLoading(true);
    setTgError('');
    setTgSuccess('');
    try {
      await apiCall('telegram.test', {});
      setTgSuccess('ส่งข้อความทดสอบไปยัง Telegram ของคุณเรียบร้อยแล้ว กรุณาเปิดดูในแอป Telegram');
    } catch (err) {
      setTgError(err.message || 'ส่งข้อความทดสอบไม่สำเร็จ');
    } finally {
      setTgLoading(false);
    }
  };

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

          {/* TELEGRAM NOTIFICATION CARD */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    การแจ้งเตือนผ่าน Telegram (Individual Notification)
                  </h2>
                  <p className="text-xs text-slate-400">
                    รับการแจ้งเตือนมอบหมายงานและสถานะใบงานตรงเข้าสู่ Telegram ส่วนบุคคล
                  </p>
                </div>
              </div>

              {tgStatus?.is_bound && (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>เชื่อมต่อแล้ว</span>
                </span>
              )}
            </div>

            {tgSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{tgSuccess}</span>
              </div>
            )}

            {tgError && (
              <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{tgError}</span>
              </div>
            )}

            {tgStatus?.is_bound ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Telegram Chat ID:</span>
                    <span className="font-mono font-bold text-slate-800">{tgStatus.telegram_chat_id}</span>
                  </div>
                  {tgStatus.telegram_username && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Username:</span>
                      <span className="font-mono text-blue-600">@{tgStatus.telegram_username}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">สถานะการรับแจ้งเตือน:</span>
                    <span className="font-semibold text-emerald-600">เปิดใช้งาน (Active)</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-end">
                  <button
                    type="button"
                    onClick={handleTestTelegramNotification}
                    disabled={tgLoading}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
                  >
                    {tgLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5 text-amber-400" />}
                    <span>ทดสอบส่งการแจ้งเตือน</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleUnbindTelegram}
                    disabled={tgLoading}
                    className="px-3.5 py-2 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    <span>ยกเลิกการเชื่อมต่อ</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  เชื่อมต่อบัญชีนี้กับ Telegram เพื่อรับการแจ้งเตือนเมื่อได้รับมอบหมายงานใหม่, งานถูกส่งกลับแก้ไข (Rework), หรือเมื่อช่างส่งมอบงานเสร็จสมบูรณ์
                </p>

                {inMiniApp && currentTgUser?.id ? (
                  <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 space-y-3">
                    <p className="font-semibold text-sky-900">
                      ตรวจพบบัญชี Telegram ของคุณ: {currentTgUser.first_name || currentTgUser.username} (ID: {currentTgUser.id})
                    </p>
                    <button
                      type="button"
                      onClick={() => handleBindTelegram(String(currentTgUser.id))}
                      disabled={tgLoading}
                      className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2.5 rounded-xl font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {tgLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span>ผูกกับบัญชี Telegram นี้ทันที</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        ระบุ Telegram Chat ID
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="เช่น 123456789"
                          value={manualChatId}
                          onChange={(e) => setManualChatId(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-300 font-mono focus:border-blue-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleBindTelegram()}
                          disabled={tgLoading}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
                        >
                          {tgLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          <span>เชื่อมต่อ</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      * สามารถดู Chat ID ของตนเองได้โดยเปิดแชทกับบ็อต หรือพิมพ์คำสั่ง /start กับบ็อตใน Telegram
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
