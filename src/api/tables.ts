import { apiClient } from './client';
import type { Table } from '../types';

export interface CreateTableRequest {
  name: string;
}

export interface UpdateTableRequest {
  name?: string;
  active?: boolean;
}

export const tablesApi = {
  list: async (): Promise<Table[]> => {
    const response = await apiClient.get('/tables');
    return response.data;
  },

  create: async (data: CreateTableRequest): Promise<Table> => {
    const response = await apiClient.post('/tables', data);
    return response.data;
  },

  update: async (id: string, data: UpdateTableRequest): Promise<Table> => {
    const response = await apiClient.patch(`/tables/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tables/${id}`);
  },

  regenerateToken: async (id: string): Promise<Table> => {
    const response = await apiClient.post(`/tables/${id}/regenerate-token`);
    return response.data;
  }
};