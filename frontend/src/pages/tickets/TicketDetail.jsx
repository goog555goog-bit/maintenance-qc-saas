import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Users, 
  Camera, 
  Navigation,
  FileText,
  MessageSquare,
  ShieldCheck,
  Package,
  Plus,
  Trash2,
  DollarSign,
  X,
  Search,
  Check
} from 'lucide-react';
import { apiCall } from '@/core/api';

export default function TicketDetail({ role: propRole }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Modals & Action States
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [satisfactionScore, setSatisfactionScore] = useState(5);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [technicianNote, setTechnicianNote] = useState('');
  const [gpsStatus, setGpsStatus] = useState(null);

  // Spare Parts State
  const [showSparePartsModal, setShowSparePartsModal] = useState(false);
  const [masterParts, setMasterParts] = useState([]);
  const [ticketParts, setTicketParts] = useState([]);

  // User role normalization
  const storedUser = (() => {
    try {
      const raw = localStorage.getItem('auth_user');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  })();

  const role = (() => {
    const r = String(storedUser.role || propRole || '').toUpperCase();
    if (r === 'CENTRAL_ADMIN' || r === 'ADMIN') return 'admin';
    if (r === 'BRANCH_MANAGER' || r === 'MANAGER') return 'manager';
    if (r === 'TECHNICIAN' || r === 'TECH') return 'tech';
    return 'tech';
  })();

  const fetchTicket = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiCall('ticket.get', { ticket_id: id });
      setTicket(res || null);
    } catch (err) {
      setError(err.message || 'ไม่สามารถดึงข้อมูลใบงานได้');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMasterParts = async () => {
    try {
      const res = await apiCall('spare_part.list', { active_only: true });
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setMasterParts(list);
    } catch (e) {
      console.error('Error fetching master parts:', e);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTicket();
    }
  }, [id]);

  // Actions
  const handleManagerApprove = async () => {
    setActionLoading(true);
    try {
      await apiCall('ticket.review', {
        ticket_id: id,
        review_status: 'APPROVED',
        comments: 'ตรวจรับงานผ่านเรียบร้อย'
      });
      setSuccessMsg('ตรวจรับงานผ่านเรียบร้อยแล้ว');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchTicket();
    } catch (err) {
      setError(err.message || 'ไม่สามารถดำเนินการตรวจรับได้');
    } finally {
      setActionLoading(false);
    }
  };

  const handleManagerReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;
    setActionLoading(true);
    try {
      await apiCall('ticket.review', {
        ticket_id: id,
        review_status: 'REJECTED_REWORK',
        comments: rejectReason.trim()
      });
      setShowRejectModal(false);
      setSuccessMsg('ส่งงานกลับแก้ไข (Rework) เรียบร้อย');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchTicket();
    } catch (err) {
      setError(err.message || 'ไม่สามารถส่งกลับแก้ไขได้');
    } finally {
      setActionLoading(false);
    }
  };

  const handleManagerClose = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await apiCall('ticket.close', {
        ticket_id: id,
        satisfaction_score: Number(satisfactionScore)
      });
      setShowCloseModal(false);
      setSuccessMsg('ปิดใบงานและประเมินความพึงพอใจเรียบร้อยแล้ว');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchTicket();
    } catch (err) {
      setError(err.message || 'ไม่สามารถปิดใบงานได้');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTechCheckin = () => {
    if (!navigator.geolocation) {
      setError('เบราว์เซอร์ไม่รองรับการระบุพิกัด GPS');
      return;
    }
    setGpsStatus('กำลังค้นหาพิกัด GPS...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setActionLoading(true);
        try {
          await apiCall('ticket.checkin', {
            ticket_id: id,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          });
          setGpsStatus(null);
          setSuccessMsg('ลงชื่อเข้าพื้นที่ (GPS Check-in) สำเร็จ');
          setTimeout(() => setSuccessMsg(''), 4000);
          fetchTicket();
        } catch (err) {
          setError(err.message || 'บันทึกพิกัด GPS ไม่สำเร็จ');
        } finally {
          setActionLoading(false);
        }
      },
      (err) => {
        setGpsStatus(null);
        setError('ไม่สามารถอ่านพิกัด GPS ได้: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleTechSubmitWork = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await apiCall('ticket.submit', {
        ticket_id: id,
        technician_note: technicianNote.trim()
      });
      setShowSubmitModal(false);
      setSuccessMsg('ส่งมอบงานเรียบร้อย รอผู้จัดการสาขาตรวจรับ');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchTicket();
    } catch (err) {
      setError(err.message || 'ไม่สามารถส่งมอบงานได้');
    } finally {
      setActionLoading(false);
    }
  };

  // Spare Parts Handlers
  const openSparePartsModal = () => {
    fetchMasterParts();
    const current = ticket?.spare_parts && ticket.spare_parts.length > 0 
      ? ticket.spare_parts.map(p => ({
          part_id: p.part_id || '',
          part_name: p.part_name || p.name || '',
          part_code: p.part_code || p.code || '',
          category: p.category || '',
          unit: p.unit || 'ชิ้น',
          unit_price: Number(p.unit_price || p.unitPrice || 0),
          qty: Number(p.qty || p.quantity || 1),
          total: Number(p.total || 0) || (Number(p.qty || 1) * Number(p.unit_price || 0))
        }))
      : [{ part_id: '', part_name: '', part_code: '', category: '', unit: 'ชิ้น', unit_price: 0, qty: 1, total: 0 }];
    setTicketParts(current);
    setShowSparePartsModal(true);
  };

  const handleSelectMasterPart = (index, masterPartId) => {
    const selected = masterParts.find(p => p.part_id === masterPartId);
    const updated = [...ticketParts];
    if (selected) {
      const qty = updated[index].qty || 1;
      const unitPrice = Number(selected.unit_price) || 0;
      updated[index] = {
        ...updated[index],
        part_id: selected.part_id,
        part_name: selected.part_name,
        part_code: selected.part_code,
        category: selected.category,
        unit: selected.unit || 'ชิ้น',
        unit_price: unitPrice,
        qty: qty,
        total: qty * unitPrice
      };
    } else {
      updated[index] = {
        ...updated[index],
        part_id: '',
        part_name: '',
        part_code: '',
        unit_price: 0,
        total: 0
      };
    }
    setTicketParts(updated);
  };

  const handleUpdatePartRow = (index, field, value) => {
    const updated = [...ticketParts];
    updated[index] = { ...updated[index], [field]: value };
    const qty = Number(field === 'qty' ? value : updated[index].qty) || 0;
    const price = Number(field === 'unit_price' ? value : updated[index].unit_price) || 0;
    updated[index].total = qty * price;
    setTicketParts(updated);
  };

  const handleAddPartRow = () => {
    setTicketParts([
      ...ticketParts,
      { part_id: '', part_name: '', part_code: '', category: '', unit: 'ชิ้น', unit_price: 0, qty: 1, total: 0 }
    ]);
  };

  const handleRemovePartRow = (index) => {
    if (ticketParts.length === 1) {
      setTicketParts([{ part_id: '', part_name: '', part_code: '', category: '', unit: 'ชิ้น', unit_price: 0, qty: 1, total: 0 }]);
    } else {
      setTicketParts(ticketParts.filter((_, i) => i !== index));
    }
  };

  const handleSaveSpareParts = async (e) => {
    e.preventDefault();
    const validItems = ticketParts.filter(p => p.part_name && p.part_name.trim());
    setActionLoading(true);
    try {
      await apiCall('ticket.spare_parts.save', {
        ticket_id: id,
        items: validItems
      });
      setShowSparePartsModal(false);
      setSuccessMsg('บันทึกรายการเบิกใช้อะไหล่เรียบร้อยแล้ว');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchTicket();
    } catch (err) {
      setError(err.message || 'ไม่สามารถบันทึกรายการอะไหล่ได้');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">กำลังโหลดรายละเอียดใบงาน...</p>
      </div>
    );
  }

  const statusMap = {
    NEW: { label: 'แจ้งใหม่ (รอจัดสรรทีมช่าง)', color: 'bg-sky-50 text-sky-700 border-sky-200' },
    SUBMITTED: { label: 'แจ้งใหม่ (รอจัดสรรทีมช่าง)', color: 'bg-sky-50 text-sky-700 border-sky-200' },
    WAITING_ASSIGNMENT: { label: 'รอจัดสรรทีมช่าง', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    ASSIGNED: { label: 'มอบหมายทีมช่างแล้ว', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    CHECKED_IN: { label: 'ช่างถึงพื้นที่แล้ว', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    IN_PROGRESS: { label: 'กำลังดำเนินการซ่อม', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    COMPLETED_BY_TECH: { label: 'ช่างส่งมอบงานแล้ว (รอตรวจรับ)', color: 'bg-teal-50 text-teal-700 border-teal-200' },
    WAITING_REVIEW: { label: 'รอผู้จัดการตรวจรับงาน', color: 'bg-teal-50 text-teal-700 border-teal-200' },
    REWORK: { label: 'ส่งกลับแก้ไข (Rework)', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    REJECTED_REWORK: { label: 'ส่งกลับแก้ไข (Rework)', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    COMPLETED: { label: 'ตรวจรับผ่านเรียบร้อย', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    CLOSED: { label: 'ปิดงานสมบูรณ์', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    ARCHIVED: { label: 'เก็บเข้าคลังประวัติ', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    CANCELLED: { label: 'ยกเลิกใบงาน', color: 'bg-slate-100 text-slate-600 border-slate-200' }
  };

  const priorityMap = {
    URGENT: { label: 'ฉุกเฉินที่สุด', color: 'text-rose-600 font-bold' },
    HIGH: { label: 'เร่งด่วน', color: 'text-amber-600 font-bold' },
    NORMAL: { label: 'ปกติ', color: 'text-slate-700 font-semibold' },
    LOW: { label: 'ไม่เร่งด่วน', color: 'text-slate-500 font-medium' }
  };

  const currentStatus = ticket ? (statusMap[ticket.status] || { label: ticket.status, color: 'bg-slate-100 text-slate-700 border-slate-200' }) : null;
  const currentParts = ticket?.spare_parts || [];
  const totalPartsCost = currentParts.reduce((acc, curr) => acc + Number(curr.total || 0), 0);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 font-mono">ใบแจ้งซ่อม {id}</h1>
              {currentStatus && (
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${currentStatus.color}`}>
                  {currentStatus.label}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              สร้างเมื่อ: {ticket?.created_at ? new Date(ticket.created_at).toLocaleString('th-TH') : '-'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => navigate(`/tickets/${id}/report`)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>ใบรายงาน Service Report</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-xs flex items-center gap-2 shadow-2xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200 text-xs flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {gpsStatus && (
        <div className="bg-blue-50 text-blue-700 p-3.5 rounded-xl border border-blue-200 text-xs flex items-center gap-2 shadow-2xs">
          <Navigation className="w-4 h-4 animate-spin text-blue-600" />
          <span>{gpsStatus}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50/50 overflow-x-auto">
          {[
            { id: 'general', label: 'ข้อมูลทั่วไป' },
            { id: 'locations', label: 'รายการจุดซ่อม', count: ticket?.items?.length },
            { id: 'spare_parts', label: 'รายการอะไหล่ที่ใช้', count: currentParts.length },
            { id: 'timeline', label: 'ประวัติการดำเนินงาน' },
            { id: 'review', label: 'ประวัติตรวจรับและตีกลับ' },
            { id: 'gps', label: 'พิกัด GPS' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === tab.id ? 'bg-blue-50 text-blue-600' : 'bg-slate-200 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-5 sm:p-6 min-h-[260px]">
          {/* TAB 1: General Info */}
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 font-medium">รหัสใบงาน</label>
                  <p className="text-sm font-mono font-bold text-slate-800">{ticket?.ticket_id || id}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium">สาขาที่แจ้ง</label>
                  <p className="text-sm font-semibold text-slate-800">{ticket?.branch_name || ticket?.branch_id || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium">หมวดหมู่งานซ่อม</label>
                  <p className="text-sm font-semibold text-slate-800">{ticket?.category_name || ticket?.work_type_name || 'งานซ่อมบำรุงทั่วไป'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 font-medium">ทีมช่างผู้รับผิดชอบ</label>
                  <p className="text-sm font-semibold text-blue-700">{ticket?.team_name || ticket?.team || 'ยังไม่ระบุทีม'}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium">ระดับความเร่งด่วน</label>
                  <p className={`text-sm ${priorityMap[ticket?.priority]?.color || 'text-slate-700 font-semibold'}`}>
                    {priorityMap[ticket?.priority]?.label || ticket?.priority || 'ปกติ'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium">รายละเอียดภาพรวม</label>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 mt-1 leading-relaxed">
                    {ticket?.overview || ticket?.description || (ticket?.items && ticket.items[0]?.detail) || (ticket?.items && ticket.items[0]?.description) || 'ไม่มีรายละเอียดเพิ่มเติม'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Locations / Items */}
          {activeTab === 'locations' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800">รายการจุดที่ต้องเข้าซ่อม</h3>
                <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200">
                  {ticket?.items?.length || 0} จุดซ่อม
                </span>
              </div>
              {ticket?.items && ticket.items.length > 0 ? (
                <div className="space-y-3">
                  {ticket.items.map((item, idx) => (
                    <div key={item.item_id || idx} className="p-4 border border-slate-200 rounded-xl bg-slate-50/70 hover:bg-white transition-all space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-xs text-slate-800">
                            จุดซ่อมที่ {idx + 1}
                          </span>
                        </div>
                        {item.category_name && (
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold">
                            {item.category_name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 pl-8 leading-relaxed">
                        {item.detail || item.description || 'ไม่มีรายละเอียดระบุ'}
                      </p>
                      {item.image_url && (
                        <div className="pl-8 pt-2">
                          <img src={item.image_url} alt="หลักฐานจุดซ่อม" className="w-32 h-24 object-cover rounded-lg border border-slate-200" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">ไม่มีข้อมูลรายการจุดซ่อม</p>
              )}
            </div>
          )}

          {/* TAB 3: SPARE PARTS */}
          {activeTab === 'spare_parts' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span>รายการอะไหล่และอุปกรณ์ที่ใช้ (Spare Parts Used)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    อะไหล่ที่ช่างเทคนิคเบิกใช้ในงานซ่อมบำรุงนี้
                  </p>
                </div>

                {(role === 'tech' || role === 'admin') && (
                  <button
                    onClick={openSparePartsModal}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs self-start sm:self-center"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{currentParts.length > 0 ? 'แก้ไข / เพิ่มรายการอะไหล่' : 'บันทึกการเบิกใช้อะไหล่'}</span>
                  </button>
                )}
              </div>

              {currentParts.length > 0 ? (
                <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-2xs">
                  <table className="w-full text-left border-collapse text-xs min-w-[500px]">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                        <th className="py-3 px-4 w-12 text-center">ลำดับ</th>
                        <th className="py-3 px-4">รายการอะไหล่ / รหัส</th>
                        <th className="py-3 px-4">หมวดหมู่</th>
                        <th className="py-3 px-4 text-center w-24">จำนวน</th>
                        <th className="py-3 px-4 text-right w-28">ราคา/หน่วย (บาท)</th>
                        <th className="py-3 px-4 text-right w-32">รวมเงิน (บาท)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentParts.map((sp, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            <div>{sp.part_name || sp.name}</div>
                            {(sp.part_code || sp.code) && (
                              <div className="text-[10px] font-mono text-slate-400">{sp.part_code || sp.code}</div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-600 text-[11px]">{sp.category || '-'}</td>
                          <td className="py-3 px-4 text-center font-medium text-slate-700">
                            {sp.qty} {sp.unit || 'ชิ้น'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-700">
                            {Number(sp.unit_price || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                            {Number(sp.total || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 border-t border-slate-200 font-bold">
                        <td colSpan={5} className="py-3 px-4 text-right text-slate-700">
                          รวมค่าอะไหล่สุทธิทั้งหมด:
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-blue-700 text-sm">
                          {totalPartsCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50 text-xs text-slate-400 space-y-2">
                  <Package className="w-8 h-8 text-slate-300 mx-auto" />
                  <p>ยังไม่มีการบันทึกการเบิกใช้อะไหล่ในใบงานนี้</p>
                  {(role === 'tech' || role === 'admin') && (
                    <button
                      onClick={openSparePartsModal}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors inline-flex items-center gap-1 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-600" />
                      <span>บันทึกอะไหล่ที่ใช้</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Timeline */}
          {activeTab === 'timeline' && (
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-4">ลำดับเหตุการณ์การดำเนินงาน</h3>
              <div className="space-y-4 border-l-2 border-slate-200 pl-4 ml-2">
                <div className="relative">
                  <div className="w-2.5 h-2.5 bg-blue-600 rounded-full absolute -left-[21px] top-1.5" />
                  <p className="text-xs font-semibold text-slate-800">สร้างใบแจ้งซ่อม</p>
                  <p className="text-[11px] text-slate-400">{ticket?.created_at ? new Date(ticket.created_at).toLocaleString('th-TH') : '-'}</p>
                </div>
                {ticket?.assigned_at && (
                  <div className="relative">
                    <div className="w-2.5 h-2.5 bg-purple-600 rounded-full absolute -left-[21px] top-1.5" />
                    <p className="text-xs font-semibold text-slate-800">มอบหมายทีมช่าง: {ticket.team_name || ticket.team_id}</p>
                    <p className="text-[11px] text-slate-400">{new Date(ticket.assigned_at).toLocaleString('th-TH')}</p>
                  </div>
                )}
                {ticket?.checked_in_at && (
                  <div className="relative">
                    <div className="w-2.5 h-2.5 bg-amber-600 rounded-full absolute -left-[21px] top-1.5" />
                    <p className="text-xs font-semibold text-slate-800">ช่างลงชื่อเข้าพื้นที่ (GPS Check-in)</p>
                    <p className="text-[11px] text-slate-400">{new Date(ticket.checked_in_at).toLocaleString('th-TH')}</p>
                  </div>
                )}
                {ticket?.completed_at && (
                  <div className="relative">
                    <div className="w-2.5 h-2.5 bg-green-600 rounded-full absolute -left-[21px] top-1.5" />
                    <p className="text-xs font-semibold text-slate-800">ช่างส่งมอบงานซ่อม</p>
                    <p className="text-[11px] text-slate-400">{new Date(ticket.completed_at).toLocaleString('th-TH')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Review History */}
          {activeTab === 'review' && (
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3">ประวัติการตรวจรับงาน</h3>
              {ticket?.reviews && ticket.reviews.length > 0 ? (
                <div className="space-y-3">
                  {ticket.reviews.map((rev, idx) => (
                    <div key={idx} className="p-3 border rounded-xl bg-slate-50">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          rev.review_status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {rev.review_status === 'APPROVED' ? 'ผ่านการตรวจรับ' : 'ตีกลับแก้ไข (Rework)'}
                        </span>
                        <span className="text-[11px] text-slate-400">{new Date(rev.created_at).toLocaleString('th-TH')}</span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1">{rev.comments || 'ไม่มีความเห็นเพิ่มเติม'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">ยังไม่มีประวัติการตรวจรับ</p>
              )}
            </div>
          )}

          {/* TAB 6: GPS */}
          {activeTab === 'gps' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">ข้อมูลพิกัด GPS และระยะทางช่วงการเดินทาง</h3>
                <p className="text-xs text-slate-500">บันทึกพิกัดจริงที่ช่างกดเช็คอิน พร้อมคำนวณระยะทางต่อช่วง (Hop-by-Hop)</p>
              </div>

              {ticket?.distances && ticket.distances.length > 0 && (
                <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900">ระยะทางเดินทางช่วงนี้ (Travel Leg):</span>
                    <span className="text-sm font-bold text-blue-700">
                      {Number(ticket.distances[ticket.distances.length - 1].straight_distance_km || 0).toFixed(1)} กม.
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-blue-800 pt-1 border-t border-blue-200/60">
                    <span>ประมาณการค่าน้ำมัน (เรท {ticket.fuel_rate || 5.0} บ./กม.):</span>
                    <span className="font-bold text-blue-900">
                      {(Number(ticket.distances[ticket.distances.length - 1].straight_distance_km || 0) * Number(ticket.fuel_rate || 5.0)).toFixed(2)} บาท
                    </span>
                  </div>
                </div>
              )}

              {ticket?.checkins && ticket.checkins.length > 0 ? (
                <div className="space-y-2">
                  {ticket.checkins.map((chk, idx) => (
                    <div key={idx} className="p-3 border rounded-xl bg-slate-50 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                      <div>
                        <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                          <span>ละติจูด: {chk.latitude}, ลองจิจูด: {chk.longitude}</span>
                        </p>
                        <p className="text-slate-400 mt-0.5">
                          เวลาเช็คอิน: {new Date(chk.timestamp || chk.created_at || Date.now()).toLocaleString('th-TH')}
                        </p>
                      </div>
                      <a 
                        href={`https://www.google.com/maps?q=${chk.latitude},${chk.longitude}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-2xs text-center self-start sm:self-center"
                      >
                        เปิดดูบน Google Maps
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50 text-xs text-slate-400">
                  ยังไม่มีข้อมูลการเช็คอิน GPS สำหรับใบงานนี้
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Role-Specific Action Footer */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          การดำเนินการสำหรับบทบาท: {
            role === 'admin' ? 'ผู้ดูแลระบบส่วนกลาง (Central Admin)' :
            role === 'manager' ? 'ผู้จัดการสาขา (Branch Manager)' : 'ช่างเทคนิค (Technician)'
          }
        </h3>

        {/* ADMIN ACTIONS */}
        {role === 'admin' && (
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => navigate('/assignments')}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors shadow-2xs"
            >
              ไปที่หน้ามอบหมายทีมช่าง
            </button>
            <button 
              onClick={openSparePartsModal}
              className="bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-900 transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Package className="w-3.5 h-3.5 text-blue-400" />
              <span>บันทึกอะไหล่ที่ใช้</span>
            </button>
            <button 
              onClick={() => navigate('/fuel/review')}
              className="bg-slate-100 text-slate-800 border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              ตรวจสอบค่าน้ำมัน
            </button>
          </div>
        )}

        {/* MANAGER ACTIONS */}
        {role === 'manager' && (
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleManagerApprove}
              disabled={actionLoading}
              className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ตรวจรับงานผ่าน (Approve)</span>
            </button>
            <button 
              onClick={() => {
                setRejectReason('');
                setShowRejectModal(true);
              }}
              disabled={actionLoading}
              className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-red-700 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>ส่งกลับแก้ไข (Reject / Rework)</span>
            </button>
            <button 
              onClick={() => setShowCloseModal(true)}
              disabled={actionLoading}
              className="bg-purple-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-purple-700 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ปิดใบงานและประเมินความพึงพอใจ</span>
            </button>
          </div>
        )}

        {/* TECHNICIAN ACTIONS */}
        {role === 'tech' && (
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleTechCheckin}
              disabled={actionLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>ลงชื่อเข้าพื้นที่ (GPS Check-in)</span>
            </button>
            <button 
              onClick={openSparePartsModal}
              className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Package className="w-3.5 h-3.5 text-blue-400" />
              <span>บันทึกการเบิกใช้อะไหล่ ({currentParts.length})</span>
            </button>
            <button 
              onClick={() => {
                setTechnicianNote('');
                setShowSubmitModal(true);
              }}
              disabled={actionLoading}
              className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ส่งมอบงาน (Submit Work)</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: MANAGE TICKET SPARE PARTS                                          */}
      {/* ========================================================================= */}
      {showSparePartsModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span>บันทึกการเบิกใช้อะไหล่ในใบงาน {id}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  เลือกอะไหล่จากฐานข้อมูลของระบบ หรือพิมพ์ระบุรายการและจำนวนที่เบิกใช้จริง
                </p>
              </div>
              <button 
                onClick={() => setShowSparePartsModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSpareParts} className="space-y-4 overflow-y-auto flex-1 pr-1">
              <div className="space-y-3">
                {ticketParts.map((row, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        รายการที่ {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemovePartRow(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                        title="ลบแถวนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Master parts dropdown */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">เลือกจากฐานข้อมูลอะไหล่</label>
                        <select
                          value={row.part_id || ''}
                          onChange={(e) => handleSelectMasterPart(idx, e.target.value)}
                          className="w-full border border-slate-300 rounded-xl p-2 outline-none focus:border-blue-500 font-medium bg-white"
                        >
                          <option value="">-- เลือกรายการอะไหล่ --</option>
                          {masterParts.map(mp => (
                            <option key={mp.part_id} value={mp.part_id}>
                              {mp.part_name} ({mp.part_code}) - {Number(mp.unit_price).toFixed(2)} บ.
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Part Name custom/edit */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">ชื่อรายการอะไหล่ *</label>
                        <input
                          type="text"
                          required
                          placeholder="ชื่ออะไหล่"
                          value={row.part_name}
                          onChange={(e) => handleUpdatePartRow(idx, 'part_name', e.target.value)}
                          className="w-full border border-slate-300 rounded-xl p-2 outline-none focus:border-blue-500 font-medium bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">จำนวน *</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={row.qty}
                          onChange={(e) => handleUpdatePartRow(idx, 'qty', e.target.value)}
                          className="w-full border border-slate-300 rounded-xl p-2 font-mono font-bold outline-none focus:border-blue-500 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">หน่วย</label>
                        <input
                          type="text"
                          value={row.unit}
                          onChange={(e) => handleUpdatePartRow(idx, 'unit', e.target.value)}
                          className="w-full border border-slate-300 rounded-xl p-2 outline-none focus:border-blue-500 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">ราคา/หน่วย (บ.)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={row.unit_price}
                          onChange={(e) => handleUpdatePartRow(idx, 'unit_price', e.target.value)}
                          className="w-full border border-slate-300 rounded-xl p-2 font-mono outline-none focus:border-blue-500 bg-white"
                        />
                      </div>
                      <div className="col-span-3 sm:col-span-1">
                        <label className="block font-semibold text-slate-700 mb-1">รวมเงิน (บาท)</label>
                        <div className="p-2 bg-slate-100 rounded-xl font-mono font-bold text-slate-900 text-right">
                          {Number(row.total || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={handleAddPartRow}
                  className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-600" />
                  <span>+ เพิ่มรายการอะไหล่อีก</span>
                </button>

                <div className="text-right text-xs">
                  <span className="text-slate-500 mr-2">ยอดรวมค่าอะไหล่:</span>
                  <span className="text-base font-bold font-mono text-blue-700">
                    {ticketParts.reduce((acc, curr) => acc + Number(curr.total || 0), 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSparePartsModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold disabled:opacity-40 transition-colors shadow-2xs"
                >
                  {actionLoading ? 'กำลังบันทึก...' : 'บันทึกข้อมูลอะไหล่'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Reject Rework */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-base font-bold text-slate-800 mb-1">ระบุเหตุผลการส่งกลับแก้ไข (Rework)</h3>
            <p className="text-xs text-slate-500 mb-4">โปรดระบุรายละเอียดจุดที่ต้องให้ช่างเทคนิคแก้ไขเพิ่มเติม</p>
            <form onSubmit={handleManagerReject} className="space-y-4">
              <textarea 
                required
                rows={4}
                placeholder="เช่น งานเก็บสียังไม่เรียบร้อย, จุดรั่วยังมีน้ำซึมอยู่..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
              />
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700"
                >
                  {actionLoading ? 'กำลังส่ง...' : 'ยืนยันการส่งกลับแก้ไข'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Close Ticket */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-base font-bold text-slate-800 mb-1">ปิดใบงานและประเมินผลการซ่อม</h3>
            <p className="text-xs text-slate-500 mb-4">ให้คะแนนความพึงพอใจการปฏิบัติงานของทีมช่าง</p>
            <form onSubmit={handleManagerClose} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">คะแนนความพึงพอใจ (1-5)</label>
                <select 
                  value={satisfactionScore} 
                  onChange={(e) => setSatisfactionScore(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs outline-none bg-white font-semibold"
                >
                  <option value={5}>5 - ดีเยี่ยมมาก</option>
                  <option value={4}>4 - ดี</option>
                  <option value={3}>3 - ปานกลาง</option>
                  <option value={2}>2 - พอใช้</option>
                  <option value={1}>1 - ควรปรับปรุง</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-700"
                >
                  {actionLoading ? 'กำลังบันทึก...' : 'ยืนยันการปิดใบงาน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Tech Submit Work */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-base font-bold text-slate-800 mb-1">ส่งมอบงานซ่อมบำรุง</h3>
            <p className="text-xs text-slate-500 mb-4">บันทึกผลการปฏิบัติงานเพื่อให้ผู้จัดการสาขาตรวจรับ</p>
            <form onSubmit={handleTechSubmitWork} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">บันทึกของช่างเทคนิค</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="ระบุสิ่งที่ได้ดำเนินการซ่อมแซม รายละเอียดการทดสอบระบบ..."
                  value={technicianNote}
                  onChange={(e) => setTechnicianNote(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
                >
                  {actionLoading ? 'กำลังส่ง...' : 'ยืนยันการส่งมอบงาน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
