import React, { useState, useEffect } from 'react';
import { Save, Settings as SettingsIcon, Database, Inbox, Loader2 } from 'lucide-react';
import { apiCall } from '@/core/api';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('workTypes');
  const [workTypes, setWorkTypes] = useState([]);
  const [backupSchedule, setBackupSchedule] = useState({
    enabled: true,
    intervalDays: 30
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingId, setEditingId] = useState(null);
  const [workTypeName, setWorkTypeName] = useState('');

  const fetchWorkTypes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiCall('work_type.list', {});
      setWorkTypes(res.work_types || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch work types');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'workTypes') {
      fetchWorkTypes();
    }
  }, [activeTab]);

  const handleSaveWorkType = async () => {
    if (!workTypeName.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      if (modalMode === 'create') {
        await apiCall('work_type.create', { work_type_name: workTypeName });
      } else {
        await apiCall('work_type.update', { work_type_id: editingId, work_type_name: workTypeName });
      }
      setShowModal(false);
      fetchWorkTypes();
    } catch (err) {
      setError(err.message || 'Failed to save');
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (wt) => {
    setIsLoading(true);
    setError(null);
    try {
      const newStatus = wt.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await apiCall('work_type.update', { work_type_id: wt.work_type_id, status: newStatus });
      fetchWorkTypes();
    } catch (err) {
      setError(err.message || 'Failed to update status');
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setWorkTypeName('');
    setShowModal(true);
  };

  const openEditModal = (wt) => {
    setModalMode('edit');
    setEditingId(wt.work_type_id);
    setWorkTypeName(wt.work_type_name);
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <SettingsIcon className="h-6 w-6 text-slate-500" /> ตั้งค่าระบบ
      </h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 flex flex-col">
          <button onClick={() => setActiveTab('workTypes')} className={`p-4 text-left text-sm font-medium border-b border-slate-200 ${activeTab === 'workTypes' ? 'bg-white text-blue-600 border-l-4 border-l-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}>
            หมวดหมู่ใบงาน (Work Types)
          </button>
          <button onClick={() => setActiveTab('backup')} className={`p-4 text-left text-sm font-medium border-b border-slate-200 ${activeTab === 'backup' ? 'bg-white text-blue-600 border-l-4 border-l-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}>
            ระบบสำรองข้อมูล
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col">
          {activeTab === 'workTypes' && (
            <div className="flex-1 flex flex-col relative">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800">จัดการหมวดหมู่ใบงาน</h2>
                <button onClick={openCreateModal} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700">เพิ่มหมวดหมู่</button>
              </div>
              
              <div className="border border-slate-200 rounded-lg overflow-hidden flex-1 flex flex-col">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                      <th className="p-3">ชื่อหมวดหมู่ (Name)</th>
                      <th className="p-3">สถานะ</th>
                      <th className="p-3 text-right">จัดการ</th>
                    </tr>
                  </thead>
                  {workTypes.length > 0 && !isLoading && (
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {workTypes.map(wt => (
                        <tr key={wt.work_type_id}>
                          <td className="p-3 font-medium text-slate-800">{wt.work_type_name}</td>
                          <td className="p-3">
                            {wt.status === 'ACTIVE' ? (
                              <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold border border-green-200">เปิดใช้งาน</span>
                            ) : (
                              <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-xs font-bold border border-slate-200">ปิดใช้งาน</span>
                            )}
                          </td>
                          <td className="p-3 text-right space-x-2">
                            <button onClick={() => openEditModal(wt)} className="text-blue-600 hover:text-blue-800 font-medium">แก้ไข</button>
                            <button onClick={() => handleToggleStatus(wt)} className="text-slate-600 hover:text-slate-800 font-medium">
                              {wt.status === 'ACTIVE' ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  )}
                </table>
                
                {isLoading && (
                  <div className="flex justify-center items-center flex-1 py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                )}

                {workTypes.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center justify-center flex-1 py-16 text-slate-500">
                    <Inbox className="h-16 w-16 text-slate-200 mb-4" />
                    <p className="text-lg font-medium text-slate-600">ยังไม่มีข้อมูลหมวดหมู่ใบงาน</p>
                    <p className="text-sm text-slate-400 mt-1">คลิก "เพิ่มหมวดหมู่" เพื่อเริ่มต้น</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Database className="h-5 w-5" /> ตั้งค่าการสำรองข้อมูล (Backup Schedule)</h2>
              <div className="space-y-6 max-w-md">
                <div>
                  <label className="flex items-center gap-2 mb-2">
                    <input 
                      type="checkbox" 
                      checked={backupSchedule.enabled}
                      onChange={(e) => setBackupSchedule({...backupSchedule, enabled: e.target.checked})}
                      className="h-4 w-4 text-blue-600 rounded border-slate-300" 
                    />
                    <span className="text-sm font-medium text-slate-700">เปิดใช้งานการสำรองข้อมูลอัตโนมัติ</span>
                  </label>
                  <p className="text-xs text-slate-500 ml-6">ระบบจะทำการสำรองข้อมูลทุกวันเวลา 00:00 น.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ระยะเวลาเก็บรักษาข้อมูลสำรอง (วัน)</label>
                  <input 
                    type="number" 
                    value={backupSchedule.intervalDays}
                    onChange={(e) => setBackupSchedule({...backupSchedule, intervalDays: parseInt(e.target.value) || 0})}
                    className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500" 
                  />
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <button className="bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-900 text-sm font-medium flex items-center gap-2">
                    <Save className="h-4 w-4" /> บันทึกการตั้งค่า
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">
                {modalMode === 'create' ? 'เพิ่มหมวดหมู่ใบงาน' : 'แก้ไขหมวดหมู่ใบงาน'}
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อหมวดหมู่</label>
                <input
                  type="text"
                  value={workTypeName}
                  onChange={(e) => setWorkTypeName(e.target.value)}
                  className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-md text-sm font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveWorkType}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm font-medium flex items-center"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
