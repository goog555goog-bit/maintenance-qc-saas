/**
 * Fuel Rate and Calculation Service
 */
const FuelService = {
  calculateFuelCost: function(distanceKm) {
    const rate = CacheService.getFuelRate();
    return distanceKm * rate;
  },

  adjustFuelAmount: function(payload, userContext) {
    if (userContext.role !== 'CENTRAL_ADMIN') {
      throw new Error("Only Admin can adjust fuel amounts");
    }
    Validation.requireFields(payload, ['ticket_id', 'system_distance', 'adjusted_distance', 'system_amount', 'adjusted_amount', 'reason']);
    
    const db = Database.getInstance();
    const adjustmentId = Utils.generateId('ADJ');
    
    db.insert('Fuel_Adjustments', {
      adjustment_id: adjustmentId,
      ticket_id: payload.ticket_id,
      system_distance: payload.system_distance,
      adjusted_distance: payload.adjusted_distance,
      system_amount: payload.system_amount,
      adjusted_amount: payload.adjusted_amount,
      reason: payload.reason,
      adjusted_by: userContext.user_id,
      adjusted_at: new Date().toISOString()
    });
    
    AuditService.logActivity(userContext.user_id, userContext.role, 'FUEL_ADJUSTMENT', 'Ticket', payload.ticket_id, payload.system_amount, payload.adjusted_amount, payload.reason);
    
    return { success: true, adjustment_id: adjustmentId };
  }
};
