/**
 * Reassignment Management
 */
const ReassignService = {
  reassignTeam: function(payload, userContext) {
    if (userContext.role !== 'CENTRAL_ADMIN') {
      throw new Error("Only Admin can reassign teams");
    }
    Validation.requireFields(payload, ['ticket_id', 'old_assignment_id', 'new_team_id', 'transfer_reason']);
    
    const db = Database.getInstance();
    const tickets = db.query('Tickets', { ticket_id: payload.ticket_id });
    if (tickets.length === 0) throw new Error("Ticket not found");
    const ticket = tickets[0];
    
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const newAssignmentId = Utils.generateId('ASN');
      
      // Update old assignment
      db.update('Work_Assignments', 'assignment_id', payload.old_assignment_id, {
        assignment_status: 'TRANSFERRED',
        transfer_reason: payload.transfer_reason,
        transfer_to_assignment_id: newAssignmentId,
        released_at: new Date().toISOString()
      });
      
      // Create new assignment
      db.insert('Work_Assignments', {
        assignment_id: newAssignmentId,
        ticket_id: ticket.ticket_id,
        team_id: payload.new_team_id,
        technician_id: '',
        assigned_by: userContext.user_id,
        assigned_at: new Date().toISOString(),
        accepted_at: '',
        released_at: '',
        assignment_status: 'ACTIVE',
        transfer_reason: '',
        transfer_to_assignment_id: ''
      });
      
      // Update Ticket status
      TicketService.updateTicketStatus(ticket.ticket_id, ticket.status, 'ASSIGNED', userContext);
      
      AuditService.logActivity(userContext.user_id, userContext.role, 'REASSIGN_TEAM', 'Ticket', ticket.ticket_id, payload.old_assignment_id, newAssignmentId, 'Reassigned: ' + payload.transfer_reason);
      
      return { success: true, assignment_id: newAssignmentId };
    } finally {
      lock.releaseLock();
    }
  }
};
