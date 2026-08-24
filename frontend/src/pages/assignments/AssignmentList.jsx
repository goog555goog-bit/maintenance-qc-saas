import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserPlus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  RefreshCw, 
  Search, 
  Filter, 
  Layers, 
  Kanban, 
  LayoutList, 
  Calendar, 
  ArrowRight, 
  RotateCcw, 
  Wrench, 
  Building2, 
  AlertTriangle,
  ChevronRight,
  Plus,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiCall } from '@/core/api';
import StatusBadge from '@/components/ui/StatusBadge';

export default function AssignmentList() {
  const navigate = useNavigate();

  // Data States
  const [tickets, setTickets] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null);
  const [notification, setNotification] = useState(null);

  // View Mode: 'matrix' (ตารางงานช่างรวมแบบ Matrix/Grid), 'kanban' (บอร์ดคัมบัง), 'list' (รายการคิว)
  const [viewMode, setViewMode] = useState('matrix');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [targetTeam, setTargetTeam] = useState(null);
  const [selectedTicketToAssign, setSelectedTicketToAssign] = useState('');

  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignTicket, setReassignTicket] = useState(null);
  const [newTeamId, setNewTeamId] = useState('');
  const [reassignReason, setReassignReason] = useState('');

  // Inline team selections per ticket
  const [selectedTeams, setSelectedTeams] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ticketsRes, teamsRes] = await Promise.all([
        apiCall('ticket.list'),
        apiCall('team.list').catch(() => [])
      ]);
      
      const toArray = (v) => Array.isArray(v) ? v : (Array.isArray(v?.tickets) ? v.tickets : (Array.isArray(v?.data) ? v.data : []));
      const ticketsList = toArray(ticketsRes);
      const teamsList = toArray(teamsRes);
      
      setTickets(ticketsList);
      setTeams(teamsList);
    } catch (err) {
      console.error('Error fetching assignment data:', err);
      showNotification('error', 'ไม่สามารถโหลดข้อมูลการจัดสรรงานได้: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  };

  // Assign Team Handler
  const handleAssign = async (ticketId, teamId) => {
    const targetTeamId = teamId || selectedTeams[ticketId];
    if (!targetTeamId) {
      showNotification('error', 'กรุณาเลือกทีมช่างที่ต้องการมอบหมาย');
      return;
    }
    
    setAssigningId(ticketId);
    try {
      await apiCall('ticket.assign', { ticket_id: ticketId, team_id: targetTeamId });
      showNotification('success', `มอบหมายใบงาน ${ticketId} ให้ทีมช่างเรียบร้อยแล้ว`);
      setShowAssignModal(false);
      setSelectedTicketToAssign('');
      fetchData();
      setSelectedTeams(prev => ({ ...prev, [ticketId]: '' }));
    } catch (err) {
      console.error('Error assigning team:', err);
      showNotification('error', 'เกิดข้อผิดพลาดในการมอบหมายงาน: ' + err.message);
    } finally {
      setAssigningId(null);
    }
  };

  // Reassign Team Handler
  const handleReassign = async (e) => {
    e.preventDefault();
    if (!reassignTicket || !newTeamId) return;
    if (!reassignReason.trim()) {
      showNotification('error', 'กรุณาระบุเหตุผลในการเปลี่ยนทีมช่าง');
      return;
    }

    const oldAsnId = reassignTicket.assignments && reassignTicket.assignments.length > 0
      ? (reassignTicket.assignments.find(a => a.assignment_status === 'ACTIVE') || reassignTicket.assignments[0]).assignment_id
      : 'ASN-DEFAULT';

    setAssigningId(reassignTicket.ticket_id);
    try {
      await apiCall('ticket.reassign', {
        ticket_id: reassignTicket.ticket_id,
        old_assignment_id: oldAsnId,
        new_team_id: newTeamId,
        transfer_reason: reassignReason.trim()
      });
      showNotification('success', `เปลี่ยนทีมช่างสำหรับใบงาน ${reassignTicket.ticket_id} เรียบร้อยแล้ว`);
      setShowReassignModal(false);
      setReassignTicket(null);
      setNewTeamId('');
      setReassignReason('');
      fetchData();
    } catch (err) {
      console.error('Error reassigning team:', err);
      showNotification('error', 'เกิดข้อผิดพลาดในการเปลี่ยนทีมช่าง: ' + err.message);
    } finally {
      setAssigningId(null);
    }
  };

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      if (filterCategory !== 'all') {
        const cat = t.category_name || t.work_type_name || '';
        if (!cat.includes(filterCategory)) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const idMatch = String(t.ticket_id || '').toLowerCase().includes(q);
        const branchMatch = String(t.branch_name || t.branch_id || '').toLowerCase().includes(q);
        const teamMatch = String(t.team_name || t.team || '').toLowerCase().includes(q);
        const overMatch = String(t.overview || t.description || '').toLowerCase().includes(q);
        return idMatch || branchMatch || teamMatch || overMatch;
      }
      return true;
    });
  }, [tickets, filterPriority, filterCategory, searchQuery]);

  // Buckets
  const waitingTickets = useMemo(() => {
    return filteredTickets.filter(t => ['NEW', 'SUBMITTED', 'WAITING_ASSIGNMENT'].includes(t.status));
  }, [filteredTickets]);

  const assignedTickets = useMemo(() => {
    return filteredTickets.filter(t => t.status === 'ASSIGNED');
  }, [filteredTickets]);

  const inProgressTickets = useMemo(() => {
    return filteredTickets.filter(t => ['IN_PROGRESS', 'CHECKED_IN'].includes(t.status));
  }, [filteredTickets]);

  const reviewTickets = useMemo(() => {
    return filteredTickets.filter(t => ['COMPLETED_BY_TECH', 'WAITING_REVIEW', 'REWORK', 'REJECTED_REWORK'].includes(t.status));
  }, [filteredTickets]);

  // Group tickets by Team ID for Matrix view
  const teamWorkloadMap = useMemo(() => {
    const map = {};
    teams.forEach(team => {
      map[team.team_id] = {
        team,
        inProgress: [],
        assigned: [],
        waitingReview: [],
        totalActive: 0
      };
    });

    tickets.forEach(t => {
      const teamId = t.team_id || (t.assignments && t.assignments[0]?.team_id);
      if (teamId && map[teamId]) {
        if (['IN_PROGRESS', 'CHECKED_IN'].includes(t.status)) {
          map[teamId].inProgress.push(t);
          map[teamId].totalActive++;
        } else if (t.status === 'ASSIGNED') {
          map[teamId].assigned.push(t);
          map[teamId].totalActive++;
        } else if (['COMPLETED_BY_TECH', 'WAITING_REVIEW', 'REWORK', 'REJECTED_REWORK'].includes(t.status)) {
          map[teamId].waitingReview.push(t);
        }
      }
    });

    return map;
  }, [teams, tickets]);

  const categoriesList = useMemo(() => {
    const set = new Set();
    tickets.forEach(t => {
      const c = t.category_name || t.work_type_name;
      if (c) set.add(c);
    });
    return Array.from(set);
  }, [tickets]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <span>ตารางงานช่างรวมและการจัดสรรงาน (Dispatch Matrix)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ภาพรวมตารางงานของทุกทีมช่าง มอบหมายใบงานด่วน โอนย้ายงาน และติดตามภาระงาน (Workload) แบบเรียลไทม์
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'matrix' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>ตารางทีมช่าง (Matrix)</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'kanban' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>บอร์ดคัมบัง (Kanban)</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'list' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>คิวจัดสรร (Queue)</span>
            </button>
          </div>

          <button 
            onClick={fetchData}
            className="p-2 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2 border shadow-xs transition-all ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>ใบงานรอจัดสรรทีมช่าง</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{waitingTickets.length}</p>
          <p className="text-[11px] text-slate-400">ต้องการช่างดูแล</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>กำลังดำเนินการซ่อม</span>
            <Wrench className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{inProgressTickets.length}</p>
          <p className="text-[11px] text-slate-400">ช่างอยู่ในพื้นที่</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>มอบหมายรอคิว</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600">{assignedTickets.length}</p>
          <p className="text-[11px] text-slate-400">เตรียมเข้าซ่อม</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>ทีมช่างทั้งหมด</span>
            <Layers className="w-4 h-4 text-slate-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{teams.length}</p>
          <p className="text-[11px] text-emerald-600 font-medium">ทีมในระบบ</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ค้นหารหัสใบงาน, สาขา, ทีมช่าง, หรือรายละเอียด..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Priority filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 outline-none focus:border-blue-500 font-medium text-slate-700"
          >
            <option value="all">ความเร่งด่วน: ทั้งหมด</option>
            <option value="URGENT">ฉุกเฉินที่สุด (URGENT)</option>
            <option value="HIGH">เร่งด่วน (HIGH)</option>
            <option value="NORMAL">ปกติ (NORMAL)</option>
          </select>

          {/* Category filter */}
          {categoriesList.length > 0 && (
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 outline-none focus:border-blue-500 font-medium text-slate-700 max-w-[200px] truncate"
            >
              <option value="all">หมวดหมู่งาน: ทั้งหมด</option>
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}

          {(filterPriority !== 'all' || filterCategory !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setFilterPriority('all');
                setFilterCategory('all');
                setSearchQuery('');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area based on viewMode */}
      {loading && tickets.length === 0 ? (
        <div className="flex flex-col justify-center items-center py-24 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mb-2" />
          <p className="text-xs text-slate-400">กำลังโหลดข้อมูลตารางงานช่าง...</p>
        </div>
      ) : (
        <>
          {/* ======================================================== */}
          {/* VIEW 1: MATRIX / GRID VIEW (ตารางงานช่างรวมตามทีม)        */}
          {/* ======================================================== */}
          {viewMode === 'matrix' && (
            <div className="space-y-6">
              {/* Unassigned Quick Pool (ถังพักใบงานรอจัดสรร) */}
              {waitingTickets.length > 0 && (
                <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-amber-500 text-white rounded-lg">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-amber-900">
                          ใบงานรอจัดสรรทีมช่าง ({waitingTickets.length} รายการ)
                        </h3>
                        <p className="text-xs text-amber-700 mt-0.5">
                          เลือกทีมช่างและกดปุ่ม "มอบหมายงาน" ด้านล่างการ์ด เพื่อส่งต่องานให้ทีมช่างทันที
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                    {waitingTickets.map(t => (
                      <div key={t.ticket_id} className="bg-white border border-amber-200/80 rounded-xl p-3.5 shadow-2xs space-y-2 hover:shadow-sm transition-all">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                              {t.ticket_id}
                            </span>
                            <p className="font-semibold text-xs text-slate-800 mt-1">
                              {t.branch_name || ('สาขา ' + t.branch_id)}
                            </p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            t.priority === 'URGENT' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            t.priority === 'HIGH' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {t.priority === 'URGENT' ? 'ฉุกเฉิน' : t.priority === 'HIGH' ? 'เร่งด่วน' : 'ปกติ'}
                          </span>
                        </div>

                        {t.category_name && (
                          <p className="text-[11px] text-slate-500 font-medium">
                            หมวดหมู่: <span className="text-slate-700">{t.category_name}</span>
                          </p>
                        )}

                        <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100">
                          <select
                            value={selectedTeams[t.ticket_id] || ''}
                            onChange={(e) => setSelectedTeams({ ...selectedTeams, [t.ticket_id]: e.target.value })}
                            className="flex-1 text-xs border border-slate-200 rounded-lg p-1.5 bg-slate-50 outline-none focus:border-blue-500 text-slate-700"
                          >
                            <option value="">-- เลือกทีมช่าง --</option>
                            {teams.map(team => (
                              <option key={team.team_id} value={team.team_id}>
                                {team.team_name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAssign(t.ticket_id, selectedTeams[t.ticket_id])}
                            disabled={assigningId === t.ticket_id || !selectedTeams[t.ticket_id]}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-40 transition-colors shadow-2xs shrink-0"
                          >
                            {assigningId === t.ticket_id ? 'มอบหมาย...' : 'มอบหมาย'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Team Matrix Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span>ตารางสถานะและภาระงานของทีมช่าง (Team Schedule Grid)</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      ดูงานที่แต่ละทีมกำลังทำอยู่ และกดปุ่ม "+ มอบหมายงาน" เพื่อส่งงานให้ทีมนั้นโดยตรง
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {teams.length > 0 ? (
                    teams.map(team => {
                      const loadData = teamWorkloadMap[team.team_id] || { inProgress: [], assigned: [], waitingReview: [], totalActive: 0 };
                      const isHeavy = loadData.totalActive >= 3;
                      const isAvailable = loadData.totalActive === 0;

                      return (
                        <div key={team.team_id} className="p-5 hover:bg-slate-50/50 transition-colors space-y-4">
                          {/* Team Row Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                                {team.team_name.slice(0, 1)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-bold text-sm text-slate-800">{team.team_name}</h3>
                                  <span className="font-mono text-[10px] text-slate-400 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                                    {team.team_id}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {team.description || 'ทีมช่างเทคนิคประจำศูนย์'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 self-end sm:self-center">
                              {/* Load badge */}
                              {isAvailable ? (
                                <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                                  ว่างพร้อมรับงาน
                                </span>
                              ) : isHeavy ? (
                                <span className="text-[11px] font-semibold bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full border border-rose-200">
                                  มีงานในมือ {loadData.totalActive} งาน (งานแน่น)
                                </span>
                              ) : (
                                <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
                                  กำลังทำ {loadData.totalActive} งาน
                                </span>
                              )}

                              {/* Direct Assign Button to this team */}
                              <button
                                onClick={() => {
                                  setTargetTeam(team);
                                  setSelectedTicketToAssign(waitingTickets[0]?.ticket_id || '');
                                  setShowAssignModal(true);
                                }}
                                disabled={waitingTickets.length === 0}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl flex items-center gap-1 transition-colors shadow-2xs disabled:opacity-40 disabled:hover:bg-blue-600"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>+ มอบหมายงานให้ทีมนี้</span>
                              </button>
                            </div>
                          </div>

                          {/* Team Jobs Columns (In Progress vs Queued vs Review) */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Column A: In Progress */}
                            <div className="border border-blue-100 rounded-xl p-3 bg-blue-50/20 space-y-2">
                              <div className="flex items-center justify-between text-xs font-bold text-blue-900 border-b border-blue-100 pb-1.5">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                                  <span>กำลังดำเนินการซ่อม ({loadData.inProgress.length})</span>
                                </span>
                              </div>
                              {loadData.inProgress.length > 0 ? (
                                <div className="space-y-2">
                                  {loadData.inProgress.map(t => (
                                    <div key={t.ticket_id} className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs space-y-1">
                                      <div className="flex items-center justify-between">
                                        <Link to={`/tickets/${t.ticket_id}`} className="font-mono text-xs font-bold text-blue-600 hover:underline">
                                          {t.ticket_id}
                                        </Link>
                                        <span className="text-[10px] text-slate-400">
                                          {t.priority === 'URGENT' ? 'ฉุกเฉิน' : 'ปกติ'}
                                        </span>
                                      </div>
                                      <p className="font-semibold text-xs text-slate-800 truncate">
                                        {t.branch_name || ('สาขา ' + t.branch_id)}
                                      </p>
                                      <div className="flex items-center justify-between pt-1">
                                        <StatusBadge status={t.status} size="xs" />
                                        <button
                                          onClick={() => {
                                            setReassignTicket(t);
                                            setNewTeamId('');
                                            setReassignReason('');
                                            setShowReassignModal(true);
                                          }}
                                          className="text-[10px] text-slate-500 hover:text-blue-600 underline font-medium"
                                        >
                                          เปลี่ยนทีม
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[11px] text-slate-400 py-3 text-center">ไม่มีงานที่กำลังทำอยู่</p>
                              )}
                            </div>

                            {/* Column B: Queued / Assigned */}
                            <div className="border border-purple-100 rounded-xl p-3 bg-purple-50/20 space-y-2">
                              <div className="flex items-center justify-between text-xs font-bold text-purple-900 border-b border-purple-100 pb-1.5">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                                  <span>มอบหมายแล้ว/รอคิว ({loadData.assigned.length})</span>
                                </span>
                              </div>
                              {loadData.assigned.length > 0 ? (
                                <div className="space-y-2">
                                  {loadData.assigned.map(t => (
                                    <div key={t.ticket_id} className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs space-y-1">
                                      <div className="flex items-center justify-between">
                                        <Link to={`/tickets/${t.ticket_id}`} className="font-mono text-xs font-bold text-blue-600 hover:underline">
                                          {t.ticket_id}
                                        </Link>
                                        <span className="text-[10px] text-slate-400">
                                          {t.priority === 'URGENT' ? 'ฉุกเฉิน' : 'ปกติ'}
                                        </span>
                                      </div>
                                      <p className="font-semibold text-xs text-slate-800 truncate">
                                        {t.branch_name || ('สาขา ' + t.branch_id)}
                                      </p>
                                      <div className="flex items-center justify-between pt-1">
                                        <StatusBadge status={t.status} size="xs" />
                                        <button
                                          onClick={() => {
                                            setReassignTicket(t);
                                            setNewTeamId('');
                                            setReassignReason('');
                                            setShowReassignModal(true);
                                          }}
                                          className="text-[10px] text-slate-500 hover:text-blue-600 underline font-medium"
                                        >
                                          เปลี่ยนทีม
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[11px] text-slate-400 py-3 text-center">ไม่มีงานในคิว</p>
                              )}
                            </div>

                            {/* Column C: Pending Review / Rework */}
                            <div className="border border-teal-100 rounded-xl p-3 bg-teal-50/20 space-y-2">
                              <div className="flex items-center justify-between text-xs font-bold text-teal-900 border-b border-teal-100 pb-1.5">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                                  <span>ช่างส่งงาน/รอตรวจ ({loadData.waitingReview.length})</span>
                                </span>
                              </div>
                              {loadData.waitingReview.length > 0 ? (
                                <div className="space-y-2">
                                  {loadData.waitingReview.map(t => (
                                    <div key={t.ticket_id} className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs space-y-1">
                                      <div className="flex items-center justify-between">
                                        <Link to={`/tickets/${t.ticket_id}`} className="font-mono text-xs font-bold text-blue-600 hover:underline">
                                          {t.ticket_id}
                                        </Link>
                                        <StatusBadge status={t.status} size="xs" />
                                      </div>
                                      <p className="font-semibold text-xs text-slate-800 truncate">
                                        {t.branch_name || ('สาขา ' + t.branch_id)}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[11px] text-slate-400 py-3 text-center">ไม่มีงานรอตรวจรับ</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-16 text-center text-slate-400">
                      <p>ยังไม่มีข้อมูลทีมช่างในระบบ</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 2: KANBAN BOARD VIEW (บอร์ดคัมบังจัดสรรงาน)          */}
          {/* ======================================================== */}
          {viewMode === 'kanban' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
              {/* Column 1: Waiting Assignment */}
              <div className="bg-slate-100/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>รอจัดสรรทีมช่าง</span>
                  </h3>
                  <span className="text-xs font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                    {waitingTickets.length}
                  </span>
                </div>
                <div className="space-y-3 min-h-[150px]">
                  {waitingTickets.map(t => (
                    <div key={t.ticket_id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                      <div className="flex items-start justify-between">
                        <Link to={`/tickets/${t.ticket_id}`} className="font-mono text-xs font-bold text-blue-600 hover:underline">
                          {t.ticket_id}
                        </Link>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          t.priority === 'URGENT' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {t.priority || 'NORMAL'}
                        </span>
                      </div>
                      <p className="font-semibold text-xs text-slate-800">
                        {t.branch_name || ('สาขา ' + t.branch_id)}
                      </p>
                      {t.category_name && (
                        <p className="text-[11px] text-slate-500 truncate">
                          {t.category_name}
                        </p>
                      )}
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <select
                          value={selectedTeams[t.ticket_id] || ''}
                          onChange={(e) => setSelectedTeams({ ...selectedTeams, [t.ticket_id]: e.target.value })}
                          className="w-full text-xs border border-slate-200 rounded-lg p-1.5 bg-slate-50 outline-none"
                        >
                          <option value="">-- เลือกทีมช่าง --</option>
                          {teams.map(team => (
                            <option key={team.team_id} value={team.team_id}>
                              {team.team_name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAssign(t.ticket_id, selectedTeams[t.ticket_id])}
                          disabled={assigningId === t.ticket_id || !selectedTeams[t.ticket_id]}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 rounded-lg disabled:opacity-40 transition-colors shadow-2xs"
                        >
                          มอบหมายงาน
                        </button>
                      </div>
                    </div>
                  ))}
                  {waitingTickets.length === 0 && (
                    <p className="text-center text-xs text-slate-400 py-8">ไม่มีงานรอจัดสรร</p>
                  )}
                </div>
              </div>

              {/* Column 2: Assigned */}
              <div className="bg-slate-100/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <span>มอบหมายแล้ว (รอคิว)</span>
                  </h3>
                  <span className="text-xs font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                    {assignedTickets.length}
                  </span>
                </div>
                <div className="space-y-3 min-h-[150px]">
                  {assignedTickets.map(t => (
                    <div key={t.ticket_id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                      <div className="flex items-start justify-between">
                        <Link to={`/tickets/${t.ticket_id}`} className="font-mono text-xs font-bold text-blue-600 hover:underline">
                          {t.ticket_id}
                        </Link>
                        <StatusBadge status={t.status} size="xs" />
                      </div>
                      <p className="font-semibold text-xs text-slate-800">
                        {t.branch_name || ('สาขา ' + t.branch_id)}
                      </p>
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>ทีม: <strong>{t.team_name || t.team || '-'}</strong></span>
                      </p>
                      <button
                        onClick={() => {
                          setReassignTicket(t);
                          setNewTeamId('');
                          setReassignReason('');
                          setShowReassignModal(true);
                        }}
                        className="w-full text-xs font-medium text-slate-600 hover:text-blue-600 py-1 border border-dashed border-slate-300 rounded-lg hover:border-blue-300 transition-colors"
                      >
                        เปลี่ยนทีมช่าง (Reassign)
                      </button>
                    </div>
                  ))}
                  {assignedTickets.length === 0 && (
                    <p className="text-center text-xs text-slate-400 py-8">ไม่มีงานในคิว</p>
                  )}
                </div>
              </div>

              {/* Column 3: In Progress */}
              <div className="bg-slate-100/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                    <span>กำลังดำเนินการซ่อม</span>
                  </h3>
                  <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                    {inProgressTickets.length}
                  </span>
                </div>
                <div className="space-y-3 min-h-[150px]">
                  {inProgressTickets.map(t => (
                    <div key={t.ticket_id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                      <div className="flex items-start justify-between">
                        <Link to={`/tickets/${t.ticket_id}`} className="font-mono text-xs font-bold text-blue-600 hover:underline">
                          {t.ticket_id}
                        </Link>
                        <StatusBadge status={t.status} size="xs" />
                      </div>
                      <p className="font-semibold text-xs text-slate-800">
                        {t.branch_name || ('สาขา ' + t.branch_id)}
                      </p>
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>ทีม: <strong>{t.team_name || t.team || '-'}</strong></span>
                      </p>
                      <Link 
                        to={`/tickets/${t.ticket_id}`}
                        className="w-full text-xs font-semibold text-blue-600 hover:text-blue-800 py-1.5 bg-blue-50 rounded-lg flex items-center justify-center gap-1"
                      >
                        <span>เปิดดูความคืบหน้า</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                  {inProgressTickets.length === 0 && (
                    <p className="text-center text-xs text-slate-400 py-8">ไม่มีงานกำลังซ่อม</p>
                  )}
                </div>
              </div>

              {/* Column 4: Waiting Review */}
              <div className="bg-slate-100/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                    <span>รอผู้จัดการตรวจรับ</span>
                  </h3>
                  <span className="text-xs font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200">
                    {reviewTickets.length}
                  </span>
                </div>
                <div className="space-y-3 min-h-[150px]">
                  {reviewTickets.map(t => (
                    <div key={t.ticket_id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                      <div className="flex items-start justify-between">
                        <Link to={`/tickets/${t.ticket_id}`} className="font-mono text-xs font-bold text-blue-600 hover:underline">
                          {t.ticket_id}
                        </Link>
                        <StatusBadge status={t.status} size="xs" />
                      </div>
                      <p className="font-semibold text-xs text-slate-800">
                        {t.branch_name || ('สาขา ' + t.branch_id)}
                      </p>
                      <Link 
                        to={`/tickets/${t.ticket_id}`}
                        className="w-full text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors"
                      >
                        <span>เปิดตรวจรับงาน</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                  {reviewTickets.length === 0 && (
                    <p className="text-center text-xs text-slate-400 py-8">ไม่มีงานรอตรวจรับ</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 3: QUEUE LIST VIEW (รายการคิวแบบตารางละเอียด)        */}
          {/* ======================================================== */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-800">รายการใบงานทั้งหมด ({filteredTickets.length} รายการ)</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">รหัสใบงาน</th>
                      <th className="py-3 px-4">สาขา</th>
                      <th className="py-3 px-4">หมวดหมู่งาน</th>
                      <th className="py-3 px-4">ความเร่งด่วน</th>
                      <th className="py-3 px-4">สถานะปัจจุบัน</th>
                      <th className="py-3 px-4">ทีมช่างที่รับผิดชอบ</th>
                      <th className="py-3 px-4 text-right">การจัดการมอบหมาย</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTickets.map(t => {
                      const isWaiting = ['NEW', 'SUBMITTED', 'WAITING_ASSIGNMENT'].includes(t.status);
                      return (
                        <tr key={t.ticket_id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                            <Link to={`/tickets/${t.ticket_id}`} className="hover:underline">
                              {t.ticket_id}
                            </Link>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-800">
                            {t.branch_name || ('สาขา ' + t.branch_id)}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {t.category_name || t.work_type_name || '-'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.priority === 'URGENT' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                              t.priority === 'HIGH' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {t.priority === 'URGENT' ? 'ฉุกเฉิน' : t.priority === 'HIGH' ? 'เร่งด่วน' : 'ปกติ'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusBadge status={t.status} size="xs" />
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 font-medium">
                            {t.team_name || t.team || (
                              <span className="text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded">ยังไม่ระบุ</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {isWaiting ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <select
                                  value={selectedTeams[t.ticket_id] || ''}
                                  onChange={(e) => setSelectedTeams({ ...selectedTeams, [t.ticket_id]: e.target.value })}
                                  className="text-xs border border-slate-200 rounded-lg p-1.5 bg-slate-50 outline-none max-w-[160px]"
                                >
                                  <option value="">-- เลือกทีมช่าง --</option>
                                  {teams.map(team => (
                                    <option key={team.team_id} value={team.team_id}>{team.team_name}</option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => handleAssign(t.ticket_id, selectedTeams[t.ticket_id])}
                                  disabled={assigningId === t.ticket_id || !selectedTeams[t.ticket_id]}
                                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-40 shadow-2xs transition-colors"
                                >
                                  มอบหมาย
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setReassignTicket(t);
                                  setNewTeamId('');
                                  setReassignReason('');
                                  setShowReassignModal(true);
                                }}
                                className="text-xs text-slate-600 hover:text-blue-600 font-medium px-2.5 py-1 rounded hover:bg-slate-100 transition-colors"
                              >
                                เปลี่ยนทีมช่าง
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ======================================================== */}
      {/* MODAL: DIRECT ASSIGN TO TEAM                             */}
      {/* ======================================================== */}
      {showAssignModal && targetTeam && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">มอบหมายงานให้ทีมช่าง</h3>
                <p className="text-xs text-blue-600 font-semibold mt-0.5">{targetTeam.team_name}</p>
              </div>
              <button 
                onClick={() => setShowAssignModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                เลือกใบงานที่ต้องการมอบหมายให้ทีมนี้:
              </label>
              <select
                value={selectedTicketToAssign}
                onChange={(e) => setSelectedTicketToAssign(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-xl p-2.5 bg-white outline-none focus:border-blue-500 font-medium"
              >
                <option value="">-- กรุณาเลือกใบงานรอจัดสรร --</option>
                {waitingTickets.map(t => (
                  <option key={t.ticket_id} value={t.ticket_id}>
                    {t.ticket_id} - {t.branch_name || ('สาขา ' + t.branch_id)} ({t.category_name || 'งานซ่อมทั่วไป'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => handleAssign(selectedTicketToAssign, targetTeam.team_id)}
                disabled={!selectedTicketToAssign || assigningId === selectedTicketToAssign}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold disabled:opacity-40 transition-colors shadow-2xs"
              >
                {assigningId === selectedTicketToAssign ? 'กำลังมอบหมาย...' : 'ยืนยันมอบหมายงาน'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: REASSIGN TEAM (โอนย้ายงาน)                          */}
      {/* ======================================================== */}
      {showReassignModal && reassignTicket && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">เปลี่ยนทีมช่างผู้รับผิดชอบ (Reassign)</h3>
                <p className="text-xs font-mono text-blue-600 font-bold mt-0.5">{reassignTicket.ticket_id}</p>
              </div>
              <button 
                onClick={() => setShowReassignModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReassign} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ทีมช่างเดิม</label>
                <p className="text-xs font-medium text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  {reassignTicket.team_name || reassignTicket.team || 'ไม่ระบุทีม'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">เลือกทีมช่างใหม่ *</label>
                <select
                  required
                  value={newTeamId}
                  onChange={(e) => setNewTeamId(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 bg-white outline-none focus:border-blue-500"
                >
                  <option value="">-- กรุณาเลือกทีมช่างใหม่ --</option>
                  {teams
                    .filter(t => t.team_id !== reassignTicket.team_id && t.team_name !== reassignTicket.team_name)
                    .map(team => (
                      <option key={team.team_id} value={team.team_id}>
                        {team.team_name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">เหตุผลในการเปลี่ยนทีมช่าง *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="เช่น ทีมเดิมติดเคสด่วนภายนอก, ปรับตามความเชี่ยวชาญเฉพาะทาง"
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReassignModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={assigningId === reassignTicket.ticket_id}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold disabled:opacity-40 transition-colors shadow-2xs"
                >
                  {assigningId === reassignTicket.ticket_id ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนทีม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
