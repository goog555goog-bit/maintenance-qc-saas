import React, { useState } from 'react';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({
    newTickets: 0,
    waitingAssign: 0,
    inProgress: 0,
    waitingReview: 0,
    rework: 0,
    completedToday: 0
  });

  return (
    <div className="admin-dashboard p-6">
      <h1 className="text-2xl font-bold mb-4">แดชบอร์ดผู้ดูแลระบบส่วนกลาง</h1>
      
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="metric-card bg-blue-100 p-4 rounded shadow">
          <h3>ใบงานแจ้งใหม่</h3>
          <p className="text-xl">{metrics.newTickets}</p>
        </div>
        <div className="metric-card bg-yellow-100 p-4 rounded shadow">
          <h3>รอจัดสรรทีมช่าง</h3>
          <p className="text-xl">{metrics.waitingAssign}</p>
        </div>
        <div className="metric-card bg-indigo-100 p-4 rounded shadow">
          <h3>กำลังดำเนินงาน</h3>
          <p className="text-xl">{metrics.inProgress}</p>
        </div>
        <div className="metric-card bg-orange-100 p-4 rounded shadow">
          <h3>รอผู้จัดการตรวจรับ</h3>
          <p className="text-xl">{metrics.waitingReview}</p>
        </div>
        <div className="metric-card bg-red-100 p-4 rounded shadow">
          <h3>งานตีกลับ (Rework)</h3>
          <p className="text-xl">{metrics.rework}</p>
        </div>
        <div className="metric-card bg-green-100 p-4 rounded shadow">
          <h3>ปิดงานสำเร็จวันนี้</h3>
          <p className="text-xl">{metrics.completedToday}</p>
        </div>
      </div>

      <div className="hotspot-section mb-8 bg-red-50 p-4 rounded border border-red-200">
        <h2 className="text-xl font-bold text-red-700">ใบงานที่มีการตีกลับซ้ำซ้อน (3 รอบขึ้นไป)</h2>
        <ul className="mt-2 list-disc pl-5">
          <li>ไม่มีข้อมูลในขณะนี้</li>
        </ul>
      </div>

      <div className="recent-activity">
        <h2 className="text-xl font-bold mb-4">กิจกรรมล่าสุด</h2>
        <div className="filters mb-4 flex gap-4">
          <select className="border p-2 rounded">
            <option value="">สาขาทั้งหมด</option>
          </select>
          <select className="border p-2 rounded">
            <option value="">สถานะทั้งหมด</option>
          </select>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2">หมายเลขใบงาน</th>
              <th className="p-2">สาขา</th>
              <th className="p-2">สถานะ</th>
              <th className="p-2">ผู้ดำเนินการ</th>
              <th className="p-2">เวลา</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2" colSpan="5">กำลังโหลดข้อมูล...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
