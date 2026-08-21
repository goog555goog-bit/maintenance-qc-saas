import React, { useState, useEffect } from 'react';
import { Map, MapPin, Inbox, Loader2 } from 'lucide-react';
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
      setFuelRequests(res.requests || []);
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
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">ตรวจสอบและอนุมัติการขอปรับค่าน้ำมัน</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto flex flex-col min-h-[400px]">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-sm font-semibold text-slate-600">รหัสใบงาน</th>
              <th className="p-4 text-sm font-semibold text-slate-600">ทีมช่าง</th>
              <th className="p-4 text-sm font-semibold text-slate-600">ระยะทางระบบ</th>
              <th className="p-4 text-sm font-semibold text-slate-600">ค่าน้ำมันระบบ</th>
              <th className="p-4 text-sm font-semibold text-slate-600">ระยะทางที่ขอปรับ</th>
              <th className="p-4 text-sm font-semibold text-slate-600">ค่าน้ำมันที่ขอปรับ</th>
              <th className="p-4 text-sm font-semibold text-slate-600">สถานะ</th>
              <th className="p-4 text-sm font-semibold text-slate-600">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {fuelRequests.map((req) => (
              <tr key={req.adjustment_id || req.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 text-sm font-semibold text-slate-800">{req.ticket_id || req.ticketId}</td>
                <td className="p-4 text-sm text-slate-600">{req.team_name || req.teamName}</td>
                <td className="p-4 text-sm text-slate-600">{req.system_distance || req.systemDistance} กม.</td>
                <td className="p-4 text-sm text-slate-600">{req.system_amount || req.systemAmount} บาท</td>
                <td className="p-4 text-sm font-bold text-amber-600">{req.adjusted_distance || req.adjustedDistance} กม.</td>
                <td className="p-4 text-sm font-bold text-amber-600">{req.adjusted_amount || req.adjustedAmount} บาท</td>
                <td className="p-4 text-sm">
                  {req.status === 'APPROVED' ? (
                    <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">อนุมัติแล้ว</span>
                  ) : req.status === 'REJECTED' ? (
                    <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-xs font-semibold">ปฏิเสธแล้ว</span>
                  ) : (
                    <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs font-semibold">รอการอนุมัติ</span>
                  )}
                </td>
                <td className="p-4">
                  {(!req.status || req.status === 'PENDING') && (
                    <button onClick={() => openReviewModal(req)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">ตรวจสอบ</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isLoading && (
          <div className="flex justify-center items-center flex-1 py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}

        {fuelRequests.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center flex-1 py-16 text-slate-500">
            <Inbox className="h-16 w-16 text-slate-200 mb-4" />
            <p className="text-lg font-medium text-slate-600">ไม่มีรายการขอปรับปรุงค่าน้ำมัน</p>
            <p className="text-sm text-slate-400 mt-1">รายการขอปรับปรุงค่าน้ำมันจากช่างเทคนิคจะปรากฏที่นี่</p>
          </div>
        )}
      </div>

      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">ตรวจสอบการขอปรับค่าน้ำมัน</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">รหัสใบงาน</p>
                  <p className="font-semibold text-slate-800">{selectedRequest.ticket_id || selectedRequest.ticketId}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">ทีมช่าง</p>
                  <p className="font-semibold text-slate-800">{selectedRequest.team_name || selectedRequest.teamName}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">ระยะทางระบบ</p>
                  <p className="text-slate-800">{selectedRequest.system_distance || selectedRequest.systemDistance} กม.</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">ค่าน้ำมันระบบ</p>
                  <p className="text-slate-800">{selectedRequest.system_amount || selectedRequest.systemAmount} บาท</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">ระยะทางที่ขอปรับ</p>
                  <p className="font-bold text-amber-600">{selectedRequest.adjusted_distance || selectedRequest.adjustedDistance} กม.</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">ค่าน้ำมันที่ขอปรับ</p>
                  <p className="font-bold text-amber-600">{selectedRequest.adjusted_amount || selectedRequest.adjustedAmount} บาท</p>
                </div>
              </div>

              {isRejecting && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">เหตุผลที่ปฏิเสธ</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-red-500 focus:ring-red-500"
                    rows={3}
                    placeholder="โปรดระบุเหตุผล..."
                  />
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-md text-sm font-medium"
              >
                ยกเลิก
              </button>
              {!isRejecting ? (
                <>
                  <button
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md text-sm font-medium"
                  >
                    ปฏิเสธ
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-md text-sm font-medium flex items-center"
                  >
                    {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    อนุมัติ
                  </button>
                </>
              ) : (
                <button
                  onClick={handleReject}
                  disabled={actionLoading || !rejectReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md text-sm font-medium flex items-center"
                >
                  {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  ยืนยันการปฏิเสธ
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

