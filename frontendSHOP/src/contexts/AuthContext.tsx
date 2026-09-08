import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { authApi } from '@/services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    const response = await authApi.login(email, password);
    setIsLoading(false);

    if (response.error) {
      return { success: false, error: response.error };
    }

    if (response.data) {
      const { token: newToken, email: userEmail, role } = response.data;
      const newUser: User = { id: 0, email: userEmail, role: role as 'Client' | 'Admin' };
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      return { success: true };
    }

    return { success: false, error: 'Erreur inconnue' };
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    const response = await authApi.register(email, password);
    setIsLoading(false);

    if (response.error) {
      return { success: false, error: response.error };
    }

    if (response.data) {
      const { token: newToken, email: userEmail, role } = response.data;
      const newUser: User = { id: 0, email: userEmail, role: role as 'Client' | 'Admin' };
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      return { success: true };
    }

    return { success: false, error: 'Erreur inconnue' };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'Admin',
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
