import React, { useState } from 'react';
import { DollarSign, Inbox } from 'lucide-react';

export default function FuelRates() {
  const [rateHistory, setRateHistory] = useState([]);
  const [currentRate, setCurrentRate] = useState(0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">กำหนดอัตราค่าน้ำมันรายวัน (Fuel Rates)</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">ตั้งค่าเรทปัจจุบัน</h2>
        <form className="flex items-end gap-4">
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-slate-700 mb-1">เรทปัจจุบัน (บาท/กม.)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="number" 
                step="0.5" 
                value={currentRate}
                onChange={(e) => setCurrentRate(e.target.value)}
                className="pl-9 w-full rounded-md border border-slate-300 p-2 focus:border-blue-500 focus:ring-blue-500" 
              />
            </div>
          </div>
          <button type="button" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium">
            อัปเดตข้อมูล
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[300px]">
        <h2 className="text-lg font-semibold text-slate-800 p-6 border-b border-slate-200 bg-slate-50">ประวัติการกำหนดเรทย้อนหลัง</h2>
        
        {rateHistory.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="p-4 text-sm font-semibold text-slate-600">วันที่มีผลบังคับใช้</th>
                <th className="p-4 text-sm font-semibold text-slate-600">อัตรา (บาท/กม.)</th>
                <th className="p-4 text-sm font-semibold text-slate-600">กำหนดโดย</th>
              </tr>
            </thead>
            <tbody>
              {rateHistory.map((history, index) => (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 text-sm text-slate-800">{history.date}</td>
                  <td className="p-4 text-sm font-bold text-slate-800">{history.rate}</td>
                  <td className="p-4 text-sm text-slate-600">{history.admin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 py-12 text-slate-500 bg-white">
            <Inbox className="h-16 w-16 text-slate-200 mb-4" />
            <p className="text-lg font-medium text-slate-600">ยังไม่มีประวัติการกำหนดเรทน้ำมัน</p>
            <p className="text-sm text-slate-400 mt-1">เรทค่าน้ำมันที่คุณอัปเดตจะปรากฏที่นี่</p>
          </div>
        )}
      </div>
    </div>
  );
}
