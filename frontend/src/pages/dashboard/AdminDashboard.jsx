import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Inbox, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  RotateCcw, 
  Calendar,
  AlertTriangle, 
  ArrowRight,
  Building2,
  Users,
  Ticket
} from 'lucide-react';
import { apiCall } from '@/core/api';
import StatusBadge from '@/components/ui/StatusBadge';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    newTickets: 0,
    waitingAssign: 0,
    inProgress: 0,
    waitingReview: 0,
    rework: 0,
    completedToday: 0
  });

  const [recentTickets, setRecentTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      setIsLoading(true);
      try {
        const res = await apiCall('ticket.list');
        const data = Array.isArray(res) ? res : (Array.isArray(res?.tickets) ? res.tickets : (Array.isArray(res?.data) ? res.data : []));
        
        let newT = 0, waitingA = 0, inProg = 0, waitingR = 0, rewk = 0, completed = 0;
        const today = new Date().toISOString().split('T')[0];

        data.forEach(t => {
          if (t.status === 'NEW' || t.status === 'SUBMITTED') newT++;
          if (t.status === 'NEW' || t.status === 'WAITING_ASSIGNMENT' || t.status === 'SUBMITTED') waitingA++;
          if (t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS') inProg++;
          if (t.status === 'COMPLETED_BY_TECH' || t.status === 'WAITING_REVIEW') waitingR++;
          if (t.status === 'REWORK' || t.status === 'REJECTED_REWORK') rewk++;
          if (t.status === 'CLOSED') {
             const closedDate = new Date(t.updated_at || t.created_at || Date.now()).toISOString().split('T')[0];
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
        
        setRecentTickets(data.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const cards = [
    { title: 'ใบงานแจ้งใหม่', count: metrics.newTickets, icon: Inbox, color: 'text-blue-600', bg: 'bg-blue-50/70', border: 'border-blue-200' },
    { title: 'รอจัดสรรทีมช่าง', count: metrics.waitingAssign, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50/70', border: 'border-amber-200' },
    { title: 'กำลังดำเนินงาน', count: metrics.inProgress, icon: Wrench, color: 'text-purple-600', bg: 'bg-purple-50/70', border: 'border-purple-200' },
    { title: 'รอตรวจรับงาน', count: metrics.waitingReview, icon: CheckCircle2, color: 'text-teal-600', bg: 'bg-teal-50/70', border: 'border-teal-200' },
    { title: 'งานตีกลับ (Rework)', count: metrics.rework, icon: RotateCcw, color: 'text-rose-600', bg: 'bg-rose-50/70', border: 'border-rose-200' },
    { title: 'ปิดงานสำเร็จวันนี้', count: metrics.completedToday, icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50/70', border: 'border-emerald-200' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">แดชบอร์ดผู้ดูแลระบบส่วนกลาง</h1>
          <p className="text-xs text-slate-500 mt-0.5">ภาพรวมสถานะการดำเนินงานของระบบซ่อมบำรุงและทีมช่างทั่วประเทศ</p>
        </div>
        <div className="flex items-center gap-2">
          <Link 
            to="/assignments" 
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>คิวจัดสรรทีมช่าง ({metrics.waitingAssign})</span>
          </Link>
          <Link 
            to="/tickets" 
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>ดูใบงานทั้งหมด</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">{c.title}</span>
                <div className={`p-1.5 rounded-lg ${c.bg} ${c.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800 font-mono tracking-tight">{c.count}</p>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Hotspot Alert + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hotspot & Alerts */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>การแจ้งเตือนงานวิกฤต</span>
            </h2>
            <span className="text-[11px] font-semibold text-slate-400">Rework Hotspot</span>
          </div>

          <div className="space-y-3">
            {metrics.rework > 0 ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-rose-800">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>มีงานตีกลับรอแก้ไข {metrics.rework} รายการ</span>
                </div>
                <p className="text-rose-600 text-[11px]">
                  กรุณาตรวจสอบและติดตามทีมช่างเพื่อดำเนินการแก้ไขให้ตรงตามมาตรฐาน
                </p>
              </div>
            ) : (
              <div className="p-4 border border-dashed border-slate-200 rounded-xl text-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                <p className="text-xs font-semibold text-slate-700">ไม่มีงานที่ติดปัญหาหรือตีกลับซ้ำซ้อน</p>
                <p className="text-[11px] text-slate-400 mt-0.5">การดำเนินงานทุกจุดเป็นไปตามเกณฑ์มาตรฐาน</p>
              </div>
            )}

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-600 block">ทางลัดการจัดการ</span>
              <div className="grid grid-cols-2 gap-2">
                <Link to="/branches" className="p-2 bg-white hover:bg-slate-100/80 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>ข้อมูลสาขา</span>
                </Link>
                <Link to="/teams" className="p-2 bg-white hover:bg-slate-100/80 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors">
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  <span>จัดการทีมช่าง</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Tickets Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">รายการใบงานล่าสุด</h2>
              <p className="text-xs text-slate-400 mt-0.5">อัปเดตความคืบหน้าของใบแจ้งซ่อมล่าสุด</p>
            </div>
            <Link to="/tickets" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <span>ดูทั้งหมด</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase bg-slate-50/50">
                  <th className="py-2.5 px-3">หมายเลขใบงาน</th>
                  <th className="py-2.5 px-3">สาขา</th>
                  <th className="py-2.5 px-3">สถานะ</th>
                  <th className="py-2.5 px-3">ทีมผู้รับผิดชอบ</th>
                  <th className="py-2.5 px-3 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentTickets.length > 0 ? (
                  recentTickets.map((t) => (
                    <tr key={t.ticket_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3">
                        <Link to={`/tickets/${t.ticket_id}`} className="font-mono font-bold text-blue-600 hover:underline">
                          {t.ticket_id}
                        </Link>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">
                        {t.branch_name || ('สาขา ' + t.branch_id)}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={t.status} size="xs" />
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {t.team_name || t.team || '-'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link 
                          to={`/tickets/${t.ticket_id}`}
                          className="text-xs font-semibold text-slate-600 hover:text-blue-600 inline-flex items-center gap-1"
                        >
                          <span>เปิดดู</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400">
                      ยังไม่มีรายการใบงานในระบบ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
