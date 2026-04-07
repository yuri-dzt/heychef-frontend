import { apiClient } from './client';

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
}

export interface AdminAuthResponse {
  token: string;
  refreshToken: string;
  admin: AdminUser;
}

export const adminAuthApi = {
  login: async (data: AdminLoginRequest): Promise<AdminAuthResponse> => {
    const response = await apiClient.post('/admin/auth/login', data);
    return response.data;
  },

  getMe: async (): Promise<AdminUser> => {
    const response = await apiClient.get('/admin/auth/me');
    return response.data;
  },
};
