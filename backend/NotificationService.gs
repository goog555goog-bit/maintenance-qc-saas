/**
 * Notification Service
 */
const NotificationService = {
  notify: function(ticketId, eventStr, targetUserId) {
    const db = Database.getInstance();
    const message = "ใบงาน " + ticketId + ": " + eventStr;
    const notifId = 'NOTIF-' + Utilities.getUuid().slice(0, 8).toUpperCase();
    
    db.insert('Notifications', {
      notification_id: notifId,
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
