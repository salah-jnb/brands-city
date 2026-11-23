import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { User } from '@/types';
import { authApi } from '@/services/api';
import { supabase } from '@/lib/supabase';

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

  // La session est persistée et rafraîchie par supabase-js ; on s'y synchronise.
  const applySession = useCallback(async (session: Session | null) => {
    if (!session) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }
    setToken(session.access_token);
    const profile = await authApi.getProfile();
    setUser(profile.data ?? null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => applySession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      // Différé : ne pas appeler Supabase directement dans le callback (risque de blocage)
      setTimeout(() => applySession(session), 0);
    });
    return () => listener.subscription.unsubscribe();
  }, [applySession]);

  const handleAuthResponse = useCallback(
    async (
      call: () => ReturnType<typeof authApi.login>
    ): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      const response = await call();
      setIsLoading(false);

      if (response.error) return { success: false, error: response.error };

      if (response.data) {
        const { token: newToken, email: userEmail, role } = response.data;
        const profile = await authApi.getProfile();
        setToken(newToken);
        setUser(profile.data ?? { id: '', email: userEmail, role: role as 'Client' | 'Admin' });
        return { success: true };
      }
      return { success: false, error: 'Erreur inconnue' };
    },
    []
  );

  const login = useCallback(
    (email: string, password: string) => handleAuthResponse(() => authApi.login(email, password)),
    [handleAuthResponse]
  );

  const register = useCallback(
    (email: string, password: string) => handleAuthResponse(() => authApi.register(email, password)),
    [handleAuthResponse]
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    authApi.logout();
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
