import React, { useState } from 'react';
import { Bell, CheckCircle2, AlertCircle, RefreshCw, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Bell className="h-6 w-6 text-blue-600" /> การแจ้งเตือน
        </h1>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-800" disabled={notifications.length === 0}>อ่านทั้งหมด</button>
      </div>

      <div className="space-y-3 min-h-[400px] flex flex-col">
        {notifications.length > 0 ? (
          notifications.map(notification => (
             <div key={notification.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex gap-4 cursor-pointer hover:border-blue-300 transition-colors relative overflow-hidden">
             </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 py-16 text-slate-500 bg-white rounded-lg border border-slate-200 shadow-sm">
            <Bell className="h-16 w-16 text-slate-200 mb-4" />
            <p className="text-lg font-medium text-slate-600">ไม่มีการแจ้งเตือนใหม่</p>
            <p className="text-sm text-slate-400 mt-1">คุณตรวจสอบการแจ้งเตือนครบหมดแล้ว</p>
          </div>
        )}
      </div>
    </div>
  );
}
