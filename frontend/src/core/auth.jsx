import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Token expiry check: decode stored expiry and compare
function isTokenExpired() {
  try {
    const expiry = localStorage.getItem('auth_token_expiry');
    if (!expiry) return false;
    return new Date(expiry) < new Date();
  } catch {
    return false;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    if (token && storedUser) {
      if (isTokenExpired()) {
        // Token expired: clear storage and stay logged out
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token_expiry');
      } else {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  const login = (userData, token, remember) => {
    setUser(userData);
    const expiry = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(); // 8 hours
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    localStorage.setItem('auth_token_expiry', expiry);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token_expiry');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
