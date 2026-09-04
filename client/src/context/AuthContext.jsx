import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('vibepulse_admin_token') || null);
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('vibepulse_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (authToken, adminData) => {
    setToken(authToken);
    setAdmin(adminData);
    localStorage.setItem('vibepulse_admin_token', authToken);
    localStorage.setItem('vibepulse_admin_user', JSON.stringify(adminData));
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('vibepulse_admin_token');
    localStorage.removeItem('vibepulse_admin_user');
  };

  return (
    <AuthContext.Provider value={{ token, admin, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
