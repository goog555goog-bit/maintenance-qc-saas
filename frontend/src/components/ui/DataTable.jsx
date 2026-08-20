import React from 'react';

export default function DataTable({ columns, data }) {
  if (!data || data.length === 0) {
    return <div className="p-8 text-center text-text-muted border border-border rounded-lg bg-surface">ไม่มีข้อมูล</div>;
  }
  return (
    <div className="overflow-x-auto border border-border rounded-lg bg-surface">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-surface-muted">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-surface divide-y divide-border">
          {data.map((row, i) => (
            <tr key={i}>
              {columns.map((col, j) => (
                <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-text">
                  {col.cell ? col.cell(row) : row[col.accessorKey]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
