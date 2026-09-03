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

    // Send Telegram Personal Notification
    try {
      this.sendTelegramNotification(ticketId, eventStr, eventThai, targetUserId, extraDetail);
    } catch (tgErr) {
      console.warn("Could not dispatch Telegram notification: " + tgErr.message);
    }
  },

  sendTelegramNotification: function(ticketId, eventStr, eventThai, targetUserId, extraDetail) {
    const db = Database.getInstance();
    const chatIdsToSend = new Set();

    // 1. Direct target user
    if (targetUserId && targetUserId !== 'SYSTEM_BROADCAST') {
      const users = db.query('Users', { user_id: targetUserId });
      if (users.length > 0 && users[0].telegram_chat_id) {
        chatIdsToSend.add(String(users[0].telegram_chat_id).trim());
      }
      const tgUsers = db.query('Telegram_Users', { user_id: targetUserId });
      if (tgUsers.length > 0 && tgUsers[0].telegram_chat_id) {
        chatIdsToSend.add(String(tgUsers[0].telegram_chat_id).trim());
      }
    }

    // 2. Resolve target based on ticket role and workflow state
    if (ticketId) {
      const tickets = db.query('Tickets', { ticket_id: ticketId });
      if (tickets.length > 0) {
        const ticket = tickets[0];

        // If ticket assigned or reworked: notify assigned technicians
        if (eventStr === 'ASSIGNED' || eventStr === 'REWORK' || eventStr === 'REJECTED_REWORK') {
          const assignments = db.query('Work_Assignments', { ticket_id: ticketId });
          const activeAsn = assignments.find(function(a) { return a.assignment_status === 'ACTIVE'; }) || assignments[0];
          if (activeAsn) {
            // Check direct technician_id
            if (activeAsn.technician_id) {
              const techUsers = db.query('Users', { user_id: activeAsn.technician_id });
              if (techUsers.length > 0 && techUsers[0].telegram_chat_id) {
                chatIdsToSend.add(String(techUsers[0].telegram_chat_id).trim());
              }
            }
            // Check team members
            if (activeAsn.team_id) {
              const histories = db.query('User_Assignment_History', { team_id: activeAsn.team_id });
              histories.forEach(function(h) {
                if (h.user_id) {
                  const u = db.query('Users', { user_id: h.user_id });
                  if (u.length > 0 && u[0].telegram_chat_id) {
                    chatIdsToSend.add(String(u[0].telegram_chat_id).trim());
                  }
                }
              });
            }
          }
        }

        // If completed or checked-in: notify Branch Manager
        if (eventStr === 'COMPLETED_BY_TECH' || eventStr === 'CHECKED_IN' || eventStr === 'WAITING_REVIEW') {
          if (ticket.created_by) {
            const creator = db.query('Users', { user_id: ticket.created_by });
            if (creator.length > 0 && creator[0].telegram_chat_id) {
              chatIdsToSend.add(String(creator[0].telegram_chat_id).trim());
            }
          }
          if (ticket.branch_id) {
            const managers = db.query('Users', { role: 'BRANCH_MANAGER', branch_id: ticket.branch_id });
            managers.forEach(function(m) {
              if (m.telegram_chat_id) {
                chatIdsToSend.add(String(m.telegram_chat_id).trim());
              }
            });
          }
        }
      }
    }

    // 3. Dispatch to all resolved chat IDs
    if (chatIdsToSend.size === 0) return;

    const miniAppUrl = TelegramService.getMiniAppUrl();
    const ticketUrl = miniAppUrl + '/tickets/' + ticketId;

    let text = '<b>แจ้งเตือนงานซ่อมบำรุง</b>\n\n';
    text += 'ใบงาน: <code>' + ticketId + '</code>\n';
    text += 'สถานะ: <b>' + eventThai + '</b>\n';
    if (extraDetail) {
      text += 'รายละเอียด: ' + extraDetail + '\n';
    }
    text += 'เวลา: ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.\n';

    const replyMarkup = {
      inline_keyboard: [
        [
          { text: 'เปิดดูใบงานในระบบ', web_app: { url: ticketUrl } }
        ]
      ]
    };

    chatIdsToSend.forEach(function(chatId) {
      if (chatId) {
        TelegramService.sendMessage(chatId, text, replyMarkup);
      }
    });

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
