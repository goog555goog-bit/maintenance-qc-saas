/**
 * Notification Service
 */
const NotificationService = {
  getEventThaiLabel: function(eventStr) {
    const map = {
      'SUBMITTED': 'แจ้งซ่อมใหม่ (รอจัดสรรทีมช่าง)',
      'NEW': 'แจ้งซ่อมใหม่ (รอจัดสรรทีมช่าง)',
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
    return map[eventStr] || eventStr;
  },

  notify: function(ticketId, eventStr, targetUserId, extraDetail) {
    const db = Database.getInstance();
    const eventThai = this.getEventThaiLabel(eventStr);
    const message = "ใบงาน " + ticketId + ": " + eventThai + (extraDetail ? " - " + extraDetail : "");
    const notifId = 'NOTIF-' + Utilities.getUuid().slice(0, 8).toUpperCase();
    
    db.insert('Notifications', {
      notification_id: notifId,
      ticket_id: ticketId,
      status: eventStr,
      user_id: targetUserId || 'SYSTEM_BROADCAST',
      message: message,
      is_read: 'FALSE',
      read: 'FALSE',
      created_at: new Date().toISOString()
    });
  },

  listNotifications: function(payload, userContext) {
    const db = Database.getInstance();
    const all = db.query('Notifications');
    const userId = userContext ? String(userContext.user_id).trim().toLowerCase() : '';
    
    // Filter for current user or broadcast
    const userNotifs = all.filter(function(n) {
      const nUserId = String(n.user_id || '').trim().toLowerCase();
      return nUserId === userId || nUserId === 'system_broadcast' || nUserId === '';
    });
    
    // Sort descending by created_at
    userNotifs.sort(function(a, b) {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });
    
    return userNotifs.map(function(n) {
      const isRead = n.is_read === 'TRUE' || n.read === 'TRUE';
      return {
        notification_id: n.notification_id,
        ticket_id: n.ticket_id || '',
        status: n.status || '',
        user_id: n.user_id,
        message: n.message,
        is_read: isRead,
        read: isRead,
        created_at: n.created_at
      };
    });
  },

  getNotifications: function(userContext) {
    return this.listNotifications({}, userContext);
  },

  markRead: function(payload, userContext) {
    Validation.requireFields(payload, ['notification_id']);
    const db = Database.getInstance();
    if (payload.notification_id === 'ALL') {
      const all = this.listNotifications({}, userContext);
      all.forEach(function(n) {
        try {
          db.update('Notifications', 'notification_id', n.notification_id, { is_read: 'TRUE', read: 'TRUE' });
        } catch (e) {}
      });
      return { success: true };
    }
    db.update('Notifications', 'notification_id', payload.notification_id, { is_read: 'TRUE', read: 'TRUE' });
    return { success: true };
  }
};
