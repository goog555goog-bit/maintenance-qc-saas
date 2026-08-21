import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Shield, UserPlus, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiCall } from '@/core/api';

export default function TeamManagement() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamDetail, setTeamDetail] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [teamsRes, usersRes] = await Promise.all([
        apiCall('team.list', {}),
        apiCall('user.list', {})
      ]);
      const teamsList = Array.isArray(teamsRes) ? teamsRes : (Array.isArray(teamsRes?.data) ? teamsRes.data : []);
      const usersList = Array.isArray(usersRes) ? usersRes : (Array.isArray(usersRes?.data) ? usersRes.data : []);
      setTeams(teamsList);
      setAllUsers(usersList);

      if (teamsList.length > 0 && !selectedTeam) {
        handleSelectTeam(teamsList[0]);
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const loadTeamDetail = async (team_id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiCall('team.get', { team_id });
      const detail = res?.data || res || null;
      setTeamDetail(detail);
      const team = teams.find(t => t.team_id === team_id);
      setSelectedTeam(team || detail);
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดรายละเอียดทีม');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTeam = (team) => {
    loadTeamDetail(team.team_id);
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await apiCall('team.create', { team_name: newTeamName.trim(), description: newTeamDesc.trim() });
      setShowModal(false);
      setNewTeamName('');
      setNewTeamDesc('');
      setSuccessMsg('สร้างทีมช่างใหม่สำเร็จ');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchData();
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการสร้างทีม');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !selectedTeam) return;
    setLoading(true);
    setError(null);
    try {
      await apiCall('team.addMember', { 
        team_id: selectedTeam.team_id, 
        user_id: selectedUserId,
        role: 'MEMBER'
      });
      setShowAddMember(false);
      setSelectedUserId('');
      setSuccessMsg('เพิ่มสมาชิกเข้าทีมเรียบร้อยแล้ว');
      setTimeout(() => setSuccessMsg(''), 3000);
      loadTeamDetail(selectedTeam.team_id);
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเพิ่มสมาชิก');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (assignment_id) => {
    if (!confirm('คุณต้องการนำสมาชิกคนนี้ออกจากทีมใช่หรือไม่?')) return;
    setLoading(true);
    setError(null);
    try {
      await apiCall('team.removeMember', { assignment_id });
      setSuccessMsg('นำสมาชิกออกจากทีมเรียบร้อยแล้ว');
      setTimeout(() => setSuccessMsg(''), 3000);
      loadTeamDetail(selectedTeam.team_id);
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการนำสมาชิกออก');
    } finally {
      setLoading(false);
    }
  };

  // Filter out users who are already in the team
  const availableUsers = allUsers.filter(user => {
    if (!teamDetail || !teamDetail.members) return true;
    return !teamDetail.members.some(member => member.user_id === user.user_id);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการทีมช่างเทคนิค</h1>
          <p className="text-xs text-slate-500 mt-0.5">บริหารจัดการทีมงาน กำหนดหัวหน้าทีม และจัดสรรกำลังพลช่างเทคนิค</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>สร้างทีมช่างใหม่</span>
        </button>
      </div>
      
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Teams List */}
        <div className="border border-slate-200 bg-white rounded-xl shadow-xs overflow-hidden flex flex-col h-[560px]">
          <div className="bg-slate-50/70 p-4 border-b border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>รายชื่อทีมช่างทั้งหมด</span>
            <span className="text-[11px] font-mono font-semibold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
              {teams.length} ทีม
            </span>
          </div>

          {teams.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center flex-1 p-8 text-center text-slate-400">
              <Users className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-xs font-medium text-slate-600">ยังไม่มีข้อมูลทีมช่าง</p>
              <p className="text-[11px] text-slate-400 mt-1">กดปุ่ม 'สร้างทีมช่างใหม่' เพื่อเริ่มต้น</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 overflow-y-auto flex-1">
              {teams.map(team => {
                const isSelected = selectedTeam?.team_id === team.team_id;
                return (
                  <li 
                    key={team.team_id} 
                    className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/70 border-l-4 border-blue-600' : ''
                    }`}
                    onClick={() => handleSelectTeam(team)}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xs text-slate-800">{team.team_name}</h3>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                        {team.team_id}
                      </span>
                    </div>
                    {team.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">{team.description}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        
        {/* Right: Team Details & Members */}
        <div className="lg:col-span-2 border border-slate-200 bg-white rounded-xl shadow-xs flex flex-col h-[560px] overflow-hidden">
          {!teamDetail ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <Users className="h-12 w-12 text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-700">ยังไม่ได้เลือกทีมช่าง</p>
              <p className="text-xs text-slate-400 mt-1">โปรดเลือกทีมช่างจากรายการด้านซ้ายเพื่อดูรายชื่อสมาชิก</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Team Top Header */}
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-800">{teamDetail.team_name}</h2>
                    <span className="font-mono text-xs text-slate-400">({teamDetail.team_id})</span>
                  </div>
                  {teamDetail.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{teamDetail.description}</p>
                  )}
                </div>
                <button 
                  onClick={() => setShowAddMember(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>เพิ่มสมาชิกเข้าทีม</span>
                </button>
              </div>
              
              {/* Member Table */}
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase">
                    <tr>
                      <th className="py-3 px-4">รหัสพนักงาน</th>
                      <th className="py-3 px-4">ชื่อผู้ใช้งาน</th>
                      <th className="py-3 px-4">บทบาท</th>
                      <th className="py-3 px-4 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teamDetail.members && teamDetail.members.length > 0 ? (
                      teamDetail.members.map((member) => (
                        <tr key={member.assignment_id || member.user_id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-blue-600">
                            {member.user_id}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-800">
                            {member.username || member.user_id}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-slate-50 text-slate-600 border-slate-200">
                              {member.role || 'ช่างเทคนิค'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button 
                              onClick={() => handleRemoveMember(member.assignment_id)} 
                              className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50 transition-colors"
                              title="นำออกจากทีม"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-16 text-center text-slate-400">
                          <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                          <p className="font-medium text-sm text-slate-600">ทีมนี้ยังไม่มีสมาชิก</p>
                          <p className="text-xs text-slate-400 mt-1">กดปุ่ม 'เพิ่มสมาชิกเข้าทีม' ด้านบนเพื่อเพิ่มช่างเทคนิค</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Team */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-800">สร้างทีมช่างใหม่</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTeam} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อทีมช่าง *</label>
                <input 
                  type="text" 
                  required
                  placeholder="เช่น ทีมช่างระบบปรับอากาศโซนตะวันออก"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">รายละเอียดขอบเขตงาน</label>
                <textarea 
                  rows={3}
                  placeholder="เช่น รับผิดชอบงานแอร์และระบบทำความเย็น โซน กทม. และปริมณฑล"
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs disabled:bg-blue-300"
                >
                  {loading ? 'กำลังบันทึก...' : 'สร้างทีม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Member */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-800">เพิ่มสมาชิกเข้าทีม: {selectedTeam?.team_name}</h2>
              <button onClick={() => setShowAddMember(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">เลือกช่างเทคนิค *</label>
                <select
                  required
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white font-medium"
                >
                  <option value="">-- เลือกช่างเทคนิค --</option>
                  {availableUsers.map(u => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.username || u.user_id} ({u.user_id}) - {u.role}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  disabled={loading || !selectedUserId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs disabled:bg-blue-300"
                >
                  {loading ? 'กำลังเพิ่ม...' : 'เพิ่มเข้าทีม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
