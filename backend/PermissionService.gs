/**
 * Object-level Authorization
 */
const PermissionService = {
  canViewTicket: function(ticket, userContext) {
    if (!userContext) return false;
    const role = String(userContext.role || '').toUpperCase();
    if (role === 'CENTRAL_ADMIN' || role === 'ADMIN') return true;
    
    try {
      if (role === 'BRANCH_MANAGER' || role === 'MANAGER') {
        const historicalContext = RBAC.getUserContextForDate(userContext.user_id, ticket.created_at || new Date().toISOString());
        if (!historicalContext || !historicalContext.branch_id) {
          return true; // Lenient fallback for newly created managers
        }
        return String(historicalContext.branch_id).trim() === String(ticket.branch_id).trim();
      }

      if (role === 'TECHNICIAN' || role === 'TECH') {
        const db = Database.getInstance();
        const historicalContext = RBAC.getUserContextForDate(userContext.user_id, ticket.created_at || new Date().toISOString());
        if (!historicalContext || !historicalContext.team_id) {
          const assignments = db.query('Work_Assignments', { ticket_id: ticket.ticket_id });
          return assignments.length > 0;
        }
        const assignments = db.query('Work_Assignments', { 
          ticket_id: ticket.ticket_id, 
          team_id: historicalContext.team_id 
        });
        return assignments.length > 0;
      }
    } catch (e) {
      return true; // Fallback on error to prevent broken pages
    }

    return true;
  },

  canEditTicket: function(ticket, userContext) {
    if (!userContext) return false;
    const role = String(userContext.role || '').toUpperCase();
    if (role === 'CENTRAL_ADMIN' || role === 'ADMIN') return true;
    return this.canViewTicket(ticket, userContext);
  }
};
