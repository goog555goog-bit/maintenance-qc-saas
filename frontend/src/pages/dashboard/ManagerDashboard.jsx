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
    <div className="manager-dashboard p-6">
      <h1 className="text-2xl font-bold mb-4">แดชบอร์ดผู้จัดการสาขา</h1>
      
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded shadow">
          <h3>ใบงานที่เปิดอยู่ของสาขา</h3>
          <p className="text-xl">{metrics.openTickets}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded shadow">
          <h3>รอฉันตรวจรับงาน</h3>
          <p className="text-xl">{metrics.waitingReview}</p>
        </div>
        <div className="bg-red-50 p-4 rounded shadow">
          <h3>รายการตีกลับแก้ไข</h3>
          <p className="text-xl">{metrics.reworkList}</p>
        </div>
        <div className="bg-green-50 p-4 rounded shadow">
          <h3>ปิดงานประจำเดือน</h3>
          <p className="text-xl">{metrics.monthlyCompleted}</p>
        </div>
      </div>

      <div className="quick-actions mb-8">
        <h2 className="text-xl font-bold mb-4">การทำงานด่วน</h2>
        <div className="flex gap-4">
          <Link to="/tickets/create" className="bg-blue-600 text-white px-4 py-2 rounded">
            สร้างใบแจ้งซ่อมใหม่
          </Link>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded">
            รายการงานที่ต้องลงตรวจพื้นที่จริง
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
