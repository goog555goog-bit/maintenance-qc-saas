import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../../core/api';

const TicketList = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('table');
  const [tickets, setTickets] = useState([]);
  const [branches, setBranches] = useState([]);
  const [workTypes, setWorkTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterWorkType, setFilterWorkType] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ticketsRes, branchesRes, workTypesRes] = await Promise.all([
          apiCall('ticket.list'),
          apiCall('branch.list'),
          apiCall('work_type.list').catch(() => ({ data: [] }))
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
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterBranch && String(t.branch_id) !== String(filterBranch)) return false;
    if (filterWorkType && String(t.work_type_id) !== String(filterWorkType)) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    if (filterTeam && String(t.team_id) !== String(filterTeam)) return false;
    if (filterDate && (!t.created_at || !t.created_at.startsWith(filterDate))) return false;
    return true;
  });

  return (
    <div className="ticket-list p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">รายการใบแจ้งซ่อมทั้งหมด</h1>
        <div className="view-toggles flex border rounded">
          <button 
            className={`px-4 py-2 ${viewMode === 'table' ? 'bg-blue-100 font-bold' : ''}`}
            onClick={() => setViewMode('table')}
          >
            รูปแบบตาราง
          </button>
          <button 
            className={`px-4 py-2 ${viewMode === 'kanban' ? 'bg-blue-100 font-bold' : ''}`}
            onClick={() => setViewMode('kanban')}
          >
            รูปแบบคัมบัง (Kanban)
          </button>
        </div>
      </div>

      <div className="filters grid grid-cols-6 gap-2 mb-6">
        <select className="border p-2 rounded" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">สถานะ</option>
          <option value="NEW">รอจัดสรร</option>
          <option value="IN_PROGRESS">กำลังดำเนินการ</option>
          <option value="RESOLVED">รอตรวจรับ</option>
        </select>
        <select className="border p-2 rounded" value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}>
          <option value="">สาขา</option>
          {branches.map(b => (
            <option key={b.branch_id} value={b.branch_id}>{b.name}</option>
          ))}
        </select>
        <select className="border p-2 rounded" value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)}>
          <option value="">ทีมช่าง</option>
        </select>
        <select className="border p-2 rounded" value={filterWorkType} onChange={(e) => setFilterWorkType(e.target.value)}>
          <option value="">หมวดหมู่</option>
          {workTypes.map(wt => (
            <option key={wt.work_type_id} value={wt.work_type_id}>{wt.name}</option>
          ))}
        </select>
        <select className="border p-2 rounded" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="">ระดับความเร่งด่วน</option>
          <option value="LOW">ต่ำ</option>
          <option value="NORMAL">ปกติ</option>
          <option value="HIGH">สูง</option>
          <option value="URGENT">ด่วนที่สุด</option>
        </select>
        <input type="date" className="border p-2 rounded" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : viewMode === 'table' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 border-b">รหัสใบงาน</th>
                <th className="p-3 border-b">สาขา</th>
                <th className="p-3 border-b">หมวดหมู่งาน</th>
                <th className="p-3 border-b">สถานะ</th>
                <th className="p-3 border-b">ทีมที่รับผิดชอบ</th>
                <th className="p-3 border-b">วันที่สร้าง</th>
                <th className="p-3 border-b">ความเร่งด่วน</th>
                <th className="p-3 border-b">รอบการแก้ไข</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-lg font-medium text-gray-600 mb-2">ยังไม่มีข้อมูลใบงาน</p>
                      <p className="text-sm text-gray-400">กดปุ่ม 'สร้างใบแจ้งซ่อมใหม่' เพื่อเริ่มต้น</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTickets.map(ticket => (
                  <tr 
                    key={ticket.ticket_id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate('/tickets/' + ticket.ticket_id)}
                  >
                    <td className="p-3 border-b">{ticket.ticket_id}</td>
                    <td className="p-3 border-b">{ticket.branch_name || ticket.branch_id}</td>
                    <td className="p-3 border-b">{ticket.work_type_name || ticket.work_type_id}</td>
                    <td className="p-3 border-b">{ticket.status}</td>
                    <td className="p-3 border-b">{ticket.team_name || ticket.team_id || '-'}</td>
                    <td className="p-3 border-b">{ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : '-'}</td>
                    <td className="p-3 border-b">{ticket.priority}</td>
                    <td className="p-3 border-b">-</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="kanban-board flex gap-4">
          <div className="kanban-column flex-1 bg-gray-50 p-4 rounded min-h-[400px]">
            <h3 className="font-bold border-b pb-2 mb-4">รอจัดสรร</h3>
            {filteredTickets.filter(t => t.status === 'NEW' || t.status === 'รอจัดสรร').length === 0 ? (
              <p className="text-center text-gray-500 mt-8">ยังไม่มีข้อมูลใบงาน</p>
            ) : (
              filteredTickets.filter(t => t.status === 'NEW' || t.status === 'รอจัดสรร').map(ticket => (
                <div key={ticket.ticket_id} className="bg-white p-3 rounded shadow mb-3 cursor-pointer" onClick={() => navigate('/tickets/' + ticket.ticket_id)}>
                  <div className="font-bold">{ticket.ticket_id}</div>
                  <div className="text-sm text-gray-600">{ticket.branch_name || ticket.branch_id}</div>
                </div>
              ))
            )}
          </div>
          <div className="kanban-column flex-1 bg-gray-50 p-4 rounded min-h-[400px]">
            <h3 className="font-bold border-b pb-2 mb-4">กำลังดำเนินการ</h3>
            {filteredTickets.filter(t => t.status === 'IN_PROGRESS' || t.status === 'กำลังดำเนินการ').length === 0 ? (
              <p className="text-center text-gray-500 mt-8">ยังไม่มีข้อมูลใบงาน</p>
            ) : (
              filteredTickets.filter(t => t.status === 'IN_PROGRESS' || t.status === 'กำลังดำเนินการ').map(ticket => (
                <div key={ticket.ticket_id} className="bg-white p-3 rounded shadow mb-3 cursor-pointer" onClick={() => navigate('/tickets/' + ticket.ticket_id)}>
                  <div className="font-bold">{ticket.ticket_id}</div>
                  <div className="text-sm text-gray-600">{ticket.branch_name || ticket.branch_id}</div>
                </div>
              ))
            )}
          </div>
          <div className="kanban-column flex-1 bg-gray-50 p-4 rounded min-h-[400px]">
            <h3 className="font-bold border-b pb-2 mb-4">รอตรวจรับ</h3>
            {filteredTickets.filter(t => t.status === 'RESOLVED' || t.status === 'รอตรวจรับ').length === 0 ? (
              <p className="text-center text-gray-500 mt-8">ยังไม่มีข้อมูลใบงาน</p>
            ) : (
              filteredTickets.filter(t => t.status === 'RESOLVED' || t.status === 'รอตรวจรับ').map(ticket => (
                <div key={ticket.ticket_id} className="bg-white p-3 rounded shadow mb-3 cursor-pointer" onClick={() => navigate('/tickets/' + ticket.ticket_id)}>
                  <div className="font-bold">{ticket.ticket_id}</div>
                  <div className="text-sm text-gray-600">{ticket.branch_name || ticket.branch_id}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketList;
