import React from 'react';
import { Search, Filter, Archive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ArchiveList() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Archive className="h-6 w-6 text-slate-500" /> Historical Archive
      </h1>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search by ID, Branch, Team..." className="pl-9 w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <button className="flex items-center gap-2 border border-slate-300 px-3 py-2 rounded-md hover:bg-slate-50 bg-white text-sm font-medium">
          <Filter className="h-4 w-4" /> Filters
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-3 text-sm font-semibold text-slate-600">ID</th>
              <th className="p-3 text-sm font-semibold text-slate-600">Branch</th>
              <th className="p-3 text-sm font-semibold text-slate-600">Work Type</th>
              <th className="p-3 text-sm font-semibold text-slate-600">Closed Date</th>
              <th className="p-3 text-sm font-semibold text-slate-600">Team</th>
              <th className="p-3 text-sm font-semibold text-slate-600">Status</th>
              <th className="p-3 text-sm font-semibold text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="p-3 text-sm font-mono text-slate-800">TCK-2023-001</td>
              <td className="p-3 text-sm text-slate-600">Branch A</td>
              <td className="p-3 text-sm text-slate-600">HVAC</td>
              <td className="p-3 text-sm text-slate-600">Sep 15, 2023</td>
              <td className="p-3 text-sm text-slate-600">Team Alpha</td>
              <td className="p-3 text-sm">
                <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs font-bold">CLOSED</span>
              </td>
              <td className="p-3">
                <button onClick={() => navigate('/tickets/TCK-2023-001')} className="text-blue-600 hover:text-blue-800 text-sm font-medium">View Only</button>
              </td>
            </tr>
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="p-3 text-sm font-mono text-slate-800">TCK-2023-002</td>
              <td className="p-3 text-sm text-slate-600">Branch B</td>
              <td className="p-3 text-sm text-slate-600">Plumbing</td>
              <td className="p-3 text-sm text-slate-600">Sep 10, 2023</td>
              <td className="p-3 text-sm text-slate-600">Team Beta</td>
              <td className="p-3 text-sm">
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">CANCELLED</span>
              </td>
              <td className="p-3">
                <button onClick={() => navigate('/tickets/TCK-2023-002')} className="text-blue-600 hover:text-blue-800 text-sm font-medium">View Only</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
