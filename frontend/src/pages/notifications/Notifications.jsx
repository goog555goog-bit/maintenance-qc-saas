import React from 'react';
import { Bell, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Bell className="h-6 w-6 text-blue-600" /> ศูนย์การแจ้งเตือน
        </h1>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-800">ทำเครื่องหมายว่าอ่านแล้วทั้งหมด</button>
      </div>

      <div className="space-y-3">
        <div onClick={() => navigate('/tickets/TCK-2023-050')} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex gap-4 cursor-pointer hover:border-blue-300 transition-colors relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
          <div className="mt-1"><AlertCircle className="h-6 w-6 text-blue-500" /></div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-bold text-slate-800">การแจ้งเตือนงานใหม่</h3>
              <span className="text-xs text-slate-500">2 นาทีที่ผ่านมา</span>
            </div>
            <p className="text-sm text-slate-600 mb-2">ใบงานรหัส <span className="font-mono text-slate-800">TCK-2023-050</span> ถูกมอบหมายให้ทีมของคุณ</p>
            <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded">สาขา ก • งานระบบปรับอากาศ</span>
          </div>
        </div>

        <div onClick={() => navigate('/tickets/TCK-2023-048')} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex gap-4 cursor-pointer hover:border-blue-300 transition-colors relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
          <div className="mt-1"><RefreshCw className="h-6 w-6 text-red-500" /></div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-bold text-slate-800">งานถูกตีกลับ (รอบที่ 1)</h3>
              <span className="text-xs text-slate-500">1 ชั่วโมงที่ผ่านมา</span>
            </div>
            <p className="text-sm text-slate-600 mb-2">ผู้จัดการตีกลับงานรหัส <span className="font-mono text-slate-800">TCK-2023-048</span> เหตุผล: "แผ่นกรองยังคงสกปรก"</p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex gap-4 opacity-75">
          <div className="mt-1"><CheckCircle2 className="h-6 w-6 text-green-500" /></div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-medium text-slate-700">งานที่ปิดแล้ว</h3>
              <span className="text-xs text-slate-500">เมื่อวานนี้</span>
            </div>
            <p className="text-sm text-slate-600">ใบงานรหัส <span className="font-mono text-slate-700">TCK-2023-040</span> ถูกปิดเรียบร้อยแล้ว</p>
          </div>
        </div>
      </div>
    </div>
  );
}
