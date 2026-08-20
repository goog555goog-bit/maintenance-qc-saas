import React from 'react';
import { Search, Filter, Archive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ArchiveList() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Archive className="h-6 w-6 text-slate-500" /> คลังประวัติใบงานที่ปิดแล้ว (Archive)
      </h1>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="ค้นหาประวัติย้อนหลัง (รหัส, สาขา, ทีม)..." className="pl-9 w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <button className="flex items-center gap-2 border border-slate-300 px-3 py-2 rounded-md hover:bg-slate-50 bg-white text-sm font-medium">
          <Filter className="h-4 w-4" /> กรองตามสาขา/ทีม/ช่วงเวลา
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-3 text-sm font-semibold text-slate-600">รหัสใบงาน</th>
              <th className="p-3 text-sm font-semibold text-slate-600">สาขา</th>
              <th className="p-3 text-sm font-semibold text-slate-600">หมวดหมู่งานซ่อม</th>
              <th className="p-3 text-sm font-semibold text-slate-600">วันที่ปิดงาน</th>
              <th className="p-3 text-sm font-semibold text-slate-600">ทีมช่าง</th>
              <th className="p-3 text-sm font-semibold text-slate-600">สถานะ</th>
              <th className="p-3 text-sm font-semibold text-slate-600">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="p-3 text-sm font-mono text-slate-800">TCK-2023-001</td>
              <td className="p-3 text-sm text-slate-600">สาขา ก</td>
              <td className="p-3 text-sm text-slate-600">งานระบบปรับอากาศ</td>
              <td className="p-3 text-sm text-slate-600">15 ก.ย. 2023</td>
              <td className="p-3 text-sm text-slate-600">ทีมช่าง Alpha</td>
              <td className="p-3 text-sm">
                <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs font-bold">ปิดแล้ว</span>
              </td>
              <td className="p-3">
                <button onClick={() => navigate('/tickets/TCK-2023-001')} className="text-blue-600 hover:text-blue-800 text-sm font-medium">ดูข้อมูลแบบอ่านอย่างเดียว (Read-only)</button>
              </td>
            </tr>
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="p-3 text-sm font-mono text-slate-800">TCK-2023-002</td>
              <td className="p-3 text-sm text-slate-600">สาขา ข</td>
              <td className="p-3 text-sm text-slate-600">งานระบบประปา</td>
              <td className="p-3 text-sm text-slate-600">10 ก.ย. 2023</td>
              <td className="p-3 text-sm text-slate-600">ทีมช่าง Beta</td>
              <td className="p-3 text-sm">
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">ยกเลิกแล้ว</span>
              </td>
              <td className="p-3">
                <button onClick={() => navigate('/tickets/TCK-2023-002')} className="text-blue-600 hover:text-blue-800 text-sm font-medium">ดูข้อมูลแบบอ่านอย่างเดียว (Read-only)</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
