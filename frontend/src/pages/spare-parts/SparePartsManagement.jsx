import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Package, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  DollarSign, 
  Layers, 
  Tag,
  X,
  Check
} from 'lucide-react';
import { apiCall } from '@/core/api';

export default function SparePartsManagement() {
  const [parts, setParts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [formData, setFormData] = useState({
    part_code: '',
    part_name: '',
    category: 'ระบบปรับอากาศ',
    unit: 'ชิ้น',
    unit_price: '',
    status: 'ACTIVE'
  });

  const fetchParts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiCall('spare_part.list', {});
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setParts(list);
    } catch (err) {
      console.error('Error fetching spare parts:', err);
      setError(err.message || 'ไม่สามารถโหลดรายการอะไหล่ได้');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, []);

  const openAddModal = () => {
    setEditingPart(null);
    setFormData({
      part_code: '',
      part_name: '',
      category: 'ระบบปรับอากาศ',
      unit: 'ชิ้น',
      unit_price: '',
      status: 'ACTIVE'
    });
    setShowModal(true);
  };

  const openEditModal = (part) => {
    setEditingPart(part);
    setFormData({
      part_code: part.part_code || '',
      part_name: part.part_name || '',
      category: part.category || 'อะไหล่ทั่วไป',
      unit: part.unit || 'ชิ้น',
      unit_price: part.unit_price || '',
      status: part.status || 'ACTIVE'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.part_name.trim() || formData.unit_price === '') return;

    setActionLoading(true);
    setError(null);
    try {
      if (editingPart) {
        await apiCall('spare_part.update', {
          part_id: editingPart.part_id,
          ...formData,
          unit_price: Number(formData.unit_price)
        });
        setSuccessMsg('แก้ไขข้อมูลอะไหล่เรียบร้อยแล้ว');
      } else {
        await apiCall('spare_part.create', {
          ...formData,
          unit_price: Number(formData.unit_price)
        });
        setSuccessMsg('เพิ่มรายการอะไหล่ใหม่สำเร็จ');
      }
      setTimeout(() => setSuccessMsg(''), 4000);
      setShowModal(false);
      fetchParts();
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (partId) => {
    if (!window.confirm('คุณต้องการปิดการใช้งานรายการอะไหล่นี้ใช่หรือไม่?')) return;
    setActionLoading(true);
    try {
      await apiCall('spare_part.delete', { part_id: partId });
      setSuccessMsg('ปิดการใช้งานอะไหล่เรียบร้อยแล้ว');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchParts();
    } catch (err) {
      setError(err.message || 'ไม่สามารถลบรายการอะไหล่ได้');
    } finally {
      setActionLoading(false);
    }
  };

  // Categories list
  const categories = useMemo(() => {
    const set = new Set();
    parts.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [parts]);

  // Filtered parts
  const filteredParts = useMemo(() => {
    return parts.filter(p => {
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = String(p.part_name || '').toLowerCase().includes(q);
        const matchCode = String(p.part_code || '').toLowerCase().includes(q);
        const matchCat = String(p.category || '').toLowerCase().includes(q);
        return matchName || matchCode || matchCat;
      }
      return true;
    });
  }, [parts, categoryFilter, searchQuery]);

  const activeCount = parts.filter(p => p.status === 'ACTIVE').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <span>จัดการฐานข้อมูลอะไหล่และอุปกรณ์ (Spare Parts Master)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            กำหนดรายการอะไหล่ รหัสสินค้า และราคามาตรฐาน เพื่อให้ทีมช่างสามารถเลือกและบันทึกการเบิกใช้ในใบงานได้ทันที
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchParts}
            className="p-2.5 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ เพิ่มอะไหล่ใหม่</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">รายการอะไหล่ทั้งหมด</p>
            <p className="text-2xl font-bold text-slate-800 font-mono">{parts.length} <span className="text-xs text-slate-400 font-normal">รายการ</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">พร้อมใช้งาน (Active)</p>
            <p className="text-2xl font-bold text-emerald-600 font-mono">{activeCount} <span className="text-xs text-slate-400 font-normal">รายการ</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">หมวดหมู่อะไหล่</p>
            <p className="text-2xl font-bold text-purple-600 font-mono">{categories.length} <span className="text-xs text-slate-400 font-normal">หมวดหมู่</span></p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ค้นหารหัสอะไหล่, ชื่ออะไหล่, หรือหมวดหมู่..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 outline-none focus:border-blue-500 font-medium text-slate-700"
          >
            <option value="all">หมวดหมู่: ทั้งหมด ({parts.length})</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Parts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">
            ตารางรายการอะไหล่มาตรฐาน ({filteredParts.length} รายการ)
          </h2>
        </div>

        {isLoading && parts.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
            <p className="text-xs text-slate-400">กำลังโหลดรายการอะไหล่...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4 w-28">รหัสอะไหล่</th>
                  <th className="py-3 px-4">ชื่อรายการอะไหล่</th>
                  <th className="py-3 px-4">หมวดหมู่</th>
                  <th className="py-3 px-4 text-center w-20">หน่วย</th>
                  <th className="py-3 px-4 text-right w-28">ราคามาตรฐาน (บาท)</th>
                  <th className="py-3 px-4 text-center w-24">สถานะ</th>
                  <th className="py-3 px-4 text-right w-24">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredParts.length > 0 ? (
                  filteredParts.map(part => (
                    <tr key={part.part_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        {part.part_code || part.part_id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {part.part_name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium text-[11px]">
                          {part.category || 'ทั่วไป'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-600 font-medium">
                        {part.unit || 'ชิ้น'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {Number(part.unit_price || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          part.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {part.status === 'ACTIVE' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(part)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="แก้ไขข้อมูลอะไหล่"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(part.part_id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="ปิดการใช้งาน"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      ไม่พบรายการอะไหล่ที่ตรงตามเงื่อนไข
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT SPARE PART                                              */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  {editingPart ? 'แก้ไขข้อมูลอะไหล่' : 'เพิ่มรายการอะไหล่ใหม่'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  กำหนดรายละเอียดและราคามาตรฐานสำหรับช่างเบิกใช้งาน
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">รหัสอะไหล่ / บาร์โค้ด (Part Code)</label>
                <input
                  type="text"
                  placeholder="เช่น BRG-6204, CAP-45UF"
                  value={formData.part_code}
                  onChange={(e) => setFormData({ ...formData, part_code: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-mono outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ชื่อรายการอะไหล่ *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ชุดลูกปืนตลับ High Speed 6204"
                  value={formData.part_name}
                  onChange={(e) => setFormData({ ...formData, part_name: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">หมวดหมู่อะไหล่ *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ระบบปรับอากาศ, ไฟฟ้า"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">หน่วยนับ *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ชิ้น, ชุด, หลอด, ตัว"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ราคามาตรฐานต่อหน่วย (บาท) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">สถานะ</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="ACTIVE">เปิดใช้งาน (ACTIVE)</option>
                    <option value="INACTIVE">ปิดใช้งาน (INACTIVE)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-40 transition-colors shadow-2xs"
                >
                  {actionLoading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
