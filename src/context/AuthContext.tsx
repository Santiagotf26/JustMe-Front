import { createContext, useContext, useState, type ReactNode } from 'react';
import { mockCurrentUser, type UserProfile } from '../data/mockData';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  role: 'user' | 'professional' | 'admin' | null;
  login: (role: 'user' | 'professional' | 'admin') => void;
  logout: () => void;
  switchRole: (role: 'user' | 'professional' | 'admin') => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<'user' | 'professional' | 'admin' | null>(null);

  const login = (selectedRole: 'user' | 'professional' | 'admin') => {
    setUser({ ...mockCurrentUser, role: selectedRole });
    setRole(selectedRole);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
  };

  const switchRole = (newRole: 'user' | 'professional' | 'admin') => {
    if (user) {
      setUser({ ...user, role: newRole });
      setRole(newRole);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, role, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
