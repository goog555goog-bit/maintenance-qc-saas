/**
 * Caching mechanisms
 */
const CacheServiceWrapper = {
  getFuelRate: function() {
    const cache = CacheService.getScriptCache();
    let rate = cache.get('current_fuel_rate');
    
    if (!rate) {
      const db = Database.getInstance();
      const rates = db.query('Fuel_Rates', { status: 'ACTIVE' });
      if (rates.length > 0) {
        rate = rates[0].rate_per_km;
        cache.put('current_fuel_rate', rate, 3600); // cache for 1 hour
      } else {
        rate = 0; // fallback
      }
    }
    
    return parseFloat(rate);
  }
};
