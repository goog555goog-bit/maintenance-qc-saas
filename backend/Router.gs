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

      // Branch master data
      case 'branch.list':
        return Database.getInstance().query('Branches', { status: 'ACTIVE' });
      case 'branch.get':
        return Database.getInstance().query('Branches', { branch_id: payload.branch_id })[0] || null;

      // Team master data
      case 'team.list':
        return Database.getInstance().query('Teams', { status: 'ACTIVE' });
      case 'team.get':
        return Database.getInstance().query('Teams', { team_id: payload.team_id })[0] || null;

      // User / Technician list
      case 'user.list':
        return Database.getInstance().query('Users', { active: 'TRUE' }).map(function(u) {
          return { user_id: u.user_id, username: u.username, role: u.role, email: u.email };
        });
      case 'user.history':
        return RBAC.getUserHistory(payload, userContext);

      // Work type / Category master data
      case 'work_type.list':
        return Database.getInstance().query('Work_Types', { status: 'ACTIVE' });

      // Fuel
      case 'fuel.adjust':
        return FuelService.adjustFuelAmount(payload, userContext);
      case 'fuel_rate.get':
        return Database.getInstance().query('Fuel_Rates').slice(-1)[0] || null;
      case 'fuel_rate.list':
        return Database.getInstance().query('Fuel_Rates');
      case 'fuel_rate.set':
        return FuelService.setFuelRate(payload, userContext);

      // Notifications
      case 'notification.list':
        return NotificationService.listNotifications(payload, userContext);
      case 'notification.markRead':
        return NotificationService.markRead(payload, userContext);

      // Reports / Archive
      case 'report.summary':
        return TicketService.getReportSummary(payload, userContext);
      case 'archive.list':
        return ArchiveService.listArchived(payload, userContext);

      default:
        throw new Error("Unknown action: " + action);
    }
  }
};

