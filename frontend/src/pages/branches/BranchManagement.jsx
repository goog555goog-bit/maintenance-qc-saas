import React, { useState, useEffect } from 'react';
import { Building2, Search, Inbox, AlertCircle } from 'lucide-react';
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
      setBranches(res.data || []);
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
    (b.branch_name && b.branch_name.includes(searchQuery)) || 
    (b.branch_id && String(b.branch_id).includes(searchQuery))
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">จัดการข้อมูลสาขา</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm transition-colors"
        >
          เพิ่มสาขา
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="ค้นหาสาขา..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500 outline-none" 
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto min-h-[400px] flex flex-col relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        )}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-sm font-semibold text-slate-600">รหัสสาขา</th>
              <th className="p-4 text-sm font-semibold text-slate-600">ชื่อสาขา</th>
              <th className="p-4 text-sm font-semibold text-slate-600">ที่อยู่</th>
              <th className="p-4 text-sm font-semibold text-slate-600">สถานะ</th>
              <th className="p-4 text-sm font-semibold text-slate-600">จัดการ</th>
            </tr>
          </thead>
          {filteredBranches.length > 0 && (
            <tbody>
              {filteredBranches.map((branch) => (
                <tr key={branch.branch_id || branch.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 text-sm text-slate-600 font-medium">{branch.branch_id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-2 rounded"><Building2 className="h-4 w-4 text-slate-500" /></div>
                      <div className="font-medium text-slate-800">{branch.branch_name}</div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-500">{branch.address}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${branch.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                      {branch.status === 'ACTIVE' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                    </span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => handleOpenModal(branch)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">แก้ไข</button>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
        
        {!loading && filteredBranches.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 py-16 text-slate-500">
            <Inbox className="h-16 w-16 text-slate-200 mb-4" />
            <p className="text-lg font-medium text-slate-600">ยังไม่มีข้อมูลสาขา</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">{editingBranch ? 'แก้ไขสาขา' : 'เพิ่มสาขา'}</h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">รหัสสาขา</label>
                  <input 
                    type="text"
                    required
                    value={form.branch_id}
                    onChange={(e) => setForm({...form, branch_id: e.target.value})}
                    className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500 outline-none"
                    disabled={!!editingBranch}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อสาขา</label>
                  <input 
                    type="text"
                    required
                    value={form.branch_name}
                    onChange={(e) => setForm({...form, branch_name: e.target.value})}
                    className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ที่อยู่</label>
                  <textarea 
                    required
                    rows="3"
                    value={form.address}
                    onChange={(e) => setForm({...form, address: e.target.value})}
                    className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500 outline-none"
                  ></textarea>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  {loading && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>}
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
