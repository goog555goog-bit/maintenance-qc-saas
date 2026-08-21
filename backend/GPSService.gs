/**
 * GPS and Checkin Service
 */
const GPSService = {
  handleCheckin: function(payload, userContext) {
    Validation.requireFields(payload, ['ticket_id', 'latitude', 'longitude']);
    
    const db = Database.getInstance();
    
    let assignmentId = payload.assignment_id;
    if (!assignmentId) {
      const existingAssignments = db.query('Work_Assignments', { ticket_id: payload.ticket_id, assignment_status: 'ACTIVE' });
      if (existingAssignments.length > 0) {
        assignmentId = existingAssignments[0].assignment_id;
      } else {
        assignmentId = 'ASN-' + Utilities.getUuid().slice(0, 8).toUpperCase();
      }
    }
    
    const checkinType = payload.checkin_type || 'CHECKIN';
    const gpsId = Utils.generateId('GPS');
    db.insert('GPS_Checkins', {
      gps_id: gpsId,
      ticket_id: payload.ticket_id,
      assignment_id: assignmentId,
      technician_id: userContext.user_id,
      checkin_type: checkinType,
      latitude: payload.latitude,
      longitude: payload.longitude,
      accuracy: payload.accuracy || '',
      device_time: payload.device_time || new Date().toISOString(),
      server_time: new Date().toISOString(),
      source: payload.source || 'APP',
      created_at: new Date().toISOString()
    });
    
    // Auto transition to IN_PROGRESS on checkin if ticket is ASSIGNED or WAITING_ASSIGNMENT
    try {
      const tickets = db.query('Tickets', { ticket_id: payload.ticket_id });
      if (tickets.length > 0) {
        const curStatus = tickets[0].status;
        if (curStatus === 'ASSIGNED' || curStatus === 'WAITING_ASSIGNMENT' || curStatus === 'REWORK' || curStatus === 'REJECTED_REWORK') {
          TicketService.updateTicketStatus(payload.ticket_id, curStatus, 'IN_PROGRESS', userContext);
        }
      }
    } catch (e) {
      console.warn("Could not transition ticket status on checkin: " + e.message);
    }
    
    AuditService.logActivity(userContext.user_id, userContext.role, 'CHECKIN', 'Ticket', payload.ticket_id, null, checkinType, 'GPS checkin recorded: ' + payload.latitude + ',' + payload.longitude);
    
    return { success: true, gps_id: gpsId };
  }
};
