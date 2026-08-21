import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Clock, 
  RotateCcw, 
  CheckCircle2, 
  Plus, 
  ArrowRight,
  Ticket,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { apiCall } from '@/core/api';

export default function ManagerDashboard() {
  const [metrics, setMetrics] = useState({
    openTickets: 0,
    waitingReview: 0,
    reworkList: 0,
    monthlyCompleted: 0
  });

  const [waitingTickets, setWaitingTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      setIsLoading(true);
      try {
        const res = await apiCall('ticket.list');
        const data = Array.isArray(res) ? res : (Array.isArray(res?.tickets) ? res.tickets : (Array.isArray(res?.data) ? res.data : []));
        
        let open = 0, waiting = 0, rework = 0, completed = 0;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        data.forEach(t => {
          if (t.status !== 'CLOSED' && t.status !== 'CANCELLED') open++;
          if (t.status === 'COMPLETED_BY_TECH' || t.status === 'WAITING_REVIEW') waiting++;
          if (t.status === 'REWORK' || t.status === 'REJECTED_REWORK') rework++;
          if (t.status === 'CLOSED') {
             const closedDate = new Date(t.updated_at || t.created_at || Date.now());
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
        
        setWaitingTickets(data.filter(t => t.status === 'COMPLETED_BY_TECH' || t.status === 'WAITING_REVIEW').slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const cards = [
    { title: 'ใบงานที่เปิดอยู่ของสาขา', count: metrics.openTickets, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50/70' },
    { title: 'รอฉันตรวจรับงาน', count: metrics.waitingReview, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50/70' },
    { title: 'รายการตีกลับแก้ไข (Rework)', count: metrics.reworkList, icon: RotateCcw, color: 'text-rose-600', bg: 'bg-rose-50/70' },
    { title: 'ปิดงานสำเร็จประจำเดือน', count: metrics.monthlyCompleted, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50/70' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">แดชบอร์ดผู้จัดการสาขา</h1>
          <p className="text-xs text-slate-500 mt-0.5">ติดตามสถานะงานซ่อมบำรุงและตรวจรับมอบงานของสาขาคุณ</p>
        </div>
        <div className="flex items-center gap-2">
          <Link 
            to="/tickets/new" 
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างใบแจ้งซ่อมใหม่</span>
          </Link>
          <Link 
            to="/tickets" 
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>ดูประวัติใบงานสาขา</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">{c.title}</span>
                <div className={`p-2 rounded-lg ${c.bg} ${c.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-800 font-mono tracking-tight">{c.count}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content: Waiting Review Queue */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>รายการรอผู้จัดการตรวจรับงาน (Waiting Review)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">ช่างส่งมอบงานแล้ว กรุณาตรวจสอบคุณภาพและอนุมัติปิดงาน</p>
          </div>
          <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200">
            {waitingTickets.length} รายการ
          </span>
        </div>

        {waitingTickets.length > 0 ? (
          <div className="space-y-3">
            {waitingTickets.map(t => (
              <div key={t.ticket_id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50/70 hover:bg-white transition-all">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {t.ticket_id}
                    </span>
                    <span className="font-semibold text-sm text-slate-800">
                      {t.branch_name || ('สาขา ' + t.branch_id)}
                    </span>
                  </div>
                  {t.overview && (
                    <p className="text-xs text-slate-600 line-clamp-1 mt-1">
                      {t.overview}
                    </p>
                  )}
                </div>
                <Link 
                  to={`/tickets/${t.ticket_id}`} 
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1 shrink-0 transition-colors shadow-xs"
                >
                  <span>ตรวจรับงาน</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">ไม่มีรายการรอตรวจรับงานในขณะนี้</p>
            <p className="text-xs text-slate-400 mt-0.5">เมื่อช่างเทคนิคส่งมอบงานซ่อม รายการจะปรากฏที่นี่ทันที</p>
          </div>
        )}
      </div>
    </div>
  );
}
