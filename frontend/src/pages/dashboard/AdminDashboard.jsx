import React, { useState, useEffect } from 'react';
import { apiCall } from '../../core/api';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({
    newTickets: 0,
    waitingAssign: 0,
    inProgress: 0,
    waitingReview: 0,
    rework: 0,
    completedToday: 0
  });
  const [recentTickets, setRecentTickets] = useState([]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await apiCall('ticket.list');
        const data = Array.isArray(res) ? res : (Array.isArray(res?.tickets) ? res.tickets : (Array.isArray(res?.data) ? res.data : []));
        
        let newT = 0, waitingA = 0, inProg = 0, waitingR = 0, rewk = 0, completed = 0;
        const today = new Date().toISOString().split('T')[0];

        data.forEach(t => {
          if (t.status === 'NEW' || t.status === 'SUBMITTED') newT++;
          if (t.status === 'NEW') waitingA++;
          if (t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS') inProg++;
          if (t.status === 'COMPLETED_BY_TECH') waitingR++;
          if (t.status === 'REJECTED_REWORK') rewk++;
          if (t.status === 'CLOSED') {
             const closedDate = new Date(t.updatedAt || t.createdAt || Date.now()).toISOString().split('T')[0];
             if (closedDate === today) completed++;
          }
        });

        setMetrics({
          newTickets: newT,
          waitingAssign: waitingA,
          inProgress: inProg,
          waitingReview: waitingR,
          rework: rewk,
          completedToday: completed
        });
        
        setRecentTickets(data.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    };
    fetchTickets();
  }, []);

  return (
    <div className="admin-dashboard p-8 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <h1 className="text-3xl font-semibold mb-8 text-slate-800 tracking-tight">แดชบอร์ดผู้ดูแลระบบส่วนกลาง</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="metric-card bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-medium text-slate-500 mb-2">ใบงานแจ้งใหม่</h3>
          <p className="text-3xl font-semibold text-slate-800">{metrics.newTickets}</p>
        </div>
        <div className="metric-card bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-medium text-slate-500 mb-2">รอจัดสรรทีมช่าง</h3>
          <p className="text-3xl font-semibold text-slate-800">{metrics.waitingAssign}</p>
        </div>
        <div className="metric-card bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-medium text-slate-500 mb-2">กำลังดำเนินงาน</h3>
          <p className="text-3xl font-semibold text-slate-800">{metrics.inProgress}</p>
        </div>
        <div className="metric-card bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-medium text-slate-500 mb-2">รอผู้จัดการตรวจรับ</h3>
          <p className="text-3xl font-semibold text-slate-800">{metrics.waitingReview}</p>
        </div>
        <div className="metric-card bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-medium text-slate-500 mb-2">งานตีกลับ (Rework)</h3>
          <p className="text-3xl font-semibold text-slate-800">{metrics.rework}</p>
        </div>
        <div className="metric-card bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-medium text-slate-500 mb-2">ปิดงานสำเร็จวันนี้</h3>
          <p className="text-3xl font-semibold text-slate-800">{metrics.completedToday}</p>
        </div>
      </div>

      <div className="hotspot-section mb-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 tracking-tight">ใบงานที่มีการตีกลับซ้ำซ้อน (3 รอบขึ้นไป)</h2>
        <div className="text-center py-8">
          <p className="text-slate-500">ไม่มีรายการต้องแก้ไข</p>
        </div>
      </div>

      <div className="recent-activity bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-slate-800 tracking-tight">กิจกรรมล่าสุด</h2>
          <div className="filters flex gap-3">
            <select className="border border-slate-300 bg-white text-slate-700 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-shadow">
              <option value="">สาขาทั้งหมด</option>
            </select>
            <select className="border border-slate-300 bg-white text-slate-700 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-shadow">
              <option value="">สถานะทั้งหมด</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm text-slate-600">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                <th className="py-3 px-4 font-medium">หมายเลขใบงาน</th>
                <th className="py-3 px-4 font-medium">สาขา</th>
                <th className="py-3 px-4 font-medium">สถานะ</th>
                <th className="py-3 px-4 font-medium">ผู้ดำเนินการ</th>
                <th className="py-3 px-4 font-medium">เวลา</th>
              </tr>
            </thead>
            <tbody>
              {recentTickets.length > 0 ? (
                recentTickets.map((t) => (
                  <tr key={t.id || Math.random()} className="border-b border-slate-100">
                    <td className="py-3 px-4">{t.ticketNumber || t.id}</td>
                    <td className="py-3 px-4">{t.branch || '-'}</td>
                    <td className="py-3 px-4">{t.status}</td>
                    <td className="py-3 px-4">{t.assignee || '-'}</td>
                    <td className="py-3 px-4">{t.updatedAt || t.createdAt || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-12 px-4 text-center text-slate-500" colSpan="5">ไม่มีประวัติกิจกรรมล่าสุด</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
