import { apiRequest } from './api';
import { 
  LoginData, 
  RegisterData, 
  AuthResponse, 
  User 
} from '../types/Auth';

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const { confirmPassword, ...registerData } = data;
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerData),
    });
  },

  async getCurrentUser(token: string): Promise<{ success: boolean; data?: User; message?: string }> {
    return apiRequest<{ success: boolean; data?: User; message?: string }>('/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  async refreshToken(token: string): Promise<{ success: boolean; data?: { token: string }; message?: string }> {
    return apiRequest<{ success: boolean; data?: { token: string }; message?: string }>('/auth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};