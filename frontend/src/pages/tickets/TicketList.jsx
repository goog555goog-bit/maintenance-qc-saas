import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  LayoutList, 
  Kanban, 
  ArrowUpDown, 
  Building2, 
  Calendar,
  AlertCircle,
  Loader2,
  Ticket
} from 'lucide-react';
import { apiCall } from '../../core/api';

export default function TicketList() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('table');
  const [tickets, setTickets] = useState([]);
  const [branches, setBranches] = useState([]);
  const [workTypes, setWorkTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterWorkType, setFilterWorkType] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ticketsRes, branchesRes, workTypesRes] = await Promise.all([
          apiCall('ticket.list'),
          apiCall('branch.list'),
          apiCall('work_type.list').catch(() => [])
        ]);
        const toArray = (v) => Array.isArray(v) ? v : (Array.isArray(v?.tickets) ? v.tickets : (Array.isArray(v?.data) ? v.data : []));
        setTickets(toArray(ticketsRes));
        setBranches(toArray(branchesRes));
        setWorkTypes(toArray(workTypesRes));
      } catch (err) {
        console.error('Error fetching ticket data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredTickets = tickets.filter(t => {
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      const matchId = t.ticket_id && String(t.ticket_id).toLowerCase().includes(query);
      const matchBranch = t.branch_name && String(t.branch_name).toLowerCase().includes(query);
      const matchOverview = t.overview && String(t.overview).toLowerCase().includes(query);
      if (!matchId && !matchBranch && !matchOverview) return false;
    }
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterBranch && String(t.branch_id) !== String(filterBranch)) return false;
    if (filterWorkType && String(t.work_type_id) !== String(filterWorkType)) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    return true;
  });

  const getStatusBadge = (status) => {
    const map = {
      NEW: { label: 'แจ้งใหม่', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
      SUBMITTED: { label: 'แจ้งใหม่', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
      WAITING_ASSIGNMENT: { label: 'รอจัดสรรช่าง', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
      ASSIGNED: { label: 'มอบหมายแล้ว', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
      IN_PROGRESS: { label: 'กำลังดำเนินงาน', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
      COMPLETED_BY_TECH: { label: 'ช่างส่งงาน/รอตรวจ', bg: 'bg-teal-50 text-teal-700 border-teal-200' },
      WAITING_REVIEW: { label: 'รอตรวจรับงาน', bg: 'bg-teal-50 text-teal-700 border-teal-200' },
      REWORK: { label: 'ส่งกลับแก้ไข', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
      REJECTED_REWORK: { label: 'ส่งกลับแก้ไข', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
      COMPLETED: { label: 'ตรวจรับผ่าน', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      CLOSED: { label: 'ปิดงานสมบูรณ์', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    };
    const badge = map[status] || { label: status, bg: 'bg-slate-50 text-slate-700 border-slate-200' };
    return (
      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
        {badge.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const map = {
      URGENT: { label: 'ฉุกเฉิน', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
      HIGH: { label: 'เร่งด่วน', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
      NORMAL: { label: 'ปกติ', bg: 'bg-slate-50 text-slate-600 border-slate-200' },
      LOW: { label: 'ต่ำ', bg: 'bg-slate-50 text-slate-500 border-slate-200' }
    };
    const badge = map[priority] || map.NORMAL;
    return (
      <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${badge.bg}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">รายการใบงานแจ้งซ่อม</h1>
          <p className="text-xs text-slate-500 mt-0.5">ค้นหา กรอง และติดตามสถานะความคืบหน้าของงานซ่อมทั้งหมดในระบบ</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggles */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>ตาราง</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'kanban' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>บอร์ดคัมบัง</span>
            </button>
          </div>

          <Link
            to="/tickets/new"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างใบแจ้งซ่อม</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาเลขใบงาน, สาขา, อาการ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Status Filter */}
          <select
            className="text-xs border border-slate-300 rounded-lg p-2 bg-white outline-none focus:border-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">สถานะทั้งหมด</option>
            <option value="NEW">แจ้งใหม่ (NEW)</option>
            <option value="WAITING_ASSIGNMENT">รอจัดสรรทีมช่าง</option>
            <option value="ASSIGNED">มอบหมายทีมช่างแล้ว</option>
            <option value="IN_PROGRESS">กำลังดำเนินงาน</option>
            <option value="COMPLETED_BY_TECH">รอตรวจรับงาน</option>
            <option value="REJECTED_REWORK">งานตีกลับแก้ไข (Rework)</option>
            <option value="CLOSED">ปิดงานสมบูรณ์</option>
          </select>

          {/* Branch Filter */}
          <select
            className="text-xs border border-slate-300 rounded-lg p-2 bg-white outline-none focus:border-blue-500"
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
          >
            <option value="">สาขาทั้งหมด</option>
            {branches.map(b => (
              <option key={b.branch_id} value={b.branch_id}>
                {b.branch_name} ({b.branch_id})
              </option>
            ))}
          </select>

          {/* Work Type Filter */}
          <select
            className="text-xs border border-slate-300 rounded-lg p-2 bg-white outline-none focus:border-blue-500"
            value={filterWorkType}
            onChange={(e) => setFilterWorkType(e.target.value)}
          >
            <option value="">หมวดหมู่งานทั้งหมด</option>
            {workTypes.map(wt => (
              <option key={wt.work_type_id} value={wt.work_type_id}>
                {wt.work_type_name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            className="text-xs border border-slate-300 rounded-lg p-2 bg-white outline-none focus:border-blue-500"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="">ความเร่งด่วนทั้งหมด</option>
            <option value="NORMAL">ปกติ (NORMAL)</option>
            <option value="HIGH">เร่งด่วน (HIGH)</option>
            <option value="URGENT">ฉุกเฉิน (URGENT)</option>
          </select>
        </div>
      </div>

      {/* Main Content View */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase bg-slate-50/70">
                  <th className="py-3 px-4">รหัสใบงาน</th>
                  <th className="py-3 px-4">สาขา</th>
                  <th className="py-3 px-4">หมวดหมู่งาน</th>
                  <th className="py-3 px-4">สถานะ</th>
                  <th className="py-3 px-4">ความเร่งด่วน</th>
                  <th className="py-3 px-4">ทีมผู้รับผิดชอบ</th>
                  <th className="py-3 px-4">วันที่แจ้ง</th>
                  <th className="py-3 px-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.length > 0 ? (
                  filteredTickets.map(t => (
                    <tr 
                      key={t.ticket_id} 
                      className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                      onClick={() => navigate(`/tickets/${t.ticket_id}`)}
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-blue-600">
                          {t.ticket_id}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {t.branch_name || ('สาขา ' + t.branch_id)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {t.category_name || t.work_type_name || '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(t.status)}
                      </td>
                      <td className="py-3.5 px-4">
                        {getPriorityBadge(t.priority)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {t.team_name || t.team || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {t.created_at ? new Date(t.created_at).toLocaleDateString('th-TH') : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link 
                          to={`/tickets/${t.ticket_id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                        >
                          เปิดดู
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-16 text-center text-slate-400">
                      <Ticket className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-medium text-sm text-slate-600">ไม่พบรายการใบงานตามเงื่อนไขที่เลือก</p>
                      <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองด้านบน</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kanban Board */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { key: 'WAITING_ASSIGNMENT', title: 'รอจัดสรรช่าง', filter: t => ['NEW', 'SUBMITTED', 'WAITING_ASSIGNMENT'].includes(t.status), color: 'border-amber-400' },
            { key: 'IN_PROGRESS', title: 'กำลังดำเนินงาน', filter: t => ['ASSIGNED', 'IN_PROGRESS'].includes(t.status), color: 'border-blue-400' },
            { key: 'WAITING_REVIEW', title: 'รอตรวจรับ / แก้ไข', filter: t => ['COMPLETED_BY_TECH', 'WAITING_REVIEW', 'REWORK', 'REJECTED_REWORK'].includes(t.status), color: 'border-purple-400' },
            { key: 'CLOSED', title: 'ปิดงานสมบูรณ์', filter: t => ['COMPLETED', 'CLOSED'].includes(t.status), color: 'border-emerald-400' }
          ].map(col => {
            const colTickets = filteredTickets.filter(col.filter);
            return (
              <div key={col.key} className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 flex flex-col min-h-[480px]">
                <div className={`border-t-2 ${col.color} pt-2 pb-3 mb-3 flex items-center justify-between`}>
                  <h3 className="font-bold text-xs text-slate-800">{col.title}</h3>
                  <span className="text-[11px] font-mono font-bold bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                    {colTickets.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTickets.length > 0 ? (
                    colTickets.map(t => (
                      <div
                        key={t.ticket_id}
                        onClick={() => navigate(`/tickets/${t.ticket_id}`)}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 shadow-2xs hover:shadow-xs cursor-pointer transition-all space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-mono text-xs font-bold text-blue-600">
                            {t.ticket_id}
                          </span>
                          {getPriorityBadge(t.priority)}
                        </div>
                        <p className="font-semibold text-xs text-slate-800">
                          {t.branch_name || ('สาขา ' + t.branch_id)}
                        </p>
                        {t.overview && (
                          <p className="text-[11px] text-slate-500 line-clamp-2">
                            {t.overview}
                          </p>
                        )}
                        <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400">
                          <span>{t.team_name || 'ยังไม่ระบุทีม'}</span>
                          <span>{t.created_at ? new Date(t.created_at).toLocaleDateString('th-TH') : ''}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                      ไม่มีรายการ
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
