/**
 * Review Management
 */
const ReviewService = {
  reviewWork: function(payload, userContext) {
    Validation.requireFields(payload, ['ticket_id']);
    
    const rawResult = String(payload.result || payload.review_status || '').toUpperCase();
    if (!rawResult) {
      throw new Error("Result is required (APPROVED or REJECTED)");
    }
    
    const reason = payload.reason || payload.comments || '';
    if ((rawResult === 'REJECTED' || rawResult === 'REJECTED_REWORK') && !reason.trim()) {
      throw new Error("Reason is required when rejecting work");
    }
    
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
      const isApprove = rawResult === 'APPROVED';
      const nextState = isApprove ? 'COMPLETED' : 'REJECTED_REWORK';
      TicketService.updateTicketStatus(ticket.ticket_id, ticket.status, nextState, userContext);
      
      const reviewId = Utils.generateId('REV');
      db.insert('Reviews', {
        review_id: reviewId,
        ticket_id: ticket.ticket_id,
        assignment_id: assignmentId,
        reviewer_id: userContext.user_id,
        review_round: 1,
        result: isApprove ? 'APPROVED' : 'REJECTED',
        reason: Security.sanitizeString(reason),
        reviewed_at: new Date().toISOString()
      });
      
      AuditService.logActivity(userContext.user_id, userContext.role, 'REVIEW_WORK', 'Ticket', ticket.ticket_id, ticket.status, nextState, 'Review: ' + (isApprove ? 'ผ่านการตรวจรับ' : 'ส่งกลับแก้ไข: ' + reason));
      
      return { success: true, review_id: reviewId, status: nextState };
    } finally {
      lock.releaseLock();
    }
  }
};
