import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Camera, AlertCircle, CheckCircle2, Loader2, Tag } from 'lucide-react';
import { apiCall } from '@/core/api';

export default function TicketCreate() {
  const navigate = useNavigate();
  
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [selectedBranch, setSelectedBranch] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [overview, setOverview] = useState('');

  // Location items (แต่ละจุดซ่อม มีหมวดหมู่งานหลัก และประเภทย่อยที่เลือกได้มากกว่า 1 อัน)
  const [locations, setLocations] = useState([
    { 
      id: Date.now(), 
      work_type_id: '', 
      selected_sub_items: [], 
      detail: '', 
      image_name: null 
    }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const branchRes = await apiCall('branch.list', {});
        if (branchRes) setBranches(Array.isArray(branchRes) ? branchRes : []);
        
        const catRes = await apiCall('work_type.list', {});
        if (catRes) setCategories(Array.isArray(catRes) ? catRes : catRes.work_types || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  // Add new repair point
  const addLocation = () => {
    setLocations([
      ...locations, 
      { 
        id: Date.now(), 
        work_type_id: categories.length > 0 ? categories[0].work_type_id : '', 
        selected_sub_items: [], 
        detail: '', 
        image_name: null 
      }
    ]);
  };

  const removeLocation = (id) => {
    if (locations.length > 1) {
      setLocations(locations.filter(loc => loc.id !== id));
    }
  };

  const updateLocationWorkType = (id, work_type_id) => {
    setLocations(locations.map(loc => {
      if (loc.id === id) {
        return { ...loc, work_type_id, selected_sub_items: [] }; // Reset sub-items when main category changes
      }
      return loc;
    }));
  };

  // Toggle sub-item multi-selection
  const toggleSubItem = (locId, subItemName) => {
    setLocations(locations.map(loc => {
      if (loc.id === locId) {
        const current = loc.selected_sub_items || [];
        const exists = current.includes(subItemName);
        const updated = exists 
          ? current.filter(item => item !== subItemName)
          : [...current, subItemName];
        return { ...loc, selected_sub_items: updated };
      }
      return loc;
    }));
  };

  const updateLocationDetail = (id, detail) => {
    setLocations(locations.map(loc => loc.id === id ? { ...loc, detail } : loc));
  };

  const handleImageChange = (id, file) => {
    setLocations(locations.map(loc => loc.id === id ? { ...loc, image_name: file ? file.name : null } : loc));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedBranch) {
      return setErrorMsg('กรุณาเลือกสาขาที่ต้องการแจ้งซ่อม');
    }

    if (!overview.trim()) {
      return setErrorMsg('กรุณาระบุรายละเอียดภาพรวมของปัญหา');
    }

    // Check each location
    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i];
      if (!loc.work_type_id && categories.length > 0) {
        return setErrorMsg(`กรุณาเลือกหมวดหมู่งานหลักสำหรับจุดซ่อมที่ ${i + 1}`);
      }
      if (loc.selected_sub_items.length === 0 && !loc.detail.trim()) {
        return setErrorMsg(`กรุณาเลือกประเภทย่อยหรือระบุรายละเอียดสำหรับจุดซ่อมที่ ${i + 1}`);
      }
    }

    setIsLoading(true);

    try {
      // Build items payload
      const formattedItems = locations.map((loc, idx) => {
        const mainCat = categories.find(c => c.work_type_id === loc.work_type_id);
        const mainCatName = mainCat ? mainCat.work_type_name : '';
        const subItemsStr = loc.selected_sub_items.length > 0 ? `[${loc.selected_sub_items.join(', ')}] ` : '';
        const fullDetail = `${subItemsStr}${loc.detail}`.trim();

        return {
          work_type_id: loc.work_type_id,
          category_name: mainCatName,
          sub_items: loc.selected_sub_items,
          detail: fullDetail,
          image_url: loc.image_name
        };
      });

      const primaryCategory = categories.find(c => c.work_type_id === locations[0].work_type_id);

      const payload = {
        branch_id: selectedBranch,
        work_type_id: locations[0]?.work_type_id || '',
        category_name: primaryCategory ? primaryCategory.work_type_name : '',
        overview: overview.trim(),
        priority: priority,
        items: formattedItems
      };

      await apiCall('ticket.create', payload);
      navigate('/tickets');
    } catch (err) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการสร้างใบแจ้งซ่อม');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">สร้างใบแจ้งซ่อมใหม่</h1>
          <p className="text-xs text-slate-500 mt-0.5">กรอกข้อมูลสาขาและระบุจุดที่ต้องการให้ช่างเข้าดำเนินการซ่อมแซม</p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-200 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">ข้อมูลพื้นฐานของใบงาน</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">สาขาที่เกิดปัญหา *</label>
              <select 
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">-- เลือกสาขา --</option>
                {branches.map(b => (
                  <option key={b.branch_id} value={b.branch_id}>
                    {b.branch_name} ({b.branch_id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ระดับความเร่งด่วน</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="NORMAL">ปกติ (NORMAL)</option>
                <option value="HIGH">เร่งด่วน (HIGH)</option>
                <option value="URGENT">ฉุกเฉิน / วิกฤต (URGENT)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">รายละเอียดภาพรวมของปัญหา *</label>
            <textarea 
              rows={3}
              required
              placeholder="สรุปอาการหรือปัญหาที่พบในภาพรวม..."
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Repair Points / Locations Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-800">รายการจุดซ่อม</h2>
              <p className="text-xs text-slate-500 mt-0.5">ในแต่ละจุดซ่อมสามารถเลือกหมวดหมู่หลัก และประเภทย่อยได้หลายรายการ</p>
            </div>
            <button 
              type="button"
              onClick={addLocation}
              className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ เพิ่มจุดซ่อม</span>
            </button>
          </div>

          <div className="space-y-4">
            {locations.map((loc, index) => {
              const selectedCat = categories.find(c => c.work_type_id === loc.work_type_id);
              const subItemsList = selectedCat?.items || [];

              return (
                <div key={loc.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/60 space-y-3 relative">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-700 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                      จุดซ่อมที่ {index + 1}
                    </span>
                    {locations.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeLocation(loc.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                        title="ลบจุดซ่อมนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* 1. Main Category Select */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">หมวดหมู่งานหลัก *</label>
                    <select 
                      value={loc.work_type_id}
                      onChange={(e) => updateLocationWorkType(loc.id, e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:border-blue-500 outline-none bg-white font-medium text-slate-800"
                    >
                      <option value="">-- เลือกหมวดหมู่งานหลัก --</option>
                      {categories.map(c => (
                        <option key={c.work_type_id} value={c.work_type_id}>
                          {c.work_type_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Sub-categories Multi-Select */}
                  {selectedCat && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        ประเภทย่อย / ปัญหาที่พบ (เลือกได้มากกว่า 1 รายการ):
                      </label>
                      {subItemsList.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {subItemsList.map(subItem => {
                            const isSelected = loc.selected_sub_items.includes(subItem.item_name);
                            return (
                              <button
                                key={subItem.work_type_item_id || subItem.item_name}
                                type="button"
                                onClick={() => toggleSubItem(loc.id, subItem.item_name)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                                  isSelected 
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                                }`}
                              >
                                <span>{subItem.item_name}</span>
                                {isSelected && <span className="font-bold text-[11px]">✓</span>}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">หมวดหมู่นี้ยังไม่มีประเภทย่อย (สามารถพิมพ์ระบุในช่องรายละเอียดด้านล่าง)</p>
                      )}
                    </div>
                  )}

                  {/* 3. Detail input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      รายละเอียดเพิ่มเติม / จุดติดตั้งเฉพาะ
                    </label>
                    <input 
                      type="text" 
                      placeholder="เช่น แอร์ห้องประชุมชั้น 2 น้ำหยดลงโต๊ะประชุม"
                      value={loc.detail}
                      onChange={(e) => updateLocationDetail(loc.id, e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:border-blue-500 outline-none bg-white"
                    />
                  </div>

                  {/* 4. Photo upload (Optional) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5" />
                      <span>แนบรูปถ่ายประกอบจุดซ่อม (ถ้ามี)</span>
                    </label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleImageChange(loc.id, e.target.files[0])}
                      className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300"
                    />
                    {loc.image_name && (
                      <span className="text-[11px] text-emerald-600 block mt-1">เลือกไฟล์: {loc.image_name}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            ยกเลิก
          </button>
          <button 
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:bg-blue-400 flex items-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isLoading ? 'กำลังส่งใบแจ้งซ่อม...' : 'บันทึกและส่งใบแจ้งซ่อม'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
