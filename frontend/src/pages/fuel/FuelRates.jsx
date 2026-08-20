import React from 'react';
import { DollarSign } from 'lucide-react';

export default function FuelRates() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Daily Fuel Rate</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Set Current Rate</h2>
        <form className="flex items-end gap-4">
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-slate-700 mb-1">Rate per km (THB)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input type="number" step="0.5" defaultValue="5.0" className="pl-9 w-full rounded-md border border-slate-300 p-2 focus:border-blue-500 focus:ring-blue-500" />
            </div>
          </div>
          <button type="button" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium">
            Update Rate
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <h2 className="text-lg font-semibold text-slate-800 p-6 border-b border-slate-200 bg-slate-50">Rate History</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="p-4 text-sm font-semibold text-slate-600">Date Set</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Rate (THB/km)</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Set By</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="p-4 text-sm text-slate-800">Oct 1, 2023 - 08:00 AM</td>
              <td className="p-4 text-sm font-bold text-slate-800">5.0</td>
              <td className="p-4 text-sm text-slate-600">Admin 1</td>
            </tr>
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="p-4 text-sm text-slate-800">Sep 1, 2023 - 09:30 AM</td>
              <td className="p-4 text-sm text-slate-600">4.5</td>
              <td className="p-4 text-sm text-slate-600">Admin 2</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
