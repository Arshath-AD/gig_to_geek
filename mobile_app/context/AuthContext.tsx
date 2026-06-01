import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/lib/api';

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  is_superuser: boolean;
  occupation: string | null;
  monthly_income_estimate: number | null;
  created_at: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

export interface RegisterPayload {
  email: string;
  full_name: string;
  password: string;
  occupation?: string | null;
  monthly_income_estimate?: number | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on app start
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('gg_token');
        const raw = await AsyncStorage.getItem('gg_user');
        if (token && raw) setUser(JSON.parse(raw));
      } catch {
        // invalid stored data — clear it
        await AsyncStorage.removeItem('gg_token');
        await AsyncStorage.removeItem('gg_user');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);

    const { data: tokenData } = await api.post('/auth/login', form.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    await AsyncStorage.setItem('gg_token', tokenData.access_token);

    const { data: me } = await api.get('/auth/me');
    await AsyncStorage.setItem('gg_user', JSON.stringify(me));
    setUser(me);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    await api.post('/auth/register', payload);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('gg_token');
    await AsyncStorage.removeItem('gg_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
