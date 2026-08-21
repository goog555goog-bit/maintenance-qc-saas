import React, { useState } from 'react';
import { Users, Briefcase, History, Inbox } from 'lucide-react';

export default function TeamManagement() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">จัดการทีมช่างเทคนิค</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium">เพิ่มทีมช่าง</button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 border border-slate-200 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="bg-slate-50 p-4 border-b border-slate-200 font-semibold text-slate-700">รายชื่อทีม</div>
          {teams.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 p-8 text-center text-slate-500">
              <Inbox className="h-12 w-12 text-slate-300 mb-3" />
              <p className="text-sm font-medium">ยังไม่มีข้อมูลทีมช่าง</p>
              <p className="text-xs text-slate-400 mt-1">คลิกปุ่ม "เพิ่มทีมช่าง" ด้านบนเพื่อเริ่มต้น</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 overflow-y-auto">
              {teams.map(team => (
                <li key={team.id} className="p-4 hover:bg-slate-50 cursor-pointer">
                  <h3 className="font-semibold text-slate-700">{team.name}</h3>
                  <p className="text-sm text-slate-500">สมาชิก {team.members?.length || 0} คน</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="lg:col-span-2 border border-slate-200 bg-white rounded-lg shadow-sm p-6 flex flex-col items-center justify-center h-[600px] text-slate-500">
            <Users className="h-16 w-16 text-slate-200 mb-4" />
            <p className="text-lg font-medium text-slate-600">ยังไม่ได้เลือกทีมช่าง</p>
            <p className="text-sm text-slate-400 mt-2">โปรดเลือกทีมช่างจากรายการด้านซ้ายเพื่อดูรายละเอียด</p>
        </div>
      </div>
    </div>
  );
}
