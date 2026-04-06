import { apiClient } from './client';
import type { Category } from '../types';

export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  active?: boolean;
  orderIndex?: number;
}

export const categoriesApi = {
  list: async (): Promise<Category[]> => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  create: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await apiClient.post('/categories', data);
    return response.data;
  },

  update: async (
  id: string,
  data: UpdateCategoryRequest)
  : Promise<Category> => {
    const response = await apiClient.patch(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  }
};