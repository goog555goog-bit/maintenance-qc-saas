/**
 * GPS and Checkin Service
 */
const GPSService = {
  handleCheckin: function(payload, userContext) {
    if (userContext.role !== 'TECHNICIAN') {
      throw new Error("Only technicians can check-in");
    }
    Validation.requireFields(payload, ['ticket_id', 'assignment_id', 'latitude', 'longitude', 'checkin_type']);
    
    const db = Database.getInstance();
    
    // Validate ticket assignment
    const assignments = db.query('Work_Assignments', { assignment_id: payload.assignment_id, technician_id: userContext.user_id });
    if (assignments.length === 0) {
      throw new Error("Invalid assignment for user");
    }
    
    const gpsId = Utils.generateId('GPS');
    db.insert('GPS_Checkins', {
      gps_id: gpsId,
      ticket_id: payload.ticket_id,
      assignment_id: payload.assignment_id,
      technician_id: userContext.user_id,
      checkin_type: payload.checkin_type,
      latitude: payload.latitude,
      longitude: payload.longitude,
      accuracy: payload.accuracy || '',
      device_time: payload.device_time || new Date().toISOString(),
      server_time: new Date().toISOString(),
      source: payload.source || 'APP',
      created_at: new Date().toISOString()
    });
    
    AuditService.logActivity(userContext.user_id, userContext.role, 'CHECKIN', 'Ticket', payload.ticket_id, null, payload.checkin_type, 'GPS checkin recorded');
    
    return { success: true, gps_id: gpsId };
  }
};
