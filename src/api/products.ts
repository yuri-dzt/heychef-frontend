import { apiClient } from './client';
import type { Product } from '../types';

export interface CreateProductRequest {
  categoryId: string;
  name: string;
  description?: string;
  priceCents: number;
  imageUrl?: string;
  active?: boolean;
  ingredients?: string[];
}

export interface UpdateProductRequest {
  categoryId?: string;
  name?: string;
  description?: string;
  priceCents?: number;
  imageUrl?: string;
  active?: boolean;
  ingredients?: string[];
}

export const productsApi = {
  list: async (categoryId?: string): Promise<Product[]> => {
    const params = categoryId ? { categoryId } : {};
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  create: async (data: CreateProductRequest): Promise<Product> => {
    const response = await apiClient.post('/products', data);
    return response.data;
  },

  update: async (id: string, data: UpdateProductRequest): Promise<Product> => {
    const response = await apiClient.patch(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  }
};