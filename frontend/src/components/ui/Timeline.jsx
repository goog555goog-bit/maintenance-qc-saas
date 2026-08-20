import React from 'react';

export default function Timeline({ events }) {
  return (
    <div className="space-y-4">
      {events.map((evt, i) => (
        <div key={i} className="flex items-start">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center border border-primary-500 z-10">
            <div className="w-2 h-2 rounded-full bg-primary-500"></div>
          </div>
          <div className="ml-4 flex-1">
            <h4 className="text-sm font-semibold text-text">{evt.title}</h4>
            <p className="text-xs text-text-muted">{evt.time}</p>
            <p className="text-sm text-text mt-1">{evt.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
