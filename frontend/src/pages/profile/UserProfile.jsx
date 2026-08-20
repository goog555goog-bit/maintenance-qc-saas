import React from 'react';
import { User, Lock, Save, Briefcase } from 'lucide-react';

export default function UserProfile() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">User Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-white shadow-sm">
              <User className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Somchai T.</h2>
            <p className="text-slate-500 text-sm mb-4">EMP-2023001</p>
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">Technician</span>
            
            <div className="mt-6 pt-6 border-t border-slate-100 text-left space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Branch / Team</p>
                <p className="text-sm font-medium text-slate-800 mt-0.5 flex items-center gap-2"><Briefcase className="h-4 w-4 text-slate-400" /> Team Alpha</p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          {/* Change Password */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5 text-slate-400" /> Change Password
            </h3>
            <form className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                <input type="password" required className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <input type="password" required className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                <input type="password" required className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium flex items-center gap-2">
                <Save className="h-4 w-4" /> Update Password
              </button>
            </form>
          </div>

          {/* Activity Log / Assignment History (Tech only usually, but good for demo) */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Assignment History</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-800">Completed <span className="font-mono">TCK-2023-040</span></p>
                  <p className="text-xs text-slate-500">Yesterday, 14:30</p>
                </div>
                <span className="text-green-600 font-bold text-sm">+5.0 THB/km</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-800">Assigned <span className="font-mono">TCK-2023-042</span></p>
                  <p className="text-xs text-slate-500">Oct 1, 09:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
