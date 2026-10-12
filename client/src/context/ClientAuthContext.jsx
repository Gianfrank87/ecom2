import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { readStoredValue, removeStoredValue, writeStoredValue } from '../config/storageKeys';

const ClientAuthContext = createContext();

export const useClientAuth = () => {
  const context = useContext(ClientAuthContext);
  if (!context) throw new Error('useClientAuth must be used within a ClientAuthProvider');
  return context;
};

export const ClientAuthProvider = ({ children }) => {
  const [clientToken, setClientToken] = useState(null);
  const [clientUser, setClientUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // On mount: restore token from localStorage and verify it
  useEffect(() => {
    removeStoredValue('adminToken');
    const saved = readStoredValue('clientToken');
    if (saved) {
      api.verifyClient(saved)
        .then((data) => {
          setClientToken(saved);
          setClientUser(data.user);
        })
        .catch(() => {
          removeStoredValue('clientToken');
        })
        .finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, []);

  const clientLogin = (token, user) => {
    writeStoredValue('clientToken', token);
    setClientToken(token);
    setClientUser(user);
  };

  const clientLogout = () => {
    removeStoredValue('clientToken');
    setClientToken(null);
    setClientUser(null);
  };

  const isAdmin = clientUser?.role === 'admin';

  return (
    <ClientAuthContext.Provider value={{ clientToken, clientUser, isAdmin, authLoading, clientLogin, clientLogout }}>
      {children}
    </ClientAuthContext.Provider>
  );
};
