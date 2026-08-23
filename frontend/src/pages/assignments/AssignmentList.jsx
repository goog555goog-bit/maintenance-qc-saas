import React, { useState, useEffect } from 'react';
import { UserPlus, Clock, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import { apiCall } from '../../core/api';
import StatusBadge from '../../components/ui/StatusBadge';

export default function AssignmentList() {
  const [waitingAssignments, setWaitingAssignments] = useState([]);
  const [historyAssignments, setHistoryAssignments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeams, setSelectedTeams] = useState({});
  const [assigningId, setAssigningId] = useState(null);
  const [notification, setNotification] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ticketsRes, teamsRes] = await Promise.all([
        apiCall('ticket.list'),
        apiCall('team.list').catch(() => [])
      ]);
      
      const toArray = (v) => Array.isArray(v) ? v : (Array.isArray(v?.tickets) ? v.tickets : (Array.isArray(v?.data) ? v.data : []));
      const tickets = toArray(ticketsRes);
      const teamsData = toArray(teamsRes);
      
      const waiting = tickets.filter(t => 
        ['NEW', 'SUBMITTED', 'WAITING_ASSIGNMENT'].includes(t.status)
      );
      const history = tickets.filter(t => 
        !['NEW', 'SUBMITTED', 'WAITING_ASSIGNMENT'].includes(t.status)
      );
      
      setWaitingAssignments(waiting);
      setHistoryAssignments(history);
      setTeams(teamsData);
    } catch (err) {
      console.error('Error fetching assignment data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (ticketId) => {
    const teamId = selectedTeams[ticketId];
    if (!teamId) {
      setNotification({ type: 'error', message: 'กรุณาเลือกทีมช่างก่อนทำการมอบหมาย' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    
    setAssigningId(ticketId);
    try {
      await apiCall('ticket.assign', { ticket_id: ticketId, team_id: teamId });
      setNotification({ type: 'success', message: `มอบหมายใบงาน ${ticketId} ให้ทีมช่างเรียบร้อยแล้ว` });
      setTimeout(() => setNotification(null), 4000);
      fetchData();
      setSelectedTeams(prev => ({ ...prev, [ticketId]: '' }));
    } catch (err) {
      console.error('Error assigning team:', err);
      setNotification({ type: 'error', message: 'เกิดข้อผิดพลาดในการมอบหมายงาน: ' + err.message });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setAssigningId(null);
    }
  };

  const handleTeamChange = (ticketId, teamId) => {
    setSelectedTeams(prev => ({
      ...prev,
      [ticketId]: teamId
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">คิวจัดสรรและมอบหมายทีมช่าง</h1>
          <p className="text-xs text-slate-500 mt-0.5">จัดสรรใบงานที่ส่งเข้ามาใหม่ให้แก่ทีมช่างที่รับผิดชอบ</p>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl mb-6 text-sm flex items-center gap-2 border ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Waiting for Assignment */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" /> รายการใบงานรอจัดสรร
              </span>
              <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200">
                {waitingAssignments.length} รายการ
              </span>
            </h2>
            <div className="space-y-4">
              {waitingAssignments.length === 0 ? (
                <div className="text-center p-8 border border-dashed border-slate-300 rounded-xl bg-slate-50">
                  <p className="text-slate-500 text-sm font-medium">ไม่มีใบงานที่รอจัดสรรทีมช่างในขณะนี้</p>
                </div>
              ) : (
                waitingAssignments.map(assignment => (
                  <div key={assignment.ticket_id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 hover:bg-white transition-all space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          {assignment.ticket_id}
                        </span>
                        <h3 className="font-semibold text-slate-800 text-sm mt-1">
                          {assignment.branch_name || ('สาขา ' + assignment.branch_id)}
                        </h3>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(assignment.created_at || Date.now()).toLocaleDateString('th-TH')}
                      </span>
                    </div>

                    {assignment.overview && (
                      <p className="text-xs text-slate-600 line-clamp-2 bg-white p-2 rounded border border-slate-100">
                        {assignment.overview}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <select 
                        className="flex-1 text-xs border border-slate-300 rounded-lg p-2 bg-white focus:border-blue-500 outline-none"
                        value={selectedTeams[assignment.ticket_id] || ''}
                        onChange={(e) => handleTeamChange(assignment.ticket_id, e.target.value)}
                      >
                        <option value="">-- เลือกทีมช่างเพื่อมอบหมาย --</option>
                        {teams.map(team => (
                          <option key={team.team_id} value={team.team_id}>
                            {team.team_name}
                          </option>
                        ))}
                      </select>
                      <button 
                        onClick={() => handleAssign(assignment.ticket_id)}
                        disabled={assigningId === assignment.ticket_id}
                        className="bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-1.5 shrink-0 transition-colors disabled:bg-blue-400"
                      >
                        <UserPlus className="h-3.5 w-3.5" /> 
                        {assigningId === assignment.ticket_id ? 'กำลังมอบหมาย...' : 'มอบหมาย'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recently Assigned / Active */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" /> ใบงานที่มอบหมายแล้ว
              </span>
              <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                {historyAssignments.length} รายการ
              </span>
            </h2>
            <div className="space-y-4">
              {historyAssignments.length === 0 ? (
                <div className="text-center p-8 border border-dashed border-slate-300 rounded-xl bg-slate-50">
                  <p className="text-slate-500 text-sm font-medium">ยังไม่มีประวัติการมอบหมายใบงาน</p>
                </div>
              ) : (
                historyAssignments.slice(0, 10).map(assignment => (
                  <div key={assignment.ticket_id} className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-700">
                          {assignment.ticket_id}
                        </span>
                        <p className="text-xs font-medium text-slate-800 mt-0.5">
                          {assignment.branch_name || ('สาขา ' + assignment.branch_id)}
                        </p>
                      </div>
                      <StatusBadge status={assignment.status} size="xs" />
                    </div>
                    {assignment.team_name && (
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>ทีมผู้รับผิดชอบ: <strong className="text-slate-700">{assignment.team_name}</strong></span>
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
