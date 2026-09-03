import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  KeyRound, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  Mail,
  X 
} from 'lucide-react';
import { apiCall } from '@/core/api';
import { useAuth } from '@/core/auth';
import { isTelegramWebApp, getTelegramUser } from '@/core/telegram';

export default function Login({ setRole }) {
  const navigate = useNavigate();
  const { login } = useAuth() || {};

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot Password / OTP modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Request OTP, 2: Verify & Reset
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotUserId, setForgotUserId] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
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

        // Auto-bind Telegram user if logging in inside Telegram Mini App
        try {
          if (isTelegramWebApp()) {
            const tgUser = getTelegramUser();
            if (tgUser && tgUser.id) {
              apiCall('telegram.bind', {
                telegram_chat_id: String(tgUser.id),
                username: tgUser.username || '',
                first_name: tgUser.first_name || '',
                last_name: tgUser.last_name || ''
              }, result.token).catch(function(err) {
                console.warn('Auto-bind telegram on login error:', err);
              });
            }
          }
        } catch (ignore) {}

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

  // Step 1: Send OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);

    try {
      const res = await apiCall('auth.forgotPassword', {
        identifier: forgotIdentifier.trim()
      });

      setForgotUserId(res.user_id);
      setMaskedEmail(res.masked_email || 'อีเมลของคุณ');
      setForgotStep(2);
      setForgotSuccess(res.message || 'ส่งรหัส OTP 6 หลักไปยังอีเมลของคุณเรียบร้อยแล้ว');
    } catch (err) {
      setForgotError(err.message || 'ไม่สามารถส่ง OTP ได้ โปรดตรวจสอบรหัสพนักงาน');
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2: Reset Password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');

    if (newPassword !== confirmPassword) {
      setForgotError('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    if (newPassword.length < 4) {
      setForgotError('รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
      return;
    }

    setForgotLoading(true);

    try {
      const res = await apiCall('auth.resetPassword', {
        user_id: forgotUserId,
        otp_code: otpCode.trim(),
        new_password: newPassword
      });

      setForgotSuccess(res.message || 'ตั้งรหัสผ่านใหม่สำเร็จแล้ว');
      setTimeout(() => {
        setShowForgotModal(false);
        setUsername(forgotUserId);
        setPassword(newPassword);
        setForgotStep(1);
        setForgotSuccess('');
      }, 1500);
    } catch (err) {
      setForgotError(err.message || 'รหัส OTP ไม่ถูกต้องหรือหมดอายุ');
    } finally {
      setForgotLoading(false);
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
            ระบบจัดการงานซ่อมบำรุงและควบคุมคุณภาพ
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            แพลตฟอร์มบริหารงานซ่อมและติดตามงานภาคสนาม
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
                รหัสพนักงาน (User ID)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="เช่น EMP-0001"
                  className="pl-9 w-full rounded border border-slate-300 py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  รหัสผ่าน
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(true);
                    setForgotStep(1);
                    setForgotError('');
                    setForgotSuccess('');
                    setForgotIdentifier(username);
                  }}
                  className="text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="รหัสผ่าน (เริ่มต้นใช้รหัสพนักงาน)"
                  className="pl-9 w-full rounded border border-slate-300 py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                * สำหรับเข้าใช้งานครั้งแรก: ใช้รหัสพนักงานเป็นรหัสผ่านเริ่มต้น
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-xs text-slate-600 font-medium">จดจำการเข้าสู่ระบบ</span>
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
                  <span>ยืนยันตัวตนเข้าสู่ระบบ</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Footer */}
        <div className="text-center mt-6 text-[11px] text-slate-400 flex items-center justify-center gap-2">
          <KeyRound className="w-3.5 h-3.5" />
          <span>ระบบรองรับ RBAC และ Audit Trail แบบหลายระดับ</span>
        </div>
      </div>

      {/* Forgot Password Modal (OTP via Email) */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-sm rounded-xl border border-slate-200 shadow-xl p-6 relative">
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 text-blue-600 mb-2">
                <Mail className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                {forgotStep === 1 ? 'กู้คืนรหัสผ่านด้วย OTP' : 'ตั้งรหัสผ่านใหม่'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {forgotStep === 1 
                  ? 'ระบบจะส่งรหัส OTP 6 หลักไปยังอีเมลที่ผูกไว้กับบัญชีของคุณ'
                  : `กรอกรหัส OTP ที่ได้รับทางอีเมล ${maskedEmail}`}
              </p>
            </div>

            {forgotError && (
              <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-md flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-md flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleRequestOtp} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    รหัสพนักงาน หรือ อีเมล
                  </label>
                  <input
                    type="text"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="เช่น EMP-0001"
                    className="w-full rounded border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-slate-900 outline-none"
                    required
                    autoFocus
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    * ต้องเป็นบัญชีที่ได้ทำการผูกอีเมลไว้ในระบบแล้ว
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>กำลังส่ง OTP...</span>
                    </>
                  ) : (
                    <span>ส่งรหัส OTP ไปที่อีเมล</span>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    รหัส OTP 6 หลัก
                  </label>
                  <input
                    type="text"
                    maxLength="6"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="เช่น 123456"
                    className="w-full text-center tracking-widest font-mono text-base font-bold rounded border border-slate-300 py-2 px-3 text-slate-900 focus:border-slate-900 outline-none"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    รหัสผ่านใหม่
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="กำหนดรหัสผ่านใหม่"
                    className="w-full rounded border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-slate-900 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ยืนยันรหัสผ่านใหม่
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                    className="w-full rounded border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-slate-900 outline-none"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="w-1/3 py-2 border border-slate-300 text-slate-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors"
                  >
                    ย้อนกลับ
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-2/3 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-70"
                  >
                    {forgotLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>กำลังบันทึก...</span>
                      </>
                    ) : (
                      <span>บันทึกรหัสผ่านใหม่</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
