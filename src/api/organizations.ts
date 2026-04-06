import { apiClient } from './client';
import type { Organization } from '../types';

export const organizationsApi = {
  list: async (): Promise<Organization[]> => {
    const response = await apiClient.get('/organizations');
    return response.data;
  },

  getById: async (id: string): Promise<Organization> => {
    const response = await apiClient.get(`/organizations/${id}`);
    return response.data;
  },

  renewPlan: async (id: string): Promise<Organization> => {
    const response = await apiClient.patch(`/organizations/${id}/renew-plan`);
    return response.data;
  }
};