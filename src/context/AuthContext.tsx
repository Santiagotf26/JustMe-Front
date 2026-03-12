import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { mockCurrentUser, type UserProfile } from '../data/mockData';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  role: 'user' | 'professional' | 'admin' | null;
  isLoggingIn: boolean;
  login: (role: 'user' | 'professional' | 'admin') => Promise<void>;
  logout: () => void;
  switchRole: (role: 'user' | 'professional' | 'admin') => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<'user' | 'professional' | 'admin' | null>(() => {
    return (localStorage.getItem('justme_role') as any) || null;
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Automatically log in using the persisted role if available
  useEffect(() => {
    const savedRole = localStorage.getItem('justme_role') as any;
    if (savedRole) {
      setUser({ ...mockCurrentUser, role: savedRole });
    }
  }, []);

  const login = async (selectedRole: 'user' | 'professional' | 'admin') => {
    setIsLoggingIn(true);
    // Simulate API delay and preloader display time
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setUser({ ...mockCurrentUser, role: selectedRole });
    setRole(selectedRole);
    localStorage.setItem('justme_role', selectedRole);
    setIsLoggingIn(false);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
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
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, role, isLoggingIn, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
