import React from 'react';

export default function KanbanBoard({ columns }) {
  return (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {columns.map((col, i) => (
        <div key={i} className="flex-shrink-0 w-80 bg-surface-muted rounded-lg p-4 border border-border">
          <h3 className="font-medium text-text mb-4">{col.title} ({col.items.length})</h3>
          <div className="space-y-3">
            {col.items.map((item, j) => (
              <div key={j} className="bg-surface p-3 rounded shadow-sm border border-border">
                {item.content}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
