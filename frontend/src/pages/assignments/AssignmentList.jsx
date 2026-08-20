import React from 'react';
import { UserPlus, Clock } from 'lucide-react';

export default function AssignmentList() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">คิวจัดสรรและมอบหมายทีมช่าง</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" /> รายการใบงานรอจัดสรร (Waiting Assignment)
          </h2>
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="border border-slate-200 rounded p-4 bg-slate-50 hover:bg-white transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-sm text-slate-600">TCK-2023-00{i}</span>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold">ด่วน</span>
                </div>
                <h3 className="font-medium text-slate-800 mb-1">บำรุงรักษาระบบปรับอากาศ</h3>
                <p className="text-sm text-slate-500 mb-3">สาขาที่ {i}</p>
                <div className="flex gap-2">
                  <select className="flex-1 rounded border border-slate-300 p-1.5 text-sm focus:border-blue-500">
                    <option>เลือกทีมช่าง...</option>
                    <option>ทีมช่าง Alpha</option>
                    <option>ทีมช่าง Beta</option>
                  </select>
                  <button className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700">มอบหมายงาน</button>
                </div>
              </div>
            ))}
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
                <tr className="border-b border-slate-100">
                  <td className="p-2 text-sm font-mono text-slate-800">TCK-2023-042</td>
                  <td className="p-2 text-sm text-slate-600">ทีมช่าง Alpha</td>
                  <td className="p-2 text-sm text-blue-600 font-medium">กำลังดำเนินการ</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-2 text-sm font-mono text-slate-800">TCK-2023-045</td>
                  <td className="p-2 text-sm text-slate-600">ทีมช่าง Beta</td>
                  <td className="p-2 text-sm text-amber-600 font-medium">มอบหมายแล้ว</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
