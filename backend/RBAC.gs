/**
 * Historical Role-Based Access Control
 */
const RBAC = {
  
  getUserHistory: function(payload, userContext) {
    if (userContext.role !== 'CENTRAL_ADMIN') {
      throw new Error("Forbidden");
    }
    const db = Database.getInstance();
    return db.query('User_Assignment_History', { user_id: payload.user_id });
  },

  getUserContextForDate: function(userId, targetDate) {
    const db = Database.getInstance();
    const history = db.query('User_Assignment_History', { user_id: userId });
    const dateObj = new Date(targetDate);
    
    for (let i = 0; i < history.length; i++) {
      const record = history[i];
      const from = new Date(record.effective_from);
      const to = record.effective_to ? new Date(record.effective_to) : new Date('2099-12-31');
      
      if (dateObj >= from && dateObj <= to) {
        return {
          role: record.role,
          branch_id: record.branch_id,
          team_id: record.team_id
        };
      }
    }
    return null;
  }
};
