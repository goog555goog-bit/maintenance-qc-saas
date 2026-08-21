import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiCall } from '../../core/api';

const ManagerDashboard = () => {
  const [metrics, setMetrics] = useState({
    openTickets: 0,
    waitingReview: 0,
    reworkList: 0,
    monthlyCompleted: 0
  });
  const [waitingTickets, setWaitingTickets] = useState([]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await apiCall('ticket.list');
        const data = Array.isArray(res) ? res : (Array.isArray(res?.tickets) ? res.tickets : (Array.isArray(res?.data) ? res.data : []));
        
        let open = 0, waiting = 0, rework = 0, completed = 0;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        data.forEach(t => {
          if (t.status !== 'CLOSED' && t.status !== 'CANCELLED') open++;
          if (t.status === 'COMPLETED_BY_TECH') waiting++;
          if (t.status === 'REJECTED_REWORK') rework++;
          if (t.status === 'CLOSED') {
             const closedDate = new Date(t.updatedAt || t.createdAt || Date.now());
             if (closedDate.getMonth() === currentMonth && closedDate.getFullYear() === currentYear) {
               completed++;
             }
          }
        });

        setMetrics({
          openTickets: open,
          waitingReview: waiting,
          reworkList: rework,
          monthlyCompleted: completed
        });
        
        setWaitingTickets(data.filter(t => t.status === 'COMPLETED_BY_TECH').slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    };
    fetchTickets();
  }, []);

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

      <div className="waiting-review mb-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 tracking-tight">รายการรอตรวจรับ</h2>
        {waitingTickets.length > 0 ? (
          <div className="space-y-4">
            {waitingTickets.map(t => (
              <div key={t.id || Math.random()} className="flex justify-between items-center p-4 border border-slate-100 rounded-lg bg-slate-50/50">
                <div>
                  <p className="font-medium text-slate-800">{t.ticketNumber || t.id}</p>
                  <p className="text-sm text-slate-500">{t.title || 'ไม่มีชื่อรายการ'}</p>
                </div>
                <Link to={`/tickets/${t.id}`} className="text-sm text-slate-700 bg-white border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                  ตรวจรับ
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-500">ไม่มีรายการรอตรวจรับ</p>
          </div>
        )}
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
