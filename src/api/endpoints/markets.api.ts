import api from '../axios';
import type { Market } from '../../types';

export interface CreateMarketInput {
    name: string;
    address?: string;
    phone?: string;
}

export interface UpdateMarketInput {
    name?: string;
    address?: string;
    phone?: string;
}

export const marketsApi = {
    getMyMarkets: () => api.get<Market[]>('/markets'),
    getAll: () => api.get<Market[]>('/markets/all'),
    getOne: (id: string) => api.get<Market>(`/markets/${id}`),
    create: (data: CreateMarketInput) => api.post<Market>('/markets', data),
    update: (id: string, data: UpdateMarketInput) => api.patch<Market>(`/markets/${id}`, data),
    remove: (id: string) => api.delete(`/markets/${id}`),
    updateStatus: (id: string, status: string) =>
        api.patch<Market>(`/markets/${id}/status`, { status }),
};