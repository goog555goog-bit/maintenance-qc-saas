import React, { useState, useEffect } from 'react';
import { Search, Archive, Download, Loader2, Ticket, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { apiCall } from '@/core/api';

export default function ArchiveList() {
  const navigate = useNavigate();
  const [archives, setArchives] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArchives();
  }, []);

  const fetchArchives = async () => {
    setLoading(true);
    try {
      const res = await apiCall('archive.list');
      const tickets = Array.isArray(res) ? res : (Array.isArray(res?.tickets) ? res.tickets : (Array.isArray(res?.data) ? res.data : []));
      const archived = tickets.filter(t => t.status === 'CLOSED' || t.status === 'ARCHIVED');
      setArchives(archived);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArchives = archives.filter(item => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const matchId = item.ticket_id && String(item.ticket_id).toLowerCase().includes(q);
    const matchBranch = item.branch_name && String(item.branch_name).toLowerCase().includes(q);
    const matchOverview = item.overview && String(item.overview).toLowerCase().includes(q);
    const matchTeam = item.team_name && String(item.team_name).toLowerCase().includes(q);
    return matchId || matchBranch || matchOverview || matchTeam;
  });

  const handleExportCSV = () => {
    if (filteredArchives.length === 0) return;
    const headers = ['รหัสใบงาน', 'สาขา', 'หมวดหมู่งาน', 'ทีมช่าง', 'วันที่ปิดงาน', 'สถานะ'];
    const rows = filteredArchives.map(a => [
      `"${a.ticket_id}"`,
      `"${a.branch_name || ('สาขา ' + a.branch_id)}"`,
      `"${a.category_name || '-'}"`,
      `"${a.team_name || '-'}"`,
      `"${a.created_at ? new Date(a.created_at).toLocaleDateString('th-TH') : '-'}"`,
      `"${a.status}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `archived_tickets_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">คลังข้อมูลใบงานที่ปิดแล้ว (Archive)</h1>
          <p className="text-xs text-slate-500 mt-0.5">ค้นหาและสืบค้นประวัติใบงานแจ้งซ่อมที่ปิดงานสมบูรณ์แล้วในระบบ</p>
        </div>
        <button 
          onClick={handleExportCSV}
          disabled={filteredArchives.length === 0}
          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>ส่งออกประวัติ CSV</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="ค้นหารหัสใบงาน, ชื่อสาขา, หรือทีมช่าง..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 py-2 w-full text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white" 
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase bg-slate-50/70">
                <th className="py-3 px-4">รหัสใบงาน</th>
                <th className="py-3 px-4">สาขา</th>
                <th className="py-3 px-4">หมวดหมู่งาน</th>
                <th className="py-3 px-4">ทีมช่างผู้ดูแล</th>
                <th className="py-3 px-4">วันที่แจ้ง</th>
                <th className="py-3 px-4">สถานะ</th>
                <th className="py-3 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <span>กำลังโหลดคลังข้อมูลใบงาน...</span>
                  </td>
                </tr>
              ) : filteredArchives.length > 0 ? (
                filteredArchives.map(item => (
                  <tr 
                    key={item.ticket_id} 
                    className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                    onClick={() => navigate(`/tickets/${item.ticket_id}`)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      {item.ticket_id}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {item.branch_name || ('สาขา ' + item.branch_id)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.category_name || item.work_type_name || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {item.team_name || item.team || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('th-TH') : '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>ปิดงานสมบูรณ์</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link 
                        to={`/tickets/${item.ticket_id}`}
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
                  <td colSpan="7" className="py-16 text-center text-slate-400">
                    <Archive className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-sm text-slate-600">ยังไม่มีรายการใบงานในคลังประวัติ</p>
                    <p className="text-xs text-slate-400 mt-1">ใบงานที่ได้รับการอนุมัติปิดงานสมบูรณ์จะแสดงขึ้นที่นี่</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
