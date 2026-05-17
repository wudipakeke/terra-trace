import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { UserProfile, LoginFormData } from '../types/auth';
import { authRepo } from '../dexie/authRepo';
import { authApi } from '../api/auth';

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginFormData) => Promise<void>;
  register: (username: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'terra-trace-auth';
const USER_KEY = 'terra-trace-user';

function generateToken(userId: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600,
  }));
  const signature = btoa(`${header}.${payload}.terra-trace-secret`);
  return `${header}.${payload}.${signature}`;
}

function persistAuth(user: UserProfile, token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Restore session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch {
        clearAuth();
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (data: LoginFormData) => {
    let profile: UserProfile | null = null;

    if (data.method === 'password' && data.account && data.password) {
      profile = await authRepo.validatePassword(data.account, data.password);
      if (!profile) throw new Error('用户名或密码错误');
    } else if (data.method === 'phone' && data.account) {
      profile = await authRepo.autoRegisterPhone(data.account);
    } else {
      throw new Error('登录信息不完整');
    }

    const newToken = generateToken(profile.id);
    setUser(profile);
    setToken(newToken);
    persistAuth(profile, newToken);
  }, []);

  const register = useCallback(async (username: string, password: string, phone?: string) => {
    const existing = await authRepo.findByUsername(username);
    if (existing) throw new Error('用户名已存在');

    const profile = await authRepo.register({ username, phone, password });
    const newToken = generateToken(profile.id);
    setUser(profile);
    setToken(newToken);
    persistAuth(profile, newToken);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    clearAuth();
  }, []);

  const updateUser = useCallback((updates: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{
      user, token, isAuthenticated, isLoading,
      login, register, logout, updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
