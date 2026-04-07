import { apiClient } from './client';

export interface Plan {
  id: string;
  name: string;
  description?: string;
  priceCents: number;
  maxUsers: number;
  maxTables: number;
  maxProducts: number;
  maxCategories: number;
  maxOrdersPerDay: number;
  active: boolean;
  organizationCount?: number;
  createdAt: number;
  updatedAt?: number;
}

export interface CreatePlanRequest {
  name: string;
  description?: string;
  priceCents: number;
  maxUsers: number;
  maxTables: number;
  maxProducts: number;
  maxCategories: number;
  maxOrdersPerDay: number;
}

export type UpdatePlanRequest = Partial<CreatePlanRequest> & { active?: boolean };

export const plansApi = {
  list: async (): Promise<Plan[]> => {
    const response = await apiClient.get('/plans');
    return response.data;
  },

  getById: async (id: string): Promise<Plan> => {
    const response = await apiClient.get(`/plans/${id}`);
    return response.data;
  },

  create: async (data: CreatePlanRequest): Promise<Plan> => {
    const response = await apiClient.post('/plans', data);
    return response.data;
  },

  update: async (id: string, data: UpdatePlanRequest): Promise<Plan> => {
    const response = await apiClient.patch(`/plans/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/plans/${id}`);
  },

  assignToOrg: async (organizationId: string, planId: string): Promise<void> => {
    await apiClient.patch('/plans/assign', { organizationId, planId });
  },
};
