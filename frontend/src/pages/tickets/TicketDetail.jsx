import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Clock, CheckCircle, FileText, Camera, User, PenTool, XCircle } from 'lucide-react';

export default function TicketDetail({ role }) {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('info');

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-800 font-mono">{id || 'TCK-2023-001'}</h1>
              <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded text-xs font-bold tracking-wide">IN_PROGRESS</span>
            </div>
            <p className="text-slate-600">Branch A • HVAC Maintenance • Oct 1, 2023</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {role === 'admin' && (
              <button className="flex-1 sm:flex-none bg-slate-100 text-slate-700 px-4 py-2 rounded-md font-medium text-sm border border-slate-300 hover:bg-slate-200">
                Re-assign
              </button>
            )}
            {role === 'tech' && (
              <button className="flex-1 sm:flex-none bg-blue-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-blue-700 flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4" /> Submit Work
              </button>
            )}
            {role === 'manager' && (
              <button className="flex-1 sm:flex-none bg-green-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-green-700 flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4" /> Approve
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex border-b border-slate-200">
              <button onClick={() => setActiveTab('info')} className={`flex-1 py-3 text-sm font-medium text-center ${activeTab === 'info' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                Information
              </button>
              <button onClick={() => setActiveTab('items')} className={`flex-1 py-3 text-sm font-medium text-center ${activeTab === 'items' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                Repair Items (2)
              </button>
            </div>
            
            <div className="p-6">
              {activeTab === 'info' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Description</h3>
                    <p className="text-slate-800 leading-relaxed">The main hall AC is not cooling properly, and making a weird rattling noise. Needs immediate inspection.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">Assigned Team</h3>
                      <p className="text-slate-800 font-medium">Team Alpha</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">Urgency</h3>
                      <span className="text-red-700 bg-red-50 px-2 py-1 rounded text-sm font-bold border border-red-200">High</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Location & Check-in</h3>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-start gap-4">
                      <div className="bg-blue-100 p-2 rounded-full"><MapPin className="text-blue-600 h-5 w-5" /></div>
                      <div>
                        <p className="font-medium text-slate-800">Checked in at 10:45 AM, Oct 2</p>
                        <p className="text-sm text-slate-500">13.7563, 100.5018 (Within 50m of branch)</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'items' && (
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-slate-800">Item 1: Compressor Unit</h4>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium">Pending Fix</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">Check freon levels and rattling fan.</p>
                    <div className="flex gap-2">
                      <div className="h-16 w-16 bg-slate-200 rounded border border-slate-300 flex items-center justify-center"><Camera className="text-slate-400 h-6 w-6" /></div>
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-slate-800">Item 2: Filter Cleaning</h4>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">Fixed</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">Routine filter replacement.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Timeline */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-400" /> Ticket Timeline
            </h3>
            
            <div className="space-y-6 pl-2">
              <div className="relative border-l-2 border-blue-200 pl-4">
                <div className="absolute w-3 h-3 bg-blue-600 rounded-full -left-[7px] top-1.5"></div>
                <p className="text-sm font-semibold text-slate-800">Checked In</p>
                <p className="text-xs text-slate-500 mb-1">Oct 2, 10:45 AM • by Tech Somchai</p>
              </div>
              <div className="relative border-l-2 border-slate-200 pl-4">
                <div className="absolute w-3 h-3 bg-slate-400 rounded-full -left-[7px] top-1.5"></div>
                <p className="text-sm font-semibold text-slate-800">Assigned</p>
                <p className="text-xs text-slate-500 mb-1">Oct 1, 15:30 PM • by Admin Admin</p>
                <p className="text-sm text-slate-600 mt-1">Assigned to Team Alpha</p>
              </div>
              <div className="relative border-l-2 border-transparent pl-4">
                <div className="absolute w-3 h-3 bg-slate-400 rounded-full -left-[7px] top-1.5"></div>
                <p className="text-sm font-semibold text-slate-800">Created</p>
                <p className="text-xs text-slate-500">Oct 1, 14:00 PM • by Manager Somsri</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <PenTool className="h-5 w-5 text-slate-400" /> Review History
            </h3>
            <p className="text-sm text-slate-500 italic">No reviews yet.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
