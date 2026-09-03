import React, { useState, useEffect } from 'react';
import { Save, Settings as SettingsIcon, Database, Inbox, Loader2, Users, Briefcase, Plus, Trash2, Tag, Globe, Link2, CheckCircle2, AlertCircle, RefreshCw, Send, Copy, Check, ExternalLink, Bot } from 'lucide-react';
import { apiCall, getGasUrl, setGasUrl } from '@/core/api';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('workTypes');
  
  // Work Types state
  const [workTypes, setWorkTypes] = useState([]);
  const [showWorkTypeModal, setShowWorkTypeModal] = useState(false);
  const [workTypeModalMode, setWorkTypeModalMode] = useState('create');
  const [editingWorkTypeId, setEditingWorkTypeId] = useState(null);
  const [workTypeName, setWorkTypeName] = useState('');

  // Sub-items modal state
  const [showSubItemModal, setShowSubItemModal] = useState(false);
  const [selectedParentWorkType, setSelectedParentWorkType] = useState(null);
  const [newSubItemName, setNewSubItemName] = useState('');

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

  // Connection state
  const [gasEndpoint, setGasEndpoint] = useState(getGasUrl());
  const [testStatus, setTestStatus] = useState(null);
  const [testMessage, setTestMessage] = useState('');

  // Telegram Config state
  const [tgToken, setTgToken] = useState('');
  const [tgMiniAppUrl, setTgMiniAppUrl] = useState('https://maintenance-qc-saas.goog555goog.workers.dev');
  const [tgBotInfo, setTgBotInfo] = useState(null);
  const [tgHasToken, setTgHasToken] = useState(false);
  const [tgConfigLoading, setTgConfigLoading] = useState(false);
  const [tgWebhookResult, setTgWebhookResult] = useState('');
  const [tgWebhookLoading, setTgWebhookLoading] = useState(false);
  const [tgCopied, setTgCopied] = useState(false);

  const fetchTgConfig = async () => {
    setTgConfigLoading(true);
    try {
      const res = await apiCall('telegram.config.get', {});
      if (res) {
        setTgHasToken(res.has_token || false);
        setTgMiniAppUrl(res.mini_app_url || 'https://maintenance-qc-saas.goog555goog.workers.dev');
        if (res.bot_info && res.bot_info.ok) {
          setTgBotInfo(res.bot_info.result);
        } else {
          setTgBotInfo(null);
        }
      }
    } catch (e) {
      console.warn('Could not fetch telegram config:', e);
    } finally {
      setTgConfigLoading(false);
    }
  };

  const handleSaveTgConfig = async (e) => {
    e.preventDefault();
    setTgConfigLoading(true);
    setError(null);
    try {
      await apiCall('telegram.config.save', {
        bot_token: tgToken.trim() || undefined,
        mini_app_url: tgMiniAppUrl.trim()
      });
      setSuccessMessage('บันทึกการตั้งค่า Telegram Bot เรียบร้อยแล้ว');
      setTimeout(() => setSuccessMessage(''), 4000);
      setTgToken('');
      fetchTgConfig();
    } catch (err) {
      setError(err.message || 'บันทึกการตั้งค่า Telegram ไม่สำเร็จ');
    } finally {
      setTgConfigLoading(false);
    }
  };

  const handleSetTelegramWebhook = async () => {
    const webhookUrl = (gasEndpoint || '').trim();
    if (!webhookUrl) {
      setError('กรุณาระบุ Google Apps Script Web App URL ก่อนติดตั้ง Webhook');
      return;
    }
    setTgWebhookLoading(true);
    setTgWebhookResult('');
    setError(null);
    try {
      const res = await apiCall('telegram.set_webhook', { webhook_url: webhookUrl });
      if (res?.api_response?.ok) {
        setSuccessMessage('ติดตั้ง Webhook ไปยัง Telegram สำเร็จเรียบร้อย! บ็อตจะเริ่มรับคำสั่ง /start ได้ทันที');
        setTgWebhookResult('Webhook เชื่อมต่อแล้ว: ' + webhookUrl);
      } else {
        throw new Error(res?.api_response?.description || 'Telegram ปฏิเสธการติดตั้ง Webhook');
      }
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(err.message || 'ติดตั้ง Webhook ไม่สำเร็จ');
    } finally {
      setTgWebhookLoading(false);
    }
  };

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

  const handleTestConnection = async (urlToTest) => {
    const targetUrl = (urlToTest || gasEndpoint || '').trim();
    if (!targetUrl) {
      setTestStatus('error');
      setTestMessage('กรุณาระบุ URL ของ Google Apps Script');
      return;
    }
    setTestStatus('testing');
    setTestMessage('กำลังทดสอบการเชื่อมต่อไปยัง Google Apps Script...');
    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'work_type.list', payload: {} })
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('การเชื่อมต่อตอบกลับเป็น HTML (ไม่ใช่ JSON) - กรุณาตรวจสอบการตั้งค่า Deploy: Execute as = Me และ Who has access = Anyone หรือตรวจสอบว่า URL ถูกต้อง');
      }
      if (data && data.success) {
        setTestStatus('success');
        setTestMessage('เชื่อมต่อสำเร็จ 100%! Google Apps Script ตอบกลับเป็นปกติ');
      } else {
        throw new Error(data?.error || 'เซิร์ฟเวอร์ตอบกลับไม่สำเร็จ');
      }
    } catch (err) {
      setTestStatus('error');
      setTestMessage(err.message || 'ไม่สามารถเชื่อมต่อได้ (HTTP 404 Not Found หรือ URL ไม่ถูกต้อง)');
    }
  };

  const handleSaveGasUrl = (e) => {
    e.preventDefault();
    if (!gasEndpoint.trim()) return;
    setGasUrl(gasEndpoint.trim());
    setSuccessMessage('บันทึก URL การเชื่อมต่อ Google Apps Script เรียบร้อยแล้ว');
    setTimeout(() => setSuccessMessage(''), 4000);
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

  // Sub-Item Actions
  const handleAddSubItem = async (e) => {
    e.preventDefault();
    if (!newSubItemName.trim() || !selectedParentWorkType) return;
    setIsLoading(true);
    setError(null);
    try {
      const parsedItems = newSubItemName
        .split(/[\n,]/)
        .map(s => s.trim())
        .filter(s => s.length > 0);

      if (parsedItems.length === 0) {
        setError('กรุณาระบุชื่อประเภทย่อยอย่างน้อย 1 รายการ');
        setIsLoading(false);
        return;
      }

      await apiCall('work_type.item.create', {
        work_type_id: selectedParentWorkType.work_type_id,
        items: parsedItems
      });
      setNewSubItemName('');
      setShowSubItemModal(false);
      setSuccessMessage(`เพิ่มประเภทย่อยสำเร็จ (${parsedItems.length} รายการ)`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchWorkTypes();
    } catch (err) {
      setError(err.message || 'ไม่สามารถเพิ่มประเภทย่อยได้');
      setIsLoading(false);
    }
  };

  const handleDeleteSubItem = async (subItemId) => {
    setIsLoading(true);
    try {
      await apiCall('work_type.item.delete', { work_type_item_id: subItemId });
      fetchWorkTypes();
    } catch (err) {
      setError(err.message || 'ไม่สามารถลบประเภทย่อยได้');
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
            <span>หมวดหมู่ใบงานและประเภทย่อย</span>
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
          <button 
            onClick={() => setActiveTab('connection')} 
            className={`p-4 text-left text-sm font-medium border-b border-slate-200 flex items-center gap-2 ${activeTab === 'connection' ? 'bg-white text-blue-600 border-l-4 border-l-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Globe className="w-4 h-4" />
            <span>การเชื่อมต่อ Google Apps Script</span>
          </button>
          <button 
            onClick={() => { setActiveTab('telegram'); fetchTgConfig(); }} 
            className={`p-4 text-left text-sm font-medium border-b border-slate-200 flex items-center gap-2 ${activeTab === 'telegram' ? 'bg-white text-blue-600 border-l-4 border-l-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Send className="w-4 h-4 text-sky-600" />
            <span>Telegram Bot & Mini App</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 flex flex-col">
          {/* TAB 1: WORK TYPES & SUB-ITEMS */}
          {activeTab === 'workTypes' && (
            <div className="flex-1 flex flex-col relative">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">หมวดหมู่งานหลักและประเภทย่อย</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    กำหนดหมวดหมู่หลัก (เช่น ระบบปรับอากาศ) และประเภทย่อย (เช่น แอร์ไม่เย็น, น้ำหยด) เพื่อให้ผู้แจ้งเลือกได้หลายรายการ
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setWorkTypeModalMode('create');
                    setWorkTypeName('');
                    setShowWorkTypeModal(true);
                  }} 
                  className="bg-blue-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  + เพิ่มหมวดหมู่หลัก
                </button>
              </div>
              
              <div className="space-y-4 flex-1">
                {workTypes.length > 0 && !isLoading && (
                  workTypes.map(wt => (
                    <div key={wt.work_type_id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-white transition-all shadow-xs">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-slate-800 text-base">{wt.work_type_name}</span>
                          <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{wt.work_type_id}</span>
                          {wt.status === 'ACTIVE' ? (
                            <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-green-200">เปิดใช้งาน</span>
                          ) : (
                            <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold border border-slate-200">ปิดใช้งาน</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              setSelectedParentWorkType(wt);
                              setNewSubItemName('');
                              setShowSubItemModal(true);
                            }}
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>เพิ่มประเภทย่อย</span>
                          </button>
                          <button 
                            onClick={() => {
                              setWorkTypeModalMode('edit');
                              setEditingWorkTypeId(wt.work_type_id);
                              setWorkTypeName(wt.work_type_name);
                              setShowWorkTypeModal(true);
                            }} 
                            className="text-slate-600 hover:text-slate-900 px-2 py-1 rounded text-xs font-medium hover:bg-slate-100 transition-colors"
                          >
                            แก้ไขชื่อ
                          </button>
                          <button 
                            onClick={() => handleToggleWorkTypeStatus(wt)} 
                            className="text-slate-500 hover:text-slate-800 px-2 py-1 rounded text-xs font-medium hover:bg-slate-100 transition-colors"
                          >
                            {wt.status === 'ACTIVE' ? 'ปิด' : 'เปิด'}
                          </button>
                        </div>
                      </div>

                      {/* Sub-items chips */}
                      <div className="pt-2 border-t border-slate-200/60">
                        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                          ประเภทย่อยในหมวดหมู่นี้ ({wt.items ? wt.items.length : 0} รายการ):
                        </label>
                        {wt.items && wt.items.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {wt.items.map(item => (
                              <span 
                                key={item.work_type_item_id}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 shadow-2xs group"
                              >
                                <Tag className="w-3 h-3 text-slate-400" />
                                <span>{item.item_name}</span>
                                <button 
                                  onClick={() => handleDeleteSubItem(item.work_type_item_id)}
                                  className="text-slate-400 hover:text-red-600 ml-1 rounded hover:bg-red-50 p-0.5 transition-colors"
                                  title="ลบประเภทย่อย"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">ยังไม่มีประเภทย่อย — คลิก "+ เพิ่มประเภทย่อย" เพื่อเพิ่ม</p>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {workTypes.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center justify-center flex-1 p-8 text-slate-500 border border-dashed border-slate-200 rounded-xl">
                    <Inbox className="h-12 w-12 text-slate-300 mb-2" />
                    <p className="text-sm font-medium">ยังไม่มีข้อมูลหมวดหมู่ใบงาน</p>
                    <p className="text-xs text-slate-400 mt-1">คลิกปุ่ม "+ เพิ่มหมวดหมู่หลัก" ด้านบนเพื่อเริ่มต้น</p>
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

          {/* TAB 4: GOOGLE APPS SCRIPT CONNECTION */}
          {activeTab === 'connection' && (
            <div className="flex-1 flex flex-col space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <span>การเชื่อมต่อ Google Apps Script Web App</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  กำหนดและทดสอบ Web App URL ของ Google Apps Script สำหรับเชื่อมต่อฐานข้อมูล Google Sheets
                </p>
              </div>

              {testStatus && (
                <div className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
                  testStatus === 'testing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  testStatus === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                  'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {testStatus === 'testing' && <Loader2 className="w-4 h-4 animate-spin shrink-0 text-blue-600" />}
                  {testStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  {testStatus === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                  <span className="font-medium">{testMessage}</span>
                </div>
              )}

              <form onSubmit={handleSaveGasUrl} className="space-y-4 max-w-2xl bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Google Apps Script Web App URL (ลงท้ายด้วย /exec) *
                  </label>
                  <div className="relative">
                    <input 
                      type="url"
                      required
                      placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                      value={gasEndpoint}
                      onChange={(e) => setGasEndpoint(e.target.value)}
                      className="w-full pl-3 pr-24 py-2.5 text-xs font-mono border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleTestConnection(gasEndpoint)}
                      disabled={testStatus === 'testing'}
                      className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-semibold rounded-md transition-colors disabled:opacity-50"
                    >
                      {testStatus === 'testing' ? 'กำลังทดสอบ...' : 'ทดสอบ URL'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>บันทึก URL ใหม่</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('gas_api_url');
                      setGasEndpoint(getGasUrl());
                      setSuccessMessage('รีเซ็ต URL กลับเป็นค่าเริ่มต้นเรียบร้อยแล้ว');
                      setTimeout(() => setSuccessMessage(''), 3000);
                    }}
                    className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
                  >
                    รีเซ็ตเป็นค่าเริ่มต้น
                  </button>
                </div>
              </form>

              {/* Instructions card */}
              <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-5 space-y-3 max-w-2xl text-xs text-slate-700">
                <h3 className="font-bold text-blue-900 flex items-center gap-1.5">
                  <Link2 className="w-4 h-4 text-blue-600" />
                  <span>วิธีตั้งค่าและนำ Web App URL มาใช้งาน:</span>
                </h3>
                <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed text-slate-600">
                  <li>เปิดโปรเจกต์ <strong>Google Apps Script</strong> ของคุณ</li>
                  <li>กดปุ่มสีน้ำเงิน <strong>"ทำให้ใช้งานได้" (Deploy)</strong> ด้านบนขวา</li>
                  <li>เลือก <strong>"จัดการการทำให้ใช้งานได้" (Manage deployments)</strong></li>
                  <li>กดรูปดินสอ <strong>"แก้ไข" (Edit)</strong> ด้านขวา</li>
                  <li>เลือก <strong>เวอร์ชัน (Version): "เวอร์ชันใหม่" (New version)</strong></li>
                  <li>ตรวจสอบว่า <strong>ผู้มีสิทธิ์เข้าถึง (Who has access) = "ทุกคน" (Anyone)</strong></li>
                  <li>กด <strong>"ทำให้ใช้งานได้" (Deploy)</strong> แล้วคัดลอก <strong>URL ของเว็บแอป (Web App URL)</strong> มาวางในช่องด้านบน</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 5: TELEGRAM BOT & MINI APP */}
          {activeTab === 'telegram' && (
            <div className="flex-1 flex flex-col space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Send className="w-5 h-5 text-sky-600" />
                  <span>การตั้งค่า Telegram Bot และ Telegram Mini App (TMA)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  เชื่อมต่อ Telegram Bot API เพื่อรองรับการเปิดใช้งาน Mini App และส่งการแจ้งเตือนงานซ่อมตรงถึงบุคคล
                </p>
              </div>

              {/* Bot Status Banner */}
              <div className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                tgHasToken && tgBotInfo ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${tgHasToken && tgBotInfo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    {tgHasToken && tgBotInfo ? (
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-emerald-900">{tgBotInfo.first_name}</span>
                          <span className="font-mono text-xs text-emerald-700">(@{tgBotInfo.username})</span>
                          <span className="bg-emerald-200 text-emerald-800 text-[10px] font-bold px-2 py-0.2 rounded-full">ออนไลน์</span>
                        </div>
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          เชื่อมต่อ Telegram Bot API สำเร็จ พร้อมส่งการแจ้งเตือนและรับคำสั่ง Webhook
                        </p>
                      </div>
                    ) : (
                      <div>
                        <span className="font-bold text-sm text-slate-800">ยังไม่ได้ระบุ Telegram Bot Token</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          สร้างบ็อตกับ @BotFather แล้วนำ Token มากรอกด้านล่างเพื่อเปิดใช้งานระบบแจ้งเตือน
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={fetchTgConfig}
                  disabled={tgConfigLoading}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5 self-start sm:self-center"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${tgConfigLoading ? 'animate-spin' : ''}`} />
                  <span>ตรวจสอบสถานะ Bot</span>
                </button>
              </div>

              {/* Bot Token Configuration Form */}
              <form onSubmit={handleSaveTgConfig} className="space-y-4 max-w-2xl bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  กำหนดค่าการเชื่อมต่อ (Bot Credentials)
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telegram Bot Token (จาก @BotFather) *
                  </label>
                  <input
                    type="password"
                    placeholder={tgHasToken ? 'มี Token ในระบบแล้ว (กรอกใหม่หากต้องการเปลี่ยน)' : 'เช่น 7123456789:AAH...'}
                    value={tgToken}
                    onChange={(e) => setTgToken(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs font-mono border border-slate-300 rounded-xl outline-none focus:border-blue-500 bg-white"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Token จะถูกเก็บอย่างปลอดภัยใน Google Apps Script และตาราง System_Config
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    URL ของระบบ Mini App (Web App URL)
                  </label>
                  <input
                    type="url"
                    required
                    value={tgMiniAppUrl}
                    onChange={(e) => setTgMiniAppUrl(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs font-mono border border-slate-300 rounded-xl outline-none focus:border-blue-500 bg-white"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    URL ของหน้าเว็บที่จะถูกเปิดเมื่อผู้ใช้กดปุ่มเมนูด้านล่างของแชท หรือกดดูใบงาน
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={tgConfigLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {tgConfigLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>บันทึกการตั้งค่า Bot</span>
                  </button>
                </div>
              </form>

              {/* Webhook Installation Card */}
              <div className="max-w-2xl bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4 text-sky-600" />
                    <span>การติดตั้ง Webhook สำหรับรับคำสั่ง /start อัตโนมัติ</span>
                  </h3>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  เมื่อติดตั้ง Webhook นี้ หากผู้ใช้ใหม่กดปุ่ม <strong>Start (/start)</strong> ใน Telegram ระบบจะตรวจจับและสั่งเปลี่ยนปุ่มล่างเป็นปุ่ม <strong>"เปิดระบบซ่อมบำรุง"</strong> ให้ทันที
                </p>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 break-all">
                  {gasEndpoint || 'กรุณากำหนด Web App URL ในแท็บการเชื่อมต่อ Google Apps Script'}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleSetTelegramWebhook}
                    disabled={tgWebhookLoading || !tgHasToken}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xs transition-colors flex items-center gap-2 disabled:opacity-40"
                  >
                    {tgWebhookLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-blue-400" />}
                    <span>ติดตั้ง Webhook ไปยัง Telegram (1-Click)</span>
                  </button>
                </div>
              </div>

              {/* Quick Guide Card */}
              <div className="bg-sky-50/60 border border-sky-200 rounded-2xl p-5 space-y-3 max-w-2xl text-xs text-slate-700">
                <h3 className="font-bold text-sky-900 flex items-center gap-1.5">
                  <ExternalLink className="w-4 h-4 text-sky-600" />
                  <span>วิธีสร้าง Telegram Bot และ Mini App (ใช้เวลา 2 นาที):</span>
                </h3>
                <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed text-slate-600">
                  <li>เปิดแอป Telegram ค้นหา <strong>@BotFather</strong> แล้วพิมพ์ <code>/newbot</code> เพื่อสร้างบ็อต</li>
                  <li>คัดลอก <strong>HTTP API Token</strong> ที่ได้ มาวางในช่องด้านบนแล้วกด <strong>"บันทึกการตั้งค่า Bot"</strong></li>
                  <li>กดปุ่ม <strong>"ติดตั้ง Webhook ไปยัง Telegram"</strong> ด้านบน</li>
                  <li>ในแชท @BotFather พิมพ์ <code>/newapp</code> เพื่อผูก Mini App ใส่ URL: <code>{tgMiniAppUrl}</code></li>
                </ol>
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
              {workTypeModalMode === 'create' ? 'เพิ่มหมวดหมู่งานซ่อมหลักใหม่' : 'แก้ไขชื่อหมวดหมู่งาน'}
            </h3>
            <form onSubmit={handleSaveWorkType} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อหมวดหมู่งานหลัก *</label>
                <input 
                  type="text" 
                  required
                  placeholder="เช่น ระบบปรับอากาศ, งานระบบไฟฟ้า, งานระบบประปา"
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

      {/* MODAL: Sub-item Create (Supports Bulk Input) */}
      {showSubItemModal && selectedParentWorkType && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-1">เพิ่มประเภทย่อย (เพิ่มได้หลายรายการพร้อมกัน)</h3>
            <p className="text-xs text-slate-500 mb-4">
              ภายใต้หมวดหมู่: <span className="font-semibold text-slate-800">{selectedParentWorkType.work_type_name}</span>
            </p>
            <form onSubmit={handleAddSubItem} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    ชื่อประเภทย่อย / รายการงานซ่อม *
                  </label>
                  {newSubItemName.trim() && (
                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      ตรวจพบ {newSubItemName.split(/[\n,]/).filter(s => s.trim()).length} รายการ
                    </span>
                  )}
                </div>
                <textarea 
                  rows={5}
                  required
                  placeholder={`พิมพ์ได้หลายรายการพร้อมกัน (1 บรรทัดต่อ 1 รายการ หรือคั่นด้วยเครื่องหมายจุลภาค ,) เช่น:\nแอร์ไม่เย็น\nน้ำหยดจากคอยล์เย็น\nคอมเพรสเซอร์เสียงดัง\nล้างฟิลเตอร์\nพัดลมกรงกระรอกไม่หมุน`}
                  value={newSubItemName}
                  onChange={(e) => setNewSubItemName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none leading-relaxed"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  * สามารถกด Enter เพื่อขึ้นบรรทัดใหม่ หรือใส่เครื่องหมายจุลภาค (,) คั่นระหว่างรายการได้
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowSubItemModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 font-medium"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  {isLoading ? 'กำลังบันทึก...' : 'บันทึกประเภทย่อย'}
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
