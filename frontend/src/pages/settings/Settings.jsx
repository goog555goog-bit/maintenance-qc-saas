import React, { useState, useEffect } from 'react';
import { Save, Settings as SettingsIcon, Database, Inbox, Loader2, Users, Briefcase } from 'lucide-react';
import { apiCall } from '@/core/api';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('workTypes');
  
  // Work Types state
  const [workTypes, setWorkTypes] = useState([]);
  const [showWorkTypeModal, setShowWorkTypeModal] = useState(false);
  const [workTypeModalMode, setWorkTypeModalMode] = useState('create');
  const [editingWorkTypeId, setEditingWorkTypeId] = useState(null);
  const [workTypeName, setWorkTypeName] = useState('');

  // Users / Employees state
  const [users, setUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userModalMode, setUserModalMode] = useState('create');
  const [userForm, setUserForm] = useState({
    user_id: '',
    username: '',
    email: '',
    role: 'TECHNICIAN'
  });

  // Backup state
  const [backupSchedule, setBackupSchedule] = useState({
    enabled: true,
    intervalDays: 30
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch Work Types
  const fetchWorkTypes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiCall('work_type.list', {});
      setWorkTypes(Array.isArray(res) ? res : res.work_types || []);
    } catch (err) {
      setError(err.message || 'ไม่สามารถดึงข้อมูลหมวดหมู่งานได้');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiCall('user.list', {});
      setUsers(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err.message || 'ไม่สามารถดึงรายชื่อผู้ใช้ได้');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'workTypes') {
      fetchWorkTypes();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  // Work Type Actions
  const handleSaveWorkType = async (e) => {
    e.preventDefault();
    if (!workTypeName.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      if (workTypeModalMode === 'create') {
        await apiCall('work_type.create', { work_type_name: workTypeName.trim() });
      } else {
        await apiCall('work_type.update', { work_type_id: editingWorkTypeId, work_type_name: workTypeName.trim() });
      }
      setShowWorkTypeModal(false);
      fetchWorkTypes();
    } catch (err) {
      setError(err.message || 'ไม่สามารถบันทึกข้อมูลได้');
      setIsLoading(false);
    }
  };

  const handleToggleWorkTypeStatus = async (wt) => {
    setIsLoading(true);
    setError(null);
    try {
      const newStatus = wt.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await apiCall('work_type.update', { work_type_id: wt.work_type_id, status: newStatus });
      fetchWorkTypes();
    } catch (err) {
      setError(err.message || 'ไม่สามารถเปลี่ยนสถานะได้');
      setIsLoading(false);
    }
  };

  // User Actions
  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!userForm.user_id.trim()) {
      setError('กรุณากรอกรหัสพนักงาน');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      if (userModalMode === 'create') {
        await apiCall('user.create', {
          user_id: userForm.user_id.trim().toUpperCase(),
          username: userForm.username.trim() || userForm.user_id.trim().toUpperCase(),
          email: userForm.email.trim(),
          role: userForm.role
        });
      } else {
        await apiCall('user.update', {
          user_id: userForm.user_id,
          username: userForm.username.trim(),
          role: userForm.role
        });
      }
      setShowUserModal(false);
      fetchUsers();
    } catch (err) {
      setError(err.message || 'ไม่สามารถบันทึกผู้ใช้ได้');
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <SettingsIcon className="h-6 w-6 text-slate-500" /> ตั้งค่าระบบ
      </h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200 text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 border border-green-200 text-sm">
          {successMessage}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 flex flex-col">
          <button 
            onClick={() => setActiveTab('workTypes')} 
            className={`p-4 text-left text-sm font-medium border-b border-slate-200 flex items-center gap-2 ${activeTab === 'workTypes' ? 'bg-white text-blue-600 border-l-4 border-l-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Briefcase className="w-4 h-4" />
            <span>หมวดหมู่ใบงาน (Work Types)</span>
          </button>
          <button 
            onClick={() => setActiveTab('users')} 
            className={`p-4 text-left text-sm font-medium border-b border-slate-200 flex items-center gap-2 ${activeTab === 'users' ? 'bg-white text-blue-600 border-l-4 border-l-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Users className="w-4 h-4" />
            <span>จัดการพนักงาน / ผู้ใช้</span>
          </button>
          <button 
            onClick={() => setActiveTab('backup')} 
            className={`p-4 text-left text-sm font-medium border-b border-slate-200 flex items-center gap-2 ${activeTab === 'backup' ? 'bg-white text-blue-600 border-l-4 border-l-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Database className="w-4 h-4" />
            <span>ระบบสำรองข้อมูล</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 flex flex-col">
          {/* TAB 1: WORK TYPES */}
          {activeTab === 'workTypes' && (
            <div className="flex-1 flex flex-col relative">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">หมวดหมู่และแม่แบบงานซ่อม</h2>
                  <p className="text-xs text-slate-500 mt-0.5">หมวดหมู่เหล่านี้จะแสดงใน Dropdown ตอนสร้างใบแจ้งซ่อม</p>
                </div>
                <button 
                  onClick={() => {
                    setWorkTypeModalMode('create');
                    setWorkTypeName('');
                    setShowWorkTypeModal(true);
                  }} 
                  className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700"
                >
                  เพิ่มหมวดหมู่
                </button>
              </div>
              
              <div className="border border-slate-200 rounded-lg overflow-hidden flex-1 flex flex-col">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                      <th className="p-3">รหัสหมวดหมู่</th>
                      <th className="p-3">ชื่อหมวดหมู่งาน</th>
                      <th className="p-3">สถานะ</th>
                      <th className="p-3 text-right">จัดการ</th>
                    </tr>
                  </thead>
                  {workTypes.length > 0 && !isLoading && (
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {workTypes.map(wt => (
                        <tr key={wt.work_type_id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono text-xs text-slate-500">{wt.work_type_id}</td>
                          <td className="p-3 font-medium text-slate-800">{wt.work_type_name}</td>
                          <td className="p-3">
                            {wt.status === 'ACTIVE' ? (
                              <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded text-xs font-semibold border border-green-200">เปิดใช้งาน</span>
                            ) : (
                              <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-xs font-semibold border border-slate-200">ปิดใช้งาน</span>
                            )}
                          </td>
                          <td className="p-3 text-right space-x-3">
                            <button 
                              onClick={() => {
                                setWorkTypeModalMode('edit');
                                setEditingWorkTypeId(wt.work_type_id);
                                setWorkTypeName(wt.work_type_name);
                                setShowWorkTypeModal(true);
                              }} 
                              className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                            >
                              แก้ไข
                            </button>
                            <button 
                              onClick={() => handleToggleWorkTypeStatus(wt)} 
                              className="text-slate-600 hover:text-slate-800 font-medium text-xs"
                            >
                              {wt.status === 'ACTIVE' ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  )}
                </table>

                {workTypes.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center justify-center flex-1 p-8 text-slate-500">
                    <Inbox className="h-12 w-12 text-slate-300 mb-2" />
                    <p className="text-sm font-medium">ยังไม่มีข้อมูลหมวดหมู่ใบงาน</p>
                    <p className="text-xs text-slate-400 mt-1">คลิกปุ่ม "เพิ่มหมวดหมู่" ด้านบนเพื่อเริ่มต้น</p>
                  </div>
                )}

                {isLoading && (
                  <div className="flex justify-center items-center flex-1 p-8">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: USERS & EMPLOYEES */}
          {activeTab === 'users' && (
            <div className="flex-1 flex flex-col relative">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">จัดการรายชื่อพนักงานและสิทธิ์ผู้ใช้</h2>
                  <p className="text-xs text-slate-500 mt-0.5">พนักงานที่เพิ่มใหม่จะใช้รหัสพนักงานเป็นรหัสผ่านเริ่มต้น</p>
                </div>
                <button 
                  onClick={() => {
                    setUserModalMode('create');
                    setUserForm({ user_id: '', username: '', email: '', role: 'TECHNICIAN' });
                    setShowUserModal(true);
                  }} 
                  className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700"
                >
                  เพิ่มพนักงาน
                </button>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden flex-1 flex flex-col">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                      <th className="p-3">รหัสพนักงาน</th>
                      <th className="p-3">ชื่อ-นามสกุล</th>
                      <th className="p-3">อีเมล</th>
                      <th className="p-3">บทบาท (Role)</th>
                      <th className="p-3 text-right">จัดการ</th>
                    </tr>
                  </thead>
                  {users.length > 0 && !isLoading && (
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {users.map(u => (
                        <tr key={u.user_id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-semibold text-slate-800">{u.user_id}</td>
                          <td className="p-3 font-medium text-slate-700">{u.username}</td>
                          <td className="p-3 text-slate-500 text-xs">{u.email || '-'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              u.role === 'CENTRAL_ADMIN' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                              u.role === 'BRANCH_MANAGER' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {u.role === 'CENTRAL_ADMIN' ? 'ผู้ดูแลระบบส่วนกลาง' :
                               u.role === 'BRANCH_MANAGER' ? 'ผู้จัดการสาขา' : 'ช่างเทคนิค'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button 
                              onClick={() => {
                                setUserModalMode('edit');
                                setUserForm({
                                  user_id: u.user_id,
                                  username: u.username,
                                  email: u.email || '',
                                  role: u.role
                                });
                                setShowUserModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                            >
                              แก้ไข
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  )}
                </table>

                {users.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center justify-center flex-1 p-8 text-slate-500">
                    <Inbox className="h-12 w-12 text-slate-300 mb-2" />
                    <p className="text-sm font-medium">ยังไม่มีรายชื่อพนักงานในระบบ</p>
                    <p className="text-xs text-slate-400 mt-1">คลิกปุ่ม "เพิ่มพนักงาน" เพื่อเริ่มต้น</p>
                  </div>
                )}

                {isLoading && (
                  <div className="flex justify-center items-center flex-1 p-8">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: BACKUP */}
          {activeTab === 'backup' && (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4">ตั้งค่าการสำรองข้อมูล (Backup Schedule)</h2>
                <div className="space-y-4 max-w-lg">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="enableBackup" 
                      checked={backupSchedule.enabled}
                      onChange={(e) => setBackupSchedule({...backupSchedule, enabled: e.target.checked})}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <label htmlFor="enableBackup" className="text-sm font-medium text-slate-700">เปิดใช้งานการสำรองข้อมูลอัตโนมัติ</label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ระยะเวลาสำรองข้อมูล (วัน)</label>
                    <input 
                      type="number" 
                      value={backupSchedule.intervalDays}
                      onChange={(e) => setBackupSchedule({...backupSchedule, intervalDays: Number(e.target.value)})}
                      className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500" 
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-slate-200 pt-4 flex justify-end">
                <button 
                  onClick={() => {
                    setSuccessMessage('บันทึกการตั้งค่าการสำรองข้อมูลสำเร็จ');
                    setTimeout(() => setSuccessMessage(''), 3000);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
                >
                  <Save className="h-4 w-4" /> บันทึกการตั้งค่า
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Work Type Create/Edit */}
      {showWorkTypeModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              {workTypeModalMode === 'create' ? 'เพิ่มหมวดหมู่งานซ่อมใหม่' : 'แก้ไขหมวดหมู่งานซ่อม'}
            </h3>
            <form onSubmit={handleSaveWorkType} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อหมวดหมู่งาน *</label>
                <input 
                  type="text" 
                  required
                  placeholder="เช่น ระบบปรับอากาศ, งานไฟฟ้า, ประปา"
                  value={workTypeName}
                  onChange={(e) => setWorkTypeName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowWorkTypeModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 font-medium"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  {isLoading ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: User Create/Edit */}
      {showUserModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              {userModalMode === 'create' ? 'เพิ่มพนักงานใหม่' : 'แก้ไขข้อมูลพนักงาน'}
            </h3>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">รหัสพนักงาน (User ID) *</label>
                <input 
                  type="text" 
                  required
                  disabled={userModalMode === 'edit'}
                  placeholder="เช่น EMP-0004"
                  value={userForm.user_id}
                  onChange={(e) => setUserForm({...userForm, user_id: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono disabled:bg-slate-100"
                />
                {userModalMode === 'create' && (
                  <p className="text-[11px] text-slate-400 mt-1">* รหัสผ่านเริ่มต้นในการเข้าสู่ระบบครั้งแรกคือรหัสพนักงานนี้</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อ-นามสกุล *</label>
                <input 
                  type="text" 
                  required
                  placeholder="เช่น นายช่าง สมศักดิ์"
                  value={userForm.username}
                  onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">อีเมล (สำหรับรับ OTP กู้คืนรหัสผ่าน)</label>
                <input 
                  type="email" 
                  placeholder="employee@company.com"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">บทบาทและสิทธิ์การเข้าถึง (Role) *</label>
                <select 
                  value={userForm.role}
                  onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="TECHNICIAN">ช่างเทคนิค (TECHNICIAN)</option>
                  <option value="BRANCH_MANAGER">ผู้จัดการสาขา (BRANCH_MANAGER)</option>
                  <option value="CENTRAL_ADMIN">ผู้ดูแลระบบส่วนกลาง (CENTRAL_ADMIN)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 font-medium"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  {isLoading ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
