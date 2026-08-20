/**
 * Assignment management
 */
const AssignmentService = {
  assignTeam: function(payload, userContext) {
    if (userContext.role !== 'CENTRAL_ADMIN') {
      throw new Error("Only Admin can assign teams");
    }
    Validation.requireFields(payload, ['ticket_id', 'team_id']);
    
    const db = Database.getInstance();
    const tickets = db.query('Tickets', { ticket_id: payload.ticket_id });
    if (tickets.length === 0) throw new Error("Ticket not found");
    
    const ticket = tickets[0];
    
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      TicketService.updateTicketStatus(ticket.ticket_id, ticket.status, 'ASSIGNED', userContext);
      
      const assignmentId = Utils.generateId('ASN');
      db.insert('Work_Assignments', {
        assignment_id: assignmentId,
        ticket_id: ticket.ticket_id,
        team_id: payload.team_id,
        technician_id: payload.technician_id || '',
        assigned_by: userContext.user_id,
        assigned_at: new Date().toISOString(),
        accepted_at: '',
        released_at: '',
        assignment_status: 'ACTIVE',
        transfer_reason: '',
        transfer_to_assignment_id: ''
      });
      
      AuditService.logActivity(userContext.user_id, userContext.role, 'ASSIGN_TEAM', 'Ticket', ticket.ticket_id, null, payload.team_id, 'Assigned to team');
      return { success: true, assignment_id: assignmentId };
    } finally {
      lock.releaseLock();
    }
  }
};
