import { apiClient } from './client';

export interface AddonItem {
  id: string;
  name: string;
  priceCents: number;
}

export interface AddonGroupProduct {
  id: string;
  name: string;
}

export interface AddonGroup {
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  items: AddonItem[];
  products: AddonGroupProduct[];
}

export const addonGroupsGlobalApi = {
  list: async (): Promise<AddonGroup[]> => {
    const response = await apiClient.get('/addon-groups');
    return response.data;
  },
  create: async (data: { name: string; minSelect: number; maxSelect: number }): Promise<AddonGroup> => {
    const response = await apiClient.post('/addon-groups', data);
    return response.data;
  },
  update: async (id: string, data: { name?: string; minSelect?: number; maxSelect?: number }): Promise<AddonGroup> => {
    const response = await apiClient.patch(`/addon-groups/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/addon-groups/${id}`);
  },
  createItem: async (groupId: string, data: { name: string; priceCents: number }): Promise<AddonItem> => {
    const response = await apiClient.post(`/addon-groups/${groupId}/items`, data);
    return response.data;
  },
  updateItem: async (itemId: string, data: { name?: string; priceCents?: number }): Promise<AddonItem> => {
    const response = await apiClient.patch(`/addon-groups/items/${itemId}`, data);
    return response.data;
  },
  deleteItem: async (itemId: string): Promise<void> => {
    await apiClient.delete(`/addon-groups/items/${itemId}`);
  },
  linkToProduct: async (groupId: string, productId: string): Promise<void> => {
    await apiClient.post(`/addon-groups/${groupId}/link`, { productId });
  },
  unlinkFromProduct: async (groupId: string, productId: string): Promise<void> => {
    await apiClient.delete(`/addon-groups/${groupId}/link/${productId}`);
  },
};
