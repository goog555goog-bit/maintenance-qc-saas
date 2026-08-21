import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertCircle, RefreshCw, Loader2, Ticket, ArrowRight } from 'lucide-react';
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
      setNotifications(Array.isArray(res) ? res : (Array.isArray(res?.notifications) ? res.notifications : (Array.isArray(res?.data) ? res.data : [])));
    } catch (err) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id, ticketId) => {
    try {
      await apiCall('notification.markRead', { notification_id: id });
      setNotifications(prev => prev.map(n => 
        (n.notification_id === id || n.id === id) ? { ...n, is_read: true } : n
      ));
      if (ticketId) {
        navigate(`/tickets/${ticketId}`);
      }
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span>ศูนย์การแจ้งเตือน</span>
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount} ข้อความใหม่
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">การแจ้งเตือนงานซ่อม การเปลี่ยนสถานะ และคำขออนุมัติ</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={fetchNotifications}
            className="p-2 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
            title="รีเฟรชการแจ้งเตือน"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || isLoading}
            className="text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 transition-colors shadow-xs"
          >
            อ่านทั้งหมดแล้ว
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-xl text-xs border border-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading && notifications.length === 0 ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : notifications.length > 0 ? (
          notifications.map(n => {
            const notifId = n.notification_id || n.id;
            return (
              <div 
                key={notifId} 
                onClick={() => handleMarkRead(notifId, n.ticket_id)}
                className={`p-4 rounded-xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                  !n.is_read 
                    ? 'bg-blue-50/50 border-blue-200 hover:bg-blue-50 shadow-xs' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${!n.is_read ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs ${!n.is_read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                      {n.message}
                    </p>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                    {n.ticket_id && (
                      <span className="font-mono font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                        {n.ticket_id}
                      </span>
                    )}
                    <span>{formatDate(n.created_at)}</span>
                  </div>
                </div>
                {n.ticket_id && (
                  <ArrowRight className="w-4 h-4 text-slate-300 shrink-0 self-center" />
                )}
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 shadow-xs text-center p-6">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2" />
            <p className="text-sm font-bold text-slate-800">ไม่มีการแจ้งเตือนใหม่</p>
            <p className="text-xs text-slate-400 mt-0.5">คุณตรวจสอบและอ่านการแจ้งเตือนทั้งหมดเรียบร้อยแล้ว</p>
          </div>
        )}
      </div>
    </div>
  );
}
