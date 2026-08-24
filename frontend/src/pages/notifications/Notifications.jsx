import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Loader2, 
  Ticket, 
  ArrowRight, 
  Search, 
  CheckCheck, 
  Inbox, 
  Clock, 
  Filter,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '@/core/api';
import StatusBadge from '@/components/ui/StatusBadge';

const STATUS_THAI_MAP = {
  'NEW': 'แจ้งซ่อมใหม่ (รอจัดสรรทีมช่าง)',
  'SUBMITTED': 'แจ้งซ่อมใหม่ (รอจัดสรรทีมช่าง)',
  'WAITING_ASSIGNMENT': 'รอจัดสรรทีมช่างเข้าปฏิบัติงาน',
  'ASSIGNED': 'มอบหมายทีมช่างผู้รับผิดชอบเรียบร้อยแล้ว',
  'CHECKED_IN': 'ช่างเทคนิคเดินทางถึงพื้นที่สาขาแล้ว (Check-in)',
  'IN_PROGRESS': 'ช่างเทคนิคกำลังดำเนินการซ่อมบำรุง',
  'COMPLETED_BY_TECH': 'ช่างส่งมอบงานแล้ว (รอผู้จัดการตรวจรับงาน)',
  'WAITING_REVIEW': 'รอผู้จัดการตรวจรับและอนุมัติปิดงาน',
  'REWORK': 'งานถูกส่งกลับแก้ไข (Rework) กรุณาตรวจสอบ',
  'REJECTED_REWORK': 'งานถูกส่งกลับแก้ไข (Rework) กรุณาตรวจสอบ',
  'COMPLETED': 'ตรวจรับงานผ่านเรียบร้อยแล้ว',
  'CLOSED': 'ปิดงานซ่อมบำรุงสมบูรณ์',
  'FUEL_SUBMITTED': 'มีคำขอเบิกค่าน้ำมันใหม่ (รอตรวจสอบ)',
  'FUEL_APPROVED': 'คำขอเบิกค่าน้ำมันได้รับการอนุมัติแล้ว',
  'FUEL_REJECTED': 'คำขอเบิกค่าน้ำมันถูกปฏิเสธ'
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread' | 'read'
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiCall('notification.list', {});
      const list = Array.isArray(res) 
        ? res 
        : (Array.isArray(res?.notifications) ? res.notifications : (Array.isArray(res?.data) ? res.data : []));
      setNotifications(list);
    } catch (err) {
      setError(err.message || 'ไม่สามารถดึงข้อมูลการแจ้งเตือนได้');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id, ticketId, shouldNavigate = true) => {
    try {
      await apiCall('notification.markRead', { notification_id: id });
      setNotifications(prev => prev.map(n => 
        (n.notification_id === id || n.id === id) ? { ...n, is_read: true, read: true } : n
      ));
      if (ticketId && shouldNavigate) {
        navigate(`/tickets/${ticketId}`);
      }
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read && !n.read);
    if (unread.length === 0) return;
    
    setIsLoading(true);
    try {
      await apiCall('notification.markRead', { notification_id: 'ALL' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read: true })));
    } catch (err) {
      try {
        await Promise.all(unread.map(n => 
          apiCall('notification.markRead', { notification_id: n.notification_id || n.id })
        ));
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read: true })));
      } catch (innerErr) {
        setError(innerErr.message || 'ไม่สามารถทำเครื่องหมายว่าอ่านทั้งหมดได้');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to extract ticketId and format message in friendly Thai
  const parseNotification = (n) => {
    const rawMsg = n.message || '';
    
    // Extract Ticket ID
    let ticketId = n.ticket_id || '';
    if (!ticketId) {
      const match = rawMsg.match(/MT-\d{4}-\d+/i);
      if (match) ticketId = match[0];
    }

    // Extract Status enum
    let status = n.status || '';
    if (!status) {
      const statusKeys = Object.keys(STATUS_THAI_MAP);
      for (const key of statusKeys) {
        if (rawMsg.includes(key)) {
          status = key;
          break;
        }
      }
    }

    // Formulate clean Thai title and description
    let thaiTitle = rawMsg;
    if (status && STATUS_THAI_MAP[status]) {
      const thaiStatusDesc = STATUS_THAI_MAP[status];
      if (ticketId) {
        thaiTitle = `ใบงาน ${ticketId}: ${thaiStatusDesc}`;
      } else {
        thaiTitle = thaiStatusDesc;
      }
    }

    return {
      ticketId,
      status,
      thaiTitle
    };
  };

  // Calculate metrics
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.is_read && !n.read).length;
  }, [notifications]);

  const readCount = useMemo(() => {
    return notifications.filter(n => n.is_read || n.read).length;
  }, [notifications]);

  const actionRequiredCount = useMemo(() => {
    return notifications.filter(n => {
      const parsed = parseNotification(n);
      const isUnread = !n.is_read && !n.read;
      const isActionStatus = ['WAITING_REVIEW', 'COMPLETED_BY_TECH', 'REWORK', 'REJECTED_REWORK', 'WAITING_ASSIGNMENT'].includes(parsed.status);
      return isUnread && isActionStatus;
    }).length;
  }, [notifications]);

  // Filter and search
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const isRead = n.is_read || n.read;
      if (activeFilter === 'unread' && isRead) return false;
      if (activeFilter === 'read' && !isRead) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const parsed = parseNotification(n);
        const matchTitle = parsed.thaiTitle.toLowerCase().includes(query);
        const matchMsg = String(n.message || '').toLowerCase().includes(query);
        const matchId = parsed.ticketId.toLowerCase().includes(query);
        return matchTitle || matchMsg || matchId;
      }

      return true;
    });
  }, [notifications, activeFilter, searchQuery]);

  const formatDate = (isoStr) => {
    if (!isoStr) return '-';
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' น.';
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <span>ศูนย์การแจ้งเตือน</span>
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                {unreadCount} ข้อความใหม่
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ติดตามสถานะใบงานซ่อมบำรุง ความคืบหน้าของช่างเทคนิค และรายการที่ต้องตรวจสอบ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={fetchNotifications}
            className="p-2.5 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
            title="รีเฟรชการแจ้งเตือน"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || isLoading}
            className="text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4 text-slate-500" />
            <span>อ่านทั้งหมดแล้ว</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>การแจ้งเตือนทั้งหมด</span>
            <Bell className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{notifications.length}</p>
          <p className="text-[11px] text-slate-400">รายการในระบบ</p>
        </div>

        <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-rose-700 text-xs font-semibold">
            <span>ยังไม่ได้อ่าน</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          </div>
          <p className="text-2xl font-bold text-rose-700">{unreadCount}</p>
          <p className="text-[11px] text-rose-500 font-medium">ข้อความใหม่ที่ต้องดู</p>
        </div>

        <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold">
            <span>อ่านแล้ว</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-800">{readCount}</p>
          <p className="text-[11px] text-emerald-600 font-medium">รับทราบเรียบร้อย</p>
        </div>

        <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
            <span>รอดำเนินการ</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-800">{actionRequiredCount}</p>
          <p className="text-[11px] text-amber-600 font-medium">รอจัดสรร / ตรวจรับ</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-xl text-xs border border-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ทั้งหมด ({notifications.length})
          </button>
          <button
            onClick={() => setActiveFilter('unread')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFilter === 'unread'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>ยังไม่ได้อ่าน</span>
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveFilter('read')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'read'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            อ่านแล้ว ({readCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ค้นหารหัสใบงาน หรือข้อความ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading && notifications.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-24 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
            <p className="text-xs text-slate-400">กำลังโหลดรายการแจ้งเตือน...</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map(n => {
            const notifId = n.notification_id || n.id;
            const isRead = n.is_read || n.read;
            const { ticketId, status, thaiTitle } = parseNotification(n);

            return (
              <div 
                key={notifId} 
                onClick={() => handleMarkRead(notifId, ticketId, true)}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-all shadow-xs ${
                  !isRead 
                    ? 'bg-blue-50/40 border-blue-200 hover:bg-blue-50/80' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`p-2.5 rounded-xl shrink-0 ${!isRead ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500'}`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={`text-xs ${!isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {thaiTitle}
                      </p>
                      {!isRead && (
                        <span className="bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                          ใหม่
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-400">
                      {ticketId && (
                        <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          {ticketId}
                        </span>
                      )}
                      {status && (
                        <StatusBadge status={status} size="xs" />
                      )}
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(n.created_at)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {!isRead && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkRead(notifId, null, false);
                      }}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                      title="ทำเครื่องหมายว่าอ่านแล้ว"
                    >
                      ทำเครื่องหมายว่าอ่านแล้ว
                    </button>
                  )}
                  {ticketId && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkRead(notifId, ticketId, true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl flex items-center gap-1 transition-colors shadow-xs"
                    >
                      <span>เปิดดูใบงาน</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-xs text-center p-6 space-y-2">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            <p className="text-sm font-bold text-slate-800">ไม่มีรายการแจ้งเตือนในหมวดหมู่นี้</p>
            <p className="text-xs text-slate-400">
              {activeFilter === 'unread' 
                ? 'คุณอ่านการแจ้งเตือนทั้งหมดเรียบร้อยแล้ว' 
                : 'ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
