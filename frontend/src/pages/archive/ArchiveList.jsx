import React, { useState, useEffect } from 'react';
import { Search, Filter, Archive, Inbox, Loader2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

  const filteredArchives = archives.filter(item => 
    (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.team && item.team.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Archive className="h-6 w-6 text-slate-500" /> คลังข้อมูลใบงานที่ปิดแล้ว (Archive)
        </h1>
        <button className="flex items-center gap-2 border border-slate-300 bg-white px-4 py-2 rounded-md hover:bg-slate-50 text-sm font-medium text-slate-700 shadow-sm">
          <Download className="h-4 w-4" /> ส่งออกข้อมูล
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="ค้นหาข้อมูล..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500" 
          />
        </div>
        <button className="flex items-center gap-2 border border-slate-300 px-3 py-2 rounded-md hover:bg-slate-50 bg-white text-sm font-medium">
          <Filter className="h-4 w-4" /> ตัวกรอง
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto min-h-[400px] flex flex-col">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-3 text-sm font-semibold text-slate-600">รหัสใบงาน</th>
              <th className="p-3 text-sm font-semibold text-slate-600">หัวข้อ</th>
              <th className="p-3 text-sm font-semibold text-slate-600">หมวดหมู่</th>
              <th className="p-3 text-sm font-semibold text-slate-600">วันที่ปิดงาน</th>
              <th className="p-3 text-sm font-semibold text-slate-600">ทีมช่าง</th>
              <th className="p-3 text-sm font-semibold text-slate-600">สถานะ</th>
              <th className="p-3 text-sm font-semibold text-slate-600">จัดการ</th>
            </tr>
          </thead>
          {!loading && filteredArchives.length > 0 && (
            <tbody>
              {filteredArchives.map(item => (
                <tr key={item.id || item.code} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 text-sm font-mono text-slate-800">{item.code}</td>
                  <td className="p-3 text-sm text-slate-600">{item.title}</td>
                  <td className="p-3 text-sm text-slate-600">{item.category || '-'}</td>
                  <td className="p-3 text-sm text-slate-600">{item.closedDate || item.updatedAt || '-'}</td>
                  <td className="p-3 text-sm text-slate-600">{item.team || '-'}</td>
                  <td className="p-3 text-sm">
                    <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs font-bold">ปิดงานแล้ว</span>
                  </td>
                  <td className="p-3">
                    <button onClick={() => navigate(`/tickets/${item.code}`)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">ดูข้อมูล (Read-only)</button>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
        
        {loading && (
          <div className="flex flex-col items-center justify-center flex-1 py-16 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-slate-300 mb-4" />
            <p className="text-sm font-medium text-slate-600">กำลังโหลดข้อมูล...</p>
          </div>
        )}

        {!loading && filteredArchives.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 py-16 text-slate-500">
            <Inbox className="h-16 w-16 text-slate-200 mb-4" />
            <p className="text-lg font-medium text-slate-600">ไม่พบข้อมูลใบงาน</p>
            <p className="text-sm text-slate-400 mt-1">ยังไม่มีใบงานที่ปิดแล้ว หรือไม่พบผลลัพธ์จากการค้นหา</p>
          </div>
        )}
      </div>
    </div>
  );
}
