import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertCircle, RefreshCw, Inbox, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '@/core/api';

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiCall('notification.list', {});
      setNotifications(res.notifications || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await apiCall('notification.markRead', { notification_id: id });
      setNotifications(prev => prev.map(n => 
        (n.notification_id === id || n.id === id) ? { ...n, is_read: true } : n
      ));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    if (unread.length === 0) return;
    
    setIsLoading(true);
    try {
      await Promise.all(unread.map(n => 
        apiCall('notification.markRead', { notification_id: n.notification_id || n.id })
      ));
      await fetchNotifications();
    } catch (err) {
      setError(err.message || 'Failed to mark all as read');
      setIsLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    const date = new Date(isoStr);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Bell className="h-6 w-6 text-blue-600" /> การแจ้งเตือน
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </h1>
        <button 
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0 || isLoading}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 disabled:text-slate-400"
        >
          อ่านทั้งหมด
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
          {error}
        </div>
      )}

      <div className="space-y-3 min-h-[400px] flex flex-col">
        {isLoading && notifications.length === 0 ? (
          <div className="flex justify-center items-center flex-1 py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : notifications.length > 0 ? (
          notifications.map(notification => (
             <div 
               key={notification.notification_id || notification.id} 
               onClick={() => !notification.is_read && handleMarkRead(notification.notification_id || notification.id)}
               className={`p-4 rounded-lg shadow-sm border flex gap-4 cursor-pointer transition-colors relative overflow-hidden ${
                 !notification.is_read 
                   ? 'bg-blue-50 border-blue-200 border-l-4 border-l-blue-500 hover:bg-blue-100' 
                   : 'bg-white border-slate-200 hover:border-blue-300'
               }`}
             >
               <div className="flex-1">
                 <p className={`text-sm ${!notification.is_read ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                   {notification.message}
                 </p>
                 <p className="text-xs text-slate-400 mt-2">
                   {formatDate(notification.created_at)}
                 </p>
               </div>
             </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 py-16 text-slate-500 bg-white rounded-lg border border-slate-200 shadow-sm">
            <Bell className="h-16 w-16 text-slate-200 mb-4" />
            <p className="text-lg font-medium text-slate-600">ไม่มีการแจ้งเตือนใหม่</p>
            <p className="text-sm text-slate-400 mt-1">คุณตรวจสอบการแจ้งเตือนครบหมดแล้ว</p>
          </div>
        )}
      </div>
    </div>
  );
}
