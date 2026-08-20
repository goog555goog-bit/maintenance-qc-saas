import React from 'react';
import { Download, Calendar } from 'lucide-react';

export default function Reports() {
  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Operational Reports</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex items-center gap-2 border border-slate-300 bg-white px-3 py-2 rounded-md hover:bg-slate-50 text-sm font-medium text-slate-700">
            <Calendar className="h-4 w-4" /> Last 30 Days
          </button>
          <button className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium flex-1 sm:flex-none">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Tickets by Status</h2>
          <div className="h-64 flex items-end justify-around gap-2 pb-6 border-b border-slate-200 relative">
            {/* Fake Chart */}
            <div className="w-16 bg-slate-200 rounded-t h-[20%] relative group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100">10</span></div>
            <div className="w-16 bg-blue-400 rounded-t h-[60%] relative group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100">30</span></div>
            <div className="w-16 bg-amber-400 rounded-t h-[40%] relative group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100">20</span></div>
            <div className="w-16 bg-green-500 rounded-t h-[80%] relative group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100">40</span></div>
            <div className="w-16 bg-red-400 rounded-t h-[10%] relative group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100">5</span></div>
          </div>
          <div className="flex justify-around mt-4 text-xs font-medium text-slate-500">
            <span>New</span>
            <span>Prog.</span>
            <span>Rev.</span>
            <span>Done</span>
            <span>Rej.</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Average Resolution Time</h2>
          <div className="flex items-center justify-center h-48 mb-4">
            <div className="text-center">
              <span className="text-5xl font-bold text-slate-800">4.5</span>
              <span className="text-xl text-slate-500 ml-2">Days</span>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500">Team Alpha</p>
              <p className="font-bold text-slate-800">3.2 days</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Team Beta</p>
              <p className="font-bold text-slate-800">5.8 days</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Reject Rate & Satisfaction by Team</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-sm font-semibold text-slate-600">
                <th className="pb-3">Team</th>
                <th className="pb-3">Total Tickets</th>
                <th className="pb-3">Rejects</th>
                <th className="pb-3">Reject Rate</th>
                <th className="pb-3">Avg Sat. Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              <tr>
                <td className="py-3 font-medium text-slate-800">Team Alpha</td>
                <td className="py-3 text-slate-600">45</td>
                <td className="py-3 text-red-600 font-medium">3</td>
                <td className="py-3 text-slate-600">6.6%</td>
                <td className="py-3 text-green-600 font-medium">4.8 / 5.0</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-slate-800">Team Beta</td>
                <td className="py-3 text-slate-600">32</td>
                <td className="py-3 text-red-600 font-medium">5</td>
                <td className="py-3 text-slate-600">15.6%</td>
                <td className="py-3 text-green-600 font-medium">4.2 / 5.0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
