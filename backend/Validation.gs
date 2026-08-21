/**
 * Payload and State Validation
 */
const Validation = {
  requireFields: function(payload, fields) {
    fields.forEach(f => {
      if (payload[f] === undefined || payload[f] === null || payload[f] === "") {
        throw new Error("Missing required field: " + f);
      }
    });
  },
  
  validateStateTransition: function(currentState, newState) {
    const validTransitions = {
      'SUBMITTED': ['WAITING_ASSIGNMENT', 'ASSIGNED', 'NEW', 'CANCELLED'],
      'NEW': ['WAITING_ASSIGNMENT', 'ASSIGNED', 'CANCELLED'],
      'WAITING_ASSIGNMENT': ['ASSIGNED', 'CANCELLED', 'IN_PROGRESS'],
      'ASSIGNED': ['CHECKED_IN', 'IN_PROGRESS', 'WAITING_REVIEW', 'COMPLETED_BY_TECH', 'ASSIGNED', 'CANCELLED'],
      'CHECKED_IN': ['IN_PROGRESS', 'WAITING_REVIEW', 'COMPLETED_BY_TECH', 'ASSIGNED'],
      'IN_PROGRESS': ['WAITING_REVIEW', 'COMPLETED_BY_TECH', 'CHECKED_IN', 'ASSIGNED', 'COMPLETED'],
      'WAITING_REVIEW': ['REWORK', 'REJECTED_REWORK', 'COMPLETED', 'CLOSED', 'IN_PROGRESS'],
      'COMPLETED_BY_TECH': ['WAITING_REVIEW', 'REWORK', 'REJECTED_REWORK', 'COMPLETED', 'CLOSED'],
      'REWORK': ['IN_PROGRESS', 'WAITING_REVIEW', 'COMPLETED_BY_TECH', 'ASSIGNED', 'CHECKED_IN'],
      'REJECTED_REWORK': ['IN_PROGRESS', 'WAITING_REVIEW', 'COMPLETED_BY_TECH', 'ASSIGNED', 'CHECKED_IN'],
      'COMPLETED': ['CLOSED', 'REWORK', 'REJECTED_REWORK'],
      'CLOSED': ['ARCHIVED', 'REOPENED', 'WAITING_ASSIGNMENT'],
      'ARCHIVED': []
    };
    
    if (!currentState || !newState) return;
    if (currentState === newState) return; // Idempotent
    
    if (validTransitions[currentState] && validTransitions[currentState].indexOf(newState) === -1) {
      console.warn("Non-standard state transition from " + currentState + " to " + newState);
    }
  }
};
