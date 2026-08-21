import React, { useState, useEffect } from 'react';
import { Fuel, CheckCircle2, XCircle, Loader2, AlertCircle, Eye, X, ArrowRight } from 'lucide-react';
import { apiCall } from '@/core/api';

export default function FuelReview() {
  const [fuelRequests, setFuelRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiCall('fuel_review.list', {});
      setFuelRequests(Array.isArray(res) ? res : (Array.isArray(res?.requests) ? res.requests : (Array.isArray(res?.data) ? res.data : [])));
    } catch (err) {
      setError(err.message || 'Failed to fetch requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openReviewModal = (req) => {
    setSelectedRequest(req);
    setRejectReason('');
    setIsRejecting(false);
    setShowModal(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      await apiCall('fuel_review.approve', { adjustment_id: selectedRequest.adjustment_id || selectedRequest.id });
      setShowModal(false);
      fetchRequests();
    } catch (err) {
      setError(err.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    if (!isRejecting) {
      setIsRejecting(true);
      return;
    }
    if (!rejectReason.trim()) return;

    setActionLoading(true);
    try {
      await apiCall('fuel_review.reject', { adjustment_id: selectedRequest.adjustment_id || selectedRequest.id, reason: rejectReason });
      setShowModal(false);
      fetchRequests();
    } catch (err) {
      setError(err.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">ตรวจสอบและอนุมัติการขอปรับค่าน้ำมัน</h1>
        <p className="text-xs text-slate-500 mt-0.5">พิจารณาคำขอปรับค่าน้ำมันเนื่องจากเหตุสุดวิสัย เช่น เส้นทางปิดซ่อม หรือเปลี่ยนจุดนัดหมาย</p>
      </div>
      
      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">รายการคำขอปรับค่าน้ำมัน</h2>
          <span className="text-xs font-mono font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
            {fuelRequests.length} รายการ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase bg-slate-50/70">
                <th className="py-3 px-4">รหัสใบงาน</th>
                <th className="py-3 px-4">ค่าน้ำมันเดิม (ระบบ)</th>
                <th className="py-3 px-4">ค่าน้ำมันที่ขอปรับ</th>
                <th className="py-3 px-4">เหตุผลการขอปรับ</th>
                <th className="py-3 px-4">สถานะ</th>
                <th className="py-3 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <span>กำลังโหลดรายการ...</span>
                  </td>
                </tr>
              ) : fuelRequests.length > 0 ? (
                fuelRequests.map((req) => (
                  <tr key={req.adjustment_id || req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      {req.ticket_id || req.ticketId}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {Number(req.system_amount || req.systemAmount || 0).toFixed(2)} บาท
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-700">
                      {Number(req.adjusted_amount || req.adjustedAmount || 0).toFixed(2)} บาท
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {req.reason || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      {req.status === 'APPROVED' ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">อนุมัติแล้ว</span>
                      ) : req.status === 'REJECTED' ? (
                        <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">ไม่อนุมัติ</span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">รอการอนุมัติ</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {(!req.status || req.status === 'PENDING') && (
                        <button 
                          onClick={() => openReviewModal(req)} 
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1 transition-colors shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>พิจารณา</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-slate-400">
                    <Fuel className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-sm text-slate-600">ไม่มีรายการขอปรับปรุงค่าน้ำมันที่ค้างอยู่</p>
                    <p className="text-xs text-slate-400 mt-1">เมื่อช่างเทคนิคส่งคำขอปรับค่าน้ำมัน รายการจะปรากฏที่นี่</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-800">พิจารณาการขอปรับค่าน้ำมัน</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-slate-400 text-[11px]">รหัสใบงาน</p>
                  <p className="font-mono font-bold text-slate-800 text-sm mt-0.5">{selectedRequest.ticket_id}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px]">ค่าน้ำมันที่ระบบคำนวณ</p>
                  <p className="font-semibold text-slate-700 mt-0.5">{selectedRequest.system_amount || 0} บาท</p>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200/60">
                  <p className="text-slate-400 text-[11px]">จำนวนเงินที่ขอปรับใหม่</p>
                  <p className="font-mono font-bold text-amber-700 text-base mt-0.5">{selectedRequest.adjusted_amount} บาท</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-700 mb-1">เหตุผลในการขอปรับ:</p>
                <div className="p-3 bg-white border border-slate-200 rounded-xl text-slate-700 leading-relaxed">
                  {selectedRequest.reason || 'ไม่มีการระบุเหตุผล'}
                </div>
              </div>

              {isRejecting && (
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-rose-700">ระบุเหตุผลที่ไม่อนุมัติ *</label>
                  <textarea
                    rows={3}
                    placeholder="กรุณาระบุเหตุผลการไม่อนุมัติ..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full p-2.5 border border-rose-300 rounded-xl outline-none focus:border-rose-500 bg-rose-50/20"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  ปิด
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleReject}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold transition-colors shadow-xs disabled:bg-rose-300"
                >
                  {isRejecting ? 'ยืนยันปฏิเสธ' : 'ไม่อนุมัติ'}
                </button>
                {!isRejecting && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleApprove}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors shadow-xs disabled:bg-emerald-300"
                  >
                    อนุมัติการขอปรับ
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
