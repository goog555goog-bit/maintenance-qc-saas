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
  ShieldCheck
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

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-sm text-slate-500">กำลังโหลดรายละเอียดใบงาน...</p>
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

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-800">ใบแจ้งซ่อม {id}</h1>
              {currentStatus && (
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${currentStatus.color}`}>
                  {currentStatus.label}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              สร้างเมื่อ: {ticket?.created_at ? new Date(ticket.created_at).toLocaleString('th-TH') : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 border border-green-200 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {gpsStatus && (
        <div className="bg-blue-50 text-blue-700 p-3 rounded-lg mb-6 border border-blue-200 text-xs flex items-center gap-2">
          <Navigation className="w-4 h-4 animate-spin text-blue-600" />
          <span>{gpsStatus}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="flex border-b border-slate-200 bg-slate-50/50 overflow-x-auto">
          {[
            { id: 'general', label: 'ข้อมูลทั่วไป' },
            { id: 'locations', label: 'รายการจุดซ่อม' },
            { id: 'timeline', label: 'ประวัติการดำเนินงาน' },
            { id: 'review', label: 'ประวัติตรวจรับและตีกลับ' },
            { id: 'gps', label: 'พิกัด GPS' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 min-h-[260px]">
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
                  <p className="text-sm font-semibold text-slate-800">
                    {ticket?.category_name || ticket?.work_type_name || (ticket?.items && ticket.items[0]?.category_name) || ticket?.work_type_id || 'งานซ่อมบำรุงทั่วไป'}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 font-medium">ทีมช่างที่รับผิดชอบ</label>
                  <p className="text-sm font-semibold text-slate-800">{ticket?.team_name || ticket?.team_id || 'ยังไม่ระบุทีม'}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium">ระดับความเร่งด่วน</label>
                  <p className={`text-sm ${priorityMap[ticket?.priority]?.color || 'text-slate-700 font-semibold'}`}>
                    {priorityMap[ticket?.priority]?.label || ticket?.priority || 'ปกติ'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium">รายละเอียดภาพรวม</label>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-1">
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
                          <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                            {item.category_name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium pl-8">
                        {item.detail || item.description || 'ไม่มีรายละเอียดระบุ'}
                      </p>
                      {item.image_url && (
                        <div className="pl-8 pt-1">
                          <a href={item.image_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1">
                            <Camera className="w-3.5 h-3.5" />
                            <span>ดูรูปถ่ายประกอบจุดซ่อม</span>
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">ไม่มีรายการจุดซ่อมแยกย่อย</p>
              )}
            </div>
          )}

          {/* TAB 3: Timeline */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="border-l-2 border-slate-200 pl-4 space-y-4">
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

          {/* TAB 4: Review History */}
          {activeTab === 'review' && (
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3">ประวัติการตรวจรับงาน</h3>
              {ticket?.reviews && ticket.reviews.length > 0 ? (
                <div className="space-y-3">
                  {ticket.reviews.map((rev, idx) => (
                    <div key={idx} className="p-3 border rounded-lg bg-slate-50">
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
                <p className="text-xs text-slate-400">ยังไม่มีประวัติการตรวจรับ</p>
              )}
            </div>
          )}

          {/* TAB 5: GPS */}
          {activeTab === 'gps' && (
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-2">ข้อมูลพิกัด GPS ตอนเช็คอิน</h3>
              {ticket?.checkins && ticket.checkins.length > 0 ? (
                <div className="space-y-2">
                  {ticket.checkins.map((chk, idx) => (
                    <div key={idx} className="p-3 border rounded-lg bg-slate-50 text-xs text-slate-700 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-slate-800">ละติจูด: {chk.latitude}, ลองจิจูด: {chk.longitude}</p>
                        <p className="text-slate-400 mt-0.5">เวลา: {new Date(chk.timestamp).toLocaleString('th-TH')}</p>
                      </div>
                      <a 
                        href={`https://www.google.com/maps?q=${chk.latitude},${chk.longitude}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="bg-blue-600 text-white px-2.5 py-1 rounded text-xs hover:bg-blue-700"
                      >
                        เปิดแผนที่
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">ยังไม่มีข้อมูลการเช็คอิน GPS</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Role-Specific Action Footer */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
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
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              ไปที่หน้ามอบหมายทีมช่าง
            </button>
            <button 
              onClick={() => navigate('/fuel/review')}
              className="bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-slate-900 transition-colors"
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
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
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
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors flex items-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>ส่งกลับแก้ไข (Reject / Rework)</span>
            </button>
            <button 
              onClick={() => setShowCloseModal(true)}
              disabled={actionLoading}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-purple-700 transition-colors flex items-center gap-1.5"
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
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>ลงชื่อเข้าพื้นที่ (GPS Check-in)</span>
            </button>
            <button 
              onClick={() => {
                setTechnicianNote('');
                setShowSubmitModal(true);
              }}
              disabled={actionLoading}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ส่งมอบงาน (Submit Work)</span>
            </button>
          </div>
        )}
      </div>

      {/* MODAL: Reject Rework */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">ระบุเหตุผลการส่งกลับแก้ไข (Rework)</h3>
            <p className="text-xs text-slate-500 mb-4">โปรดระบุรายละเอียดจุดที่ต้องให้ช่างเทคนิคแก้ไขเพิ่มเติม</p>
            <form onSubmit={handleManagerReject} className="space-y-4">
              <textarea 
                required
                rows={4}
                placeholder="เช่น งานเก็บสียังไม่เรียบร้อย, จุดรั่วยังมีน้ำซึมอยู่..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
              />
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 font-medium"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
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
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">ปิดใบงานและประเมินความพึงพอใจ</h3>
            <p className="text-xs text-slate-500 mb-4">ใบงานจะถูกเปลี่ยนสถานะเป็น CLOSED และเข้าสู่กระบวนการจัดเก็บ</p>
            <form onSubmit={handleManagerClose} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">คะแนนความพึงพอใจ (1 - 5 ดาว)</label>
                <select 
                  value={satisfactionScore}
                  onChange={(e) => setSatisfactionScore(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none bg-white"
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
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 font-medium"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
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
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">ส่งมอบงานซ่อมบำรุง</h3>
            <p className="text-xs text-slate-500 mb-4">บันทึกผลการปฏิบัติงานเพื่อให้ผู้จัดการสาขาตรวจรับ</p>
            <form onSubmit={handleTechSubmitWork} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">บันทึกของช่างเทคนิค</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="ระบุสิ่งที่ได้ดำเนินการซ่อมแซม อะไหล่ที่เปลี่ยน..."
                  value={technicianNote}
                  onChange={(e) => setTechnicianNote(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 font-medium"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
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
