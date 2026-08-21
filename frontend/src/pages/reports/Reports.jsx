import React, { useState, useEffect } from 'react';
import { Download, Calendar, BarChart2, Loader2, Award, TrendingUp, RotateCcw, CheckCircle2 } from 'lucide-react';
import { apiCall } from '@/core/api';

export default function Reports() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiCall('ticket.list');
      const tickets = Array.isArray(res) ? res : (Array.isArray(res?.tickets) ? res.tickets : (Array.isArray(res?.data) ? res.data : []));
      
      const teamsMap = {};
      tickets.forEach(t => {
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
    link.setAttribute('download', `qc_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalCompletedAll = reportData.reduce((acc, curr) => acc + curr.completed, 0);
  const avgFixRate = reportData.length > 0 ? (reportData.reduce((acc, curr) => acc + curr.firstTimeFixRate, 0) / reportData.length).toFixed(1) : '-';
  const ratedTeams = reportData.filter(d => d.avgRating !== '-');
  const overallAvgRating = ratedTeams.length > 0 ? (ratedTeams.reduce((acc, curr) => acc + Number(curr.avgRating), 0) / ratedTeams.length).toFixed(1) : '-';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">รายงานสรุปและสถิติภาพรวม</h1>
          <p className="text-xs text-slate-500 mt-0.5">ดัชนีชี้วัดประสิทธิภาพงานซ่อมบำรุง คุณภาพงาน และสถิติรายทีมช่าง</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleDownloadCSV}
            disabled={reportData.length === 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>ส่งออกรายงาน CSV</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">งานที่ปิดสำเร็จทั้งหมด</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800 font-mono">{totalCompletedAll}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">อัตราแก้จบในครั้งแรกเฉลี่ย</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800 font-mono">
            {avgFixRate !== '-' ? `${avgFixRate}%` : '-'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">คะแนนความพึงพอใจเฉลี่ย</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800 font-mono">
            {overallAvgRating !== '-' ? `${overallAvgRating} / 5` : '-'}
          </p>
        </div>
      </div>

      {/* Team Performance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">ประสิทธิภาพการทำงานรายทีมช่าง</h2>
            <p className="text-xs text-slate-400 mt-0.5">วิเคราะห์จำนวนงานที่สำเร็จ อัตรา First-Time-Fix และอัตราตีกลับแก้ไข</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase bg-slate-50/70">
                <th className="py-3 px-4">ทีมช่าง</th>
                <th className="py-3 px-4">จำนวนงานเสร็จสิ้น</th>
                <th className="py-3 px-4">อัตราแก้จบครั้งแรก (First-Time Fix)</th>
                <th className="py-3 px-4">อัตราตีกลับ (Rework Rate)</th>
                <th className="py-3 px-4 text-right">คะแนนประเมินเฉลี่ย</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <span>กำลังโหลดข้อมูลสถิติ...</span>
                  </td>
                </tr>
              ) : reportData.length > 0 ? (
                reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{row.team}</td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{row.completed} งาน</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-emerald-700">{row.firstTimeFixRate.toFixed(1)}%</span>
                        <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${row.firstTimeFixRate}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-semibold ${row.reworkRate > 20 ? 'text-rose-600' : 'text-slate-600'}`}>
                        {row.reworkRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                      {row.avgRating !== '-' ? `${row.avgRating} / 5` : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-16 text-center text-slate-400">
                    <BarChart2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-sm text-slate-600">ยังไม่มีข้อมูลสถิติเพียงพอ</p>
                    <p className="text-xs text-slate-400 mt-1">สถิติจะถูกคำนวณอัตโนมัติเมื่อมีการปิดใบงานในระบบ</p>
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
