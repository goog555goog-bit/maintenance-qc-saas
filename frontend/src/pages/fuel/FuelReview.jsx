import React, { useState } from 'react';
import { Map, MapPin, Inbox } from 'lucide-react';

export default function FuelReview() {
  const [fuelRequests, setFuelRequests] = useState([]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">ตรวจสอบและอนุมัติการขอปรับค่าน้ำมัน</h1>
      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto flex flex-col min-h-[400px]">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-sm font-semibold text-slate-600">รหัสใบงาน</th>
              <th className="p-4 text-sm font-semibold text-slate-600">ทีมช่าง</th>
              <th className="p-4 text-sm font-semibold text-slate-600">ระยะทางระบบ</th>
              <th className="p-4 text-sm font-semibold text-slate-600">ค่าน้ำมันระบบ</th>
              <th className="p-4 text-sm font-semibold text-slate-600">ระยะทางที่ขอปรับ</th>
              <th className="p-4 text-sm font-semibold text-slate-600">ค่าน้ำมันที่ขอปรับ</th>
              <th className="p-4 text-sm font-semibold text-slate-600">สถานะ</th>
              <th className="p-4 text-sm font-semibold text-slate-600">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {fuelRequests.map((req) => (
              <tr key={req.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 text-sm font-semibold text-slate-800">{req.ticketId}</td>
                <td className="p-4 text-sm text-slate-600">{req.teamName}</td>
                <td className="p-4 text-sm text-slate-600">{req.systemDistance} กม.</td>
                <td className="p-4 text-sm text-slate-600">{req.systemAmount} บาท</td>
                <td className="p-4 text-sm font-bold text-amber-600">{req.adjustedDistance} กม.</td>
                <td className="p-4 text-sm font-bold text-amber-600">{req.adjustedAmount} บาท</td>
                <td className="p-4 text-sm">
                  <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs font-semibold">รอการอนุมัติ</span>
                </td>
                <td className="p-4">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">ตรวจสอบ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {fuelRequests.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 py-16 text-slate-500">
            <Inbox className="h-16 w-16 text-slate-200 mb-4" />
            <p className="text-lg font-medium text-slate-600">ไม่มีรายการขอปรับปรุงค่าน้ำมัน</p>
            <p className="text-sm text-slate-400 mt-1">รายการขอปรับปรุงค่าน้ำมันจากช่างเทคนิคจะปรากฏที่นี่</p>
          </div>
        )}
      </div>
    </div>
  );
}

