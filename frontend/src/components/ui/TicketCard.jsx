import React from 'react';
import StatusBadge from './StatusBadge';
import { MapPin, Clock } from 'lucide-react';

export default function TicketCard({ ticket }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-text">{ticket.title}</h4>
        <StatusBadge status={ticket.status} />
      </div>
      <p className="text-sm text-text-muted mb-4 line-clamp-2">{ticket.description}</p>
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span className="flex items-center"><MapPin size={14} className="mr-1" /> {ticket.location}</span>
        <span className="flex items-center"><Clock size={14} className="mr-1" /> {ticket.updatedAt}</span>
      </div>
    </div>
  );
}
