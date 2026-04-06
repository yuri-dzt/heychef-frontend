import { apiClient } from './client';
import type { ReportDaily } from '../types';

export const reportsApi = {
  generate: async (): Promise<void> => {
    await apiClient.post('/reports/generate');
  },

  getDaily: async (
  startDate: string,
  endDate: string)
  : Promise<ReportDaily[]> => {
    const response = await apiClient.get('/reports/daily', {
      params: { from: startDate, to: endDate }
    });
    return response.data;
  }
};