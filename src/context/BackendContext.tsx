import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface BackendContextType {
  backendUrl: string | null;
  setBackendUrl: (url: string) => void;
  clearBackendUrl: () => void;
}

const BackendContext = createContext<BackendContextType | undefined>(undefined);

export const useBackend = () => {
  const context = useContext(BackendContext);
  if (context === undefined) {
    throw new Error('useBackend must be used within a BackendProvider');
  }
  return context;
};

interface BackendProviderProps {
  children: ReactNode;
}

export const BackendProvider: React.FC<BackendProviderProps> = ({ children }) => {
  const [backendUrl, setBackendUrlState] = useState<string | null>(null);

  useEffect(() => {
    const storedUrl = localStorage.getItem('backendUrl');
    if (storedUrl) {
      setBackendUrlState(storedUrl);
    }
  }, []);

  const setBackendUrl = (url: string) => {
    const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    setBackendUrlState(cleanUrl);
    localStorage.setItem('backendUrl', cleanUrl);
  };

  const clearBackendUrl = () => {
    setBackendUrlState(null);
    localStorage.removeItem('backendUrl');
  };

  return (
    <BackendContext.Provider value={{ backendUrl, setBackendUrl, clearBackendUrl }}>
      {children}
    </BackendContext.Provider>
  );
};