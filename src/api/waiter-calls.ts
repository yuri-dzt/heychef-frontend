import { apiClient } from './client';
import type { CallWaiterEvent } from '../types';

export const waiterCallsApi = {
  list: async (status?: 'OPEN' | 'RESOLVED'): Promise<CallWaiterEvent[]> => {
    const params = status ? { status } : {};
    const response = await apiClient.get('/waiter-calls', { params });
    return response.data;
  },

  resolve: async (id: string): Promise<CallWaiterEvent> => {
    const response = await apiClient.patch(`/waiter-calls/${id}/resolve`);
    return response.data;
  }
};