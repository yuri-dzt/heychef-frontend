import { apiClient } from './client';
import type { ProductAddonItem } from '../types';

export interface CreateAddonItemRequest {
  addonGroupId: string;
  name: string;
  priceCents: number;
}

export interface UpdateAddonItemRequest {
  name?: string;
  priceCents?: number;
}

export const addonItemsApi = {
  create: async (data: CreateAddonItemRequest): Promise<ProductAddonItem> => {
    const response = await apiClient.post(`/addon-groups/${data.addonGroupId}/items`, data);
    return response.data;
  },

  update: async (
  id: string,
  data: UpdateAddonItemRequest)
  : Promise<ProductAddonItem> => {
    const response = await apiClient.patch(`/addon-items/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/addon-items/${id}`);
  }
};