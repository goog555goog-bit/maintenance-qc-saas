import React, { useState } from 'react';
import { MapPin, ArrowUpRight, AlertCircle, Clock, Check, Filter, Layers, Navigation } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import StatCard from '@/components/ui/StatCard';

export default function TechDashboard() {
  const [filter, setFilter] = useState('ALL');

  const tickets = [
    {
      id: 'TCK-2026-030',
      title: 'Water Leakage in Main Hall',
      workType: 'Plumbing & Drainage',
      branch: 'Central Plaza Branch',
      branchCode: 'BKK-001',
      distance: '1.8 km away',
      status: 'REWORK',
      urgency: 'HIGH',
      assignedAt: 'Today, 08:30',
      reworkRound: 2,
      reworkReason: 'Pipe joint seal in ceiling still exhibits micro-seepage after pressure test. Needs re-tightening.',
      itemsCount: 2
    },
    {
      id: 'TCK-2026-055',
      title: 'Routine Quarterly AC Maintenance',
      workType: 'HVAC Systems',
      branch: 'North Point Complex',
      branchCode: 'BKK-004',
      distance: '5.2 km away',
      status: 'ASSIGNED',
      urgency: 'NORMAL',
      assignedAt: 'Today, 10:15',
      itemsCount: 4
    },
    {
      id: 'TCK-2026-058',
      title: 'Circuit Breaker Tripping on Floor 2',
      workType: 'Electrical Systems',
      branch: 'Riverside Depot',
      branchCode: 'BKK-002',
      distance: '8.4 km away',
      status: 'CHECKED_IN',
      urgency: 'HIGH',
      assignedAt: 'Today, 11:00',
      itemsCount: 1
    }
  ];

  const filteredTickets = filter === 'ALL'
    ? tickets
    : filter === 'REWORK'
      ? tickets.filter(t => t.status === 'REWORK')
      : tickets.filter(t => t.status === 'ASSIGNED' || t.status === 'CHECKED_IN');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Technician Operations Console</h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
              Team Alpha
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Active shift: Morning 08:00 - 17:00 | GPS Tracking Active
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors">
            <Navigation className="w-3.5 h-3.5 text-slate-500" />
            <span>Route Map</span>
          </button>
        </div>
      </div>

      {/* Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="Assigned Tasks"
          value="3"
          context="2 Pending check-in"
          indicatorColor="bg-blue-500"
        />
        <StatCard
          title="Rework Flagged"
          value="1"
          context="Requires immediate fix"
          variant="danger"
          indicatorColor="bg-rose-500 ring-4 ring-rose-500/10"
        />
        <StatCard
          title="Completed Today"
          value="12"
          context="100% QA Passed"
          variant="success"
          indicatorColor="bg-emerald-500"
        />
        <StatCard
          title="Logged Distance"
          value="24.6 km"
          context="Rate: 8.50 THB/km"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-1 p-0.5 bg-slate-100/80 rounded-md border border-slate-200/60 text-xs">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 font-medium rounded transition-all ${filter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            All Assigned ({tickets.length})
          </button>
          <button
            onClick={() => setFilter('REWORK')}
            className={`px-3 py-1 font-medium rounded transition-all flex items-center gap-1.5 ${filter === 'REWORK' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Rework Needed (1)
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-3 py-1 font-medium rounded transition-all ${filter === 'ACTIVE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            In Queue (2)
          </button>
        </div>
        <span className="text-xs text-slate-500 hidden sm:inline">
          Showing {filteredTickets.length} tasks
        </span>
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {filteredTickets.map((ticket) => {
          const isRework = ticket.status === 'REWORK';
          const isCheckedIn = ticket.status === 'CHECKED_IN';

          return (
            <div
              key={ticket.id}
              className={`bg-white rounded-md border transition-all duration-150 ${
                isRework
                  ? 'border-rose-300 ring-1 ring-rose-300/30'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {ticket.id}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {ticket.workType}
                    </span>
                    {ticket.urgency === 'HIGH' && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                        Urgent
                      </span>
                    )}
                  </div>
                  <StatusBadge status={ticket.status} />
                </div>

                {/* Title and Branch */}
                <h3 className="text-base font-semibold text-slate-900 mb-1">
                  {ticket.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <strong className="text-slate-700 font-medium">{ticket.branch}</strong> ({ticket.branchCode})
                  </span>
                  <span>•</span>
                  <span>{ticket.distance}</span>
                  <span>•</span>
                  <span>{ticket.itemsCount} inspection items</span>
                </div>

                {/* Rework Reason Box */}
                {isRework && (
                  <div className="mt-3 p-3 bg-rose-50/60 rounded border border-rose-200/80 text-xs">
                    <div className="flex items-center gap-1.5 text-rose-900 font-semibold mb-1">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Rejection Notice (Round {ticket.reworkRound})</span>
                    </div>
                    <p className="text-rose-800 leading-relaxed pl-5">
                      {ticket.reworkReason}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="px-4 py-2.5 bg-slate-50/70 border-t border-slate-100 rounded-b-md flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500">
                  Assigned: {ticket.assignedAt}
                </div>

                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors">
                    View Details
                  </button>

                  {isRework ? (
                    <button className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-sm">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Submit Rework</span>
                    </button>
                  ) : isCheckedIn ? (
                    <button className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm">
                      <Check className="w-3.5 h-3.5" />
                      <span>Submit Work Session</span>
                    </button>
                  ) : (
                    <button className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>GPS Check-in</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

