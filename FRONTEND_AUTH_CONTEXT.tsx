'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getGasApiClient } from '@/lib/gas-api';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const api = getGasApiClient();

  const checkAuth = async (): Promise<boolean> => {
    try {
      const result = await api.verifySession();
      if (result.success && result.data) {
        setUser(result.data as User);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const isAuth = await checkAuth();
      if (!isAuth) {
        api.clearToken();
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      const result = await api.login(username, password);

      if (result.success && result.data) {
        const { token, user: userData } = result.data;
        api.setToken(token);
        setUser(userData as User);
        setLoading(false);
        return { success: true, message: 'Login berhasil' };
      }

      setLoading(false);
      return { success: false, message: result.message || 'Login gagal' };
    } catch (error) {
      setLoading(false);
      return { success: false, message: 'Terjadi kesalahan saat login' };
    }
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
