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

  getMyOrg: async (): Promise<any> => {
    const response = await apiClient.get('/organizations/me');
    return response.data;
  },

  updateMyOrg: async (data: { name: string }): Promise<Organization> => {
    const response = await apiClient.patch('/organizations/me', data);
    return response.data;
  },

  renewPlan: async (id: string): Promise<Organization> => {
    const response = await apiClient.patch(`/organizations/${id}/renew-plan`);
    return response.data;
  },

  create: async (data: {
    name: string;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
    planId?: string;
  }): Promise<Organization> => {
    const response = await apiClient.post('/organizations', data);
    return response.data;
  },
};