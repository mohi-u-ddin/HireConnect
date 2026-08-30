import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthCredentials, RegisterPayload, Role, User } from '../types';
import { authService } from '../services/authService';

interface AuthContextValue {
  currentUser: User | null;
  isAuthenticated: boolean;
  role: Role | null;
  isLoading: boolean;
  login: (credentials: AuthCredentials) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
  updateCurrentUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const existing = authService.getCurrentUser();
    setCurrentUser(existing);
    setIsLoading(false);
  }, []);

  const login = async (credentials: AuthCredentials) => {
    const user = await authService.login(credentials);
    setCurrentUser(user);
    return user;
  };

  const register = async (payload: RegisterPayload) => {
    const user = await authService.register(payload);
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const updateCurrentUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('hireflow_user', JSON.stringify(user));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        role: currentUser?.role ?? null,
        isLoading,
        login,
        register,
        logout,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
