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

  parseBoolean: function(val) {
    if (val === true || val === 1) return true;
    if (!val) return false;
    const s = String(val).trim().toUpperCase();
    return s === 'TRUE' || s === '1' || s === 'YES' || s === 'READ';
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
    const self = this;
    
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
      const isRead = self.parseBoolean(n.read) || self.parseBoolean(n.is_read);
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
    const targetId = String(payload.notification_id).trim();

    try {
      const sheet = db.getSheet('Notifications');
      if (!sheet) return { success: true };
      const data = sheet.getDataRange().getValues();
      if (data.length > 1) {
        const headers = data[0];
        const idCol = headers.indexOf('notification_id');
        const readCol = headers.indexOf('read');
        const isReadCol = headers.indexOf('is_read');
        const userCol = headers.indexOf('user_id');
        const curUser = userContext ? String(userContext.user_id).trim().toLowerCase() : '';

        if (targetId === 'ALL') {
          for (let i = 1; i < data.length; i++) {
            const rowUser = userCol !== -1 ? String(data[i][userCol]).trim().toLowerCase() : '';
            if (!curUser || rowUser === curUser || rowUser === 'system_broadcast' || rowUser === '') {
              if (readCol !== -1) sheet.getRange(i + 1, readCol + 1).setValue('TRUE');
              if (isReadCol !== -1) sheet.getRange(i + 1, isReadCol + 1).setValue('TRUE');
            }
          }
        } else {
          if (idCol !== -1) {
            for (let i = 1; i < data.length; i++) {
              if (String(data[i][idCol]).trim().toUpperCase() === targetId.toUpperCase()) {
                if (readCol !== -1) sheet.getRange(i + 1, readCol + 1).setValue('TRUE');
                if (isReadCol !== -1) sheet.getRange(i + 1, isReadCol + 1).setValue('TRUE');
                break;
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn("Error marking notification as read: " + e.message);
    }
    
    return { success: true };
  }
};
