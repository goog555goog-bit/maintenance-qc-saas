import React from 'react';
import { Download, Calendar } from 'lucide-react';

export default function Reports() {
  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">รายงานสถิติและประสิทธิภาพการทำงาน</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex items-center gap-2 border border-slate-300 bg-white px-3 py-2 rounded-md hover:bg-slate-50 text-sm font-medium text-slate-700">
            <Calendar className="h-4 w-4" /> 30 วันที่ผ่านมา
          </button>
          <button className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium flex-1 sm:flex-none">
            <Download className="h-4 w-4" /> ส่งออกข้อมูล CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">สรุปสถานะใบงาน</h2>
          <div className="h-64 flex items-end justify-around gap-2 pb-6 border-b border-slate-200 relative">
            {/* Fake Chart */}
            <div className="w-16 bg-slate-200 rounded-t h-[20%] relative group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100">10</span></div>
            <div className="w-16 bg-blue-400 rounded-t h-[60%] relative group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100">30</span></div>
            <div className="w-16 bg-amber-400 rounded-t h-[40%] relative group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100">20</span></div>
            <div className="w-16 bg-green-500 rounded-t h-[80%] relative group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100">40</span></div>
            <div className="w-16 bg-red-400 rounded-t h-[10%] relative group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100">5</span></div>
          </div>
          <div className="flex justify-around mt-4 text-xs font-medium text-slate-500">
            <span>ใหม่</span>
            <span>ดำเนินการ</span>
            <span>ตรวจสอบ</span>
            <span>ปิดงาน</span>
            <span>ตีกลับ</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">เวลาเฉลี่ยในการปิดงาน</h2>
          <div className="flex items-center justify-center h-48 mb-4">
            <div className="text-center">
              <span className="text-5xl font-bold text-slate-800">4.5</span>
              <span className="text-xl text-slate-500 ml-2">วัน</span>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500">ทีมช่าง Alpha</p>
              <p className="font-bold text-slate-800">3.2 วัน</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">ทีมช่าง Beta</p>
              <p className="font-bold text-slate-800">5.8 วัน</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4">ประสิทธิภาพรายทีม</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-sm font-semibold text-slate-600">
                <th className="pb-3">ทีมช่าง</th>
                <th className="pb-3">จำนวนงานทั้งหมด</th>
                <th className="pb-3">อัตราการส่งงานซ่อมรอบเดียวผ่าน (First-time Fix Rate)</th>
                <th className="pb-3">สถิติการตีกลับ (Rework Rate)</th>
                <th className="pb-3">ค่าเฉลี่ยคะแนนความพึงพอใจ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              <tr>
                <td className="py-3 font-medium text-slate-800">ทีมช่าง Alpha</td>
                <td className="py-3 text-slate-600">45</td>
                <td className="py-3 text-blue-600 font-medium">93.4%</td>
                <td className="py-3 text-red-600 font-medium">6.6%</td>
                <td className="py-3 text-green-600 font-medium">4.8 / 5.0</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-slate-800">ทีมช่าง Beta</td>
                <td className="py-3 text-slate-600">32</td>
                <td className="py-3 text-blue-600 font-medium">84.4%</td>
                <td className="py-3 text-red-600 font-medium">15.6%</td>
                <td className="py-3 text-green-600 font-medium">4.2 / 5.0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
