/**
 * Routes actions to their respective services.
 */
const Router = {
  route: function(action, payload, token) {
    let userContext = null;
    
    // Actions that do not require auth
    const publicActions = [
      'auth.login', 
      'auth.forgotPassword', 
      'auth.resetPassword', 
      'system.ping'
    ];
    
    if (publicActions.indexOf(action) === -1) {
      userContext = Auth.verifyToken(token);
      if (!userContext) {
        throw new Error("Unauthorized");
      }
    }

    switch (action) {
      case 'system.ping':
        return { status: 'OK', message: 'System is online', timestamp: new Date().toISOString() };
        
      case 'auth.login':
        return Auth.login(payload);
      case 'auth.logout':
        return Auth.logout(token);
      case 'auth.forgotPassword':
        return Auth.forgotPassword(payload);
      case 'auth.resetPassword':
        return Auth.resetPassword(payload);
      case 'auth.updateProfile':
        return Auth.updateProfile(payload, userContext);
        
      case 'ticket.create':
        return TicketService.createTicket(payload, userContext);
      case 'ticket.list':
        return TicketService.listTickets(payload, userContext);
      case 'ticket.get':
        return TicketService.getTicket(payload, userContext);
      case 'ticket.assign':
        return AssignmentService.assignTeam(payload, userContext);
      case 'ticket.reassign':
        return ReassignService.reassignTeam(payload, userContext);
      case 'ticket.checkin':
        return GPSService.handleCheckin(payload, userContext);
      case 'ticket.submit':
        return WorkSessionService.submitWork(payload, userContext);
      case 'ticket.review':
        return ReviewService.reviewWork(payload, userContext);
      case 'ticket.close':
        return TicketService.closeTicket(payload, userContext);
        
      case 'user.history':
        return RBAC.getUserHistory(payload, userContext);
        
      default:
        throw new Error("Unknown action: " + action);
    }
  }
};

