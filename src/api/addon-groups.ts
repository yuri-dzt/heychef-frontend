import { apiClient } from './client';
import type { ProductAddonGroup } from '../types';

export interface CreateAddonGroupRequest {
  productId: string;
  name: string;
  minSelect: number;
  maxSelect: number;
}

export interface UpdateAddonGroupRequest {
  name?: string;
  minSelect?: number;
  maxSelect?: number;
}

export const addonGroupsApi = {
  create: async (data: CreateAddonGroupRequest): Promise<ProductAddonGroup> => {
    const response = await apiClient.post(`/products/${data.productId}/addon-groups`, data);
    return response.data;
  },

  update: async (
  id: string,
  data: UpdateAddonGroupRequest)
  : Promise<ProductAddonGroup> => {
    const response = await apiClient.patch(`/addon-groups/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/addon-groups/${id}`);
  }
};