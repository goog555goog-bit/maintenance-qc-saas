import React from 'react';
import { Users, Briefcase, History } from 'lucide-react';

export default function TeamManagement() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">จัดการทีมช่างเทคนิค</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium">เพิ่มทีมช่าง</button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 border border-slate-200 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-slate-50 p-4 border-b border-slate-200 font-semibold text-slate-700">รายชื่อทีม</div>
          <ul className="divide-y divide-slate-100">
            <li className="p-4 bg-blue-50 cursor-pointer">
              <h3 className="font-bold text-blue-800">ทีมช่าง Alpha</h3>
              <p className="text-sm text-blue-600">สมาชิก 3 คน</p>
            </li>
            <li className="p-4 hover:bg-slate-50 cursor-pointer">
              <h3 className="font-semibold text-slate-700">ทีมช่าง Beta</h3>
              <p className="text-sm text-slate-500">สมาชิก 2 คน</p>
            </li>
          </ul>
        </div>
        
        <div className="lg:col-span-2 border border-slate-200 bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-1">ทีมช่าง Alpha</h2>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">เปิดใช้งาน</span>
            </div>
            <div className="flex gap-2">
              <button className="border border-slate-300 px-3 py-1.5 rounded text-sm font-medium hover:bg-slate-50 text-slate-700 flex items-center gap-1"><History className="h-4 w-4" /> ประวัติการโยกย้ายสังกัดทีม</button>
              <button className="border border-slate-300 px-3 py-1.5 rounded text-sm font-medium hover:bg-slate-50 text-slate-700">แก้ไขข้อมูลทีม</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="border border-slate-200 p-4 rounded-lg bg-slate-50 flex items-center gap-3">
              <div className="bg-white p-2 rounded shadow-sm"><Users className="h-5 w-5 text-blue-600" /></div>
              <div>
                <p className="text-sm text-slate-500 font-medium">สมาชิกในทีม</p>
                <p className="text-lg font-bold text-slate-800">3</p>
              </div>
            </div>
            <div className="border border-slate-200 p-4 rounded-lg bg-slate-50 flex items-center gap-3">
              <div className="bg-white p-2 rounded shadow-sm"><Briefcase className="h-5 w-5 text-amber-500" /></div>
              <div>
                <p className="text-sm text-slate-500 font-medium">ภาระงานปัจจุบัน</p>
                <p className="text-lg font-bold text-slate-800">2 ใบงาน</p>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">รายชื่อสมาชิก</h3>
          <table className="w-full text-left">
            <thead>
              <tr className="text-sm text-slate-500 border-b border-slate-200">
                <th className="pb-2 font-medium">ชื่อ-นามสกุล</th>
                <th className="pb-2 font-medium">ตำแหน่ง</th>
                <th className="pb-2 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 text-sm text-slate-800 font-medium">สมชาย ท.</td>
                <td className="py-3 text-sm text-slate-600">หัวหน้าช่าง</td>
                <td className="py-3 text-right">
                  <button className="text-red-600 hover:text-red-800 text-sm font-medium">นำออก</button>
                </td>
              </tr>
              <tr>
                <td className="py-3 text-sm text-slate-800 font-medium">วิชัย ป.</td>
                <td className="py-3 text-sm text-slate-600">ช่างเทคนิค</td>
                <td className="py-3 text-right">
                  <button className="text-red-600 hover:text-red-800 text-sm font-medium">นำออก</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
