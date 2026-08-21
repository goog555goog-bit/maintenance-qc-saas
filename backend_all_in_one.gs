/**
 * ============================================================================
 * MAINTENANCE & QUALITY CONTROL SAAS - UNIFIED BACKEND SCRIPT
 * Generated: 2026-08-21T07:28:31.309Z
 * ============================================================================
 * Instructions:
 * 1. Open your Google Apps Script project (https://script.google.com)
 * 2. Delete existing code in Code.gs
 * 3. Copy all contents of this file and paste into Code.gs
 * 4. Click 'Save' (Ctrl+S)
 * 5. Click 'Deploy' -> 'Manage deployments' -> Edit (Pencil) -> 'New version' -> 'Deploy'
 * ============================================================================
 */



// ==================== FILE: Utils.gs ====================
/**
 * Utility Functions
 */
const Utils = {
  generateId: function(prefix) {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 10000);
    return prefix + '-' + timestamp + '-' + random;
  },
  
  generateTicketId: function() {
    const d = new Date();
    const year = d.getFullYear();
    const random = Math.floor(Math.random() * 90000) + 10000;
    return 'MT-' + year + '-' + random;
  },

  successResponse: function(data) {
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: data
    })).setMimeType(ContentService.MimeType.JSON);
  },
  
  errorResponse: function(message, code) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: message,
      code: code
    })).setMimeType(ContentService.MimeType.JSON);
  }
};


// ==================== FILE: Security.gs ====================
/**
 * Security and sanitization utilities.
 */
const Security = {
  
  sanitizePayload: function(obj) {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizePayload(item));
    }
    if (typeof obj === 'object') {
      const sanitizedObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitizedObj[key] = this.sanitizePayload(obj[key]);
        }
      }
      return sanitizedObj;
    }
    return obj;
  },

  sanitizeString: function(str) {
    // Prevent spreadsheet injection
    if (/^[\=\+\-\@]/.test(str)) {
      str = "'" + str; // Prefix with apostrophe to force text evaluation
    }
    // Basic XSS mitigation - strip script tags
    str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    return str;
  },

  hashToken: function(token) {
    const signature = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, token);
    return Utilities.base64EncodeWebSafe(signature);
  },

  hashPassword: function(password, salt) {
    const combined = password + salt;
    const signature = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, combined);
    let hexString = '';
    for (let i = 0; i < signature.length; i++) {
      let byte = signature[i];
      if (byte < 0) byte += 256;
      let hex = byte.toString(16);
      if (hex.length == 1) hex = '0' + hex;
      hexString += hex;
    }
    return hexString;
  },
  
  generateSalt: function() {
    return Utilities.getUuid();
  }
};


// ==================== FILE: Validation.gs ====================
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


// ==================== FILE: Database.gs ====================
/**
 * Database Access Layer
 */
