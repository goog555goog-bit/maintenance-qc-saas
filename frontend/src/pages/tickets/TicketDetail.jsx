import React, { useState } from 'react';

const TicketDetail = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="ticket-detail p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">รายละเอียดใบแจ้งซ่อม</h1>
        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded font-bold">รอดำเนินการ</span>
      </div>

      <div className="tabs flex border-b mb-6">
        {['general', 'locations', 'timeline', 'review', 'gps', 'documents'].map(tab => {
          const tabNames = {
            general: 'ข้อมูลทั่วไป',
            locations: 'รายการจุดซ่อม',
            timeline: 'ประวัติการดำเนินงาน',
            review: 'ประวัติการตรวจรับและตีกลับ',
            gps: 'พิกัด GPS เช็คอิน',
            documents: 'เอกสารและรูปถ่ายแนบ'
          };
          return (
            <button
              key={tab}
              className={`px-4 py-2 ${activeTab === tab ? 'border-b-2 border-blue-600 font-bold text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tabNames[tab]}
            </button>
          );
        })}
      </div>

      <div className="tab-content mb-8 min-h-[300px]">
        {activeTab === 'general' && <div>แสดงข้อมูลทั่วไป...</div>}
        {activeTab === 'locations' && <div>แสดงรายการจุดซ่อม...</div>}
        {activeTab === 'timeline' && <div>แสดงประวัติการดำเนินงาน...</div>}
        {activeTab === 'review' && <div>แสดงประวัติการตรวจรับและตีกลับ...</div>}
        {activeTab === 'gps' && <div>แสดงพิกัด GPS เช็คอิน...</div>}
        {activeTab === 'documents' && <div>แสดงเอกสารและรูปถ่ายแนบ...</div>}
      </div>

      <div className="actions border-t pt-6 space-y-4">
        <div className="admin-actions bg-gray-50 p-4 rounded border">
          <h3 className="font-bold mb-2">สำหรับ Admin</h3>
          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-3 py-1 rounded">มอบหมายทีมช่าง</button>
            <button className="bg-indigo-600 text-white px-3 py-1 rounded">โอนย้ายเปลี่ยนทีม (Re-assign)</button>
            <button className="bg-gray-600 text-white px-3 py-1 rounded">ตรวจสอบค่าเดินทาง</button>
          </div>
        </div>

        <div className="manager-actions bg-gray-50 p-4 rounded border">
          <h3 className="font-bold mb-2">สำหรับ Manager</h3>
          <div className="flex gap-2">
            <button className="bg-green-600 text-white px-3 py-1 rounded">ตรวจรับงานผ่าน (Approve)</button>
            <button className="bg-red-600 text-white px-3 py-1 rounded">ส่งกลับแก้ไข (Reject พร้อมระบุเหตุผล)</button>
            <button className="bg-purple-600 text-white px-3 py-1 rounded">ปิดใบงานและประเมินความพึงพอใจ</button>
          </div>
        </div>

        <div className="tech-actions bg-gray-50 p-4 rounded border">
          <h3 className="font-bold mb-2">สำหรับ Technician</h3>
          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-3 py-1 rounded">ลงชื่อเข้าพื้นที่ (GPS Check-in)</button>
            <button className="bg-green-600 text-white px-3 py-1 rounded">ส่งมอบงาน (พร้อมแนบรูปหลังทำ)</button>
            <button className="bg-orange-600 text-white px-3 py-1 rounded">ส่งงานที่แก้ไข (Rework)</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
