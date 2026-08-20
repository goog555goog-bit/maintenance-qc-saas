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
      'SUBMITTED': ['WAITING_ASSIGNMENT'],
      'WAITING_ASSIGNMENT': ['ASSIGNED'],
      'ASSIGNED': ['CHECKED_IN'],
      'CHECKED_IN': ['IN_PROGRESS'],
      'IN_PROGRESS': ['WAITING_REVIEW'],
      'WAITING_REVIEW': ['REWORK', 'COMPLETED'],
      'REWORK': ['IN_PROGRESS', 'WAITING_REVIEW'],
      'COMPLETED': ['CLOSED']
    };
    
    if (!validTransitions[currentState] || validTransitions[currentState].indexOf(newState) === -1) {
      throw new Error("Invalid state transition from " + currentState + " to " + newState);
    }
  }
};
