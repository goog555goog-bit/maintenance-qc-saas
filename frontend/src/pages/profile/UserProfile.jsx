import React from 'react';
import { User, Lock, Save, Briefcase } from 'lucide-react';

export default function UserProfile() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">ข้อมูลผู้ใช้งานส่วนบุคคล</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-white shadow-sm">
              <User className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">สมชาย ท.</h2>
            <p className="text-slate-500 text-sm mb-4">พนง-2023001</p>
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">ช่างเทคนิค</span>
            
            <div className="mt-6 pt-6 border-t border-slate-100 text-left space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ข้อมูลสังกัด</p>
                <p className="text-sm font-medium text-slate-800 mt-0.5 flex items-center gap-2"><Briefcase className="h-4 w-4 text-slate-400" /> ทีมช่าง Alpha</p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          {/* Change Password */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5 text-slate-400" /> เปลี่ยนรหัสผ่าน
            </h3>
            <form className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่านปัจจุบัน</label>
                <input type="password" required className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่านใหม่</label>
                <input type="password" required className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
                <input type="password" required className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium flex items-center gap-2">
                <Save className="h-4 w-4" /> บันทึกรหัสผ่านใหม่
              </button>
            </form>
          </div>

          {/* Activity Log / Assignment History */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">ประวัติการเปลี่ยนแปลงสังกัดและบทบาท (Historical Assignment Log)</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-800">ย้ายจาก <span className="font-mono">ทีมช่าง Beta</span> มายัง <span className="font-mono">ทีมช่าง Alpha</span></p>
                  <p className="text-xs text-slate-500">เมื่อวานนี้, 14:30</p>
                </div>
                <span className="text-slate-600 font-bold text-sm">บทบาท: ช่างเทคนิค</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-800">ปรับเปลี่ยนตำแหน่งเป็น <span className="font-mono">ช่างเทคนิค</span></p>
                  <p className="text-xs text-slate-500">1 ต.ค., 09:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
