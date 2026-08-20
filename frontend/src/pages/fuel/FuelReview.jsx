import React, { useState } from 'react';
import { Map, MapPin } from 'lucide-react';

export default function FuelReview() {
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Travel Cost Review</h1>
      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-sm font-semibold text-slate-600">Ticket ID</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Team</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Sys Dist.</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Sys Amt.</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Apprv Dist.</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Apprv Amt.</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Status</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="p-4 text-sm font-mono text-slate-800">TCK-2023-010</td>
              <td className="p-4 text-sm text-slate-600">Team Alpha</td>
              <td className="p-4 text-sm text-slate-600">20 km</td>
              <td className="p-4 text-sm text-slate-600">100 THB</td>
              <td className="p-4 text-sm text-slate-800 font-medium">-</td>
              <td className="p-4 text-sm text-slate-800 font-medium">-</td>
              <td className="p-4"><span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded">PENDING</span></td>
              <td className="p-4">
                <button onClick={() => toggleRow(1)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Review</button>
              </td>
            </tr>
            {expandedRow === 1 && (
              <tr className="bg-slate-50 border-b border-slate-200">
                <td colSpan="8" className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-4 border border-slate-200 rounded shadow-sm">
                      <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Map className="h-4 w-4" /> GPS Path</h3>
                      <div className="h-48 bg-slate-100 border border-slate-300 rounded flex items-center justify-center mb-4">
                        <p className="text-slate-400 font-mono text-sm">[Map Viewer Placeholder]</p>
                      </div>
                      <p className="text-sm text-slate-600"><MapPin className="inline h-4 w-4 text-red-500 mr-1" /> HQ to Branch A</p>
                    </div>
                    <div className="bg-white p-4 border border-slate-200 rounded shadow-sm">
                      <h3 className="font-semibold text-slate-800 mb-3">Adjust Fuel Cost</h3>
                      <form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Adj. Distance (km)</label>
                            <input type="number" defaultValue="20" className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Adj. Amount (THB)</label>
                            <input type="number" defaultValue="100" className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Reason (Required if changed)</label>
                          <textarea rows="2" className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => toggleRow(1)} className="px-4 py-2 border border-slate-300 rounded text-sm text-slate-700 hover:bg-slate-50 font-medium">Cancel</button>
                          <button type="button" className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 font-medium">Approve</button>
                        </div>
                      </form>
                    </div>
                  </div>
                </td>
              </tr>
            )}
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="p-4 text-sm font-mono text-slate-800">TCK-2023-012</td>
              <td className="p-4 text-sm text-slate-600">Team Beta</td>
              <td className="p-4 text-sm text-slate-600">15 km</td>
              <td className="p-4 text-sm text-slate-600">75 THB</td>
              <td className="p-4 text-sm text-slate-800 font-medium">15 km</td>
              <td className="p-4 text-sm text-slate-800 font-medium">75 THB</td>
              <td className="p-4"><span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">APPROVED</span></td>
              <td className="p-4">
                <button className="text-slate-400 hover:text-slate-600 text-sm font-medium" disabled>Viewed</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
