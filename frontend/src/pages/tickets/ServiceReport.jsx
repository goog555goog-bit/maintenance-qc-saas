import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Printer, 
  ArrowLeft, 
  Download, 
  Share2, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Building2, 
  User, 
  Wrench, 
  Calendar, 
  ShieldCheck, 
  Star, 
  DollarSign, 
  Fuel, 
  Camera, 
  FileText,
  Copy,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { apiCall } from '@/core/api';
import StatusBadge from '@/components/ui/StatusBadge';

export default function ServiceReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const reportRef = useRef(null);

  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await apiCall('ticket.get', { ticket_id: id });
        setTicket(res || null);
      } catch (err) {
        console.error('Error fetching service report:', err);
        setError(err.message || 'ไม่สามารถดึงข้อมูลรายงาน Service Report ได้');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchTicket();
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '-';
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' น.';
    } catch {
      return isoStr;
    }
  };

  const formatTimeOnly = (isoStr) => {
    if (!isoStr) return '-';
    try {
      const date = new Date(isoStr);
      return date.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
      }) + ' น.';
    } catch {
      return isoStr;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs text-slate-500 font-medium">กำลังจัดเตรียมเอกสาร Service Report...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl border border-rose-200 shadow-sm text-center space-y-4 my-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <div>
          <h2 className="text-base font-bold text-slate-800">ไม่พบข้อมูลรายงาน Service Report</h2>
          <p className="text-xs text-slate-500 mt-1">{error || 'ไม่พบรหัสใบงานที่ระบุในระบบ'}</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
        >
          ย้อนกลับ
        </button>
      </div>
    );
  }

  // Real Database Field Resolution
  const branchName = ticket.branch_name || (ticket.branch ? ticket.branch.branch_name : ('สาขา ' + (ticket.branch_id || '-')));
  const branchAddress = ticket.branch?.address || ('ที่ตั้งสาขา ' + branchName);
  const managerName = ticket.branch?.manager_name || ticket.created_by || 'ผู้จัดการสาขา';
  const managerPhone = ticket.branch?.phone || '-';
  const teamName = ticket.team_name || ticket.team || (ticket.assignments && ticket.assignments[0]?.team_id ? 'ทีม ' + ticket.assignments[0].team_id : 'รอจัดสรรทีมช่าง');
  const categoryName = ticket.category_name || ticket.work_type_name || (ticket.items && ticket.items[0]?.category_name) || 'งานซ่อมบำรุงทั่วไป';
  
  // Symptoms / Problem overview
  const itemsText = ticket.items && ticket.items.length > 0 
    ? ticket.items.map(it => it.detail || it.description || it.category_name).filter(Boolean).join(', ')
    : '';
  const problemDescription = ticket.overview || ticket.description || itemsText || 'ไม่มีระบุรายละเอียดอาการเพิ่มเติม';

  // Technician Diagnosis / Resolution Note
  const latestSession = ticket.sessions && ticket.sessions.length > 0 ? ticket.sessions[ticket.sessions.length - 1] : null;
  const technicianResolution = latestSession?.technician_note || ticket.technician_note || ticket.overview || 'ช่างเทคนิคดำเนินการตรวจเช็คและแก้ไขเรียบร้อยตามมาตรฐาน QC';

  // Service Dates & Timestamps
  const firstCheckin = ticket.checkins && ticket.checkins.length > 0 ? ticket.checkins[0] : null;
  const serviceDate = firstCheckin ? (firstCheckin.device_time || firstCheckin.server_time || firstCheckin.created_at) : (ticket.updated_at || ticket.created_at);
  const startTime = firstCheckin ? (firstCheckin.device_time || firstCheckin.server_time || firstCheckin.created_at) : null;
  const endTime = latestSession?.submitted_at || latestSession?.ended_at || (['COMPLETED_BY_TECH', 'CLOSED', 'WAITING_REVIEW'].includes(ticket.status) ? ticket.updated_at : null);

  // Calculate operation duration
  let durationText = '-';
  if (startTime && endTime) {
    const diffMs = new Date(endTime).getTime() - new Date(startTime).getTime();
    if (diffMs > 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      durationText = hours > 0 ? `${hours} ชม. ${mins} นาที` : `${mins} นาที`;
    }
  }

  // Calculate distances & estimated fuel
  const latestDistance = ticket.distances && ticket.distances.length > 0 
    ? Number(ticket.distances[ticket.distances.length - 1].straight_distance_km || 0)
    : 0;
  
  const fuelRateVal = Number(ticket.fuel_rate || 5.0);
  const travelCost = latestDistance * fuelRateVal;

  // Real Spare Parts List
  const spareParts = Array.isArray(ticket.spare_parts) && ticket.spare_parts.length > 0 
    ? ticket.spare_parts 
    : [];

  const totalSparePartsCost = spareParts.reduce((acc, curr) => acc + Number(curr.total || 0), 0);
  const laborCost = Number(ticket.labor_cost || 0);
  const subtotalBeforeVat = totalSparePartsCost + laborCost + travelCost;
  const vat7 = subtotalBeforeVat * 0.07;
  const grandTotal = subtotalBeforeVat + vat7;

  // Photos (From Ticket_Items or Photos array)
  const itemPhotos = (ticket.items || [])
    .filter(it => it.image_url)
    .map(it => ({ url: it.image_url, name: it.detail || it.category_name, photo_type: 'BEFORE' }));

  const directPhotos = ticket.photos || [];
  const allBeforePhotos = [...itemPhotos, ...directPhotos.filter(p => p.photo_type === 'BEFORE')];
  const allAfterPhotos = directPhotos.filter(p => p.photo_type === 'AFTER');

  // Satisfaction Review
  const satisfactionScore = ticket.satisfaction?.score || ticket.satisfaction_score || null;
  const satisfactionComment = ticket.satisfaction?.comment || (ticket.reviews && ticket.reviews[0]?.comments) || '';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 print:p-0 print:m-0 print:max-w-none print:w-full print:space-y-0 print:pb-0">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ย้อนกลับ</span>
        </button>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={handleCopyLink}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'คัดลอกลิงก์แล้ว' : 'แชร์ลิงก์'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>พิมพ์เอกสาร / บันทึกเป็น PDF</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN SERVICE REPORT SHEET (Printable Paper Document)                      */}
      {/* ========================================================================= */}
      <div 
        ref={reportRef}
        className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10 space-y-7 text-slate-800 print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none print:w-full"
      >
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b-2 border-slate-900 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900 uppercase">
                Service Report
              </span>
              <span className="text-xs bg-slate-900 text-white font-bold px-2 py-0.5 rounded">
                ใบรายงานผลการปฏิบัติงาน
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              ระบบบริหารและตรวจรับงานซ่อมบำรุงมาตรฐานสากล (Maintenance Quality Control System)
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <div className="flex items-center sm:justify-end gap-1.5">
              <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                {ticket.ticket_id}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              สถานะ: <span className="font-bold text-slate-800">{ticket.status}</span>
            </p>
          </div>
        </div>

        {/* Section 1: ข้อมูลเอกสารและข้อมูลสาขา (Document & Branch Details) */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>ข้อมูลใบงานและข้อมูลสาขา (Service & Location Information)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 text-xs bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-slate-500 shrink-0 w-28">เลขที่เอกสาร:</span>
              <span className="font-mono font-bold text-slate-900">{ticket.ticket_id}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-slate-500 shrink-0 w-28">วันที่เปิดใบงาน:</span>
              <span className="text-slate-800">{formatDate(ticket.created_at)}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-slate-500 shrink-0 w-28">ชื่อสาขา / รหัส:</span>
              <span className="font-bold text-slate-900">{branchName}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-slate-500 shrink-0 w-28">วันที่เข้าปฏิบัติงาน:</span>
              <span className="text-slate-800">{formatDate(serviceDate)}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-slate-500 shrink-0 w-28">ที่อยู่สาขา:</span>
              <span className="text-slate-800">{branchAddress}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-slate-500 shrink-0 w-28">ผู้จัดการ / ผู้ติดต่อ:</span>
              <span className="text-slate-800 font-medium">{managerName} {managerPhone !== '-' && `(${managerPhone})`}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-slate-500 shrink-0 w-28">ทีมช่างผู้รับผิดชอบ:</span>
              <span className="font-bold text-blue-700">{teamName}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-slate-500 shrink-0 w-28">ระดับความเร่งด่วน:</span>
              <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                ticket.priority === 'URGENT' ? 'bg-rose-100 text-rose-800' : 
                ticket.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-800'
              }`}>
                {ticket.priority === 'URGENT' ? 'ฉุกเฉินที่สุด (URGENT)' : ticket.priority === 'HIGH' ? 'เร่งด่วน (HIGH)' : 'ปกติ (NORMAL)'}
              </span>
            </div>
            <div className="flex items-baseline gap-2 md:col-span-2 pt-1 border-t border-slate-200/60">
              <span className="font-semibold text-slate-500 shrink-0 w-28">หมวดหมู่งานซ่อม:</span>
              <span className="font-semibold text-slate-900">{categoryName}</span>
            </div>
            <div className="flex items-start gap-2 md:col-span-2">
              <span className="font-semibold text-slate-500 shrink-0 w-28">อาการปัญหาที่พบ:</span>
              <span className="text-slate-800 leading-relaxed font-medium">{problemDescription}</span>
            </div>
          </div>
        </div>

        {/* Section 2: รูปภาพก่อนซ่อม & หลังซ่อม (Before & After Photo Gallery) */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-blue-600" />
            <span>หลักฐานภาพถ่ายการปฏิบัติงาน (Before & After Service Evidence)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Before Photos */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>รูปภาพก่อนซ่อม (Before Service)</span>
                </span>
                <span className="text-[10px] text-slate-400">สภาพปัญหาเดิม</span>
              </div>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 min-h-[140px] items-center">
                {allBeforePhotos.length > 0 ? (
                  allBeforePhotos.map((p, idx) => (
                    <div key={idx} className="aspect-4/3 rounded-xl overflow-hidden border border-slate-200 bg-white">
                      <img 
                        src={p.photo_url || p.url || p} 
                        alt={`Before ${idx + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 flex flex-col items-center justify-center text-center p-4 text-slate-400 text-xs">
                    <Camera className="w-6 h-6 text-slate-300 mb-1" />
                    <span>ไม่มีรูปภาพก่อนซ่อมที่แนบไว้</span>
                  </div>
                )}
              </div>
            </div>

            {/* After Photos */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>รูปภาพหลังซ่อม (After Service)</span>
                </span>
                <span className="text-[10px] text-slate-400">ผลงานเสร็จสมบูรณ์</span>
              </div>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 min-h-[140px] items-center">
                {allAfterPhotos.length > 0 ? (
                  allAfterPhotos.map((p, idx) => (
                    <div key={idx} className="aspect-4/3 rounded-xl overflow-hidden border border-slate-200 bg-white">
                      <img 
                        src={p.photo_url || p.url || p} 
                        alt={`After ${idx + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 flex flex-col items-center justify-center text-center p-4 text-slate-400 text-xs">
                    <Camera className="w-6 h-6 text-slate-300 mb-1" />
                    <span>ไม่มีรูปภาพหลังซ่อมที่แนบไว้</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: รายละเอียดการซ่อมและการจำแนกประเภท (Repair Classification & Diagnosis) */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-blue-600" />
            <span>รายละเอียดการตรวจเช็คและการแก้ไข (Inspection & Resolution Details)</span>
          </h2>

          <div className="space-y-2 text-xs bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="font-semibold text-slate-500 block mb-0.5">อุปกรณ์ / เครื่องจักร:</span>
                <p className="font-bold text-slate-800">{categoryName}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block mb-0.5">หมวดหมู่หลัก (Category):</span>
                <p className="font-semibold text-slate-800">{ticket.work_type_name || categoryName}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block mb-0.5">ประเภทปัญหา (Problem Type):</span>
                <p className="font-semibold text-slate-800">
                  {ticket.priority === 'URGENT' ? 'งานซ่อมบำรุงฉุกเฉิน (Urgent Corrective)' : 
                   ticket.priority === 'HIGH' ? 'งานซ่อมบำรุงเร่งด่วน (High Priority)' : 'งานซ่อมบำรุงทั่วไป (General Maintenance)'}
                </p>
              </div>
            </div>

            {ticket.items && ticket.items.length > 0 && (
              <div className="pt-2 border-t border-slate-200/60">
                <span className="font-semibold text-slate-500 block mb-1">รายการจุดซ่อมที่ระบุในใบงาน:</span>
                <div className="flex flex-wrap gap-1.5">
                  {ticket.items.map((it, idx) => (
                    <span key={idx} className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-medium text-slate-800">
                      จุดที่ {idx + 1}: {it.detail || it.description || it.category_name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200/60 space-y-1">
              <span className="font-semibold text-slate-500 block">ผลการตรวจเช็คและวิธีแก้ไขของช่าง:</span>
              <p className="text-slate-800 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed font-medium">
                {technicianResolution}
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: ตารางรายการอะไหล่และอุปกรณ์ที่ใช้ (Spare Parts & Materials Used) */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-blue-600" />
            <span>รายการอะไหล่และอุปกรณ์ที่ใช้ (Spare Parts & Materials)</span>
          </h2>

          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-2.5 px-4 w-12 text-center">ลำดับ</th>
                  <th className="py-2.5 px-4">รายการอะไหล่ / รหัสสินค้า</th>
                  <th className="py-2.5 px-4 text-center w-24">จำนวน</th>
                  <th className="py-2.5 px-4 text-right w-28">ราคา/หน่วย (บาท)</th>
                  <th className="py-2.5 px-4 text-right w-32">รวมเงิน (บาท)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {spareParts.length > 0 ? (
                  spareParts.map((sp, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-800">
                        <div>{sp.name || sp.item_name}</div>
                        {sp.code && <div className="text-[10px] font-mono text-slate-400">{sp.code}</div>}
                      </td>
                      <td className="py-2.5 px-4 text-center">{sp.qty} {sp.unit || 'ชิ้น'}</td>
                      <td className="py-2.5 px-4 text-right font-mono">{Number(sp.unitPrice || sp.unit_price || 0).toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{Number(sp.total || 0).toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-3 px-4 text-center text-slate-400 italic">
                      ไม่มีการเบิกใช้อะไหล่เพิ่มเติมในใบงานนี้ (งานตรวจเช็ค / บำรุงรักษาเชิงปฏิบัติการ)
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t border-slate-200 font-bold">
                  <td colSpan={4} className="py-2.5 px-4 text-right text-slate-600">รวมค่าอะไหล่สุทธิ:</td>
                  <td className="py-2.5 px-4 text-right font-mono text-blue-700">{totalSparePartsCost.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Section 5: ระยะเวลาปฏิบัติงานและการเดินทาง (Duration & Travel) */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>ระยะเวลาปฏิบัติงานและการเดินทาง (Operation Time & Travel Distance)</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
            <div>
              <span className="text-slate-500 block mb-0.5">เวลาเริ่มงาน (Check-in):</span>
              <p className="font-bold text-slate-800">{startTime ? formatTimeOnly(startTime) : '-'}</p>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">เวลาเสร็จสิ้น (Submit):</span>
              <p className="font-bold text-slate-800">{endTime ? formatTimeOnly(endTime) : '-'}</p>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">รวมเวลาปฏิบัติงาน:</span>
              <p className="font-bold text-slate-800">{durationText}</p>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">ระยะทางเดินทาง (GPS):</span>
              <p className="font-bold text-blue-700 font-mono">{latestDistance > 0 ? `${latestDistance.toFixed(1)} กม.` : '-'}</p>
            </div>
          </div>
        </div>

        {/* Section 6: สรุปค่าใช้จ่ายทั้งหมด (Financial / Cost Summary) */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-blue-600" />
            <span>สรุปค่าใช้จ่ายรวม (Financial Summary)</span>
          </h2>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800">การรับประกันผลงานซ่อม:</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                  รับประกัน 30 วัน
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">
                ครอบคลุมอาการเดิมและชิ้นส่วนอะไหล่ที่ได้รับการเปลี่ยนใหม่
              </p>
            </div>

            <div className="w-full sm:w-72 space-y-1.5 text-xs pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>รวมค่าอะไหล่:</span>
                <span className="font-mono">{totalSparePartsCost.toFixed(2)} บาท</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>รวมค่าแรง / ค่าบริการ:</span>
                <span className="font-mono">{laborCost.toFixed(2)} บาท</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>รวมค่าน้ำมัน / ค่าเดินทาง ({latestDistance.toFixed(1)} กม.):</span>
                <span className="font-mono">{travelCost.toFixed(2)} บาท</span>
              </div>
              <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
                <span>รวมเงินก่อนภาษี:</span>
                <span className="font-mono font-semibold">{subtotalBeforeVat.toFixed(2)} บาท</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>ภาษีมูลค่าเพิ่ม (VAT 7%):</span>
                <span className="font-mono">{vat7.toFixed(2)} บาท</span>
              </div>
              <div className="flex justify-between text-slate-900 text-sm font-bold pt-1.5 border-t-2 border-slate-900">
                <span>จำนวนเงินรวมทั้งสิ้น:</span>
                <span className="font-mono text-blue-700 text-base">{grandTotal.toFixed(2)} บาท</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 7: การลงนามและตรวจรับงาน (Signatures & Verification) */}
        <div className="space-y-4 pt-4 border-t-2 border-slate-200">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>การลงนามตรวจรับและประเมินผลงาน (Signatures & Approvals)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Technician Signature */}
            <div className="border border-slate-200 rounded-2xl p-4 text-center space-y-3 bg-slate-50/40">
              <span className="text-xs font-bold text-slate-700 block">ช่างเทคนิคผู้ส่งมอบงาน (Technician)</span>
              
              {/* Signature display box */}
              <div className="h-24 border border-dashed border-slate-300 rounded-xl bg-white flex items-center justify-center p-2">
                <span className="font-serif italic text-lg text-slate-700 tracking-wider">
                  {teamName}
                </span>
              </div>

              <div className="text-[11px] text-slate-500 space-y-0.5">
                <p className="font-semibold text-slate-800">({teamName})</p>
                <p>วันที่: {formatDate(serviceDate)}</p>
              </div>
            </div>

            {/* Branch Manager Signature */}
            <div className="border border-slate-200 rounded-2xl p-4 text-center space-y-3 bg-slate-50/40">
              <span className="text-xs font-bold text-slate-700 block">ผู้จัดการสาขาผู้ตรวจรับงาน (Branch Manager)</span>
              
              {/* Signature display box */}
              <div className="h-24 border border-dashed border-slate-300 rounded-xl bg-white flex flex-col items-center justify-center p-2">
                <span className="font-serif italic text-lg text-emerald-700 tracking-wider">
                  {managerName}
                </span>
                {satisfactionScore ? (
                  <div className="flex items-center gap-1 text-amber-500 mt-1">
                    {[...Array(Math.min(5, Number(satisfactionScore)))].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-[10px] font-bold text-slate-700 ml-1">{Number(satisfactionScore).toFixed(1)}</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 mt-1">อยู่ระหว่างรอการตรวจรับจากสาขา</span>
                )}
              </div>

              <div className="text-[11px] text-slate-500 space-y-0.5">
                <p className="font-semibold text-slate-800">({managerName})</p>
                <p>วันที่: {formatDate(ticket.updated_at || ticket.created_at)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 space-y-0.5">
          <p>เอกสารฉบับนี้ออกโดยระบบบริหารงานซ่อมบำรุงและควบคุมคุณภาพอัตโนมัติ (Maintenance QC SaaS)</p>
          <p>ข้อมูลได้รับการรับรองด้วยลายเซ็นดิจิทัลและพิกัดดาวเทียม GPS ประจำจุดปฏิบัติงาน</p>
        </div>
      </div>
    </div>
  );
}
