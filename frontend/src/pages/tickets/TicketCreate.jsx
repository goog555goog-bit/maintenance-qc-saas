import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '@/core/api';

const TicketCreate = () => {
  const navigate = useNavigate();
  
  const [locations, setLocations] = useState([{ id: Date.now(), detail: '', image_url: null }]);
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [overview, setOverview] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const branchRes = await apiCall('branch.list', {});
        if (branchRes) setBranches(branchRes);
        
        const catRes = await apiCall('work_type.list', {});
        if (catRes) setCategories(catRes);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  const addLocation = () => {
    setLocations([...locations, { id: Date.now(), detail: '', image_url: null }]);
  };

  const removeLocation = (id) => {
    if (locations.length > 1) {
      setLocations(locations.filter(loc => loc.id !== id));
    }
  };

  const updateLocationDetail = (id, detail) => {
    setLocations(locations.map(loc => loc.id === id ? { ...loc, detail } : loc));
  };

  const handleImageChange = (id, file) => {
    setLocations(locations.map(loc => loc.id === id ? { ...loc, image_url: file ? file.name : null } : loc));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validation
    if (!selectedBranch) {
      return setErrorMsg('กรุณาเลือกสาขา');
    }
    if (!selectedCategory) {
      return setErrorMsg('กรุณาเลือกหมวดหมู่งาน');
    }
    if (!overview.trim()) {
      return setErrorMsg('กรุณาระบุรายละเอียดภาพรวม');
    }
    const hasValidLocation = locations.some(loc => loc.detail.trim() !== '');
    if (!hasValidLocation) {
      return setErrorMsg('กรุณาระบุรายละเอียดอย่างน้อย 1 จุดซ่อม');
    }

    setIsLoading(true);

    try {
      const payload = {
        branch_id: parseInt(selectedBranch, 10),
        work_type_id: parseInt(selectedCategory, 10),
        overview,
        priority,
        items: locations.filter(l => l.detail.trim() !== '').map(l => ({ detail: l.detail }))
      };
      
      await apiCall('ticket.create', payload);
      navigate('/tickets');
    } catch (err) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ticket-create max-w-3xl mx-auto p-6 text-slate-800">
      <h1 className="text-2xl font-bold mb-6 text-slate-900">สร้างใบแจ้งซ่อมใหม่</h1>
      
      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded mb-6 border border-red-200">
          {errorMsg}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-semibold text-slate-700">สาขาที่แจ้ง</label>
            <select 
              className="w-full border border-slate-300 p-2 rounded focus:ring-slate-500 focus:border-slate-500"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="">เลือกสาขา</option>
              {Array.isArray(branches) && branches.map(b => (
                <option key={b.id} value={b.id}>{b.name || b.branch_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-slate-700">หมวดหมู่งานหลัก</label>
            <select 
              className="w-full border border-slate-300 p-2 rounded focus:ring-slate-500 focus:border-slate-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">เลือกหมวดหมู่งาน</option>
              {Array.isArray(categories) && categories.map(c => (
                <option key={c.id} value={c.id}>{c.name || c.type_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
            <label className="block mb-1 font-semibold text-slate-700">ความเร่งด่วน</label>
            <select 
              className="w-full border border-slate-300 p-2 rounded focus:ring-slate-500 focus:border-slate-500"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="NORMAL">ปกติ</option>
              <option value="HIGH">สูง</option>
              <option value="URGENT">ด่วนที่สุด</option>
            </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold text-slate-700">รายละเอียดภาพรวม</label>
          <textarea 
            className="w-full border border-slate-300 p-2 rounded focus:ring-slate-500 focus:border-slate-500" 
            rows="3" 
            placeholder="ระบุรายละเอียดภาพรวมของการแจ้งซ่อม"
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
          ></textarea>
        </div>

        <div className="locations-section border-t border-slate-200 pt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800">รายการจุดซ่อม</h2>
            <button type="button" onClick={addLocation} className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1 rounded transition-colors font-medium">
              + เพิ่มรายการ
            </button>
          </div>

          {locations.map((loc, index) => (
            <div key={loc.id} className="border border-slate-200 p-4 rounded mb-4 bg-slate-50 relative">
              {locations.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => removeLocation(loc.id)}
                  className="absolute top-2 right-2 text-slate-400 hover:text-red-500 font-bold"
                  aria-label="ลบรายการ"
                >
                  X
                </button>
              )}
              <h3 className="font-bold mb-2 text-slate-700">จุดซ่อมที่ {index + 1}</h3>
              <div className="mb-3">
                <label className="block mb-1 text-sm text-slate-600">รายละเอียดแต่ละจุด</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-300 p-2 rounded focus:ring-slate-500 focus:border-slate-500" 
                  placeholder="เช่น บริเวณทางเดินชั้น 2" 
                  value={loc.detail}
                  onChange={(e) => updateLocationDetail(loc.id, e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm text-slate-600">แนบรูปถ่ายหน้างาน</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleImageChange(loc.id, e.target.files[0])}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300" 
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-medium transition-colors">
            ยกเลิก
          </button>
          <button 
            type="submit" 
            disabled={isLoading}
            className={`px-6 py-2 bg-slate-800 text-white rounded font-medium hover:bg-slate-900 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'กำลังบันทึก...' : 'บันทึกและส่งใบแจ้งซ่อม'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketCreate;
