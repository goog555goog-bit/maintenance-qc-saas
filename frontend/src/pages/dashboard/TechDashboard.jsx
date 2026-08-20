import React, { useState } from 'react';

const TechDashboard = () => {
  const [filter, setFilter] = useState('all');

  return (
    <div className="tech-dashboard p-6">
      <h1 className="text-2xl font-bold mb-4">แผงควบคุมช่างเทคนิคภาคสนาม</h1>
      
      <div className="flex justify-between items-center bg-gray-100 p-4 rounded mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-600">งานที่ได้รับมอบหมาย</p>
          <p className="font-bold text-lg">0</p>
        </div>
        <div className="text-center text-red-600">
          <p className="text-sm">รายการต้องแก้ไขด่วน (Rework)</p>
          <p className="font-bold text-lg">0</p>
        </div>
        <div className="text-center text-green-600">
          <p className="text-sm">งานเสร็จสิ้นวันนี้</p>
          <p className="font-bold text-lg">0</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">ระยะทางสะสมวันนี้</p>
          <p className="font-bold text-lg">0 กม.</p>
        </div>
      </div>

      <div className="filters mb-4 flex gap-4">
        <button 
          className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setFilter('all')}
        >
          งานทั้งหมด
        </button>
        <button 
          className={`px-4 py-2 rounded ${filter === 'urgent' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setFilter('urgent')}
        >
          ต้องแก้ไขด่วน
        </button>
        <button 
          className={`px-4 py-2 rounded ${filter === 'queue' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setFilter('queue')}
        >
          อยู่ในคิว
        </button>
      </div>

      <div className="ticket-cards space-y-4">
        <div className="card border p-4 rounded shadow">
          <div className="flex justify-between mb-2">
            <span className="font-bold">หมายเลขใบงาน: TK-20260820-001</span>
            <span className="text-red-500 font-bold">แจ้งเตือนเหตุผลการตีกลับ (รอบที่ 1)</span>
          </div>
          <p>หมวดหมู่งาน: ระบบไฟฟ้า</p>
          <p>สาขา: สาขาลาดพร้าว</p>
          <p>ระยะทาง: 5.2 กม.</p>
          <p className="mb-4">จำนวนจุดซ่อม: 3</p>
          
          <div className="flex gap-2">
            <button className="bg-gray-800 text-white px-3 py-1 rounded">ดูรายละเอียด</button>
            <button className="bg-indigo-600 text-white px-3 py-1 rounded">ลงชื่อเข้าพื้นที่ (GPS Check-in)</button>
            <button className="bg-green-600 text-white px-3 py-1 rounded">ส่งมอบงานซ่อม</button>
            <button className="bg-red-600 text-white px-3 py-1 rounded">ส่งงานที่แก้ไขแล้ว</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechDashboard;
