import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiCall } from '../../core/api';

const TechDashboard = () => {
  const [filter, setFilter] = useState('all');
  const [metrics, setMetrics] = useState({
    assigned: 0,
    urgentRework: 0,
    completedToday: 0
  });
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await apiCall('ticket.list');
        const data = Array.isArray(res) ? res : (Array.isArray(res?.tickets) ? res.tickets : (Array.isArray(res?.data) ? res.data : []));
        
        let assignedCount = 0, urgentCount = 0, completedCount = 0;
        const today = new Date().toISOString().split('T')[0];

        data.forEach(t => {
          if (t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS') assignedCount++;
          if (t.status === 'REJECTED_REWORK') urgentCount++;
          if (t.status === 'CLOSED' || t.status === 'COMPLETED_BY_TECH') {
             const closedDate = new Date(t.updatedAt || t.createdAt || Date.now()).toISOString().split('T')[0];
             if (closedDate === today) completedCount++;
          }
        });

        setMetrics({
          assigned: assignedCount,
          urgentRework: urgentCount,
          completedToday: completedCount
        });
        
        setTickets(data.filter(t => t.status !== 'CLOSED'));
      } catch (err) {
        console.error(err);
      }
    };
    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter(t => {
    if (filter === 'urgent') return t.status === 'REJECTED_REWORK';
    if (filter === 'queue') return t.status === 'ASSIGNED';
    return true;
  });

  return (
    <div className="tech-dashboard p-8 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <h1 className="text-3xl font-semibold mb-8 text-slate-800 tracking-tight">แผงควบคุมช่างเทคนิคภาคสนาม</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-slate-500 mb-2">งานที่ได้รับมอบหมาย</p>
          <p className="text-3xl font-semibold text-slate-800">{metrics.assigned}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-slate-500 mb-2">รายการต้องแก้ไขด่วน (Rework)</p>
          <p className="text-3xl font-semibold text-slate-800">{metrics.urgentRework}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-slate-500 mb-2">งานเสร็จสิ้นวันนี้</p>
          <p className="text-3xl font-semibold text-slate-800">{metrics.completedToday}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-slate-500 mb-2">ระยะทางสะสมวันนี้</p>
          <p className="text-3xl font-semibold text-slate-800">0 กม.</p>
        </div>
      </div>

      <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
        <button 
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${filter === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
          onClick={() => setFilter('all')}
        >
          งานทั้งหมด
        </button>
        <button 
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${filter === 'urgent' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
          onClick={() => setFilter('urgent')}
        >
          ต้องแก้ไขด่วน
        </button>
        <button 
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${filter === 'queue' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
          onClick={() => setFilter('queue')}
        >
          อยู่ในคิว
        </button>
      </div>

      <div className="ticket-cards space-y-4">
        {filteredTickets.length > 0 ? (
          filteredTickets.map(t => (
            <div key={t.id || Math.random()} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="font-medium text-slate-800">{t.ticketNumber || t.id}</p>
                <p className="text-sm text-slate-500">{t.title || 'ไม่มีชื่อรายการ'}</p>
                <p className="text-xs text-slate-400 mt-1">สถานะ: {t.status}</p>
              </div>
              <Link to={`/tickets/${t.id}`} className="text-sm text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                ดูรายละเอียด
              </Link>
            </div>
          ))
        ) : (
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center">
            <p className="text-slate-500">ยังไม่มีรายการใบงานในระบบ</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechDashboard;
