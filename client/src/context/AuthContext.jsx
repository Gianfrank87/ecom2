import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { readStoredValue, removeStoredValue, writeStoredValue } from '../config/storageKeys';

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
    const saved = readStoredValue('adminToken');
    if (saved) {
      api.verifyAdmin(saved)
        .then(() => {
          setAdminToken(saved);
          setIsAdmin(true);
        })
        .catch(() => {
          removeStoredValue('adminToken');
        })
        .finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, []);

  const adminLogin = (token) => {
    writeStoredValue('adminToken', token);
    setAdminToken(token);
    setIsAdmin(true);
  };

  const adminLogout = () => {
    removeStoredValue('adminToken');
    setAdminToken(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ adminToken, isAdmin, authLoading, adminLogin, adminLogout }}>
      {children}
    </AuthContext.Provider>
  );
};
