import api from '../axios';
import type { Category } from '../../types';

export interface CreateCategoryInput {
    name: string;
    imageUrl?: string;
}

export interface UpdateCategoryInput {
    name?: string;
    imageUrl?: string;
}

export const categoriesApi = {
    getAll: (marketId: string) =>
        api.get<Category[]>('/categories', { params: { marketId } }),
    getOne: (id: string) => api.get<Category>(`/categories/${id}`),
    create: (data: CreateCategoryInput) => api.post<Category>('/categories', data),
    update: (id: string, data: UpdateCategoryInput) => api.patch<Category>(`/categories/${id}`, data),
    remove: (id: string) => api.delete(`/categories/${id}`),
};