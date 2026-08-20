import React from 'react';
import { Clock, FileText, CheckCircle, XCircle } from 'lucide-react';

export default function ManagerDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Branch Manager Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">My Open Tickets</p>
            <p className="text-2xl font-bold text-slate-800">5</p>
          </div>
          <FileText className="text-blue-500 h-8 w-8" />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Awaiting Review</p>
            <p className="text-2xl font-bold text-slate-800">2</p>
          </div>
          <Clock className="text-amber-500 h-8 w-8" />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Rejected</p>
            <p className="text-2xl font-bold text-slate-800">1</p>
          </div>
          <XCircle className="text-red-500 h-8 w-8" />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Closed This Month</p>
            <p className="text-2xl font-bold text-slate-800">18</p>
          </div>
          <CheckCircle className="text-green-500 h-8 w-8" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Tickets Awaiting Review</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="p-3 text-sm font-medium text-slate-600">ID</th>
                <th className="p-3 text-sm font-medium text-slate-600">Work Type</th>
                <th className="p-3 text-sm font-medium text-slate-600">Submitted Date</th>
                <th className="p-3 text-sm font-medium text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3 text-sm text-slate-800 font-medium">TCK-2023-050</td>
                <td className="p-3 text-sm text-slate-600">Electrical</td>
                <td className="p-3 text-sm text-slate-600">Today, 10:00 AM</td>
                <td className="p-3">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Review</button>
                </td>
              </tr>
              <tr className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3 text-sm text-slate-800 font-medium">TCK-2023-048</td>
                <td className="p-3 text-sm text-slate-600">Plumbing</td>
                <td className="p-3 text-sm text-slate-600">Yesterday, 15:30</td>
                <td className="p-3">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Review</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
