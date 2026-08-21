import React, { useState } from 'react';

const TechDashboard = () => {
  const [filter, setFilter] = useState('all');

  return (
    <div className="tech-dashboard p-8 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <h1 className="text-3xl font-semibold mb-8 text-slate-800 tracking-tight">แผงควบคุมช่างเทคนิคภาคสนาม</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-slate-500 mb-2">งานที่ได้รับมอบหมาย</p>
          <p className="text-3xl font-semibold text-slate-800">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-slate-500 mb-2">รายการต้องแก้ไขด่วน (Rework)</p>
          <p className="text-3xl font-semibold text-slate-800">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-slate-500 mb-2">งานเสร็จสิ้นวันนี้</p>
          <p className="text-3xl font-semibold text-slate-800">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-slate-500 mb-2">ระยะทางสะสมวันนี้</p>
          <p className="text-3xl font-semibold text-slate-800">0 กม.</p>
        </div>
      </div>

      <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
        <button 
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${filter === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
          onClick={() => setFilter('all')}
        >
          งานทั้งหมด
        </button>
        <button 
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${filter === 'urgent' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
          onClick={() => setFilter('urgent')}
        >
          ต้องแก้ไขด่วน
        </button>
        <button 
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${filter === 'queue' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
          onClick={() => setFilter('queue')}
        >
          อยู่ในคิว
        </button>
      </div>

      <div className="ticket-cards space-y-4">
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center">
          <p className="text-slate-500">ยังไม่มีรายการใบงานในระบบ</p>
        </div>
      </div>
    </div>
  );
};

export default TechDashboard;
