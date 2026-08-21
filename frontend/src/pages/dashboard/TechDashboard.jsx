import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench, 
  RotateCcw, 
  CheckCircle2, 
  MapPin, 
  ArrowRight,
  Ticket,
  Clock,
  Building2,
  Navigation
} from 'lucide-react';
import { apiCall } from '@/core/api';

export default function TechDashboard() {
  const [metrics, setMetrics] = useState({
    assigned: 0,
    urgentRework: 0,
    completedToday: 0
  });

  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      setIsLoading(true);
      try {
        const res = await apiCall('ticket.list');
        const data = Array.isArray(res) ? res : (Array.isArray(res?.tickets) ? res.tickets : (Array.isArray(res?.data) ? res.data : []));
        
        let assignedCount = 0, urgentCount = 0, completedCount = 0;
        const today = new Date().toISOString().split('T')[0];

        data.forEach(t => {
          if (t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS') assignedCount++;
          if (t.status === 'REWORK' || t.status === 'REJECTED_REWORK') urgentCount++;
          if (t.status === 'CLOSED' || t.status === 'COMPLETED_BY_TECH') {
             const closedDate = new Date(t.updated_at || t.created_at || Date.now()).toISOString().split('T')[0];
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
      } finally {
        setIsLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter(t => {
    if (filter === 'urgent') return t.status === 'REJECTED_REWORK' || t.status === 'REWORK';
    if (filter === 'progress') return t.status === 'IN_PROGRESS';
    if (filter === 'queue') return t.status === 'ASSIGNED';
    return true;
  });

  const cards = [
    { title: 'งานที่ได้รับมอบหมาย', count: metrics.assigned, icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-50/70' },
    { title: 'ต้องแก้ไขด่วน (Rework)', count: metrics.urgentRework, icon: RotateCcw, color: 'text-rose-600', bg: 'bg-rose-50/70' },
    { title: 'งานที่ส่งมอบวันนี้', count: metrics.completedToday, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50/70' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">แผงควบคุมช่างเทคนิคภาคสนาม</h1>
          <p className="text-xs text-slate-500 mt-0.5">รายการใบงานที่ได้รับมอบหมาย เช็คอินพิกัด GPS และส่งมอบงานซ่อม</p>
        </div>
        <Link 
          to="/tickets" 
          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Ticket className="w-4 h-4" />
          <span>ดูใบงานทั้งหมด</span>
        </Link>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Main Ticket Queue */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">คิวงานที่ต้องปฏิบัติงาน</h2>
            <p className="text-xs text-slate-400 mt-0.5">กดเลือกใบงานเพื่อเช็คอิน GPS หรือส่งผลการซ่อม</p>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2">
            {[
              { key: 'all', label: `ทั้งหมด (${tickets.length})` },
              { key: 'urgent', label: `แก้ไขด่วน (${metrics.urgentRework})` },
              { key: 'progress', label: 'กำลังทำ' },
              { key: 'queue', label: 'รอเข้าพื้นที่' }
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === f.key 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filteredTickets.length > 0 ? (
          <div className="space-y-3">
            {filteredTickets.map(t => (
              <div key={t.ticket_id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50/70 hover:bg-white transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {t.ticket_id}
                    </span>
                    <span className="font-semibold text-sm text-slate-800">
                      {t.branch_name || ('สาขา ' + t.branch_id)}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      t.status === 'REJECTED_REWORK' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      t.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-purple-50 text-purple-700 border-purple-200'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  {t.overview && (
                    <p className="text-xs text-slate-600 line-clamp-1">
                      {t.overview}
                    </p>
                  )}
                </div>
                <Link 
                  to={`/tickets/${t.ticket_id}`} 
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>เข้าดูใบงาน & เช็คอิน</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">ไม่มีรายการใบงานในหมวดนี้</p>
            <p className="text-xs text-slate-400 mt-0.5">เมื่อได้รับมอบหมายงานใหม่ รายการจะแสดงขึ้นที่นี่</p>
          </div>
        )}
      </div>
    </div>
  );
}
