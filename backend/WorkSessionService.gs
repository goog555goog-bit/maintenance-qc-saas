/**
 * Tracking technician checkin and work sessions
 */
const WorkSessionService = {
  submitWork: function(payload, userContext) {
    if (userContext.role !== 'TECHNICIAN') {
      throw new Error("Only technicians can submit work");
    }
    Validation.requireFields(payload, ['ticket_id', 'assignment_id', 'technician_note']);
    
    const db = Database.getInstance();
    const tickets = db.query('Tickets', { ticket_id: payload.ticket_id });
    if (tickets.length === 0) throw new Error("Ticket not found");
    const ticket = tickets[0];

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      TicketService.updateTicketStatus(ticket.ticket_id, ticket.status, 'WAITING_REVIEW', userContext);
      
      const sessionId = Utils.generateId('WS');
      db.insert('Work_Sessions', {
        session_id: sessionId,
        ticket_id: ticket.ticket_id,
        assignment_id: payload.assignment_id,
        session_no: 1, // simplified
        started_at: '', // from checkin theoretically
        ended_at: new Date().toISOString(),
        work_status: 'SUBMITTED',
        technician_note: payload.technician_note,
        submitted_at: new Date().toISOString()
      });
      
      return { success: true, session_id: sessionId };
    } finally {
      lock.releaseLock();
    }
  }
};
