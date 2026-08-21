import React, { useState } from 'react';
import { Save, Settings as SettingsIcon, Database, Inbox } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('workTypes');
  const [workTypes, setWorkTypes] = useState([]);
  const [backupSchedule, setBackupSchedule] = useState({
    enabled: true,
    intervalDays: 30
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <SettingsIcon className="h-6 w-6 text-slate-500" /> ตั้งค่าระบบ
      </h1>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 flex flex-col">
          <button onClick={() => setActiveTab('workTypes')} className={`p-4 text-left text-sm font-medium border-b border-slate-200 ${activeTab === 'workTypes' ? 'bg-white text-blue-600 border-l-4 border-l-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}>
            หมวดหมู่ใบงาน (Work Types)
          </button>
          <button onClick={() => setActiveTab('backup')} className={`p-4 text-left text-sm font-medium border-b border-slate-200 ${activeTab === 'backup' ? 'bg-white text-blue-600 border-l-4 border-l-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}>
            ระบบสำรองข้อมูล
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col">
          {activeTab === 'workTypes' && (
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800">จัดการหมวดหมู่ใบงาน</h2>
                <button className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700">เพิ่มหมวดหมู่</button>
              </div>
              
              <div className="border border-slate-200 rounded-lg overflow-hidden flex-1 flex flex-col">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                      <th className="p-3">รหัส</th>
                      <th className="p-3">ชื่อหมวดหมู่ (Name)</th>
                      <th className="p-3">สถานะ</th>
                      <th className="p-3 text-right">จัดการ</th>
                    </tr>
                  </thead>
                  {workTypes.length > 0 && (
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {workTypes.map(wt => (
                        <tr key={wt.id}>
                          <td className="p-3 font-mono text-slate-500">{wt.code}</td>
                          <td className="p-3 font-medium text-slate-800">{wt.name}</td>
                          <td className="p-3"><span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold border border-green-200">เปิดใช้งาน</span></td>
                          <td className="p-3 text-right">
                            <button className="text-blue-600 hover:text-blue-800 font-medium">แก้ไข</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  )}
                </table>
                
                {workTypes.length === 0 && (
                  <div className="flex flex-col items-center justify-center flex-1 py-16 text-slate-500">
                    <Inbox className="h-16 w-16 text-slate-200 mb-4" />
                    <p className="text-lg font-medium text-slate-600">ยังไม่มีข้อมูลหมวดหมู่ใบงาน</p>
                    <p className="text-sm text-slate-400 mt-1">คลิก "เพิ่มหมวดหมู่" เพื่อเริ่มต้น</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Database className="h-5 w-5" /> ตั้งค่าการสำรองข้อมูล (Backup Schedule)</h2>
              <div className="space-y-6 max-w-md">
                <div>
                  <label className="flex items-center gap-2 mb-2">
                    <input 
                      type="checkbox" 
                      checked={backupSchedule.enabled}
                      onChange={(e) => setBackupSchedule({...backupSchedule, enabled: e.target.checked})}
                      className="h-4 w-4 text-blue-600 rounded border-slate-300" 
                    />
                    <span className="text-sm font-medium text-slate-700">เปิดใช้งานการสำรองข้อมูลอัตโนมัติ</span>
                  </label>
                  <p className="text-xs text-slate-500 ml-6">ระบบจะทำการสำรองข้อมูลทุกวันเวลา 00:00 น.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ระยะเวลาเก็บรักษาข้อมูลสำรอง (วัน)</label>
                  <input 
                    type="number" 
                    value={backupSchedule.intervalDays}
                    onChange={(e) => setBackupSchedule({...backupSchedule, intervalDays: parseInt(e.target.value) || 0})}
                    className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500" 
                  />
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <button className="bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-900 text-sm font-medium flex items-center gap-2">
                    <Save className="h-4 w-4" /> บันทึกการตั้งค่า
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
