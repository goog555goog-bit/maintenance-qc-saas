import React from 'react';

export default function ReviewHistory({ reviews }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden bg-surface">
      <div className="bg-surface-muted px-4 py-2 border-b border-border font-medium">ประวัติการตรวจรับงาน</div>
      <div className="p-4 space-y-4">
        {reviews.map((rev, i) => (
          <div key={i} className="border-l-2 border-primary-500 pl-4">
            <div className="flex justify-between">
              <span className="font-medium text-sm text-text">รอบที่ {rev.round}</span>
              <span className="text-xs text-text-muted">{rev.date}</span>
            </div>
            <p className="text-sm mt-1 text-text">{rev.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
