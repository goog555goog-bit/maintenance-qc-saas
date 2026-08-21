import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ManagerDashboard = () => {
  const [metrics, setMetrics] = useState({
    openTickets: 0,
    waitingReview: 0,
    reworkList: 0,
    monthlyCompleted: 0
  });

  return (
    <div className="manager-dashboard p-8 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <h1 className="text-3xl font-semibold mb-8 text-slate-800 tracking-tight">แดชบอร์ดผู้จัดการสาขา</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-medium text-slate-500 mb-2">ใบงานที่เปิดอยู่ของสาขา</h3>
          <p className="text-3xl font-semibold text-slate-800">{metrics.openTickets}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-medium text-slate-500 mb-2">รอฉันตรวจรับงาน</h3>
          <p className="text-3xl font-semibold text-slate-800">{metrics.waitingReview}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-medium text-slate-500 mb-2">รายการตีกลับแก้ไข</h3>
          <p className="text-3xl font-semibold text-slate-800">{metrics.reworkList}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-medium text-slate-500 mb-2">ปิดงานประจำเดือน</h3>
          <p className="text-3xl font-semibold text-slate-800">{metrics.monthlyCompleted}</p>
        </div>
      </div>

      <div className="quick-actions bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-6 tracking-tight">การทำงานด่วน</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/tickets/create" className="bg-slate-900 hover:bg-slate-800 transition-colors text-white text-sm font-medium px-5 py-2.5 rounded-lg shadow-sm">
            สร้างใบแจ้งซ่อมใหม่
          </Link>
          <button className="bg-white border border-slate-300 hover:bg-slate-50 transition-colors text-slate-700 text-sm font-medium px-5 py-2.5 rounded-lg shadow-sm">
            รายการงานที่ต้องลงตรวจพื้นที่จริง
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
