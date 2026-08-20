import React from 'react';
import { Users, Briefcase } from 'lucide-react';

export default function TeamManagement() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Team Management</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium">Add Team</button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 border border-slate-200 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-slate-50 p-4 border-b border-slate-200 font-semibold text-slate-700">Teams</div>
          <ul className="divide-y divide-slate-100">
            <li className="p-4 bg-blue-50 cursor-pointer">
              <h3 className="font-bold text-blue-800">Team Alpha</h3>
              <p className="text-sm text-blue-600">3 Members</p>
            </li>
            <li className="p-4 hover:bg-slate-50 cursor-pointer">
              <h3 className="font-semibold text-slate-700">Team Beta</h3>
              <p className="text-sm text-slate-500">2 Members</p>
            </li>
          </ul>
        </div>
        
        <div className="lg:col-span-2 border border-slate-200 bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Team Alpha</h2>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">Active</span>
            </div>
            <button className="border border-slate-300 px-3 py-1.5 rounded text-sm font-medium hover:bg-slate-50 text-slate-700">Edit Team</button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="border border-slate-200 p-4 rounded-lg bg-slate-50 flex items-center gap-3">
              <div className="bg-white p-2 rounded shadow-sm"><Users className="h-5 w-5 text-blue-600" /></div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Members</p>
                <p className="text-lg font-bold text-slate-800">3</p>
              </div>
            </div>
            <div className="border border-slate-200 p-4 rounded-lg bg-slate-50 flex items-center gap-3">
              <div className="bg-white p-2 rounded shadow-sm"><Briefcase className="h-5 w-5 text-amber-500" /></div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Active Workload</p>
                <p className="text-lg font-bold text-slate-800">2 Tickets</p>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Members</h3>
          <table className="w-full text-left">
            <thead>
              <tr className="text-sm text-slate-500 border-b border-slate-200">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Role</th>
                <th className="pb-2 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 text-sm text-slate-800 font-medium">Somchai T.</td>
                <td className="py-3 text-sm text-slate-600">Lead Tech</td>
                <td className="py-3 text-right">
                  <button className="text-red-600 hover:text-red-800 text-sm font-medium">Remove</button>
                </td>
              </tr>
              <tr>
                <td className="py-3 text-sm text-slate-800 font-medium">Wichai P.</td>
                <td className="py-3 text-sm text-slate-600">Tech</td>
                <td className="py-3 text-right">
                  <button className="text-red-600 hover:text-red-800 text-sm font-medium">Remove</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
