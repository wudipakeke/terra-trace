import { api } from './client';
import type { SyncData } from '../types/sync';

export const syncApi = {
  upload: (data: SyncData) => api.post<any>('/sync/upload', { data }),
  download: () => api.get<{ syncedAt: string; data: SyncData }>('/sync/download'),
};
