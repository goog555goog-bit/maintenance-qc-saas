/**
 * Review Management
 */
const ReviewService = {
  reviewWork: function(payload, userContext) {
    if (userContext.role !== 'BRANCH_MANAGER' && userContext.role !== 'CENTRAL_ADMIN') {
      throw new Error("Unauthorized to review work");
    }
    Validation.requireFields(payload, ['ticket_id', 'assignment_id', 'result']);
    
    if (payload.result === 'REJECTED' && !payload.reason) {
      throw new Error("Reason is required when rejecting work");
    }
    
    const db = Database.getInstance();
    const tickets = db.query('Tickets', { ticket_id: payload.ticket_id });
    if (tickets.length === 0) throw new Error("Ticket not found");
    const ticket = tickets[0];
    
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const nextState = payload.result === 'APPROVED' ? 'COMPLETED' : 'REWORK';
      TicketService.updateTicketStatus(ticket.ticket_id, ticket.status, nextState, userContext);
      
      const reviewId = Utils.generateId('REV');
      db.insert('Reviews', {
        review_id: reviewId,
        ticket_id: ticket.ticket_id,
        assignment_id: payload.assignment_id,
        reviewer_id: userContext.user_id,
        review_round: 1, // Simplified, in practice calculate based on existing reviews
        result: payload.result,
        reason: payload.reason || '',
        reviewed_at: new Date().toISOString()
      });
      
      AuditService.logActivity(userContext.user_id, userContext.role, 'REVIEW_WORK', 'Ticket', ticket.ticket_id, ticket.status, nextState, 'Review: ' + payload.result);
      
      return { success: true, review_id: reviewId };
    } finally {
      lock.releaseLock();
    }
  }
};
