import { createContext, useContext, useState, useCallback } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('notepad_token'));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('notepad_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email, password) => {
    const { data } = await client.post('/api/auth/login', { email, password });
    localStorage.setItem('notepad_token', data.token);
    if (data.user) {
      localStorage.setItem('notepad_user', JSON.stringify(data.user));
      setUser(data.user);
    }
    setToken(data.token);
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await client.post('/api/auth/register', { name, email, password });
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await client.post('/api/auth/logout');
    } catch {
    }
    localStorage.removeItem('notepad_token');
    localStorage.removeItem('notepad_user');
    setToken(null);
    setUser(null);
  }, []);

  const value = { token, user, isAuthenticated: !!token, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider');
  return ctx;
}