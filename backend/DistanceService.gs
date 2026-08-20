/**
 * Distance Calculation Service
 */
const DistanceService = {
  calculateStraightLineDistance: function(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  calculateAndStore: function(ticketId, fromGpsId, toGpsId, lat1, lon1, lat2, lon2) {
    const straightDist = this.calculateStraightLineDistance(lat1, lon1, lat2, lon2);
    
    const db = Database.getInstance();
    const distanceId = Utils.generateId('DIST');
    
    db.insert('Distance_Calculations', {
      distance_id: distanceId,
      ticket_id: ticketId,
      from_gps_id: fromGpsId,
      to_gps_id: toGpsId,
      straight_distance_km: straightDist,
      road_distance_km: '', // Requires external API
      calculation_method: 'HAVERSINE',
      calculated_at: new Date().toISOString(),
      calculated_version: 1
    });
    
    return distanceId;
  }
};
