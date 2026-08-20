import React, { useState } from 'react';
import { Save, Settings as SettingsIcon, Database } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('workTypes');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <SettingsIcon className="h-6 w-6 text-slate-500" /> System Settings
      </h1>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 flex flex-col">
          <button onClick={() => setActiveTab('workTypes')} className={`p-4 text-left text-sm font-medium border-b border-slate-200 ${activeTab === 'workTypes' ? 'bg-white text-blue-600 border-l-4 border-l-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}>
            Work Types
          </button>
          <button onClick={() => setActiveTab('backup')} className={`p-4 text-left text-sm font-medium border-b border-slate-200 ${activeTab === 'backup' ? 'bg-white text-blue-600 border-l-4 border-l-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}>
            System & Backup
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {activeTab === 'workTypes' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800">Work Types Management</h2>
                <button className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700">Add Work Type</button>
              </div>
              <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                    <th className="p-3">ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  <tr>
                    <td className="p-3 font-mono text-slate-500">WT-01</td>
                    <td className="p-3 font-medium text-slate-800">HVAC</td>
                    <td className="p-3"><span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold border border-green-200">Active</span></td>
                    <td className="p-3 text-right">
                      <button className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-slate-500">WT-02</td>
                    <td className="p-3 font-medium text-slate-800">Plumbing</td>
                    <td className="p-3"><span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold border border-green-200">Active</span></td>
                    <td className="p-3 text-right">
                      <button className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'backup' && (
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Database className="h-5 w-5" /> Backup Settings</h2>
              <div className="space-y-6 max-w-md">
                <div>
                  <label className="flex items-center gap-2 mb-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded border-slate-300" />
                    <span className="text-sm font-medium text-slate-700">Enable Daily Auto-Backup</span>
                  </label>
                  <p className="text-xs text-slate-500 ml-6">Backups will run daily at 00:00 system time.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Backup Retention (Days)</label>
                  <input type="number" defaultValue="30" className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <button className="bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-900 text-sm font-medium flex items-center gap-2">
                    <Save className="h-4 w-4" /> Save Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
