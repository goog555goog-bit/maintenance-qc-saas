import React, { useState, useEffect, useMemo } from 'react';
import { 
  Download, 
  Calendar, 
  BarChart2, 
  Loader2, 
  Award, 
  TrendingUp, 
  RotateCcw, 
  CheckCircle2, 
  FileText, 
  Printer, 
  Search, 
  Building2, 
  ArrowRight,
  Filter,
  Eye,
  Star
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiCall } from '@/core/api';
import StatusBadge from '@/components/ui/StatusBadge';

export default function Reports() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('kpi'); // 'kpi' | 'service_reports'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiCall('ticket.list');
      const ticketsList = Array.isArray(res) ? res : (Array.isArray(res?.tickets) ? res.tickets : (Array.isArray(res?.data) ? res.data : []));
      setTickets(ticketsList);
      
      const teamsMap = {};
      ticketsList.forEach(t => {
        const teamName = t.team_name || t.team || 'ทีมส่วนกลาง';
        if (!teamsMap[teamName]) {
          teamsMap[teamName] = {
            team: teamName,
            totalCompleted: 0,
            rework: 0,
            firstTimeFix: 0,
            qualitySum: 0,
            qualityCount: 0
          };
        }
        
        if (t.status === 'CLOSED' || t.status === 'ARCHIVED' || t.status === 'COMPLETED') {
          teamsMap[teamName].totalCompleted += 1;
          
          if (t.rework_count > 0 || t.status === 'REWORK' || t.status === 'REJECTED_REWORK') {
            teamsMap[teamName].rework += 1;
          } else {
            teamsMap[teamName].firstTimeFix += 1;
          }
          
          if (t.satisfaction && t.satisfaction.score) {
            teamsMap[teamName].qualitySum += Number(t.satisfaction.score);
            teamsMap[teamName].qualityCount += 1;
          }
        }
      });

      const processedData = Object.values(teamsMap).filter(t => t.totalCompleted > 0).map(t => {
        return {
          team: t.team,
          completed: t.totalCompleted,
          firstTimeFixRate: (t.firstTimeFix / t.totalCompleted) * 100,
          reworkRate: (t.rework / t.totalCompleted) * 100,
          avgRating: t.qualityCount > 0 ? (t.qualitySum / t.qualityCount).toFixed(1) : '-'
        };
      });

      setReportData(processedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (reportData.length === 0) return;
    const headers = ['ทีมช่าง', 'จำนวนงานที่เสร็จสิ้น', 'อัตราแก้จบครั้งแรก (%)', 'อัตรางานตีกลับ (%)', 'คะแนนประเมินเฉลี่ย'];
    const rows = reportData.map(r => [
      `"${r.team}"`,
      r.completed,
      r.firstTimeFixRate.toFixed(1),
      r.reworkRate.toFixed(1),
      r.avgRating
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `qc_kpi_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalCompletedAll = reportData.reduce((acc, curr) => acc + curr.completed, 0);
  const avgFixRate = reportData.length > 0 ? (reportData.reduce((acc, curr) => acc + curr.firstTimeFixRate, 0) / reportData.length).toFixed(1) : '-';
  const ratedTeams = reportData.filter(d => d.avgRating !== '-');
  const overallAvgRating = ratedTeams.length > 0 ? (ratedTeams.reduce((acc, curr) => acc + Number(curr.avgRating), 0) / ratedTeams.length).toFixed(1) : '-';

  // Filtered tickets for Service Reports tab
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const idMatch = String(t.ticket_id || '').toLowerCase().includes(q);
        const branchMatch = String(t.branch_name || t.branch_id || '').toLowerCase().includes(q);
        const teamMatch = String(t.team_name || t.team || '').toLowerCase().includes(q);
        const catMatch = String(t.category_name || t.work_type_name || '').toLowerCase().includes(q);
        return idMatch || branchMatch || teamMatch || catMatch;
      }
      return true;
    });
  }, [tickets, statusFilter, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">รายงานสรุปและใบรายงานผลงาน (Reports Hub)</h1>
          <p className="text-xs text-slate-500 mt-0.5">ดัชนีชี้วัดประสิทธิภาพงานซ่อมบำรุง และคลังพิมพ์ใบรายงาน Service Report</p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'kpi' && (
            <button 
              onClick={handleDownloadCSV}
              disabled={reportData.length === 0}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 shadow-2xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>ดาวน์โหลดรายงาน KPI (CSV)</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveTab('kpi')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'kpi' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>สถิติ KPI ประสิทธิภาพทีมช่าง</span>
        </button>
        <button
          onClick={() => setActiveTab('service_reports')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'service_reports' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>คลังใบรายงาน Service Report (PDF)</span>
          <span className="bg-blue-50 text-blue-600 px-1.5 py-0.2 rounded-full text-[10px] font-bold border border-blue-200">
            {tickets.length}
          </span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
        </div>
      ) : activeTab === 'kpi' ? (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
              <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">งานที่ปิดสมบูรณ์ทั้งหมด</p>
                <p className="text-2xl font-bold text-slate-800 font-mono">{totalCompletedAll} <span className="text-sm font-normal text-slate-400">ใบงาน</span></p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
              <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">อัตราการซ่อมจบในครั้งแรก (เฉลี่ย)</p>
                <p className="text-2xl font-bold text-emerald-600 font-mono">{avgFixRate}%</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
              <div className="p-3.5 bg-amber-50 text-amber-500 rounded-2xl">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">คะแนนความพึงพอใจเฉลี่ย</p>
                <p className="text-2xl font-bold text-amber-600 font-mono">{overallAvgRating} <span className="text-sm font-normal text-slate-400">/ 5.0</span></p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800">ผลการประเมินคุณภาพรายทีมช่าง (Quality Scorecard)</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">ทีมช่าง</th>
                    <th className="py-3 px-4 text-center">งานที่เสร็จสิ้น</th>
                    <th className="py-3 px-4 text-center">อัตราแก้จบครั้งแรก (FTFR)</th>
                    <th className="py-3 px-4 text-center">อัตรางานตีกลับ (Rework)</th>
                    <th className="py-3 px-4 text-center">คะแนนประเมินคุณภาพ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        ยังไม่มีข้อมูลงานที่ปิดสมบูรณ์สำหรับการประเมิน
                      </td>
                    </tr>
                  ) : (
                    reportData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {row.team}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-700">
                          {row.completed}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            {row.firstTimeFixRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`font-mono font-semibold px-2 py-0.5 rounded ${
                            row.reworkRate > 10 ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'text-slate-500'
                          }`}>
                            {row.reworkRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 inline-flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{row.avgRating}</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* TAB 2: คลังใบรายงาน Service Report (PDF)                   */
        /* ======================================================== */
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="ค้นหารหัสใบงาน, สาขา, หมวดหมู่งาน, หรือทีมช่าง..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 outline-none focus:border-blue-500 font-medium text-slate-700"
              >
                <option value="all">สถานะ: ทั้งหมด ({tickets.length})</option>
                <option value="CLOSED">ปิดงานสมบูรณ์ (CLOSED)</option>
                <option value="COMPLETED_BY_TECH">ช่างส่งงานแล้ว (COMPLETED_BY_TECH)</option>
                <option value="IN_PROGRESS">กำลังดำเนินงาน (IN_PROGRESS)</option>
                <option value="ASSIGNED">มอบหมายแล้ว (ASSIGNED)</option>
              </select>
            </div>
          </div>

          {/* Service Reports Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">
                รายการใบรายงานพร้อมพิมพ์ ({filteredTickets.length} ฉบับ)
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">รหัสใบงาน / เอกสาร</th>
                    <th className="py-3 px-4">สาขา</th>
                    <th className="py-3 px-4">หมวดหมู่งาน</th>
                    <th className="py-3 px-4">ทีมช่าง</th>
                    <th className="py-3 px-4">สถานะ</th>
                    <th className="py-3 px-4 text-right">การเปิดเอกสาร</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTickets.length > 0 ? (
                    filteredTickets.map(t => (
                      <tr key={t.ticket_id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                          <Link to={`/tickets/${t.ticket_id}/report`} className="hover:underline flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            <span>{t.ticket_id}</span>
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          {t.branch_name || ('สาขา ' + t.branch_id)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {t.category_name || t.work_type_name || 'งานซ่อมทั่วไป'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          {t.team_name || t.team || '-'}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={t.status} size="xs" />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/tickets/${t.ticket_id}/report`}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                            >
                              <Printer className="w-3 h-3 text-blue-400" />
                              <span>เปิด Service Report</span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        ไม่พบเอกสารใบรายงานที่ตรงตามเงื่อนไข
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
