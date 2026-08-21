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

    const db = Database.getInstance();

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
      case 'auth.changePassword':
        return Auth.changePassword(payload, userContext);

      // ---- Tickets ----
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

      // ---- Branches ----
      case 'branch.list':
        return db.query('Branches');
      case 'branch.get':
        return db.query('Branches', { branch_id: payload.branch_id })[0] || null;
      case 'branch.create': {
        Validation.requireFields(payload, ['branch_name']);
        const branchId = 'BR-' + Utilities.getUuid().slice(0, 8).toUpperCase();
        const row = {
          branch_id: branchId,
          branch_name: Security.sanitizeString(payload.branch_name),
          location_lat: payload.location_lat || '',
          location_lng: payload.location_lng || '',
          address: Security.sanitizeString(payload.address || ''),
          status: 'ACTIVE',
          created_at: new Date().toISOString(),
          created_by: userContext.user_id
        };
        db.insert('Branches', row);
        AuditService.logActivity(userContext.user_id, 'ADMIN', 'CREATE_BRANCH', 'Branches', branchId, null, row, 'เพิ่มสาขาใหม่: ' + row.branch_name);
        return row;
      }
      case 'branch.update': {
        Validation.requireFields(payload, ['branch_id']);
        const updates = {};
        if (payload.branch_name) updates.branch_name = Security.sanitizeString(payload.branch_name);
        if (payload.address !== undefined) updates.address = Security.sanitizeString(payload.address);
        if (payload.location_lat !== undefined) updates.location_lat = payload.location_lat;
        if (payload.location_lng !== undefined) updates.location_lng = payload.location_lng;
        if (payload.status !== undefined) updates.status = payload.status;
        db.update('Branches', 'branch_id', payload.branch_id, updates);
        AuditService.logActivity(userContext.user_id, 'ADMIN', 'UPDATE_BRANCH', 'Branches', payload.branch_id, null, updates, 'อัปเดตข้อมูลสาขา');
        return { success: true };
      }

      // ---- Teams ----
      case 'team.list':
        return db.query('Teams');
      case 'team.get': {
        const team = db.query('Teams', { team_id: payload.team_id })[0] || null;
        if (!team) return null;
        // Get current active members from User_Assignment_History
        const members = db.query('User_Assignment_History', { team_id: payload.team_id })
          .filter(function(a) {
            return !a.effective_to || String(a.effective_to).trim() === '';
          })
          .map(function(a) {
            const u = db.query('Users', { user_id: a.user_id })[0] || {};
            return { user_id: a.user_id, username: u.username || a.user_id, role: u.role || 'TECHNICIAN', assignment_id: a.assignment_id };
          });
        return Object.assign({}, team, { members: members });
      }
      case 'team.create': {
        Validation.requireFields(payload, ['team_name']);
        const teamId = 'TM-' + Utilities.getUuid().slice(0, 8).toUpperCase();
        const row = {
          team_id: teamId,
          team_name: Security.sanitizeString(payload.team_name),
          description: Security.sanitizeString(payload.description || ''),
          status: 'ACTIVE',
          created_at: new Date().toISOString(),
          created_by: userContext.user_id
        };
        db.insert('Teams', row);
        AuditService.logActivity(userContext.user_id, 'ADMIN', 'CREATE_TEAM', 'Teams', teamId, null, row, 'เพิ่มทีมช่างใหม่: ' + row.team_name);
        return row;
      }
      case 'team.update': {
        Validation.requireFields(payload, ['team_id']);
        const updates = {};
        if (payload.team_name) updates.team_name = Security.sanitizeString(payload.team_name);
        if (payload.description !== undefined) updates.description = Security.sanitizeString(payload.description);
        if (payload.status !== undefined) updates.status = payload.status;
        db.update('Teams', 'team_id', payload.team_id, updates);
        return { success: true };
      }
      case 'team.addMember': {
        Validation.requireFields(payload, ['team_id', 'user_id']);
        const assignId = 'UAH-' + Utilities.getUuid().slice(0, 8).toUpperCase();
        db.insert('User_Assignment_History', {
          assignment_id: assignId,
          user_id: payload.user_id,
          role: 'TECHNICIAN',
          branch_id: '',
          team_id: payload.team_id,
          effective_from: new Date().toISOString(),
          effective_to: '',
          assigned_by: userContext.user_id,
          reason: 'เพิ่มสมาชิกทีม'
        });
        return { success: true };
      }
      case 'team.removeMember': {
        Validation.requireFields(payload, ['assignment_id']);
        db.update('User_Assignment_History', 'assignment_id', payload.assignment_id, {
          effective_to: new Date().toISOString()
        });
        return { success: true };
      }

      // ---- Users ----
      case 'user.list':
        return db.query('Users').filter(function(u) {
          if (u.active === undefined || u.active === null || u.active === '') return true;
          const act = String(u.active).trim().toUpperCase();
          return act === 'TRUE' || act === '1' || act === 'ACTIVE';
        }).map(function(u) {
          return { user_id: u.user_id, username: u.username || u.user_id, role: u.role || 'TECHNICIAN', email: u.email || '' };
        });
      case 'user.create': {
        Validation.requireFields(payload, ['user_id', 'role']);
        const existing = db.query('Users', { user_id: payload.user_id });
        if (existing.length > 0) throw new Error('รหัสพนักงานนี้มีอยู่แล้วในระบบ');
        const salt = Security.generateSalt();
        const initialPass = String(payload.user_id).trim();
        const row = {
          user_id: payload.user_id,
          username: Security.sanitizeString(payload.username || payload.user_id),
          email: payload.email || '',
          password_hash: Security.hashPassword(initialPass, salt),
          salt: salt,
          role: payload.role,
          active: 'TRUE'
        };
        db.insert('Users', row);
        AuditService.logActivity(userContext.user_id, 'ADMIN', 'CREATE_USER', 'Users', payload.user_id, null, { role: payload.role }, 'เพิ่มผู้ใช้งานใหม่');
        return { user_id: row.user_id, username: row.username, role: row.role };
      }
      case 'user.update': {
        Validation.requireFields(payload, ['user_id']);
        const updates = {};
        if (payload.username) updates.username = Security.sanitizeString(payload.username);
        if (payload.role) updates.role = payload.role;
        if (payload.active !== undefined) updates.active = String(payload.active);
        db.update('Users', 'user_id', payload.user_id, updates);
        return { success: true };
      }
      case 'user.history':
        return RBAC.getUserHistory(payload, userContext);

      // ---- Work Types ----
      case 'work_type.list': {
        const allTypes = db.query('Work_Types');
        const allItems = db.query('Work_Type_Items');
        return allTypes.map(function(wt) {
          const items = allItems.filter(function(it) {
            const matchId = String(it.work_type_id || '').trim() === String(wt.work_type_id || '').trim();
            const isActive = it.status === undefined || it.status === null || String(it.status).toUpperCase() === 'ACTIVE';
            return matchId && isActive;
          });
          return Object.assign({}, wt, { items: items });
        });
      }
      case 'work_type.create': {
        Validation.requireFields(payload, ['work_type_name']);
        const wtId = 'WT-' + Utilities.getUuid().slice(0, 8).toUpperCase();
        const row = {
          work_type_id: wtId,
          work_type_name: Security.sanitizeString(payload.work_type_name),
          description: Security.sanitizeString(payload.description || ''),
          status: 'ACTIVE',
          created_at: new Date().toISOString()
        };
        db.insert('Work_Types', row);
        return row;
      }
      case 'work_type.update': {
        Validation.requireFields(payload, ['work_type_id']);
        const updates = {};
        if (payload.work_type_name) updates.work_type_name = Security.sanitizeString(payload.work_type_name);
        if (payload.status !== undefined) updates.status = payload.status;
        db.update('Work_Types', 'work_type_id', payload.work_type_id, updates);
        return { success: true };
      }
      case 'work_type.item.create': {
        Validation.requireFields(payload, ['work_type_id']);
        const itemsToAdd = [];
        if (Array.isArray(payload.items)) {
          payload.items.forEach(function(name) {
            if (name && String(name).trim()) itemsToAdd.push(String(name).trim());
          });
        } else if (payload.item_name) {
          const rawNames = String(payload.item_name).split(/[\n,]/);
          rawNames.forEach(function(name) {
            if (name && String(name).trim()) itemsToAdd.push(String(name).trim());
          });
        }

        if (itemsToAdd.length === 0) {
          throw new Error("กรุณาระบุชื่อประเภทย่อยอย่างน้อย 1 รายการ");
        }

        const createdRows = [];
        itemsToAdd.forEach(function(name) {
          const itemId = 'WTI-' + Utilities.getUuid().slice(0, 8).toUpperCase();
          const row = {
            work_type_item_id: itemId,
            work_type_id: payload.work_type_id,
            item_name: Security.sanitizeString(name),
            status: 'ACTIVE'
          };
          db.insert('Work_Type_Items', row);
          createdRows.push(row);
        });

        return { success: true, count: createdRows.length, items: createdRows };
      }
      case 'work_type.item.update': {
        Validation.requireFields(payload, ['work_type_item_id']);
        const updates = {};
        if (payload.item_name) updates.item_name = Security.sanitizeString(payload.item_name);
        if (payload.status !== undefined) updates.status = payload.status;
        db.update('Work_Type_Items', 'work_type_item_id', payload.work_type_item_id, updates);
        return { success: true };
      }
      case 'work_type.item.delete': {
        Validation.requireFields(payload, ['work_type_item_id']);
        db.update('Work_Type_Items', 'work_type_item_id', payload.work_type_item_id, { status: 'INACTIVE' });
        return { success: true };
      }

      // ---- Fuel ----
      case 'fuel.adjust':
        return FuelService.adjustFuelAmount(payload, userContext);
      case 'fuel_rate.get':
        return db.query('Fuel_Rates').slice(-1)[0] || null;
      case 'fuel_rate.list':
        return db.query('Fuel_Rates');
      case 'fuel_rate.set':
        return FuelService.setFuelRate(payload, userContext);
      case 'fuel_review.list':
        return db.query('Fuel_Adjustments').filter(function(r) { return r.status === 'PENDING'; });
      case 'fuel_review.approve': {
        Validation.requireFields(payload, ['adjustment_id']);
        db.update('Fuel_Adjustments', 'adjustment_id', payload.adjustment_id, {
          status: 'APPROVED',
          reviewed_by: userContext.user_id,
          reviewed_at: new Date().toISOString()
        });
        AuditService.logActivity(userContext.user_id, 'MANAGER', 'APPROVE_FUEL', 'Fuel_Adjustments', payload.adjustment_id, 'PENDING', 'APPROVED', 'อนุมัติการขอปรับค่าน้ำมัน');
        return { success: true };
      }
      case 'fuel_review.reject': {
        Validation.requireFields(payload, ['adjustment_id', 'reason']);
        db.update('Fuel_Adjustments', 'adjustment_id', payload.adjustment_id, {
          status: 'REJECTED',
          reject_reason: Security.sanitizeString(payload.reason),
          reviewed_by: userContext.user_id,
          reviewed_at: new Date().toISOString()
        });
        AuditService.logActivity(userContext.user_id, 'MANAGER', 'REJECT_FUEL', 'Fuel_Adjustments', payload.adjustment_id, 'PENDING', 'REJECTED', 'ปฏิเสธการขอปรับค่าน้ำมัน');
        return { success: true };
      }

      // ---- Notifications ----
      case 'notification.list':
        return NotificationService.listNotifications(payload, userContext);
      case 'notification.markRead':
        return NotificationService.markRead(payload, userContext);

      // ---- Reports / Archive ----
      case 'report.summary':
        return TicketService.getReportSummary(payload, userContext);
      case 'archive.list':
        return ArchiveService.listArchived(payload, userContext);

      default:
        throw new Error("Unknown action: " + action);
    }
  }
};
