import React, { useState, useEffect } from 'react';
import { Download, Calendar, BarChart2, Loader2 } from 'lucide-react';
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
      const tickets = res.tickets || res.data || [];
      
      const teamsMap = {};
      tickets.forEach(t => {
        const teamName = t.team || 'ไม่มีทีม';
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
        
        if (t.status === 'CLOSED' || t.status === 'ARCHIVED') {
          teamsMap[teamName].totalCompleted += 1;
          
          if (t.reworkCount > 0 || t.isRework) {
            teamsMap[teamName].rework += 1;
          } else {
            teamsMap[teamName].firstTimeFix += 1;
          }
          
          if (t.rating) {
            teamsMap[teamName].qualitySum += Number(t.rating);
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

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">รายงานและสถิติภาพรวม</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex items-center gap-2 border border-slate-300 bg-white px-3 py-2 rounded-md hover:bg-slate-50 text-sm font-medium text-slate-700">
            <Calendar className="h-4 w-4" /> 30 วันย้อนหลัง
          </button>
          <button className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium flex-1 sm:flex-none" disabled={reportData.length === 0}>
            <Download className="h-4 w-4" /> ดาวน์โหลด CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 min-h-[350px] flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-4">สถานะใบงานทั้งหมด</h2>
          {loading ? (
            <div className="flex flex-col items-center justify-center flex-1 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-slate-300 mb-2" />
            </div>
          ) : reportData.length > 0 ? (
             <div className="flex-1 flex items-end justify-around gap-2 pb-6 border-b border-slate-200 relative">
                {/* Chart placeholder */}
             </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-slate-500">
              <BarChart2 className="h-12 w-12 text-slate-200 mb-3" />
              <p className="text-sm font-medium">ไม่มีข้อมูลสถิติ</p>
              <p className="text-xs text-slate-400 mt-1">ยังไม่มีข้อมูลเพียงพอสำหรับสร้างกราฟ</p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 min-h-[350px] flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-4">คะแนนประเมินคุณภาพเฉลี่ย</h2>
          {loading ? (
             <div className="flex flex-col items-center justify-center flex-1 text-slate-500">
               <Loader2 className="h-8 w-8 animate-spin text-slate-300 mb-2" />
             </div>
          ) : reportData.length > 0 ? (
            <div className="flex flex-col items-center justify-center flex-1">
              <span className="text-5xl font-bold text-blue-600">
                {reportData.reduce((acc, curr) => acc + (curr.avgRating !== '-' ? Number(curr.avgRating) : 0), 0) / reportData.filter(d => d.avgRating !== '-').length || '-'}
              </span>
              <p className="text-sm text-slate-500 mt-2">คะแนนเฉลี่ยจากทุกทีม</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-slate-500">
              <span className="text-5xl font-bold text-slate-300">-</span>
              <p className="text-sm text-slate-400 mt-2">ยังไม่มีการประเมินคุณภาพ</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 min-h-[300px] flex flex-col">
        <h2 className="text-lg font-bold text-slate-800 mb-4">ประสิทธิภาพการทำงานรายทีม</h2>
        <div className="overflow-x-auto flex-1 flex flex-col">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-sm font-semibold text-slate-600">
                <th className="pb-3">ทีมช่าง</th>
                <th className="pb-3">จำนวนงานที่เสร็จสิ้น</th>
                <th className="pb-3">อัตราการแก้ไขจบในครั้งแรก (First-time Fix Rate)</th>
                <th className="pb-3">อัตรางานตีกลับ (Rework Rate)</th>
                <th className="pb-3">คะแนนประเมินเฉลี่ย</th>
              </tr>
            </thead>
            {!loading && reportData.length > 0 && (
              <tbody className="divide-y divide-slate-100 text-sm">
                {reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 text-slate-800 font-medium">{row.team}</td>
                    <td className="py-3 text-slate-600">{row.completed}</td>
                    <td className="py-3 text-slate-600">{row.firstTimeFixRate.toFixed(1)}%</td>
                    <td className="py-3 text-slate-600">{row.reworkRate.toFixed(1)}%</td>
                    <td className="py-3 text-slate-600">{row.avgRating}</td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
          {loading && (
            <div className="flex flex-col items-center justify-center flex-1 py-12 text-slate-500">
               <Loader2 className="h-8 w-8 animate-spin text-slate-300 mb-2" />
            </div>
          )}
          {!loading && reportData.length === 0 && (
             <div className="flex flex-col items-center justify-center flex-1 py-12 text-slate-500">
                <p className="text-sm font-medium">ยังไม่มีข้อมูลประสิทธิภาพการทำงาน</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

