/**
 * Data Archiving Service
 */
const ArchiveService = {
  archiveClosedTickets: function() {
    const db = Database.getInstance();
    const tickets = db.query('Tickets', { status: 'CLOSED' });
    
    tickets.forEach(ticket => {
      // 90 days check ideally
      const ticketData = {
        ticket: ticket,
        items: db.query('Ticket_Items', { ticket_id: ticket.ticket_id }),
        assignments: db.query('Work_Assignments', { ticket_id: ticket.ticket_id }),
        sessions: db.query('Work_Sessions', { ticket_id: ticket.ticket_id }),
        reviews: db.query('Reviews', { ticket_id: ticket.ticket_id }),
        gps: db.query('GPS_Checkins', { ticket_id: ticket.ticket_id })
      };
      
      const archiveId = Utils.generateId('ARC');
      db.insert('Archived_Tickets', {
        archive_id: archiveId,
        ticket_id: ticket.ticket_id,
        archived_at: new Date().toISOString(),
        data_json: JSON.stringify(ticketData)
      });
      
      // Realistically we'd also delete the active rows to save space
      AuditService.logActivity('SYSTEM', 'SYSTEM', 'ARCHIVE_TICKET', 'Ticket', ticket.ticket_id, null, null, 'Ticket archived');
    });
  }
};
