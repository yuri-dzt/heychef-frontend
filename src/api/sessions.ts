import { apiClient } from './client';

export interface Session {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  lastActiveAt: number;
  createdAt: number;
  isCurrent: boolean;
}

export const sessionsApi = {
  list: async (): Promise<Session[]> => {
    const refreshToken = localStorage.getItem('heychef_refresh_token') || '';
    const response = await apiClient.get('/sessions', {
      headers: { 'x-refresh-token': refreshToken },
    });
    return response.data;
  },
  revoke: async (id: string): Promise<void> => {
    await apiClient.delete(`/sessions/${id}`);
  },
  revokeAll: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('heychef_refresh_token') || '';
    await apiClient.delete('/sessions', {
      headers: { 'x-refresh-token': refreshToken },
    });
  },
};
