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

    // Resolve category/work type name
    let workTypeId = payload.work_type_id || (payload.items[0] && payload.items[0].work_type_id) || '';
    let categoryName = payload.category_name || payload.work_type_name || '';
    if (!categoryName && workTypeId) {
      const wtList = db.query('Work_Types', { work_type_id: workTypeId });
      if (wtList.length > 0) categoryName = wtList[0].work_type_name;
    }
    if (!categoryName && payload.items[0] && payload.items[0].category_name) {
      categoryName = payload.items[0].category_name;
    }
    
    const ticket = {
      ticket_id: ticketId,
      branch_id: payload.branch_id,
      work_type_id: workTypeId,
      work_type_name: categoryName,
      category_name: categoryName,
      overview: Security.sanitizeString(payload.overview || payload.description || ''),
      description: Security.sanitizeString(payload.description || payload.overview || ''),
      priority: payload.priority || 'NORMAL',
      created_by: userContext.user_id,
      created_at: now,
      status: 'SUBMITTED',
      version: 1
    };
    
    db.insert('Tickets', ticket);
    
    payload.items.forEach((item, index) => {
      const itemDesc = item.description || item.detail || '';
      const itemWorkType = item.work_type_id || workTypeId;
      const itemCatName = item.category_name || categoryName;
      db.insert('Ticket_Items', {
        item_id: ticketId + "-ITM-" + (index + 1),
        ticket_id: ticketId,
        work_type_id: itemWorkType,
        category_name: itemCatName,
        detail: Security.sanitizeString(itemDesc),
        description: Security.sanitizeString(itemDesc),
        image_url: item.image_url || '',
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
    
    const newVersion = (parseInt(ticket.version) || 1) + 1;
    
    db.update('Tickets', 'ticket_id', ticketId, {
      status: newStatus,
      version: newVersion
    });
    
    AuditService.logActivity(userContext.user_id, userContext.role, 'UPDATE_STATUS', 'Ticket', ticketId, currentStatus, newStatus, 'Status updated: ' + newStatus);
    try {
      NotificationService.notify(ticketId, newStatus);
    } catch (e) {
      console.warn("Could not send notification: " + e.message);
    }
  },

  listTickets: function(payload, userContext) {
    const db = Database.getInstance();
    const allTickets = db.query('Tickets');
    
    // Lookup caches for high performance
    const branches = db.query('Branches');
    const branchMap = {};
    branches.forEach(b => { branchMap[b.branch_id] = b.branch_name; });

    const workTypes = db.query('Work_Types');
    const workTypeMap = {};
    workTypes.forEach(wt => { workTypeMap[wt.work_type_id] = wt.work_type_name; });

    const assignments = db.query('Work_Assignments');
    const teams = db.query('Teams');
    const teamMap = {};
    teams.forEach(t => { teamMap[t.team_id] = t.team_name; });

    const ticketTeamMap = {};
    assignments.forEach(a => {
      if (a.assignment_status === 'ACTIVE' || !ticketTeamMap[a.ticket_id]) {
        ticketTeamMap[a.ticket_id] = teamMap[a.team_id] || a.team_id;
      }
    });

    const filtered = allTickets.filter(t => PermissionService.canViewTicket(t, userContext));

    return filtered.map(t => {
      const catName = t.category_name || t.work_type_name || workTypeMap[t.work_type_id] || '';
      return Object.assign({}, t, {
        branch_name: branchMap[t.branch_id] || ('สาขา ' + t.branch_id),
        category_name: catName,
        work_type_name: catName,
        team: ticketTeamMap[t.ticket_id] || '',
        team_name: ticketTeamMap[t.ticket_id] || ''
      });
    });
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
    const branches = db.query('Branches', { branch_id: ticket.branch_id });
    const branch = branches[0] || null;
    
    const assignments = db.query('Work_Assignments', { ticket_id: ticket.ticket_id });
    const checkins = db.query('GPS_Checkins', { ticket_id: ticket.ticket_id });
    const reviews = db.query('Reviews', { ticket_id: ticket.ticket_id });
    const sessions = db.query('Work_Sessions', { ticket_id: ticket.ticket_id });
    const satisfactions = db.query('Satisfaction_Scores', { ticket_id: ticket.ticket_id });
    const distances = db.query('Distance_Calculations', { ticket_id: ticket.ticket_id });
    const fuelRate = FuelService.getFuelRate();

    // Active assignment details
    let activeTeamName = '';
    if (assignments.length > 0) {
      const activeAsn = assignments.find(a => a.assignment_status === 'ACTIVE') || assignments[0];
      const teams = db.query('Teams', { team_id: activeAsn.team_id });
      activeTeamName = teams.length > 0 ? teams[0].team_name : activeAsn.team_id;
    }

    // Resolve work type / category name if missing
    let catName = ticket.category_name || ticket.work_type_name || '';
    if (!catName && ticket.work_type_id) {
      const wtList = db.query('Work_Types', { work_type_id: ticket.work_type_id });
      if (wtList.length > 0) catName = wtList[0].work_type_name;
    }
    if (!catName && items.length > 0) {
      catName = items[0].category_name || '';
    }

    return Object.assign({}, ticket, {
      category_name: catName,
      work_type_name: catName,
      items: items,
      branch: branch,
      branch_name: branch ? branch.branch_name : ('สาขา ' + ticket.branch_id),
      team_name: activeTeamName,
      assignments: assignments,
      checkins: checkins,
      distances: distances,
      fuel_rate: fuelRate,
      reviews: reviews,
      sessions: sessions,
      satisfaction: satisfactions.length > 0 ? satisfactions[0] : null
    });
  },

  closeTicket: function(payload, userContext) {
    Validation.requireFields(payload, ['ticket_id']);
    if (userContext.role !== 'BRANCH_MANAGER' && userContext.role !== 'CENTRAL_ADMIN') {
      throw new Error("Unauthorized to close ticket");
    }

    const db = Database.getInstance();
    const tickets = db.query('Tickets', { ticket_id: payload.ticket_id });
    if (tickets.length === 0) throw new Error("Ticket not found");
    const ticket = tickets[0];

    this.updateTicketStatus(ticket.ticket_id, ticket.status, 'CLOSED', userContext);

    if (payload.satisfaction_score !== undefined) {
      db.insert('Satisfaction_Scores', {
        satisfaction_id: Utils.generateId('SAT'),
        ticket_id: ticket.ticket_id,
        reviewer_id: userContext.user_id,
        score: payload.satisfaction_score,
        comment: Security.sanitizeString(payload.comment || ''),
        created_at: new Date().toISOString()
      });
    }
    
    return { success: true };
  }
};
