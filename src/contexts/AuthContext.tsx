
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState } from '@/models/types';

interface AuthContextType {
  auth: AuthState;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false, username: null });

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      try {
        setAuth(JSON.parse(storedAuth));
      } catch (error) {
        console.error('Error parsing auth from localStorage', error);
        localStorage.removeItem('auth');
      }
    }
  }, []);

  // Simple login logic (will be replaced with a real API call in production)
  const login = async (username: string, password: string): Promise<boolean> => {
    // For demo purposes, hardcoded credentials
    // In a real app, this would make an API call to verify credentials
    if (username === 'admin' && password === 'admin123') {
      const newAuth = { isAuthenticated: true, username };
      setAuth(newAuth);
      localStorage.setItem('auth', JSON.stringify(newAuth));
      return true;
    }
    return false;
  };

  const logout = () => {
    setAuth({ isAuthenticated: false, username: null });
    localStorage.removeItem('auth');
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
