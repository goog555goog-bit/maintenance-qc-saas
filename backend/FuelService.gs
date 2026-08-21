/**
 * Fuel Rate and Calculation Service
 */
const FuelService = {
  getFuelRate: function() {
    const db = Database.getInstance();
    const rates = db.query('Fuel_Rates');
    if (rates.length === 0) return 5.0; // Default 5 THB/km fallback
    return Number(rates[rates.length - 1].rate_per_km) || 5.0;
  },

  calculateFuelCost: function(distanceKm) {
    const rate = this.getFuelRate();
    return Number((distanceKm * rate).toFixed(2));
  },

  setFuelRate: function(payload, userContext) {
    if (userContext.role !== 'CENTRAL_ADMIN') {
      throw new Error("Only Admin can set fuel rates");
    }
    Validation.requireFields(payload, ['rate_per_km']);
    
    const db = Database.getInstance();
    const rateId = Utils.generateId('FR');
    const row = {
      rate_id: rateId,
      rate_per_km: Number(payload.rate_per_km),
      effective_from: payload.effective_from || new Date().toISOString().split('T')[0],
      created_by: userContext.user_id,
      created_at: new Date().toISOString()
    };
    
    db.insert('Fuel_Rates', row);
    AuditService.logActivity(userContext.user_id, userContext.role, 'SET_FUEL_RATE', 'Fuel_Rates', rateId, null, row.rate_per_km, 'กำหนดอัตราค่าน้ำมันใหม่: ' + row.rate_per_km + ' บ./กม.');
    
    return { success: true, rate: row };
  },

  adjustFuelAmount: function(payload, userContext) {
    Validation.requireFields(payload, ['ticket_id', 'adjusted_amount', 'reason']);
    
    const db = Database.getInstance();
    const adjustmentId = Utils.generateId('ADJ');
    
    const row = {
      adjustment_id: adjustmentId,
      ticket_id: payload.ticket_id,
      system_distance: payload.system_distance || 0,
      adjusted_distance: payload.adjusted_distance || 0,
      system_amount: payload.system_amount || 0,
      adjusted_amount: Number(payload.adjusted_amount),
      reason: Security.sanitizeString(payload.reason),
      status: 'PENDING',
      adjusted_by: userContext.user_id,
      adjusted_at: new Date().toISOString()
    };

    db.insert('Fuel_Adjustments', row);
    
    AuditService.logActivity(userContext.user_id, userContext.role, 'FUEL_ADJUSTMENT', 'Ticket', payload.ticket_id, payload.system_amount, payload.adjusted_amount, payload.reason);
    
    return { success: true, adjustment_id: adjustmentId };
  }
};
