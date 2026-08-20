/**
 * Ticket logic and state machine
 */
const TicketService = {
  createTicket: function(payload, userContext) {
    if (userContext.role !== 'BRANCH_MANAGER' && userContext.role !== 'CENTRAL_ADMIN') {
      throw new Error("Unauthorized to create tickets");
    }
    
    Validation.requireFields(payload, ['branch_id', 'items']);
    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      throw new Error("Ticket must have at least one item");
    }
    
    const db = Database.getInstance();
    const ticketId = Utils.generateTicketId();
    const now = new Date().toISOString();
    
    const ticket = {
      ticket_id: ticketId,
      branch_id: payload.branch_id,
      created_by: userContext.user_id,
      created_at: now,
      status: 'SUBMITTED',
      version: 1
    };
    
    db.insert('Tickets', ticket);
    
    payload.items.forEach((item, index) => {
      db.insert('Ticket_Items', {
        item_id: ticketId + "-ITM-" + (index + 1),
        ticket_id: ticketId,
        description: item.description,
        status: 'PENDING'
      });
    });
    
    AuditService.logActivity(userContext.user_id, userContext.role, 'CREATE_TICKET', 'Ticket', ticketId, null, 'SUBMITTED', 'Ticket created');
    
    // Automatically transition to WAITING_ASSIGNMENT
    this.updateTicketStatus(ticketId, 'SUBMITTED', 'WAITING_ASSIGNMENT', userContext);
    
    return { ticket_id: ticketId };
  },

  updateTicketStatus: function(ticketId, currentStatus, newStatus, userContext) {
    Validation.validateStateTransition(currentStatus, newStatus);
    const db = Database.getInstance();
    
    const tickets = db.query('Tickets', { ticket_id: ticketId });
    if (tickets.length === 0) throw new Error("Ticket not found");
    const ticket = tickets[0];
    
    if (ticket.status !== currentStatus) {
      throw new Error("Concurrent modification detected. Expected " + currentStatus + ", got " + ticket.status);
    }
    
    const newVersion = parseInt(ticket.version) + 1;
    
    db.update('Tickets', 'ticket_id', ticketId, {
      status: newStatus,
      version: newVersion
    });
    
    AuditService.logActivity(userContext.user_id, userContext.role, 'UPDATE_STATUS', 'Ticket', ticketId, currentStatus, newStatus, 'Status updated');
    NotificationService.notify(ticketId, newStatus);
  },

  listTickets: function(payload, userContext) {
    const db = Database.getInstance();
    const allTickets = db.query('Tickets');
    
    // Filter by RBAC
    return allTickets.filter(t => PermissionService.canViewTicket(t, userContext));
  },
  
  getTicket: function(payload, userContext) {
    Validation.requireFields(payload, ['ticket_id']);
    const db = Database.getInstance();
    const tickets = db.query('Tickets', { ticket_id: payload.ticket_id });
    if (tickets.length === 0) throw new Error("Ticket not found");
    
    const ticket = tickets[0];
    if (!PermissionService.canViewTicket(ticket, userContext)) {
      throw new Error("Forbidden");
    }
    
    const items = db.query('Ticket_Items', { ticket_id: ticket.ticket_id });
    ticket.items = items;
    return ticket;
  },

  closeTicket: function(payload, userContext) {
    Validation.requireFields(payload, ['ticket_id', 'satisfaction_score']);
    if (userContext.role !== 'BRANCH_MANAGER' && userContext.role !== 'CENTRAL_ADMIN') {
      throw new Error("Unauthorized to close ticket");
    }

    const db = Database.getInstance();
    const tickets = db.query('Tickets', { ticket_id: payload.ticket_id });
    if (tickets.length === 0) throw new Error("Ticket not found");
    const ticket = tickets[0];

    this.updateTicketStatus(ticket.ticket_id, ticket.status, 'CLOSED', userContext);

    db.insert('Satisfaction_Scores', {
      satisfaction_id: Utils.generateId('SAT'),
      ticket_id: ticket.ticket_id,
      reviewer_id: userContext.user_id,
      score: payload.satisfaction_score,
      comment: payload.comment || '',
      created_at: new Date().toISOString()
    });
    
    return { success: true };
  }
};
