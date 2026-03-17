import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService, type LoginCredentials, type RegisterData } from '../services/authService';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'professional' | 'admin';
  photoUrl?: string;
  phone?: string;
  avatar?: string;
  addresses?: { id: string; title: string; current?: boolean; address: string }[];
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  role: 'user' | 'professional' | 'admin' | null;
  isLoggingIn: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  switchRole: (role: 'user' | 'professional' | 'admin') => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<'user' | 'professional' | 'admin' | null>(() => {
    return (localStorage.getItem('justme_role') as any) || null;
  });
  const [isLoggingIn, setIsLoggingIn] = useState(true); // start true for initial profile fetch

  // Automatically fetch user profile if token exists
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('justme_token');
      if (token) {
        try {
          const profile = await authService.getProfile();
          setUser(profile);
          setRole(profile.role);
          localStorage.setItem('justme_role', profile.role);
        } catch (error) {
          console.error("Failed to fetch profile automatically", error);
          logout();
        }
      }
      setIsLoggingIn(false);
    };

    initAuth();

    // Listen for unauthorized events from axios interceptor
    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoggingIn(true);
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('justme_token', response.token);
      localStorage.setItem('justme_role', response.user.role);
      setUser(response.user as UserProfile);
      setRole(response.user.role);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoggingIn(true);
    try {
      const response = await authService.register(data);
      localStorage.setItem('justme_token', response.token);
      localStorage.setItem('justme_role', response.user.role);
      setUser(response.user as UserProfile);
      setRole(response.user.role);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('justme_token');
    localStorage.removeItem('justme_role');
  };

  const switchRole = (newRole: 'user' | 'professional' | 'admin') => {
    if (user) {
      setUser({ ...user, role: newRole });
      setRole(newRole);
      localStorage.setItem('justme_role', newRole);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, role, isLoggingIn, login, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
