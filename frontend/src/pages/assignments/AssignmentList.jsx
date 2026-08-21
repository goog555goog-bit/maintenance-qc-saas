import React, { useState, useEffect } from 'react';
import { UserPlus, Clock } from 'lucide-react';
import { apiCall } from '../../core/api';

export default function AssignmentList() {
  const [waitingAssignments, setWaitingAssignments] = useState([]);
  const [historyAssignments, setHistoryAssignments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeams, setSelectedTeams] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ticketsRes, teamsRes] = await Promise.all([
        apiCall('ticket.list'),
        apiCall('team.list').catch(() => ({ data: [] }))
      ]);
      
      if (ticketsRes.success) {
        const tickets = ticketsRes.data || [];
        const waiting = tickets.filter(t => 
          ['NEW', 'SUBMITTED', 'WAITING_ASSIGNMENT'].includes(t.status)
        );
        const history = tickets.filter(t => 
          t.team_id && !['NEW', 'SUBMITTED', 'WAITING_ASSIGNMENT'].includes(t.status)
        );
        
        setWaitingAssignments(waiting);
        setHistoryAssignments(history);
      }
      
      if (teamsRes && teamsRes.success) {
        setTeams(teamsRes.data || []);
      }
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
      alert('กรุณาเลือกทีมช่าง');
      return;
    }
    
    try {
      const res = await apiCall('ticket.assign', { ticket_id: ticketId, team_id: teamId });
      if (res.success) {
        // Refetch on success
        fetchData();
        // Clear selected team
        setSelectedTeams(prev => ({ ...prev, [ticketId]: '' }));
      } else {
        alert('มอบหมายงานไม่สำเร็จ: ' + (res.message || 'ข้อผิดพลาดไม่ทราบสาเหตุ'));
      }
    } catch (err) {
      console.error('Error assigning team:', err);
      alert('เกิดข้อผิดพลาดในการมอบหมายงาน');
    }
  };

  const handleTeamChange = (ticketId, teamId) => {
    setSelectedTeams(prev => ({
      ...prev,
      [ticketId]: teamId
    }));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">คิวจัดสรรและมอบหมายทีมช่าง</h1>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" /> รายการใบงานรอจัดสรร
            </h2>
            <div className="space-y-4">
              {waitingAssignments.length === 0 ? (
                <div className="text-center p-8 border border-dashed border-slate-300 rounded-lg bg-slate-50">
                  <p className="text-slate-500 font-medium">ไม่มีใบงานที่รอจัดสรรทีมช่าง</p>
                </div>
              ) : (
                waitingAssignments.map(assignment => (
                  <div key={assignment.ticket_id} className="border border-slate-200 rounded p-4 bg-slate-50 hover:bg-white transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-sm text-slate-600">{assignment.ticket_id}</span>
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold">{assignment.priority || 'NORMAL'}</span>
                    </div>
                    <h3 className="font-medium text-slate-800 mb-1">{assignment.work_type_name || assignment.work_type_id || 'ไม่ระบุหมวดหมู่'}</h3>
                    <p className="text-sm text-slate-500 mb-3">{assignment.branch_name || assignment.branch_id || 'ไม่ระบุสาขา'}</p>
                    <div className="flex gap-2">
                      <select 
                        className="flex-1 rounded border border-slate-300 p-1.5 text-sm focus:border-blue-500"
                        value={selectedTeams[assignment.ticket_id] || ''}
                        onChange={(e) => handleTeamChange(assignment.ticket_id, e.target.value)}
                      >
                        <option value="">เลือกทีมช่าง...</option>
                        {teams.map(team => (
                          <option key={team.team_id} value={team.team_id}>{team.name}</option>
                        ))}
                      </select>
                      <button 
                        onClick={() => handleAssign(assignment.ticket_id)}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700"
                      >
                        มอบหมายงาน
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-500" /> ประวัติการมอบหมาย
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="p-2 text-sm font-semibold text-slate-600">รหัสใบงาน</th>
                    <th className="p-2 text-sm font-semibold text-slate-600">ทีมช่าง</th>
                    <th className="p-2 text-sm font-semibold text-slate-600">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {historyAssignments.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="p-8 text-center text-slate-500 border-b border-slate-100">
                        ไม่มีประวัติการมอบหมาย
                      </td>
                    </tr>
                  ) : (
                    historyAssignments.map(history => (
                      <tr key={history.ticket_id} className="border-b border-slate-100">
                        <td className="p-2 text-sm font-mono text-slate-800">{history.ticket_id}</td>
                        <td className="p-2 text-sm text-slate-600">{history.team_name || history.team_id || '-'}</td>
                        <td className="p-2 text-sm font-medium">{history.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
