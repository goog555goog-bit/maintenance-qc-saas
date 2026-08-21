/**
 * Audit Logging Service
 */
const AuditService = {
  logActivity: function(userId, role, action, entityType, entityId, oldValue, newValue, reason) {
    const db = Database.getInstance();
    const logId = Utils.generateId('LOG');
    
    db.insert('Activity_Log', {
      log_id: logId,
      timestamp: new Date().toISOString(),
      user_id: userId || 'SYSTEM',
      role: role || 'SYSTEM',
      action: action,
      entity_type: entityType,
      entity_id: entityId,
      old_value: oldValue || '',
      new_value: newValue || '',
      reason: reason || '',
      metadata_json: '{}'
    });
  },
  
  logError: function(error) {
    try {
      const db = Database.getInstance();
      db.insert('Error_Log', {
        error_id: Utils.generateId('ERR'),
        timestamp: new Date().toISOString(),
        user_id: 'SYSTEM',
        error_message: error ? (error.message || String(error)) : 'Unknown error',
        stack_trace: error ? (error.stack || '') : '',
        context_json: '{}'
      });
    } catch (e) {
      console.error("Failed to log error: " + e.message);
    }
  }
};
