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

