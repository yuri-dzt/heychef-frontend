import { apiClient } from './client';
import type {
  PublicMenu,
  CreateOrderRequest,
  Order,
  CallWaiterEvent } from
'../types';

export interface ActiveOrder {
  id: string;
  status: string;
  customerName?: string;
  notes?: string;
  totalCents: number;
  createdAt: number;
  items: {
    id: string;
    productName: string;
    quantity: number;
    unitPriceCents: number;
    totalPriceCents: number;
    status: string;
    notes?: string;
    addons: { id: string; name: string; priceCents: number }[];
  }[];
}

export const publicApi = {
  getMenu: async (tableToken: string): Promise<PublicMenu> => {
    const response = await apiClient.get(`/public/menu/${tableToken}`);
    return response.data;
  },

  getActiveOrder: async (tableToken: string): Promise<ActiveOrder | null> => {
    const response = await apiClient.get(`/public/order/${tableToken}`);
    return response.data;
  },

  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await apiClient.post(`/public/orders/${data.tableToken}`, data);
    return response.data;
  },

  removeItem: async (tableToken: string, itemId: string): Promise<ActiveOrder | null> => {
    const response = await apiClient.delete(`/public/order/${tableToken}/items/${itemId}`);
    return response.data;
  },

  callWaiter: async (tableToken: string): Promise<CallWaiterEvent> => {
    const response = await apiClient.post(`/public/call-waiter/${tableToken}`);
    return response.data;
  }
};