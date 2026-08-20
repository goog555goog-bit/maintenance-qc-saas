import React from 'react';
import { Activity, AlertCircle, CheckCircle, Clock, FileText, XCircle } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Admin Dashboard</h1>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">New Tickets</p>
            <p className="text-2xl font-bold text-slate-800">12</p>
          </div>
          <FileText className="text-blue-500 h-8 w-8" />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">In Progress</p>
            <p className="text-2xl font-bold text-slate-800">24</p>
          </div>
          <Activity className="text-blue-500 h-8 w-8" />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Waiting Review</p>
            <p className="text-2xl font-bold text-slate-800">8</p>
          </div>
          <Clock className="text-amber-500 h-8 w-8" />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Rejected</p>
            <p className="text-2xl font-bold text-slate-800">3</p>
          </div>
          <XCircle className="text-red-500 h-8 w-8" />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Closed Today</p>
            <p className="text-2xl font-bold text-slate-800">15</p>
          </div>
          <CheckCircle className="text-green-500 h-8 w-8" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Reject Hotspot</h2>
          <ul className="space-y-3">
            <li className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-100">
              <div>
                <p className="font-medium text-slate-800">TCK-2023-001</p>
                <p className="text-sm text-slate-500">Branch A - HVAC Fix</p>
              </div>
              <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">3 Rejects</span>
            </li>
            <li className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-100">
              <div>
                <p className="font-medium text-slate-800">TCK-2023-042</p>
                <p className="text-sm text-slate-500">Branch B - Plumbing</p>
              </div>
              <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">4 Rejects</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="mt-1"><AlertCircle className="h-5 w-5 text-blue-500" /></div>
              <div>
                <p className="text-sm font-medium text-slate-800">Ticket TCK-2023-045 submitted</p>
                <p className="text-xs text-slate-500">2 mins ago</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-1"><CheckCircle className="h-5 w-5 text-green-500" /></div>
              <div>
                <p className="text-sm font-medium text-slate-800">Ticket TCK-2023-040 closed</p>
                <p className="text-xs text-slate-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
