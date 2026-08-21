import React, { useState } from 'react';
import { Download, Calendar, BarChart2 } from 'lucide-react';

export default function Reports() {
  const [reportData, setReportData] = useState([]);

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">รายงานและสถิติภาพรวม</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex items-center gap-2 border border-slate-300 bg-white px-3 py-2 rounded-md hover:bg-slate-50 text-sm font-medium text-slate-700">
            <Calendar className="h-4 w-4" /> 30 วันย้อนหลัง
          </button>
          <button className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium flex-1 sm:flex-none" disabled={reportData.length === 0}>
            <Download className="h-4 w-4" /> ดาวน์โหลด CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 min-h-[350px] flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-4">สถานะใบงานทั้งหมด</h2>
          {reportData.length > 0 ? (
             <div className="flex-1 flex items-end justify-around gap-2 pb-6 border-b border-slate-200 relative">
             </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-slate-500">
              <BarChart2 className="h-12 w-12 text-slate-200 mb-3" />
              <p className="text-sm font-medium">ไม่มีข้อมูลสถิติ</p>
              <p className="text-xs text-slate-400 mt-1">ยังไม่มีข้อมูลเพียงพอสำหรับสร้างกราฟ</p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 min-h-[350px] flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-4">คะแนนประเมินคุณภาพเฉลี่ย</h2>
          {reportData.length > 0 ? (
            <div className="flex flex-col flex-1 justify-center">
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-slate-500">
              <span className="text-5xl font-bold text-slate-300">-</span>
              <p className="text-sm text-slate-400 mt-2">ยังไม่มีการประเมินคุณภาพ</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 min-h-[300px] flex flex-col">
        <h2 className="text-lg font-bold text-slate-800 mb-4">ประสิทธิภาพการทำงานรายทีม</h2>
        <div className="overflow-x-auto flex-1 flex flex-col">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-sm font-semibold text-slate-600">
                <th className="pb-3">ทีมช่าง</th>
                <th className="pb-3">จำนวนงานที่เสร็จสิ้น</th>
                <th className="pb-3">อัตราการแก้ไขจบในครั้งแรก (First-time Fix Rate)</th>
                <th className="pb-3">อัตรางานตีกลับ (Rework Rate)</th>
                <th className="pb-3">คะแนนประเมินเฉลี่ย</th>
              </tr>
            </thead>
            {reportData.length > 0 && (
              <tbody className="divide-y divide-slate-100 text-sm">
              </tbody>
            )}
          </table>
          {reportData.length === 0 && (
             <div className="flex flex-col items-center justify-center flex-1 py-12 text-slate-500">
                <p className="text-sm font-medium">ยังไม่มีข้อมูลประสิทธิภาพการทำงาน</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
