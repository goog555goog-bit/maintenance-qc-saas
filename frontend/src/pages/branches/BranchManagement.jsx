import React, { useState, useEffect } from 'react';
import { Building2, Search, Plus, Loader2, AlertCircle, Edit3, X, MapPin } from 'lucide-react';
import { apiCall } from '@/core/api';

export default function BranchManagement() {
  const [branches, setBranches] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [form, setForm] = useState({ branch_name: '', address: '', branch_id: '' });

  const fetchBranches = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiCall('branch.list', {});
      setBranches(Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []));
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleOpenModal = (branch = null) => {
    if (branch) {
      setEditingBranch(branch);
      setForm({ branch_name: branch.branch_name || '', address: branch.address || '', branch_id: branch.branch_id || '' });
    } else {
      setEditingBranch(null);
      setForm({ branch_name: '', address: '', branch_id: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBranch(null);
    setForm({ branch_name: '', address: '', branch_id: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editingBranch) {
        await apiCall('branch.update', { branch_id: form.branch_id || editingBranch.branch_id, branch_name: form.branch_name, address: form.address });
      } else {
        await apiCall('branch.create', { branch_name: form.branch_name, address: form.address, branch_id: form.branch_id });
      }
      handleCloseModal();
      fetchBranches();
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const filteredBranches = branches.filter(b => 
    (b.branch_name && b.branch_name.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (b.branch_id && String(b.branch_id).toLowerCase().includes(searchQuery.toLowerCase())) ||
    (b.address && b.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการข้อมูลสาขา</h1>
          <p className="text-xs text-slate-500 mt-0.5">จัดการข้อมูลที่ตั้ง พิกัด และรายชื่อสาขาทั้งหมดในระบบ ({branches.length} สาขา)</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มสาขาใหม่</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อสาขา, รหัสสาขา หรือที่อยู่..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 py-2 w-full text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white" 
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase bg-slate-50/70">
                <th className="py-3 px-4">รหัสสาขา</th>
                <th className="py-3 px-4">ชื่อสาขา</th>
                <th className="py-3 px-4">ที่อยู่ / พิกัด</th>
                <th className="py-3 px-4">สถานะ</th>
                <th className="py-3 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <span>กำลังโหลดข้อมูลสาขา...</span>
                  </td>
                </tr>
              ) : filteredBranches.length > 0 ? (
                filteredBranches.map((branch) => (
                  <tr key={branch.branch_id || branch.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      {branch.branch_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                          <Building2 className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-slate-800">{branch.branch_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                      {branch.address || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        branch.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {branch.status === 'ACTIVE' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button 
                        onClick={() => handleOpenModal(branch)} 
                        className="text-blue-600 hover:text-blue-800 font-semibold text-xs inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>แก้ไข</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-16 text-center text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-sm text-slate-600">ไม่พบข้อมูลสาขา</p>
                    <p className="text-xs text-slate-400 mt-1">กดปุ่ม 'เพิ่มสาขาใหม่' เพื่อเริ่มต้น</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-800">{editingBranch ? 'แก้ไขข้อมูลสาขา' : 'เพิ่มสาขาใหม่'}</h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">รหัสสาขา *</label>
                <input 
                  type="text"
                  required
                  placeholder="เช่น BR-001 หรือ 1001"
                  value={form.branch_id}
                  onChange={(e) => setForm({...form, branch_id: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  disabled={!!editingBranch}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อสาขา *</label>
                <input 
                  type="text"
                  required
                  placeholder="เช่น สาขาบางนา กม.4"
                  value={form.branch_name}
                  onChange={(e) => setForm({...form, branch_name: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ที่อยู่ / พิกัดที่ตั้ง</label>
                <textarea 
                  rows={3}
                  placeholder="เช่น 123 ถ.บางนา-ตราด แขวงบางนา เขตบางนา กรุงเทพฯ 10260"
                  value={form.address}
                  onChange={(e) => setForm({...form, address: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs disabled:bg-blue-300"
                >
                  {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
