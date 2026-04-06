import React, {
  useCallback,
  useEffect,
  useState,
  createContext,
  useContext } from
'react';
import type { User, LoginRequest } from '../types';
import { authApi } from '../api/auth';
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: {children: React.ReactNode;}) {
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
  }, []);
  const login = useCallback(async (data: LoginRequest) => {
    const response = await authApi.login(data);
    const { token: newToken, user: newUser } = response;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('heychef_token', newToken);
    localStorage.setItem('heychef_user', JSON.stringify(newUser));
  }, []);
  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const currentUser = await authApi.getMe();
        setUser(currentUser);
      } catch {
        // If API fails, try to restore from localStorage (mock mode)
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
        login,
        logout
      }}>
      
      {children}
    </AuthContext.Provider>);

}
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}