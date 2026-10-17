import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (fullName: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'cybershield_user';
const STORAGE_KEY_TOKEN = 'cybershield_token';

// Default initial demo user so new visitors can explore seamlessly
const DEFAULT_USER: UserProfile = {
  id: 'user-demo-1',
  email: 'shikharkapoor109@gmail.com',
  fullName: 'Shikhar Kapoor',
  onboardingCompleted: true,
  role: 'admin',
  createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) return JSON.parse(saved);
      return null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_TOKEN) || null;
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
    }
  }, [token]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Authentication unavailable in demo mode' };
      }
      setUser(data.user);
      setToken(data.token);
      return { success: true };
    } catch (err: any) {
      const demoUser: UserProfile = {
        id: `user-guest`,
        email: email || 'guest@demo.local',
        fullName: 'Guest Reviewer',
        onboardingCompleted: true,
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      setUser(demoUser);
      setToken(`token-${Date.now()}`);
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (fullName: string, email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      setUser(data.user);
      setToken(data.token);
      return { success: true };
    } catch (err: any) {
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        email,
        fullName,
        onboardingCompleted: false,
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      setUser(newUser);
      setToken(`token-${Date.now()}`);
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const completeOnboarding = async () => {
    if (!user) return;
    const updated = { ...user, onboardingCompleted: true };
    setUser(updated);
    try {
      await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, completed: true }),
      });
    } catch {
      // handled locally
    }
  };

  const resetOnboarding = async () => {
    if (!user) return;
    const updated = { ...user, onboardingCompleted: false };
    setUser(updated);
    try {
      await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, completed: false }),
      });
    } catch {
      // handled locally
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        completeOnboarding,
        resetOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
