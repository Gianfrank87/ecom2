import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [adminToken, setAdminToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // On mount: restore token from localStorage and verify it
  useEffect(() => {
    const saved = localStorage.getItem('huellitas_admin_token');
    if (saved) {
      api.verifyAdmin(saved)
        .then(() => {
          setAdminToken(saved);
          setIsAdmin(true);
        })
        .catch(() => {
          localStorage.removeItem('huellitas_admin_token');
        })
        .finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, []);

  const adminLogin = (token) => {
    localStorage.setItem('huellitas_admin_token', token);
    setAdminToken(token);
    setIsAdmin(true);
  };

  const adminLogout = () => {
    localStorage.removeItem('huellitas_admin_token');
    setAdminToken(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ adminToken, isAdmin, authLoading, adminLogin, adminLogout }}>
      {children}
    </AuthContext.Provider>
  );
};
