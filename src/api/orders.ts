import { apiClient } from './client';
import type { Order, OrderStatus } from '../types';

export const ordersApi = {
  list: async (params?: {
    status?: OrderStatus;
    tableId?: string;
  }): Promise<Order[]> => {
    const response = await apiClient.get('/orders', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Order> => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    const response = await apiClient.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  cancel: async (id: string, cancelReason?: string): Promise<Order> => {
    const response = await apiClient.patch(`/orders/${id}/cancel`, {
      cancelReason
    });
    return response.data;
  },

  updateItemStatus: async (itemId: string, status: string): Promise<void> => {
    await apiClient.patch(`/orders/items/${itemId}/status`, { status });
  },

  removeItem: async (itemId: string): Promise<void> => {
    await apiClient.delete(`/orders/items/${itemId}`);
  },
};