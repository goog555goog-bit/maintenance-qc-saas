import React from 'react';

const statusConfig = {
  // Ticket Statuses
  'NEW': { label: 'แจ้งซ่อมใหม่', dot: 'bg-sky-500', bg: 'bg-sky-50 text-sky-700 border-sky-200' },
  'SUBMITTED': { label: 'แจ้งซ่อมใหม่', dot: 'bg-sky-500', bg: 'bg-sky-50 text-sky-700 border-sky-200' },
  'WAITING_ASSIGNMENT': { label: 'รอจัดสรรทีมช่าง', dot: 'bg-amber-500', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  'ASSIGNED': { label: 'มอบหมายทีมช่างแล้ว', dot: 'bg-purple-500', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  'CHECKED_IN': { label: 'ช่างถึงพื้นที่แล้ว', dot: 'bg-indigo-500', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  'IN_PROGRESS': { label: 'กำลังดำเนินการซ่อม', dot: 'bg-blue-600 animate-pulse', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  'COMPLETED_BY_TECH': { label: 'ช่างส่งงาน/รอตรวจรับ', dot: 'bg-teal-500', bg: 'bg-teal-50 text-teal-700 border-teal-200' },
  'WAITING_REVIEW': { label: 'รอผู้จัดการตรวจรับ', dot: 'bg-teal-500', bg: 'bg-teal-50 text-teal-700 border-teal-200' },
  'REWORK': { label: 'ส่งกลับแก้ไข (Rework)', dot: 'bg-rose-500', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  'REJECTED_REWORK': { label: 'ส่งกลับแก้ไข (Rework)', dot: 'bg-rose-500', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  'COMPLETED': { label: 'ตรวจรับผ่านแล้ว', dot: 'bg-emerald-500', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'CLOSED': { label: 'ปิดงานสมบูรณ์', dot: 'bg-emerald-500', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'ARCHIVED': { label: 'เก็บเข้าคลังประวัติ', dot: 'bg-slate-400', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
  'CANCELLED': { label: 'ยกเลิกใบงาน', dot: 'bg-slate-400', bg: 'bg-slate-100 text-slate-600 border-slate-200' },

  // General & Approval Statuses
  'ACTIVE': { label: 'เปิดใช้งาน', dot: 'bg-emerald-500', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'INACTIVE': { label: 'ปิดใช้งาน', dot: 'bg-slate-400', bg: 'bg-slate-100 text-slate-600 border-slate-200' },
  'APPROVED': { label: 'อนุมัติแล้ว', dot: 'bg-emerald-500', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'REJECTED': { label: 'ไม่อนุมัติ', dot: 'bg-rose-500', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  'PENDING': { label: 'รอพิจารณา', dot: 'bg-amber-500', bg: 'bg-amber-50 text-amber-700 border-amber-200' }
};

export const getStatusLabel = (status) => {
  return statusConfig[status]?.label || status || 'ไม่ทราบสถานะ';
};

export default function StatusBadge({ status, size = 'sm' }) {
  const config = statusConfig[status] || {
    label: status || 'ไม่ทราบสถานะ',
    dot: 'bg-slate-400',
    bg: 'bg-slate-50 text-slate-700 border-slate-200'
  };

  const sizeClasses = size === 'xs'
    ? 'text-[10px] py-0.5 px-2 gap-1 rounded-full'
    : 'text-xs py-1 px-2.5 gap-1.5 rounded-full';

  return (
    <span className={`inline-flex items-center font-semibold border ${config.bg} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      <span className="whitespace-nowrap">{config.label}</span>
    </span>
  );
}
