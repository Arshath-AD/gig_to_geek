import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';

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

  // Refresh user profile from server on every app load
  // so admin-toggled flags (has_ai_access, etc.) are always current
  useEffect(() => {
    const token = localStorage.getItem('gg_token');
    if (!token) return;
    authService.getMe()
      .then((fresh) => {
        localStorage.setItem('gg_user', JSON.stringify(fresh));
        setUser(fresh);
      })
      .catch(() => {
        // Token expired / invalid — clear session
        localStorage.removeItem('gg_token');
        localStorage.removeItem('gg_user');
        setUser(null);
      });
  }, []);

  const login = useCallback(async (email, password) => {
    const tokenData = await authService.login(email, password);
    localStorage.setItem('gg_token', tokenData.access_token);

    const me = await authService.getMe();
    localStorage.setItem('gg_user', JSON.stringify(me));
    setUser(me);
    return me;
  }, []);

  const register = useCallback(async (payload) => {
    return await authService.register(payload);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('gg_token');
    localStorage.removeItem('gg_user');
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const updated = await profileService.updateProfile(payload);
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