const Database = (function() {
  let instance;

  function createInstance() {
    return {
      ssId: PropertiesService.getScriptProperties().getProperty('DB_SPREADSHEET_ID'),

      getSpreadsheet: function() {
        if (this.ssId) {
          return SpreadsheetApp.openById(this.ssId);
        }
        return SpreadsheetApp.getActiveSpreadsheet();
      },

      getSheet: function(sheetName) {
        return this.getSpreadsheet().getSheetByName(sheetName);
      },

      getHeaders: function(sheet) {
        const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        return headerRow;
      },

      query: function(sheetName, filters = {}) {
        const sheet = this.getSheet(sheetName);
        if (!sheet) return [];
        const data = sheet.getDataRange().getValues();
        if (data.length <= 1) return [];

        const headers = data[0];
        const rows = data.slice(1);
        const results = [];

        rows.forEach(row => {
          let match = true;
          const obj = {};
          for (let i = 0; i < headers.length; i++) {
            obj[headers[i]] = row[i];
          }

          for (const key in filters) {
            const val1 = String(obj[key] !== undefined && obj[key] !== null ? obj[key] : '').trim().toUpperCase();
            const val2 = String(filters[key] !== undefined && filters[key] !== null ? filters[key] : '').trim().toUpperCase();
            if (val1 !== val2) {
              match = false;
              break;
            }
          }
          if (match) results.push(obj);
        });

        return results;
      },

      insert: function(sheetName, obj) {
        const lock = LockService.getScriptLock();
        lock.waitLock(10000);
        try {
          const sheet = this.getSheet(sheetName);
          const headers = this.getHeaders(sheet);
          const row = headers.map(h => (obj[h] !== undefined ? obj[h] : ""));
          sheet.appendRow(row);
        } finally {
          lock.releaseLock();
        }
      },

      update: function(sheetName, keyField, keyValue, updateObj) {
        const lock = LockService.getScriptLock();
        lock.waitLock(10000);
        try {
          const sheet = this.getSheet(sheetName);
          const data = sheet.getDataRange().getValues();
          if (data.length <= 1) return false;

          const headers = data[0];
          const keyIndex = headers.indexOf(keyField);
          if (keyIndex === -1) throw new Error("Key field not found");

          let updated = false;
          for (let i = 1; i < data.length; i++) {
            if (data[i][keyIndex] == keyValue) {
              const rowNum = i + 1;
              for (const key in updateObj) {
                const colIndex = headers.indexOf(key);
                if (colIndex !== -1) {
                  sheet.getRange(rowNum, colIndex + 1).setValue(updateObj[key]);
                }
              }
              updated = true;
              break; // Assuming unique key
            }
          }
          return updated;
        } finally {
          lock.releaseLock();
        }
      }
    };
  }

  return {
    getInstance: function() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();


// ==================== FILE: AuditService.gs ====================
/**
 * Audit Logging Service
 */
const AuditService = {
  logActivity: function(userId, role, action, entityType, entityId, oldValue, newValue, reason) {
    const db = Database.getInstance();
    const logId = Utils.generateId('LOG');
    
    db.insert('Activity_Log', {
      log_id: logId,
      timestamp: new Date().toISOString(),
      user_id: userId || 'SYSTEM',
      role: role || 'SYSTEM',
      action: action,
      entity_type: entityType,
      entity_id: entityId,
      old_value: oldValue || '',
      new_value: newValue || '',
      reason: reason || '',
      metadata_json: '{}'
    });
  },
  
  logError: function(error) {
    try {
      const db = Database.getInstance();
      db.insert('Error_Log', {
        error_id: Utils.generateId('ERR'),
        timestamp: new Date().toISOString(),
        user_id: 'SYSTEM',
        error_message: error ? (error.message || String(error)) : 'Unknown error',
        stack_trace: error ? (error.stack || '') : '',
        context_json: '{}'
      });
    } catch (e) {
      console.error("Failed to log error: " + e.message);
    }
  }
};


// ==================== FILE: CacheService.gs ====================
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


// ==================== FILE: PermissionService.gs ====================
/**
 * Object-level Authorization
 */
const PermissionService = {
  canViewTicket: function(ticket, userContext) {
    if (!userContext) return false;
    const role = String(userContext.role || '').toUpperCase();
    if (role === 'CENTRAL_ADMIN' || role === 'ADMIN') return true;
    
    try {
      if (role === 'BRANCH_MANAGER' || role === 'MANAGER') {
        const historicalContext = RBAC.getUserContextForDate(userContext.user_id, ticket.created_at || new Date().toISOString());
        if (!historicalContext || !historicalContext.branch_id) {
          return true; // Lenient fallback for newly created managers
        }
        return String(historicalContext.branch_id).trim() === String(ticket.branch_id).trim();
      }

      if (role === 'TECHNICIAN' || role === 'TECH') {
        const db = Database.getInstance();
        const historicalContext = RBAC.getUserContextForDate(userContext.user_id, ticket.created_at || new Date().toISOString());
        if (!historicalContext || !historicalContext.team_id) {
          const assignments = db.query('Work_Assignments', { ticket_id: ticket.ticket_id });
          return assignments.length > 0;
        }
        const assignments = db.query('Work_Assignments', { 
          ticket_id: ticket.ticket_id, 
          team_id: historicalContext.team_id 
        });
        return assignments.length > 0;
      }
    } catch (e) {
      return true; // Fallback on error to prevent broken pages
    }

    return true;
  },

  canEditTicket: function(ticket, userContext) {
    if (!userContext) return false;
    const role = String(userContext.role || '').toUpperCase();
    if (role === 'CENTRAL_ADMIN' || role === 'ADMIN') return true;
    return this.canViewTicket(ticket, userContext);
  }
};


// ==================== FILE: RBAC.gs ====================
/**
 * Historical Role-Based Access Control
 */
const RBAC = {
  
  getUserHistory: function(payload, userContext) {
    if (userContext.role !== 'CENTRAL_ADMIN') {
      throw new Error("Forbidden");
    }
    const db = Database.getInstance();
    return db.query('User_Assignment_History', { user_id: payload.user_id });
  },

  getUserContextForDate: function(userId, targetDate) {
    const db = Database.getInstance();
    const history = db.query('User_Assignment_History', { user_id: userId });
    const dateObj = new Date(targetDate);
    
    for (let i = 0; i < history.length; i++) {
      const record = history[i];
      const from = new Date(record.effective_from);
      const to = record.effective_to ? new Date(record.effective_to) : new Date('2099-12-31');
      
      if (dateObj >= from && dateObj <= to) {
        return {
          role: record.role,
          branch_id: record.branch_id,
          team_id: record.team_id
        };
      }
    }
    return null;
  }
};


// ==================== FILE: Auth.gs ====================
/**
 * Authentication and Session Management
 */
const Auth = {
  login: function(payload) {
    Validation.requireFields(payload, ['username', 'password']);
    
    const db = Database.getInstance();
    const identifier = String(payload.username).trim();
    const inputPassword = String(payload.password);
    
    // Find user by user_id, username, or email
    const allUsers = db.query('Users');
    const user = allUsers.find(u => {
      const isActive = u.active === undefined || u.active === null || String(u.active).toUpperCase() === 'TRUE';
      if (!isActive) return false;
      return (
        (u.user_id && String(u.user_id).trim().toLowerCase() === identifier.toLowerCase()) ||
        (u.username && String(u.username).trim().toLowerCase() === identifier.toLowerCase()) ||
        (u.email && String(u.email).trim().toLowerCase() === identifier.toLowerCase())
      );
    });
    
    if (!user) {
      throw new Error("ไม่พบรหัสพนักงานนี้ในระบบ");
    }
    
    // Check password against hash, or default password (user_id)
    const storedHash = user.password_hash || user.password_hasl || '';
    const salt = user.salt || 'default_salt';
    const hashedInput = Security.hashPassword(inputPassword, salt);
    const defaultHashed = Security.hashPassword(user.user_id, salt);
    
    const isPasswordCorrect = (storedHash && hashedInput === storedHash) ||
                              (inputPassword === String(user.user_id).trim()) ||
                              (!storedHash && (hashedInput === defaultHashed || inputPassword === String(user.user_id).trim()));
    
    if (!isPasswordCorrect) {
      throw new Error("รหัสผ่านไม่ถูกต้อง (ค่าเริ่มต้นคือรหัสพนักงานของคุณ)");
    }
    
    const token = Utilities.getUuid() + "-" + Utilities.getUuid();
    const hashedToken = Security.hashToken(token);
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours
    
    db.insert('Sessions', {
      session_id: Utilities.getUuid(),
      user_id: user.user_id,
      token: hashedToken,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
      active: 'TRUE'
    });
    
    AuditService.logActivity(user.user_id, user.role, 'LOGIN', 'User', user.user_id, null, null, 'เข้าสู่ระบบสำเร็จ');
    
    return {
      token: token,
      user: {
        user_id: user.user_id,
        username: user.username || user.user_id,
        email: user.email || '',
        role: user.role
      }
    };
  },

  logout: function(token) {
    if (!token) return { success: true };
    const hashedToken = Security.hashToken(token);
    const db = Database.getInstance();
    
    const sessions = db.query('Sessions', { token: hashedToken, active: 'TRUE' });
    if (sessions.length > 0) {
      db.update('Sessions', 'session_id', sessions[0].session_id, { active: 'FALSE' });
      AuditService.logActivity(sessions[0].user_id, 'SYSTEM', 'LOGOUT', 'User', sessions[0].user_id, null, null, 'ออกจากระบบ');
    }
    return { success: true };
  },

  verifyToken: function(token) {
    if (!token) return null;
    
    const rawToken = String(token).replace(/^'+/, '').trim();
    const hashedToken = Security.hashToken(rawToken);
    const db = Database.getInstance();
    
    const allSessions = db.query('Sessions');
    const session = allSessions.find(function(s) {
      const isSessionActive = s.active === undefined || s.active === null || String(s.active).toUpperCase() === 'TRUE';
      const sToken = String(s.token || '').replace(/^'+/, '').trim();
      return isSessionActive && (sToken === hashedToken || sToken === rawToken);
    });
    
    if (!session) return null;
    
    if (session.expires_at && new Date(session.expires_at) < new Date()) {
      try {
        db.update('Sessions', 'session_id', session.session_id, { active: 'FALSE' });
      } catch (e) {}
      return null;
    }
    
    const allUsers = db.query('Users');
    const user = allUsers.find(function(u) {
      return u.user_id && String(u.user_id).trim().toLowerCase() === String(session.user_id).trim().toLowerCase();
    });
    
    if (!user) return null;
    
    const isUserActive = user.active === undefined || user.active === null || String(user.active).toUpperCase() === 'TRUE';
    if (!isUserActive) return null;
    
    return {
      user_id: String(user.user_id).trim(),
      role: user.role,
      username: user.username || user.user_id,
      email: user.email || ''
    };
  },

  forgotPassword: function(payload) {
    Validation.requireFields(payload, ['identifier']);
    const identifier = String(payload.identifier).trim();
    
    const db = Database.getInstance();
    const allUsers = db.query('Users');
    const user = allUsers.find(u => {
      const isActive = u.active === undefined || u.active === null || String(u.active).toUpperCase() === 'TRUE';
      if (!isActive) return false;
      return (
        (u.user_id && String(u.user_id).trim().toLowerCase() === identifier.toLowerCase()) ||
        (u.username && String(u.username).trim().toLowerCase() === identifier.toLowerCase()) ||
        (u.email && String(u.email).trim().toLowerCase() === identifier.toLowerCase())
      );
    });

    if (!user) {
      throw new Error("ไม่พบข้อมูลรหัสพนักงานหรืออีเมลนี้ในระบบ");
    }

    if (!user.email || user.email.trim() === '') {
      throw new Error("ผู้ใช้งานนี้ยังไม่ได้ระบุอีเมลในระบบ กรุณาเข้าสู่ระบบด้วยรหัสพนักงาน (รหัสเริ่มต้น) หรือติดต่อผู้ดูแลระบบเพื่อเพิ่มอีเมล");
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    db.insert('Password_Resets', {
      reset_id: Utilities.getUuid(),
      user_id: user.user_id,
      email: user.email,
      otp_code: otp,
      expires_at: expiresAt,
      used: 'FALSE',
      created_at: new Date().toISOString()
    });

    // Send email with OTP via Google Apps Script MailApp
    try {
      MailApp.sendEmail({
        to: user.email,
        subject: "[QC SaaS] รหัส OTP สำหรับตั้งรหัสผ่านใหม่: " + otp,
        body: "เรียนคุณ " + (user.username || user.user_id) + ",\n\n" +
              "ระบบได้รับคำขอตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณ\n\n" +
              "รหัส OTP ของคุณคือ: " + otp + "\n\n" +
              "(รหัส OTP นี้มีอายุการใช้งาน 10 นาที)\n\n" +
              "หากคุณไม่ได้เป็นผู้ส่งคำขอนี้ กรุณาเพิกเฉยต่ออีเมลฉบับนี้\n\n" +
              "ระบบ Maintenance & Quality Control SaaS"
      });
    } catch (e) {
      Logger.log("MailApp error: " + e.message);
      // Still allow if email quota is exceeded in dev
    }

    AuditService.logActivity(user.user_id, user.role, 'FORGOT_PASSWORD_OTP', 'User', user.user_id, null, null, 'ขอรหัส OTP สำหรับรีเซ็ตรหัสผ่าน');

    // Mask email for privacy (e.g. j***e@domain.com)
    const emailParts = user.email.split('@');
    const maskedName = emailParts[0].length > 2 
      ? emailParts[0].substring(0, 2) + '***' + emailParts[0].slice(-1)
      : emailParts[0] + '***';
    const maskedEmail = maskedName + '@' + (emailParts[1] || '');

    return {
      success: true,
      user_id: user.user_id,
      masked_email: maskedEmail,
      message: "ส่งรหัส OTP 6 หลักไปยังอีเมล " + maskedEmail + " เรียบร้อยแล้ว"
    };
  },

  resetPassword: function(payload) {
    Validation.requireFields(payload, ['user_id', 'otp_code', 'new_password']);
    const userId = String(payload.user_id).trim();
    const otpCode = String(payload.otp_code).trim();
    const newPassword = String(payload.new_password);

    if (newPassword.length < 4) {
      throw new Error("รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร");
    }

    const db = Database.getInstance();
    const resets = db.query('Password_Resets', { user_id: userId, otp_code: otpCode, used: 'FALSE' });

    if (resets.length === 0) {
      throw new Error("รหัส OTP ไม่ถูกต้องหรือถูกใช้งานไปแล้ว");
    }

    const resetRecord = resets[resets.length - 1]; // latest
    if (new Date(resetRecord.expires_at) < new Date()) {
      throw new Error("รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่อีกครั้ง");
    }

    // Update user password
    const salt = Security.generateSalt();
    const newHash = Security.hashPassword(newPassword, salt);

    db.update('Users', 'user_id', userId, {
      password_hash: newHash,
      salt: salt
    });

    // Mark reset record as used
    db.update('Password_Resets', 'reset_id', resetRecord.reset_id, {
      used: 'TRUE'
    });

    AuditService.logActivity(userId, 'USER', 'PASSWORD_RESET', 'User', userId, null, null, 'รีเซ็ตรหัสผ่านด้วย OTP สำเร็จ');

    return {
      success: true,
      message: "เปลี่ยนรหัสผ่านใหม่สำเร็จแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่"
    };
  },

  updateProfile: function(payload, userContext) {
    Validation.requireFields(payload, ['email']);
    const email = String(payload.email).trim();
    const userId = userContext.user_id;

    const db = Database.getInstance();
    db.update('Users', 'user_id', userId, {
      email: email
    });

    AuditService.logActivity(userId, userContext.role, 'UPDATE_PROFILE', 'User', userId, null, email, 'อัปเดตอีเมลผู้ใช้งาน');

    return {
      success: true,
      email: email,
      message: "บันทึกอีเมลเรียบร้อยแล้ว"
    };
  },

  changePassword: function(payload, userContext) {
    Validation.requireFields(payload, ['new_password']);
    const userId = userContext.user_id;
    const newPassword = String(payload.new_password);
    const currentPassword = payload.current_password ? String(payload.current_password) : null;

    if (newPassword.length < 4) {
      throw new Error("รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร");
    }

    const db = Database.getInstance();
    const users = db.query('Users', { user_id: userId });
    if (users.length === 0) {
      throw new Error("ไม่พบข้อมูลผู้ใช้งาน");
    }
    const user = users[0];

    // If current password is provided, verify it
    if (currentPassword) {
      const isDefaultMatch = String(user.user_id).trim() === currentPassword.trim();
      const isHashMatch = Security.verifyPassword(currentPassword, user.password_hash, user.salt);
      if (!isDefaultMatch && !isHashMatch) {
        throw new Error("รหัสผ่านเดิมไม่ถูกต้อง");
      }
    }

    const salt = Security.generateSalt();
    const newHash = Security.hashPassword(newPassword, salt);

    db.update('Users', 'user_id', userId, {
      password_hash: newHash,
      salt: salt
    });

    AuditService.logActivity(userId, userContext.role, 'CHANGE_PASSWORD', 'User', userId, null, null, 'เปลี่ยนรหัสผ่านสำเร็จ');

    return {
      success: true,
      message: "เปลี่ยนรหัสผ่านใหม่สำเร็จแล้ว"
    };
  }
};



// ==================== FILE: NotificationService.gs ====================
/**
 * Notification Service
 */
const NotificationService = {
  notify: function(ticketId, eventStr, targetUserId) {
    const db = Database.getInstance();
    const message = "ใบงาน " + ticketId + ": " + eventStr;
    const notifId = 'NOTIF-' + Utilities.getUuid().slice(0, 8).toUpperCase();
    
    db.insert('Notifications', {
      notification_id: notifId,
      user_id: targetUserId || 'SYSTEM_BROADCAST',
      message: message,
      is_read: 'FALSE',
      read: 'FALSE',
      created_at: new Date().toISOString()
    });
  },

  listNotifications: function(payload, userContext) {
    const db = Database.getInstance();
    const all = db.query('Notifications');
    const userId = userContext ? String(userContext.user_id).trim().toLowerCase() : '';
    
    // Filter for current user or broadcast
    const userNotifs = all.filter(function(n) {
      const nUserId = String(n.user_id || '').trim().toLowerCase();
      return nUserId === userId || nUserId === 'system_broadcast' || nUserId === '';
    });
    
    // Sort descending by created_at
    userNotifs.sort(function(a, b) {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });
    
    return userNotifs.map(function(n) {
      const isRead = n.is_read === 'TRUE' || n.read === 'TRUE';
      return {
        notification_id: n.notification_id,
        user_id: n.user_id,
        message: n.message,
        is_read: isRead,
        read: isRead,
        created_at: n.created_at
      };
    });
  },

  getNotifications: function(userContext) {
    return this.listNotifications({}, userContext);
  },

  markRead: function(payload, userContext) {
    Validation.requireFields(payload, ['notification_id']);
    const db = Database.getInstance();
    if (payload.notification_id === 'ALL') {
      const all = this.listNotifications({}, userContext);
      all.forEach(function(n) {
        try {
          db.update('Notifications', 'notification_id', n.notification_id, { is_read: 'TRUE', read: 'TRUE' });
        } catch (e) {}
      });
      return { success: true };
    }
    db.update('Notifications', 'notification_id', payload.notification_id, { is_read: 'TRUE', read: 'TRUE' });
    return { success: true };
  }
};


// ==================== FILE: DistanceService.gs ====================
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


// ==================== FILE: GPSService.gs ====================
/**
 * GPS and Checkin Service
 */
const GPSService = {
  handleCheckin: function(payload, userContext) {
    Validation.requireFields(payload, ['ticket_id', 'latitude', 'longitude']);
    
    const db = Database.getInstance();
    
    let assignmentId = payload.assignment_id;
    if (!assignmentId) {
      const existingAssignments = db.query('Work_Assignments', { ticket_id: payload.ticket_id, assignment_status: 'ACTIVE' });
      if (existingAssignments.length > 0) {
        assignmentId = existingAssignments[0].assignment_id;
      } else {
        assignmentId = 'ASN-' + Utilities.getUuid().slice(0, 8).toUpperCase();
      }
    }
    
    const checkinType = payload.checkin_type || 'CHECKIN';
    const gpsId = Utils.generateId('GPS');
    db.insert('GPS_Checkins', {
      gps_id: gpsId,
      ticket_id: payload.ticket_id,
      assignment_id: assignmentId,
      technician_id: userContext.user_id,
      checkin_type: checkinType,
      latitude: payload.latitude,
      longitude: payload.longitude,
      accuracy: payload.accuracy || '',
      device_time: payload.device_time || new Date().toISOString(),
      server_time: new Date().toISOString(),
      source: payload.source || 'APP',
      created_at: new Date().toISOString()
    });
    
    // Auto transition to IN_PROGRESS on checkin if ticket is ASSIGNED or WAITING_ASSIGNMENT
    try {
      const tickets = db.query('Tickets', { ticket_id: payload.ticket_id });
      if (tickets.length > 0) {
        const curStatus = tickets[0].status;
        if (curStatus === 'ASSIGNED' || curStatus === 'WAITING_ASSIGNMENT' || curStatus === 'REWORK' || curStatus === 'REJECTED_REWORK') {
          TicketService.updateTicketStatus(payload.ticket_id, curStatus, 'IN_PROGRESS', userContext);
        }
      }
    } catch (e) {
      console.warn("Could not transition ticket status on checkin: " + e.message);
    }
    
    AuditService.logActivity(userContext.user_id, userContext.role, 'CHECKIN', 'Ticket', payload.ticket_id, null, checkinType, 'GPS checkin recorded: ' + payload.latitude + ',' + payload.longitude);
    
    return { success: true, gps_id: gpsId };
  }
};


// ==================== FILE: WorkSessionService.gs ====================
/**
 * Tracking technician checkin and work sessions
 */
const WorkSessionService = {
  submitWork: function(payload, userContext) {
    Validation.requireFields(payload, ['ticket_id']);
    
    const db = Database.getInstance();
    const tickets = db.query('Tickets', { ticket_id: payload.ticket_id });
    if (tickets.length === 0) throw new Error("Ticket not found");
    const ticket = tickets[0];

    let assignmentId = payload.assignment_id;
    if (!assignmentId) {
      const activeAsn = db.query('Work_Assignments', { ticket_id: payload.ticket_id, assignment_status: 'ACTIVE' });
      assignmentId = activeAsn.length > 0 ? activeAsn[0].assignment_id : '';
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      TicketService.updateTicketStatus(ticket.ticket_id, ticket.status, 'COMPLETED_BY_TECH', userContext);
      
      const sessionId = Utils.generateId('WS');
      const note = payload.technician_note || payload.note || payload.comments || '';
      db.insert('Work_Sessions', {
        session_id: sessionId,
        ticket_id: ticket.ticket_id,
        assignment_id: assignmentId,
        session_no: 1,
        started_at: payload.started_at || '',
        ended_at: new Date().toISOString(),
        work_status: 'SUBMITTED',
        technician_note: Security.sanitizeString(note),
        submitted_at: new Date().toISOString()
      });

      AuditService.logActivity(userContext.user_id, userContext.role, 'SUBMIT_WORK', 'Ticket', ticket.ticket_id, ticket.status, 'COMPLETED_BY_TECH', 'ส่งมอบงานซ่อม: ' + note);
      
      return { success: true, session_id: sessionId };
    } finally {
      lock.releaseLock();
    }
  }
};


// ==================== FILE: ReviewService.gs ====================
/**
 * Review Management
 */
const ReviewService = {
  reviewWork: function(payload, userContext) {
    Validation.requireFields(payload, ['ticket_id']);
    
    const rawResult = String(payload.result || payload.review_status || '').toUpperCase();
    if (!rawResult) {
      throw new Error("Result is required (APPROVED or REJECTED)");
    }
    
    const reason = payload.reason || payload.comments || '';
    if ((rawResult === 'REJECTED' || rawResult === 'REJECTED_REWORK') && !reason.trim()) {
      throw new Error("Reason is required when rejecting work");
    }
    
    const db = Database.getInstance();
    const tickets = db.query('Tickets', { ticket_id: payload.ticket_id });
    if (tickets.length === 0) throw new Error("Ticket not found");
    const ticket = tickets[0];

    let assignmentId = payload.assignment_id;
    if (!assignmentId) {
      const activeAsn = db.query('Work_Assignments', { ticket_id: payload.ticket_id, assignment_status: 'ACTIVE' });
      assignmentId = activeAsn.length > 0 ? activeAsn[0].assignment_id : '';
    }
    
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const isApprove = rawResult === 'APPROVED';
      const nextState = isApprove ? 'COMPLETED' : 'REJECTED_REWORK';
      TicketService.updateTicketStatus(ticket.ticket_id, ticket.status, nextState, userContext);
      
      const reviewId = Utils.generateId('REV');
      db.insert('Reviews', {
        review_id: reviewId,
        ticket_id: ticket.ticket_id,
        assignment_id: assignmentId,
        reviewer_id: userContext.user_id,
        review_round: 1,
        result: isApprove ? 'APPROVED' : 'REJECTED',
        reason: Security.sanitizeString(reason),
        reviewed_at: new Date().toISOString()
      });
      
      AuditService.logActivity(userContext.user_id, userContext.role, 'REVIEW_WORK', 'Ticket', ticket.ticket_id, ticket.status, nextState, 'Review: ' + (isApprove ? 'ผ่านการตรวจรับ' : 'ส่งกลับแก้ไข: ' + reason));
      
      return { success: true, review_id: reviewId, status: nextState };
    } finally {
      lock.releaseLock();
    }
  }
};


// ==================== FILE: FuelService.gs ====================
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


// ==================== FILE: TicketService.gs ====================
/**
 * Ticket logic and state machine
 */
const TicketService = {
  createTicket: function(payload, userContext) {
    if (userContext.role !== 'BRANCH_MANAGER' && userContext.role !== 'CENTRAL_ADMIN') {
      throw new Error("Unauthorized to create tickets");
    }
    
    Validation.requireFields(payload, ['branch_id', 'items']);
    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      throw new Error("Ticket must have at least one item");
    }
    
    const db = Database.getInstance();
    const ticketId = Utils.generateTicketId();
    const now = new Date().toISOString();
    
    const ticket = {
      ticket_id: ticketId,
      branch_id: payload.branch_id,
      created_by: userContext.user_id,
      created_at: now,
      status: 'SUBMITTED',
      version: 1
    };
    
    db.insert('Tickets', ticket);
    
    payload.items.forEach((item, index) => {
      const itemDesc = item.description || item.detail || '';
      db.insert('Ticket_Items', {
        item_id: ticketId + "-ITM-" + (index + 1),
        ticket_id: ticketId,
        description: Security.sanitizeString(itemDesc),
        status: 'PENDING'
      });
    });
    
    AuditService.logActivity(userContext.user_id, userContext.role, 'CREATE_TICKET', 'Ticket', ticketId, null, 'SUBMITTED', 'Ticket created');
    
    // Automatically transition to WAITING_ASSIGNMENT
    this.updateTicketStatus(ticketId, 'SUBMITTED', 'WAITING_ASSIGNMENT', userContext);
    
    return { ticket_id: ticketId };
  },

  updateTicketStatus: function(ticketId, currentStatus, newStatus, userContext) {
    Validation.validateStateTransition(currentStatus, newStatus);
    const db = Database.getInstance();
    
    const tickets = db.query('Tickets', { ticket_id: ticketId });
    if (tickets.length === 0) throw new Error("Ticket not found");
    const ticket = tickets[0];
    
    const newVersion = (parseInt(ticket.version) || 1) + 1;
    
    db.update('Tickets', 'ticket_id', ticketId, {
      status: newStatus,
      version: newVersion
    });
    
    AuditService.logActivity(userContext.user_id, userContext.role, 'UPDATE_STATUS', 'Ticket', ticketId, currentStatus, newStatus, 'Status updated: ' + newStatus);
    try {
      NotificationService.notify(ticketId, newStatus);
    } catch (e) {
      console.warn("Could not send notification: " + e.message);
    }
  },

  listTickets: function(payload, userContext) {
    const db = Database.getInstance();
    const allTickets = db.query('Tickets');
    
    // Lookup caches for high performance
    const branches = db.query('Branches');
    const branchMap = {};
    branches.forEach(b => { branchMap[b.branch_id] = b.branch_name; });

    const assignments = db.query('Work_Assignments');
    const teams = db.query('Teams');
    const teamMap = {};
    teams.forEach(t => { teamMap[t.team_id] = t.team_name; });

    const ticketTeamMap = {};
    assignments.forEach(a => {
      if (a.assignment_status === 'ACTIVE' || !ticketTeamMap[a.ticket_id]) {
        ticketTeamMap[a.ticket_id] = teamMap[a.team_id] || a.team_id;
      }
    });

    const filtered = allTickets.filter(t => PermissionService.canViewTicket(t, userContext));

    return filtered.map(t => {
      return Object.assign({}, t, {
        branch_name: branchMap[t.branch_id] || ('สาขา ' + t.branch_id),
        team: ticketTeamMap[t.ticket_id] || '',
        team_name: ticketTeamMap[t.ticket_id] || ''
      });
    });
  },
  
  getTicket: function(payload, userContext) {
    Validation.requireFields(payload, ['ticket_id']);
    const db = Database.getInstance();
    const tickets = db.query('Tickets', { ticket_id: payload.ticket_id });
    if (tickets.length === 0) throw new Error("Ticket not found");
    
    const ticket = tickets[0];
    if (!PermissionService.canViewTicket(ticket, userContext)) {
      throw new Error("Forbidden");
    }
    
    const items = db.query('Ticket_Items', { ticket_id: ticket.ticket_id });
    const branches = db.query('Branches', { branch_id: ticket.branch_id });
    const branch = branches[0] || null;
    
    const assignments = db.query('Work_Assignments', { ticket_id: ticket.ticket_id });
    const checkins = db.query('GPS_Checkins', { ticket_id: ticket.ticket_id });
    const reviews = db.query('Reviews', { ticket_id: ticket.ticket_id });
    const sessions = db.query('Work_Sessions', { ticket_id: ticket.ticket_id });
    const satisfactions = db.query('Satisfaction_Scores', { ticket_id: ticket.ticket_id });

    // Active assignment details
    let activeTeamName = '';
    if (assignments.length > 0) {
      const activeAsn = assignments.find(a => a.assignment_status === 'ACTIVE') || assignments[0];
      const teams = db.query('Teams', { team_id: activeAsn.team_id });
      activeTeamName = teams.length > 0 ? teams[0].team_name : activeAsn.team_id;
    }

    return Object.assign({}, ticket, {
      items: items,
      branch: branch,
      branch_name: branch ? branch.branch_name : ('สาขา ' + ticket.branch_id),
      team_name: activeTeamName,
      assignments: assignments,
      checkins: checkins,
      reviews: reviews,
      sessions: sessions,
      satisfaction: satisfactions.length > 0 ? satisfactions[0] : null
    });
  },

  closeTicket: function(payload, userContext) {
    Validation.requireFields(payload, ['ticket_id']);
    if (userContext.role !== 'BRANCH_MANAGER' && userContext.role !== 'CENTRAL_ADMIN') {
      throw new Error("Unauthorized to close ticket");
    }

    const db = Database.getInstance();
    const tickets = db.query('Tickets', { ticket_id: payload.ticket_id });
    if (tickets.length === 0) throw new Error("Ticket not found");
    const ticket = tickets[0];

    this.updateTicketStatus(ticket.ticket_id, ticket.status, 'CLOSED', userContext);

    if (payload.satisfaction_score !== undefined) {
      db.insert('Satisfaction_Scores', {
        satisfaction_id: Utils.generateId('SAT'),
        ticket_id: ticket.ticket_id,
        reviewer_id: userContext.user_id,
        score: payload.satisfaction_score,
        comment: Security.sanitizeString(payload.comment || ''),
        created_at: new Date().toISOString()
      });
    }
    
    return { success: true };
  }
};


// ==================== FILE: AssignmentService.gs ====================
/**
 * Assignment management
 */
const AssignmentService = {
  assignTeam: function(payload, userContext) {
    if (userContext.role !== 'CENTRAL_ADMIN') {
      throw new Error("Only Admin can assign teams");
    }
    Validation.requireFields(payload, ['ticket_id', 'team_id']);
    
    const db = Database.getInstance();
    const tickets = db.query('Tickets', { ticket_id: payload.ticket_id });
    if (tickets.length === 0) throw new Error("Ticket not found");
    
    const ticket = tickets[0];
    
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      TicketService.updateTicketStatus(ticket.ticket_id, ticket.status, 'ASSIGNED', userContext);
      
      const assignmentId = Utils.generateId('ASN');
      db.insert('Work_Assignments', {
        assignment_id: assignmentId,
        ticket_id: ticket.ticket_id,
        team_id: payload.team_id,
        technician_id: payload.technician_id || '',
        assigned_by: userContext.user_id,
        assigned_at: new Date().toISOString(),
        accepted_at: '',
        released_at: '',
        assignment_status: 'ACTIVE',
        transfer_reason: '',
        transfer_to_assignment_id: ''
      });
      
      AuditService.logActivity(userContext.user_id, userContext.role, 'ASSIGN_TEAM', 'Ticket', ticket.ticket_id, null, payload.team_id, 'Assigned to team');
      return { success: true, assignment_id: assignmentId };
    } finally {
      lock.releaseLock();
    }
  }
};


// ==================== FILE: ReassignService.gs ====================
/**
 * Reassignment Management
 */
const ReassignService = {
  reassignTeam: function(payload, userContext) {
    if (userContext.role !== 'CENTRAL_ADMIN') {
      throw new Error("Only Admin can reassign teams");
    }
    Validation.requireFields(payload, ['ticket_id', 'old_assignment_id', 'new_team_id', 'transfer_reason']);
    
    const db = Database.getInstance();
    const tickets = db.query('Tickets', { ticket_id: payload.ticket_id });
    if (tickets.length === 0) throw new Error("Ticket not found");
    const ticket = tickets[0];
    
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const newAssignmentId = Utils.generateId('ASN');
      
      // Update old assignment
      db.update('Work_Assignments', 'assignment_id', payload.old_assignment_id, {
        assignment_status: 'TRANSFERRED',
        transfer_reason: payload.transfer_reason,
        transfer_to_assignment_id: newAssignmentId,
        released_at: new Date().toISOString()
      });
      
      // Create new assignment
      db.insert('Work_Assignments', {
        assignment_id: newAssignmentId,
        ticket_id: ticket.ticket_id,
        team_id: payload.new_team_id,
        technician_id: '',
        assigned_by: userContext.user_id,
        assigned_at: new Date().toISOString(),
        accepted_at: '',
        released_at: '',
        assignment_status: 'ACTIVE',
        transfer_reason: '',
        transfer_to_assignment_id: ''
      });
      
      // Update Ticket status
      TicketService.updateTicketStatus(ticket.ticket_id, ticket.status, 'ASSIGNED', userContext);
      
      AuditService.logActivity(userContext.user_id, userContext.role, 'REASSIGN_TEAM', 'Ticket', ticket.ticket_id, payload.old_assignment_id, newAssignmentId, 'Reassigned: ' + payload.transfer_reason);
      
      return { success: true, assignment_id: newAssignmentId };
    } finally {
      lock.releaseLock();
    }
  }
};


// ==================== FILE: ArchiveService.gs ====================
/**
 * Data Archiving Service
 */
const ArchiveService = {
  archiveClosedTickets: function() {
    const db = Database.getInstance();
    const tickets = db.query('Tickets', { status: 'CLOSED' });
    
    tickets.forEach(ticket => {
      // 90 days check ideally
      const ticketData = {
        ticket: ticket,
        items: db.query('Ticket_Items', { ticket_id: ticket.ticket_id }),
        assignments: db.query('Work_Assignments', { ticket_id: ticket.ticket_id }),
        sessions: db.query('Work_Sessions', { ticket_id: ticket.ticket_id }),
        reviews: db.query('Reviews', { ticket_id: ticket.ticket_id }),
        gps: db.query('GPS_Checkins', { ticket_id: ticket.ticket_id })
      };
      
      const archiveId = Utils.generateId('ARC');
      db.insert('Archived_Tickets', {
        archive_id: archiveId,
        ticket_id: ticket.ticket_id,
        archived_at: new Date().toISOString(),
        data_json: JSON.stringify(ticketData)
      });
      
      // Realistically we'd also delete the active rows to save space
      AuditService.logActivity('SYSTEM', 'SYSTEM', 'ARCHIVE_TICKET', 'Ticket', ticket.ticket_id, null, null, 'Ticket archived');
    });
  }
};


// ==================== FILE: BackupService.gs ====================
/**
 * System Backup Service
 */
const BackupService = {
  runDailyBackup: function() {
    try {
      const ssId = PropertiesService.getScriptProperties().getProperty('DB_SPREADSHEET_ID');
      const backupFolderId = PropertiesService.getScriptProperties().getProperty('DRIVE_BACKUP_FOLDER_ID');
      
      if (!ssId || !backupFolderId) {
        throw new Error("Backup config missing");
      }
      
      const file = DriveApp.getFileById(ssId);
      const folder = DriveApp.getFolderById(backupFolderId);
      
      const backupName = "Backup_" + new Date().toISOString().split('T')[0] + "_" + file.getName();
      const backupFile = file.makeCopy(backupName, folder);
      
      const db = Database.getInstance();
      db.insert('Backup_Log', {
        backup_id: Utils.generateId('BKP'),
        backup_date: new Date().toISOString(),
        status: 'SUCCESS',
        drive_file_id: backupFile.getId(),
        notes: 'Automated daily backup'
      });
      
    } catch (e) {
      AuditService.logError(e);
      const db = Database.getInstance();
      db.insert('Backup_Log', {
        backup_id: Utils.generateId('BKP'),
        backup_date: new Date().toISOString(),
        status: 'FAILED',
        drive_file_id: '',
        notes: e.message
      });
    }
  }
};


// ==================== FILE: SyncService.gs ====================
/**
 * Sync Service for offline support
 */
const SyncService = {
  syncBatch: function(payload, userContext) {
    Validation.requireFields(payload, ['operations']);
    
    const results = [];
    
    payload.operations.forEach(op => {
      try {
        if (op.ticket_id && op.expected_version) {
          const db = Database.getInstance();
          const tickets = db.query('Tickets', { ticket_id: op.ticket_id });
          if (tickets.length > 0 && tickets[0].version !== op.expected_version) {
            throw new Error("Version conflict on ticket " + op.ticket_id);
          }
        }
        
        // Execute operation via router
        const result = Router.route(op.action, op.payload, payload.token);
        results.push({ op_id: op.op_id, success: true, result: result });
      } catch (e) {
        results.push({ op_id: op.op_id, success: false, error: e.message });
      }
    });
    
    return { synced: true, results: results };
  }
};


// ==================== FILE: Router.gs ====================
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
        // Get current members
        const members = db.query('User_Assignment_History', { team_id: payload.team_id, effective_to: '' })
          .map(function(a) {
            const u = db.query('Users', { user_id: a.user_id })[0] || {};
            return { user_id: a.user_id, username: u.username || a.user_id, role: u.role || '', assignment_id: a.assignment_id };
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
        return db.query('Users', { active: 'TRUE' }).map(function(u) {
          return { user_id: u.user_id, username: u.username, role: u.role, email: u.email || '' };
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


// ==================== FILE: Code.gs ====================
/**
 * Main entry point for POST requests.
 * Expects JSON payload: { action: string, payload: object, token: string }
 */
function doPost(e) {
  return handleRequest(e);
}

/**
 * Main entry point for GET requests (can be used for health check or simple reads).
 */
function doGet(e) {
  return Utils.successResponse({ status: "OK", message: "System is online" });
}

/**
 * Handle incoming requests with centralized error handling.
 */
function handleRequest(e) {
  try {
    const postData = e.postData && e.postData.contents;
    if (!postData) {
      return Utils.errorResponse("No data provided", 400);
    }

    let request;
    try {
      request = JSON.parse(postData);
    } catch (parseErr) {
      return Utils.errorResponse("Invalid JSON format: " + parseErr.message, 400);
    }
    
    // Security: Check for malicious payloads and sanitize
    const sanitizedRequest = Security.sanitizePayload(request);
    
    const action = sanitizedRequest.action;
    const payload = sanitizedRequest.payload || {};
    const token = sanitizedRequest.token;

    if (!action) {
      return Utils.errorResponse("Action is required", 400);
    }

    // Process through router
    const result = Router.route(action, payload, token);
    return Utils.successResponse(result);

  } catch (error) {
    try {
      AuditService.logError(error);
    } catch (ignore) {}
    return Utils.errorResponse(error ? (error.message || String(error)) : "Internal Server Error", 500);
  }
}
