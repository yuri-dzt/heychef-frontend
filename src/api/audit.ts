import { apiClient } from './client';

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: number;
}

export const auditApi = {
  list: async (page = 1, limit = 50): Promise<AuditLogEntry[]> => {
    const response = await apiClient.get('/audit', { params: { page, limit } });
    return response.data;
  },
};
