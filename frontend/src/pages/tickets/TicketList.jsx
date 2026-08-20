import React, { useState } from 'react';
import { Filter, Search, LayoutGrid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TicketList({ role }) {
  const [view, setView] = useState('table');
  const navigate = useNavigate();

  const tickets = [
    { id: 'TCK-001', branch: 'Branch A', type: 'HVAC', status: 'IN_PROGRESS', team: 'Team Alpha', date: '2023-10-01', urgency: 'High', rejectCount: 0 },
    { id: 'TCK-002', branch: 'Branch B', type: 'Plumbing', status: 'WAITING_REVIEW', team: 'Team Beta', date: '2023-10-02', urgency: 'Normal', rejectCount: 1 },
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Tickets</h1>
        {role === 'manager' && (
          <button onClick={() => navigate('/tickets/new')} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Create Ticket
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex gap-2 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search tickets..." className="pl-9 w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <button className="flex items-center gap-2 border border-slate-300 px-3 py-2 rounded-md hover:bg-slate-50">
            <Filter className="h-4 w-4" /> <span className="hidden sm:inline text-sm">Filters</span>
          </button>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-md">
          <button onClick={() => setView('table')} className={`p-1.5 rounded ${view === 'table' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>
            <List className="h-4 w-4" />
          </button>
          <button onClick={() => setView('kanban')} className={`p-1.5 rounded ${view === 'kanban' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {view === 'table' ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-3 text-sm font-semibold text-slate-600">ID</th>
                <th className="p-3 text-sm font-semibold text-slate-600">Branch</th>
                <th className="p-3 text-sm font-semibold text-slate-600">Work Type</th>
                <th className="p-3 text-sm font-semibold text-slate-600">Status</th>
                <th className="p-3 text-sm font-semibold text-slate-600">Team</th>
                <th className="p-3 text-sm font-semibold text-slate-600">Urgency</th>
                <th className="p-3 text-sm font-semibold text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 text-sm font-mono text-slate-800">{t.id}</td>
                  <td className="p-3 text-sm text-slate-600">{t.branch}</td>
                  <td className="p-3 text-sm text-slate-600">{t.type}</td>
                  <td className="p-3 text-sm">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">{t.status}</span>
                  </td>
                  <td className="p-3 text-sm text-slate-600">{t.team}</td>
                  <td className="p-3 text-sm text-slate-600">{t.urgency}</td>
                  <td className="p-3">
                    <button onClick={() => navigate(`/tickets/${t.id}`)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {['WAITING_ASSIGNMENT', 'IN_PROGRESS', 'WAITING_REVIEW', 'REWORK'].map(col => (
            <div key={col} className="w-72 flex-shrink-0 bg-slate-100 rounded-lg p-3">
              <h3 className="font-semibold text-slate-700 text-sm mb-3 px-1">{col.replace('_', ' ')}</h3>
              <div className="space-y-3">
                {tickets.filter(t => t.status === col).map(t => (
                  <div key={t.id} onClick={() => navigate(`/tickets/${t.id}`)} className="bg-white p-3 rounded shadow-sm border border-slate-200 cursor-pointer hover:border-blue-300">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-xs text-slate-500">{t.id}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${t.urgency === 'High' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>{t.urgency}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-800 mb-1">{t.type}</p>
                    <p className="text-xs text-slate-500">{t.branch}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
