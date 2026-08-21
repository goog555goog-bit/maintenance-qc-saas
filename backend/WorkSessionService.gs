/**
 * Tracking technician checkin and work sessions
 */
const WorkSessionService = {
  submitWork: function(payload, userContext) {
    Validation.requireFields(payload, ['ticket_id']);
    
    const db = Database.getInstance();
    const tickets = db.query('Tickets', { ticket_id: payload.ticket_id });
    if (tickets.length === 0) throw new Error("Ticket not found");
    const ticket = tickets[0];

    let assignmentId = payload.assignment_id;
    if (!assignmentId) {
      const activeAsn = db.query('Work_Assignments', { ticket_id: payload.ticket_id, assignment_status: 'ACTIVE' });
      assignmentId = activeAsn.length > 0 ? activeAsn[0].assignment_id : '';
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      TicketService.updateTicketStatus(ticket.ticket_id, ticket.status, 'COMPLETED_BY_TECH', userContext);
      
      const sessionId = Utils.generateId('WS');
      const note = payload.technician_note || payload.note || payload.comments || '';
      db.insert('Work_Sessions', {
        session_id: sessionId,
        ticket_id: ticket.ticket_id,
        assignment_id: assignmentId,
        session_no: 1,
        started_at: payload.started_at || '',
        ended_at: new Date().toISOString(),
        work_status: 'SUBMITTED',
        technician_note: Security.sanitizeString(note),
        submitted_at: new Date().toISOString()
      });

      AuditService.logActivity(userContext.user_id, userContext.role, 'SUBMIT_WORK', 'Ticket', ticket.ticket_id, ticket.status, 'COMPLETED_BY_TECH', 'ส่งมอบงานซ่อม: ' + note);
      
      return { success: true, session_id: sessionId };
    } finally {
      lock.releaseLock();
    }
  }
};
