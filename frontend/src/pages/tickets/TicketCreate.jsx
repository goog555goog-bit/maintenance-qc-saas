import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TicketCreate = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([{ id: 1, detail: '', image: null }]);

  const addLocation = () => {
    setLocations([...locations, { id: Date.now(), detail: '', image: null }]);
  };

  return (
    <div className="ticket-create max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">สร้างใบแจ้งซ่อมใหม่</h1>
      
      <form className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-semibold">สาขาที่แจ้ง</label>
            <select className="w-full border p-2 rounded">
              <option value="">เลือกสาขา</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-semibold">หมวดหมู่งานหลัก</label>
            <select className="w-full border p-2 rounded">
              <option value="">เลือกหมวดหมู่งาน</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-1 font-semibold">รายละเอียดภาพรวม</label>
          <textarea className="w-full border p-2 rounded" rows="3" placeholder="ระบุรายละเอียดภาพรวมของการแจ้งซ่อม"></textarea>
        </div>

        <div className="locations-section border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">รายการจุดซ่อม</h2>
            <button type="button" onClick={addLocation} className="bg-blue-100 text-blue-700 px-3 py-1 rounded">
              + เพิ่มรายการ
            </button>
          </div>

          {locations.map((loc, index) => (
            <div key={loc.id} className="border p-4 rounded mb-4 bg-gray-50">
              <h3 className="font-bold mb-2">จุดซ่อมที่ {index + 1}</h3>
              <div className="mb-3">
                <label className="block mb-1 text-sm">รายละเอียดแต่ละจุด</label>
                <input type="text" className="w-full border p-2 rounded" placeholder="เช่น บริเวณทางเดินชั้น 2" />
              </div>
              <div>
                <label className="block mb-1 text-sm">แนบรูปถ่ายหน้างาน</label>
                <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 border rounded text-gray-700">
            ยกเลิก
          </button>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded">
            บันทึกและส่งใบแจ้งซ่อม
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketCreate;
