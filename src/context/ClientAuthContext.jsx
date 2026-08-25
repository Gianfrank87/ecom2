import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

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
    const saved = localStorage.getItem('huellitas_client_token');
    if (saved) {
      api.verifyClient(saved)
        .then((data) => {
          setClientToken(saved);
          setClientUser(data.user);
        })
        .catch(() => {
          localStorage.removeItem('huellitas_client_token');
        })
        .finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, []);

  const clientLogin = (token, user) => {
    localStorage.setItem('huellitas_client_token', token);
    setClientToken(token);
    setClientUser(user);
  };

  const clientLogout = () => {
    localStorage.removeItem('huellitas_client_token');
    setClientToken(null);
    setClientUser(null);
  };

  return (
    <ClientAuthContext.Provider value={{ clientToken, clientUser, authLoading, clientLogin, clientLogout }}>
      {children}
    </ClientAuthContext.Provider>
  );
};
