import React, { useState } from 'react';

const TicketList = () => {
  const [viewMode, setViewMode] = useState('table');

  return (
    <div className="ticket-list p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">รายการใบแจ้งซ่อมทั้งหมด</h1>
        <div className="view-toggles flex border rounded">
          <button 
            className={`px-4 py-2 ${viewMode === 'table' ? 'bg-blue-100 font-bold' : ''}`}
            onClick={() => setViewMode('table')}
          >
            รูปแบบตาราง
          </button>
          <button 
            className={`px-4 py-2 ${viewMode === 'kanban' ? 'bg-blue-100 font-bold' : ''}`}
            onClick={() => setViewMode('kanban')}
          >
            รูปแบบคัมบัง (Kanban)
          </button>
        </div>
      </div>

      <div className="filters grid grid-cols-6 gap-2 mb-6">
        <select className="border p-2 rounded"><option>สถานะ</option></select>
        <select className="border p-2 rounded"><option>สาขา</option></select>
        <select className="border p-2 rounded"><option>ทีมช่าง</option></select>
        <select className="border p-2 rounded"><option>หมวดหมู่</option></select>
        <select className="border p-2 rounded"><option>ระดับความเร่งด่วน</option></select>
        <input type="date" className="border p-2 rounded" />
      </div>

      {viewMode === 'table' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 border-b">รหัสใบงาน</th>
                <th className="p-3 border-b">สาขา</th>
                <th className="p-3 border-b">หมวดหมู่งาน</th>
                <th className="p-3 border-b">สถานะ</th>
                <th className="p-3 border-b">ทีมที่รับผิดชอบ</th>
                <th className="p-3 border-b">วันที่สร้าง</th>
                <th className="p-3 border-b">ความเร่งด่วน</th>
                <th className="p-3 border-b">รอบการแก้ไข</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="8" className="p-3 text-center text-gray-500">ไม่มีข้อมูลแสดงผล</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="kanban-board flex gap-4">
          <div className="kanban-column flex-1 bg-gray-50 p-4 rounded min-h-[400px]">
            <h3 className="font-bold border-b pb-2 mb-4">รอจัดสรร</h3>
          </div>
          <div className="kanban-column flex-1 bg-gray-50 p-4 rounded min-h-[400px]">
            <h3 className="font-bold border-b pb-2 mb-4">กำลังดำเนินการ</h3>
          </div>
          <div className="kanban-column flex-1 bg-gray-50 p-4 rounded min-h-[400px]">
            <h3 className="font-bold border-b pb-2 mb-4">รอตรวจรับ</h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketList;
