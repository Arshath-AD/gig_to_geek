import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('gg_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (email, password) => {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);

    const { data: tokenData } = await api.post('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    localStorage.setItem('gg_token', tokenData.access_token);

    const { data: me } = await api.get('/auth/me');
    localStorage.setItem('gg_user', JSON.stringify(me));
    setUser(me);
    return me;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('gg_token');
    localStorage.removeItem('gg_user');
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const { data: updated } = await api.patch('/auth/me', payload);
    localStorage.setItem('gg_user', JSON.stringify(updated));
    setUser(updated);
    return updated;
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
