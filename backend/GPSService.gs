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

    // Auto-calculate Hop Distance from Previous Check-in / HQ
    try {
      const allCheckins = db.query('GPS_Checkins', { technician_id: userContext.user_id });
      const sortedCheckins = allCheckins.filter(c => c.gps_id !== gpsId).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      
      let fromLat = null, fromLon = null, fromGpsId = 'ORIGIN-HQ';
      if (sortedCheckins.length > 0) {
        const prev = sortedCheckins[0];
        fromLat = Number(prev.latitude);
        fromLon = Number(prev.longitude);
        fromGpsId = prev.gps_id;
      } else {
        // Default Central HQ fallback (e.g. Bangkok Central / First Branch)
        fromLat = Number(payload.latitude) - 0.1; // Default approximate base if first checkin
        fromLon = Number(payload.longitude) - 0.1;
      }

      if (fromLat && fromLon && payload.latitude && payload.longitude) {
        DistanceService.calculateAndStore(
          payload.ticket_id,
          fromGpsId,
          gpsId,
          fromLat,
          fromLon,
          Number(payload.latitude),
          Number(payload.longitude)
        );
      }
    } catch (e) {
      console.warn("Could not calculate hop distance: " + e.message);
    }
    
    AuditService.logActivity(userContext.user_id, userContext.role, 'CHECKIN', 'Ticket', payload.ticket_id, null, checkinType, 'GPS checkin recorded: ' + payload.latitude + ',' + payload.longitude);
    
    return { success: true, gps_id: gpsId };
  }
};
