import React, { useState, useEffect } from 'react';
import { Users, Briefcase, History, Inbox, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { apiCall } from '@/core/api';

export default function TeamManagement() {
  const [teams, setTeams] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamDetail, setTeamDetail] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  
  const [form, setForm] = useState({ team_name: '', description: '' });
  const [selectedUserToAdd, setSelectedUserToAdd] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [teamsRes, usersRes] = await Promise.all([
        apiCall('team.list', {}),
        apiCall('user.list', {})
      ]);
      setTeams(Array.isArray(teamsRes) ? teamsRes : (Array.isArray(teamsRes?.data) ? teamsRes.data : []));
      setAllUsers(Array.isArray(usersRes) ? usersRes : (Array.isArray(usersRes?.data) ? usersRes.data : []));
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
    setLoading(true);
    setError(null);
    try {
      await apiCall('team.create', form);
      setShowModal(false);
      setForm({ team_name: '', description: '' });
      fetchData();
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการสร้างทีม');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserToAdd || !selectedTeam) return;
    
    setLoading(true);
    setError(null);
    try {
      await apiCall('team.addMember', { team_id: selectedTeam.team_id, user_id: selectedUserToAdd });
      setShowAddMember(false);
      setSelectedUserToAdd('');
      loadTeamDetail(selectedTeam.team_id);
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเพิ่มสมาชิก');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (assignment_id) => {
    if (!window.confirm('คุณต้องการนำสมาชิกออกจากทีมใช่หรือไม่?')) return;
    
    setLoading(true);
    setError(null);
    try {
      await apiCall('team.removeMember', { assignment_id });
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
    <div className="p-6 relative">
      {loading && (
        <div className="fixed inset-0 bg-slate-900/20 z-40 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
             <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full"></div>
             <span className="font-medium text-slate-700">กำลังโหลด...</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">จัดการทีมช่างเทคนิค</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm transition-colors"
        >
          เพิ่มทีมช่าง
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 border border-slate-200 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="bg-slate-50 p-4 border-b border-slate-200 font-semibold text-slate-700">รายชื่อทีม</div>
          {teams.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center flex-1 p-8 text-center text-slate-500">
              <Inbox className="h-12 w-12 text-slate-300 mb-3" />
              <p className="text-sm font-medium">ยังไม่มีข้อมูลทีมช่าง</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 overflow-y-auto">
              {teams.map(team => (
                <li 
                  key={team.team_id} 
                  className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${selectedTeam?.team_id === team.team_id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                  onClick={() => handleSelectTeam(team)}
                >
                  <h3 className="font-semibold text-slate-800">{team.team_name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{team.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="lg:col-span-2 border border-slate-200 bg-white rounded-lg shadow-sm flex flex-col h-[600px]">
          {!teamDetail ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-6 text-center">
              <Users className="h-16 w-16 text-slate-200 mb-4" />
              <p className="text-lg font-medium text-slate-600">ยังไม่ได้เลือกทีมช่าง</p>
              <p className="text-sm text-slate-400 mt-2">โปรดเลือกทีมช่างจากรายการด้านซ้ายเพื่อดูรายละเอียด</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-slate-200 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{teamDetail.team_name}</h2>
                  <p className="text-slate-500 mt-1">{teamDetail.description}</p>
                </div>
                <button 
                  onClick={() => setShowAddMember(true)}
                  className="bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-md hover:bg-slate-50 text-sm font-medium flex items-center gap-2 shadow-sm"
                >
                  <Plus className="h-4 w-4" /> เพิ่มสมาชิก
                </button>
              </div>
              
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-50 shadow-sm z-10">
                    <tr className="border-b border-slate-200">
                      <th className="p-4 text-sm font-semibold text-slate-600">รหัสพนักงาน</th>
                      <th className="p-4 text-sm font-semibold text-slate-600">ชื่อ-นามสกุล</th>
                      <th className="p-4 text-sm font-semibold text-slate-600">บทบาท</th>
                      <th className="p-4 text-sm font-semibold text-slate-600 w-24">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!teamDetail.members || teamDetail.members.length === 0) ? (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-slate-500">
                          ไม่มีสมาชิกในทีมนี้
                        </td>
                      </tr>
                    ) : (
                      teamDetail.members.map(member => (
                        <tr key={member.assignment_id || member.user_id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-4 text-sm font-medium text-slate-700">{member.user_id}</td>
                          <td className="p-4 text-sm text-slate-800">{member.name || member.full_name || 'ไม่ทราบชื่อ'}</td>
                          <td className="p-4 text-sm text-slate-500">{member.role || 'ช่างเทคนิค'}</td>
                          <td className="p-4">
                            <button 
                              onClick={() => handleRemoveMember(member.assignment_id)}
                              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                              title="นำออก"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">เพิ่มทีมช่าง</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleCreateTeam} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อทีม</label>
                  <input 
                    type="text"
                    required
                    value={form.team_name}
                    onChange={(e) => setForm({...form, team_name: e.target.value})}
                    className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียด (ถ้ามี)</label>
                  <textarea 
                    rows="3"
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                    className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500 outline-none"
                  ></textarea>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">เพิ่มสมาชิกทีม</h2>
              <button onClick={() => setShowAddMember(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleAddMember} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">เลือกพนักงาน</label>
                  <select 
                    required
                    value={selectedUserToAdd}
                    onChange={(e) => setSelectedUserToAdd(e.target.value)}
                    className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="" disabled>-- เลือกพนักงาน --</option>
                    {availableUsers.map(user => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.user_id} - {user.name || user.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddMember(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  disabled={loading || !selectedUserToAdd}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  เพิ่มเข้าทีม
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
