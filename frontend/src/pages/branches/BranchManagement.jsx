import React, { useState } from 'react';
import { Building2, Search, Inbox } from 'lucide-react';

export default function BranchManagement() {
  const [branches, setBranches] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">จัดการข้อมูลสาขา</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium">เพิ่มสาขา</button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="ค้นหาสาขา..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500" 
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto min-h-[400px] flex flex-col">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-sm font-semibold text-slate-600">รหัสสาขา / รายชื่อสาขา</th>
              <th className="p-4 text-sm font-semibold text-slate-600">ผู้จัดการประจำสาขา</th>
              <th className="p-4 text-sm font-semibold text-slate-600">พิกัดที่ตั้ง</th>
              <th className="p-4 text-sm font-semibold text-slate-600">จำนวนใบงานที่กำลังดำเนินการ</th>
              <th className="p-4 text-sm font-semibold text-slate-600">จัดการ</th>
            </tr>
          </thead>
          {branches.length > 0 && (
            <tbody>
              {branches.map((branch) => (
                <tr key={branch.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-2 rounded"><Building2 className="h-4 w-4 text-slate-500" /></div>
                      <div>
                        <div className="font-medium text-slate-800">{branch.name}</div>
                        <div className="text-xs text-slate-500">{branch.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{branch.manager}</td>
                  <td className="p-4 text-sm text-slate-500">{branch.location}</td>
                  <td className="p-4 text-sm font-bold text-slate-600">{branch.activeJobs || 0}</td>
                  <td className="p-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">ดูข้อมูล</button>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
        
        {branches.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 py-16 text-slate-500">
            <Inbox className="h-16 w-16 text-slate-200 mb-4" />
            <p className="text-lg font-medium text-slate-600">ยังไม่มีข้อมูลสาขา</p>
            <p className="text-sm text-slate-400 mt-1">คลิกปุ่ม "เพิ่มสาขา" เพื่อเริ่มต้นบันทึกข้อมูล</p>
          </div>
        )}
      </div>
    </div>
  );
}
