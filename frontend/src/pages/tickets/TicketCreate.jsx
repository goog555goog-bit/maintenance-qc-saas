import React, { useState } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TicketCreate() {
  const navigate = useNavigate();
  const [items, setItems] = useState([{ id: 1, description: '', workTypeItem: '' }]);

  const addItem = () => {
    setItems([...items, { id: Date.now(), description: '', workTypeItem: '' }]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate submission
    navigate('/tickets');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Create New Ticket</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">General Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Branch</label>
              <input type="text" value="Branch A" disabled className="w-full rounded-md border border-slate-300 p-2 bg-slate-50 text-slate-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Work Type *</label>
              <select required className="w-full rounded-md border border-slate-300 p-2 focus:border-blue-500 focus:ring-blue-500">
                <option value="">Select type...</option>
                <option value="HVAC">HVAC</option>
                <option value="Plumbing">Plumbing</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Overall Description *</label>
            <textarea required rows="3" className="w-full rounded-md border border-slate-300 p-2 focus:border-blue-500 focus:ring-blue-500"></textarea>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-lg font-semibold text-slate-800">Repair Items</h2>
            <button type="button" onClick={addItem} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium">
              <Plus className="h-4 w-4" /> Add Item
            </button>
          </div>
          
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="p-4 bg-slate-50 rounded-md border border-slate-200 relative">
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(item.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <h3 className="text-sm font-medium text-slate-700 mb-3">Item #{index + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Specific Area/Item</label>
                    <select className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500">
                      <option>AC Unit - Main Hall</option>
                      <option>Sink - Restroom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Photo Evidence</label>
                    <div className="flex items-center gap-2">
                      <button type="button" className="flex items-center gap-2 bg-white border border-slate-300 px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-50">
                        <Upload className="h-4 w-4" /> Upload
                      </button>
                      <span className="text-xs text-slate-500">No file chosen</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Issue Description</label>
                  <input type="text" className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500" placeholder="Describe the specific problem here..." />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/tickets')} className="px-4 py-2 text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 font-medium">Cancel</button>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium shadow-sm">Submit Ticket</button>
        </div>
      </form>
    </div>
  );
}
