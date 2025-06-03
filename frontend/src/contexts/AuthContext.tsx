import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, LoginData, RegisterData, AuthContextType } from '../types/Auth';
import { authService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se há token salvo no localStorage
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      // Verificar se o token é válido
      validateToken(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      const response = await authService.getCurrentUser(token);
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        // Token inválido
        logout();
      }
    } catch (error) {
      // Token inválido
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (loginData: LoginData) => {
    setIsLoading(true);
    try {
      const response = await authService.login(loginData);
      if (response.success && response.data) {
        setUser(response.data.user);
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
      } else {
        throw new Error(response.message || 'Erro ao fazer login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (registerData: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await authService.register(registerData);
      if (response.success && response.data) {
        setUser(response.data.user);
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
      } else {
        throw new Error(response.message || 'Erro ao registrar');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const refreshToken = async () => {
    if (!token) return;
    
    try {
      const response = await authService.refreshToken(token);
      if (response.success && response.data) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
      }
    } catch (error) {
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}