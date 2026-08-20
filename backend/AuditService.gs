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
    const db = Database.getInstance();
    db.insert('Error_Log', {
      error_id: Utils.generateId('ERR'),
      timestamp: new Date().toISOString(),
      user_id: 'SYSTEM',
      error_message: error.message || String(error),
      stack_trace: error.stack || '',
      context_json: '{}'
    });
  }
};
