import React, {
  useCallback,
  useEffect,
  useState,
  createContext,
  useContext,
} from 'react';
import type { User } from '../types';
import { authApi } from '../api/auth';
import { adminAuthApi } from '../api/admin-auth';

interface LoginData {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('heychef_token')
  );
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('heychef_token');
    localStorage.removeItem('heychef_user');
    localStorage.removeItem('heychef_user_type');
    localStorage.removeItem('heychef_refresh_token');
  }, []);

  const saveSession = (newToken: string, newUser: User, type: 'admin' | 'user') => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('heychef_token', newToken);
    localStorage.setItem('heychef_user', JSON.stringify(newUser));
    localStorage.setItem('heychef_user_type', type);
  };

  // Unified login — tries admin first, then user
  const login = useCallback(async (data: LoginData) => {
    // Try admin login
    try {
      const response = await adminAuthApi.login(data);
      const adminUser: User = {
        id: response.admin.id,
        name: response.admin.name,
        email: response.admin.email,
        type: 'admin',
      };
      saveSession(response.token, adminUser, 'admin');
      localStorage.setItem('heychef_refresh_token', response.refreshToken);
      return;
    } catch {
      // Not an admin, try user login
    }

    // Try user login
    const response = await authApi.login(data);
    const userWithType: User = { ...response.user, type: 'user' };
    saveSession(response.token, userWithType, 'user');
    localStorage.setItem('heychef_refresh_token', response.refreshToken);
  }, []);

  // Restore session on mount
  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      const userType = localStorage.getItem('heychef_user_type');

      try {
        if (userType === 'admin') {
          const admin = await adminAuthApi.getMe();
          setUser({ id: admin.id, name: admin.name, email: admin.email, type: 'admin' });
        } else {
          const currentUser = await authApi.getMe();
          setUser({ ...currentUser, type: 'user' });
        }
      } catch {
        const storedUser = localStorage.getItem('heychef_user');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            logout();
          }
        } else {
          logout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [token, logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        isAdmin: user?.type === 'admin',
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
