/**
 * Object-level Authorization
 */
const PermissionService = {
  canViewTicket: function(ticket, userContext) {
    if (userContext.role === 'CENTRAL_ADMIN') return true;
    
    const historicalContext = RBAC.getUserContextForDate(userContext.user_id, ticket.created_at);
    if (!historicalContext) return false;

    if (userContext.role === 'BRANCH_MANAGER' && historicalContext.branch_id === ticket.branch_id) {
      return true;
    }

    if (userContext.role === 'TECHNICIAN') {
      const db = Database.getInstance();
      const assignments = db.query('Work_Assignments', { ticket_id: ticket.ticket_id, team_id: historicalContext.team_id });
      return assignments.length > 0;
    }

    return false;
  },

  canEditTicket: function(ticket, userContext) {
    if (userContext.role === 'CENTRAL_ADMIN') return true;
    return this.canViewTicket(ticket, userContext);
  }
};
