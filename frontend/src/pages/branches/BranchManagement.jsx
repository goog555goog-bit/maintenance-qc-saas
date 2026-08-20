import React from 'react';
import { Building2, Search } from 'lucide-react';

export default function BranchManagement() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Branch Management</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium">Add Branch</button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search branches..." className="pl-9 w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-sm font-semibold text-slate-600">Branch Name</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Manager</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Location</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Active Tickets</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded"><Building2 className="h-4 w-4 text-blue-600" /></div>
                  <span className="font-medium text-slate-800">Central Plaza</span>
                </div>
              </td>
              <td className="p-4 text-sm text-slate-600">Somsri M.</td>
              <td className="p-4 text-sm text-slate-500">Bangkok</td>
              <td className="p-4 text-sm font-bold text-amber-600">5</td>
              <td className="p-4">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View</button>
              </td>
            </tr>
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2 rounded"><Building2 className="h-4 w-4 text-slate-500" /></div>
                  <span className="font-medium text-slate-800">North Point</span>
                </div>
              </td>
              <td className="p-4 text-sm text-slate-600">Mana D.</td>
              <td className="p-4 text-sm text-slate-500">Chiang Mai</td>
              <td className="p-4 text-sm font-bold text-slate-600">0</td>
              <td className="p-4">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
