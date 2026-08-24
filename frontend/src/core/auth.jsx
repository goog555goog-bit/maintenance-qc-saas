import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export function clearAuthSession() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  localStorage.removeItem('auth_token_expiry');
}

export function isTokenExpired() {
  try {
    const expiry = localStorage.getItem('auth_token_expiry');
    if (!expiry) return false;
    return new Date(expiry).getTime() <= Date.now();
  } catch {
    return true;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');
      if (token && storedUser && !isTokenExpired()) {
        return JSON.parse(storedUser);
      }
      clearAuthSession();
      return null;
    } catch {
      clearAuthSession();
      return null;
    }
  });

  const logout = useCallback(() => {
    setUser(null);
    clearAuthSession();
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }, []);

  const login = (userData, token, remember = true) => {
    setUser(userData);
    const durationHours = remember ? 24 * 7 : 8; // 7 days if remember, else 8 hours
    const expiry = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    localStorage.setItem('auth_token_expiry', expiry);
  };

  // Periodic token validation check
  useEffect(() => {
    const checkExpiry = () => {
      const token = localStorage.getItem('auth_token');
      if (token && isTokenExpired()) {
        logout();
      }
    };

    const interval = setInterval(checkExpiry, 15000); // Check every 15s
    window.addEventListener('focus', checkExpiry);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkExpiry);
    };
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, login, logout, clearAuthSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
