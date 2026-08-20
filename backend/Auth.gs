/**
 * Authentication and Session Management
 */
const Auth = {
  login: function(payload) {
    Validation.requireFields(payload, ['username', 'password']);
    
    const db = Database.getInstance();
    const userRecords = db.query('Users', { username: payload.username, active: 'TRUE' });
    
    if (userRecords.length === 0) {
      throw new Error("Invalid credentials");
    }
    
    const user = userRecords[0];
    const hashedInput = Security.hashPassword(payload.password, user.salt);
    
    if (hashedInput !== user.password_hash) {
      throw new Error("Invalid credentials");
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
    
    AuditService.logActivity(user.user_id, user.role, 'LOGIN', 'User', user.user_id, null, null, 'Successful login');
    
    return {
      token: token,
      user: {
        user_id: user.user_id,
        username: user.username,
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
      AuditService.logActivity(sessions[0].user_id, 'SYSTEM', 'LOGOUT', 'User', sessions[0].user_id, null, null, 'User logged out');
    }
    return { success: true };
  },

  verifyToken: function(token) {
    if (!token) return null;
    
    const hashedToken = Security.hashToken(token);
    const db = Database.getInstance();
    const sessions = db.query('Sessions', { token: hashedToken, active: 'TRUE' });
    
    if (sessions.length === 0) return null;
    
    const session = sessions[0];
    if (new Date(session.expires_at) < new Date()) {
      db.update('Sessions', 'session_id', session.session_id, { active: 'FALSE' });
      return null;
    }
    
    const users = db.query('Users', { user_id: session.user_id, active: 'TRUE' });
    if (users.length === 0) return null;
    
    const user = users[0];
    return {
      user_id: user.user_id,
      role: user.role,
      username: user.username
    };
  }
};
