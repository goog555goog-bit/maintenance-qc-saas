import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Camera, 
  AlertCircle, 
  Loader2, 
  Edit3, 
  Search, 
  ChevronDown, 
  X, 
  Building2, 
  Check 
} from 'lucide-react';
import { apiCall } from '@/core/api';

export default function TicketCreate() {
  const navigate = useNavigate();
  
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Searchable Branch Dropdown state
  const [selectedBranch, setSelectedBranch] = useState('');
  const [branchSearch, setBranchSearch] = useState('');
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const branchDropdownRef = useRef(null);

  const [priority, setPriority] = useState('NORMAL');
  const [overview, setOverview] = useState('');

  // Location items (แต่ละจุดซ่อม มีหมวดหมู่งานหลัก, ประเภทย่อยที่เลือกได้หลายอัน, และตัวเลือก อื่นๆ (*ระบุ))
  const [locations, setLocations] = useState([
    { 
      id: Date.now(), 
      work_type_id: '', 
      selected_sub_items: [], 
      is_other_selected: false,
      other_text: '',
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

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(e.target)) {
        setIsBranchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter branches by search query
  const filteredBranches = branches.filter(b => {
    const query = branchSearch.trim().toLowerCase();
    if (!query) return true;
    const nameMatch = b.branch_name && String(b.branch_name).toLowerCase().includes(query);
    const idMatch = b.branch_id && String(b.branch_id).toLowerCase().includes(query);
    const addrMatch = b.address && String(b.address).toLowerCase().includes(query);
    return nameMatch || idMatch || addrMatch;
  });

  const selectedBranchObj = branches.find(b => b.branch_id === selectedBranch);

  // Add new repair point
  const addLocation = () => {
    setLocations([
      ...locations, 
      { 
        id: Date.now(), 
        work_type_id: categories.length > 0 ? categories[0].work_type_id : '', 
        selected_sub_items: [], 
        is_other_selected: false,
        other_text: '',
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
        return { 
          ...loc, 
          work_type_id, 
          selected_sub_items: [],
          is_other_selected: false,
          other_text: ''
        };
      }
      return loc;
    }));
  };

  // Toggle standard sub-item multi-selection
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

  // Toggle "อื่นๆ (*ระบุ)" option
  const toggleOtherOption = (locId) => {
    setLocations(locations.map(loc => {
      if (loc.id === locId) {
        const nextState = !loc.is_other_selected;
        return { 
          ...loc, 
          is_other_selected: nextState,
          other_text: nextState ? loc.other_text : ''
        };
      }
      return loc;
    }));
  };

  const updateOtherText = (locId, text) => {
    setLocations(locations.map(loc => {
      if (loc.id === locId) {
        return { ...loc, other_text: text };
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
      
      const hasStandardSubItems = loc.selected_sub_items && loc.selected_sub_items.length > 0;
      const hasOtherSpecified = loc.is_other_selected && loc.other_text.trim() !== '';
      const hasDetail = loc.detail && loc.detail.trim() !== '';

      if (loc.is_other_selected && !loc.other_text.trim()) {
        return setErrorMsg(`กรุณากรอกข้อความระบุในช่อง "อื่นๆ (*ระบุเพิ่มเติม)" สำหรับจุดซ่อมที่ ${i + 1}`);
      }

      if (!hasStandardSubItems && !hasOtherSpecified && !hasDetail) {
        return setErrorMsg(`กรุณาเลือกประเภทย่อย หรือระบุอาการในช่องอื่นๆ/รายละเอียด สำหรับจุดซ่อมที่ ${i + 1}`);
      }
    }

    setIsLoading(true);

    try {
      // Build items payload
      const formattedItems = locations.map((loc) => {
        const mainCat = categories.find(c => c.work_type_id === loc.work_type_id);
        const mainCatName = mainCat ? mainCat.work_type_name : '';
        
        // Combine standard sub-items with custom "อื่นๆ: ..."
        const combinedSubItems = [...(loc.selected_sub_items || [])];
        if (loc.is_other_selected && loc.other_text.trim()) {
          combinedSubItems.push(`อื่นๆ (${loc.other_text.trim()})`);
        }

        const subItemsStr = combinedSubItems.length > 0 ? `[${combinedSubItems.join(', ')}] ` : '';
        const fullDetail = `${subItemsStr}${loc.detail || ''}`.trim();

        return {
          work_type_id: loc.work_type_id,
          category_name: mainCatName,
          sub_items: combinedSubItems,
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
            {/* SEARCHABLE BRANCH DROPDOWN */}
            <div className="relative" ref={branchDropdownRef}>
              <label className="block text-xs font-semibold text-slate-700 mb-1">สาขาที่เกิดปัญหา *</label>
              
              {/* Trigger Button */}
              <button
                type="button"
                onClick={() => {
                  setIsBranchOpen(!isBranchOpen);
                  setBranchSearch('');
                }}
                className={`w-full border rounded-lg p-2.5 text-sm flex items-center justify-between transition-all bg-white text-left ${
                  isBranchOpen 
                    ? 'border-blue-500 ring-2 ring-blue-100' 
                    : selectedBranch ? 'border-slate-300' : 'border-slate-300 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  {selectedBranchObj ? (
                    <span className="text-slate-800 font-medium truncate">
                      {selectedBranchObj.branch_name}{' '}
                      <span className="text-xs text-slate-400 font-mono font-normal">
                        ({selectedBranchObj.branch_id})
                      </span>
                    </span>
                  ) : (
                    <span>-- ค้นหาหรือเลือกสาขา --</span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {selectedBranch && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBranch('');
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                      title="ล้างค่าที่เลือก"
                    >
                      <X className="w-3.5 h-3.5" />
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isBranchOpen ? 'rotate-180 text-blue-600' : ''}`} />
                </div>
              </button>

              {/* Dropdown Popup Menu */}
              {isBranchOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  {/* Search Input Box */}
                  <div className="p-2 border-b border-slate-100 bg-slate-50/70 flex items-center gap-2">
                    <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="พิมพ์ชื่อสาขา, รหัสสาขา หรือที่อยู่..."
                      value={branchSearch}
                      onChange={(e) => setBranchSearch(e.target.value)}
                      className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none p-1"
                    />
                    {branchSearch && (
                      <button
                        type="button"
                        onClick={() => setBranchSearch('')}
                        className="text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Branch Items List */}
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                    {filteredBranches.length > 0 ? (
                      filteredBranches.map((b) => {
                        const isSelected = b.branch_id === selectedBranch;
                        return (
                          <button
                            key={b.branch_id}
                            type="button"
                            onClick={() => {
                              setSelectedBranch(b.branch_id);
                              setIsBranchOpen(false);
                              setBranchSearch('');
                            }}
                            className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between transition-colors ${
                              isSelected 
                                ? 'bg-blue-50/80 text-blue-700 font-semibold' 
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-800">{b.branch_name}</span>
                                <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                                  {b.branch_id}
                                </span>
                              </div>
                              {b.address && (
                                <p className="text-[11px] text-slate-400 truncate mt-0.5">{b.address}</p>
                              )}
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400">
                        ไม่พบสาขาที่ตรงกับคำค้นหา "{branchSearch}"
                      </div>
                    )}
                  </div>
                </div>
              )}
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
              <p className="text-xs text-slate-500 mt-0.5">ในแต่ละจุดซ่อมสามารถเลือกหมวดหมู่หลัก และประเภทย่อยได้หลายรายการพร้อมตัวเลือกอื่นๆ (*ระบุ)</p>
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

          <div className="space-y-5">
            {locations.map((loc, index) => {
              const selectedCat = categories.find(c => c.work_type_id === loc.work_type_id);
              const subItemsList = selectedCat?.items || [];

              return (
                <div key={loc.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/60 space-y-3.5 relative">
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

                  {/* 2. Sub-categories Multi-Select + อื่นๆ (*ระบุ) */}
                  {selectedCat && (
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-700">
                        ประเภทย่อย / ปัญหาที่พบ (เลือกได้มากกว่า 1 รายการ):
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {/* Standard Sub-items */}
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

                        {/* Special "อื่นๆ (*ระบุ)" Option */}
                        <button
                          type="button"
                          onClick={() => toggleOtherOption(loc.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                            loc.is_other_selected 
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                              : 'bg-white text-indigo-700 border-indigo-200 hover:border-indigo-400'
                          }`}
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>อื่นๆ (*ระบุเพิ่มเติม)</span>
                          {loc.is_other_selected && <span className="font-bold text-[11px]">✓</span>}
                        </button>
                      </div>

                      {/* Input for "อื่นๆ (*ระบุเพิ่มเติม)" */}
                      {loc.is_other_selected && (
                        <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-lg mt-2">
                          <label className="block text-xs font-semibold text-indigo-900 mb-1">
                            ระบุอาการหรือปัญหาอื่นๆ ที่พบในจุดนี้ *
                          </label>
                          <input 
                            type="text" 
                            required
                            placeholder="เช่น มีเสียงดังผิดปกติที่มอเตอร์, มีกลิ่นไหม้, น้ำหยดจากท่อน้ำทิ้ง..."
                            value={loc.other_text}
                            onChange={(e) => updateOtherText(loc.id, e.target.value)}
                            className="w-full border border-indigo-300 rounded-md p-2 text-xs focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none bg-white"
                          />
                        </div>
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
