import React, { useState, useEffect } from 'react';
import { Fuel, CheckCircle2, AlertCircle, Loader2, Save, Calendar, Clock, DollarSign } from 'lucide-react';
import { apiCall } from '@/core/api';

export default function FuelRates() {
  const [rateHistory, setRateHistory] = useState([]);
  const [currentRate, setCurrentRate] = useState(5.0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchRates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const historyRes = await apiCall('fuel_rate.list', {});
      const rates = Array.isArray(historyRes) ? historyRes : (historyRes?.rates || historyRes?.data || []);
      setRateHistory(rates);
      
      const currentRes = await apiCall('fuel_rate.get', {});
      const rateVal = currentRes ? (currentRes.rate_per_km || currentRes.rate || 0) : (rates.length > 0 ? rates[rates.length - 1].rate_per_km : 5.0);
      setCurrentRate(Number(rateVal) || 5.0);
    } catch (err) {
      setError(err.message || 'Failed to fetch fuel rates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleUpdateRate = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMsg('');
    try {
      await apiCall('fuel_rate.set', { 
        rate_per_km: Number(currentRate),
        rate: Number(currentRate),
        effective_from: new Date().toISOString().split('T')[0]
      });
      setSuccessMsg('อัปเดตอัตราค่าน้ำมันเรียบร้อยแล้ว');
      setTimeout(() => setSuccessMsg(''), 4000);
      await fetchRates();
    } catch (err) {
      setError(err.message || 'ไม่สามารถอัปเดตเรทค่าน้ำมันได้');
      setIsLoading(false);
    }
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '-';
    const date = new Date(isoStr);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">กำหนดอัตราค่าน้ำมัน (Fuel Rates)</h1>
        <p className="text-xs text-slate-500 mt-0.5">ตั้งค่าอัตราจ่ายชดเชยค่าน้ำมันต่อกิโลเมตรสำหรับการคำนวณเบี้ยเลี้ยงช่างเทคนิค</p>
      </div>
      
      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Set Rate Form */}
      <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4">
        <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Fuel className="w-4 h-4 text-blue-600" />
          <span>กำหนดเรทค่าน้ำมันปัจจุบัน</span>
        </h2>
        
        <form className="flex flex-col sm:flex-row sm:items-end gap-4" onSubmit={(e) => { e.preventDefault(); handleUpdateRate(); }}>
          <div className="flex-1 max-w-xs">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              อัตราจ่ายชดเชย (บาท / กิโลเมตร) *
            </label>
            <div className="relative">
              <input 
                type="number" 
                step="0.25" 
                min="0"
                required
                value={currentRate}
                onChange={(e) => setCurrentRate(e.target.value)}
                className="w-full pl-3 pr-14 py-2.5 rounded-lg border border-slate-300 text-sm font-mono font-bold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" 
                disabled={isLoading}
              />
              <span className="absolute right-3 top-3 text-xs text-slate-400 font-medium">
                บ./กม.
              </span>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors disabled:bg-blue-300"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>บันทึกอัตราใหม่</span>
          </button>
        </form>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden space-y-0">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">ประวัติการกำหนดเรทค่าน้ำมัน</h2>
          <span className="text-xs font-mono font-semibold bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
            {rateHistory.length} รายการ
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase bg-slate-50/70">
                <th className="py-3 px-4">วันที่มีผลบังคับใช้</th>
                <th className="py-3 px-4">อัตราค่าน้ำมัน</th>
                <th className="py-3 px-4">บันทึกโดย</th>
                <th className="py-3 px-4 text-right">วันที่บันทึก</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && rateHistory.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <span>กำลังโหลดประวัติ...</span>
                  </td>
                </tr>
              ) : rateHistory.length > 0 ? (
                rateHistory.map((history, index) => (
                  <tr key={index} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {formatDate(history.effective_from || history.effective_date || history.created_at)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      {Number(history.rate_per_km || history.rate || 0).toFixed(2)} บาท/กม.
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {history.created_by || history.admin || 'ADMIN'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-right">
                      {history.created_at ? new Date(history.created_at).toLocaleDateString('th-TH') : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-400">
                    <Fuel className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-sm text-slate-600">ยังไม่มีประวัติการกำหนดเรท</p>
                    <p className="text-xs text-slate-400 mt-1">เรทค่าน้ำมันที่คุณบันทึกจะแสดงประวัติที่นี่</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
