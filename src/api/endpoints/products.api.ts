import api from '../axios';
import type { Product, PricePlan } from '../../types';

export interface CreateProductInput {
    categoryId: string;
    name: string;
    description?: string;
    imageUrl?: string;
    stock: number;
    basePrice: number;
}

export interface UpdateProductInput {
    categoryId?: string;
    name?: string;
    description?: string;
    imageUrl?: string;
    stock?: number;
    basePrice?: number;
}

export interface CreatePricePlanInput {
    termMonths: number;
    interestRate: number;
    totalPrice: number;
    monthlyPrice: number;
}

export interface UpdatePricePlanInput {
    termMonths?: number;
    interestRate?: number;
    totalPrice?: number;
    monthlyPrice?: number;
}

export const productsApi = {
    getAll: (marketId: string) =>
        api.get<Product[]>('/products', { params: { marketId } }),
    getOne: (id: string) => api.get<Product>(`/products/${id}`),
    create: (data: CreateProductInput) => api.post<Product>('/products', data),
    update: (id: string, data: UpdateProductInput) => api.patch<Product>(`/products/${id}`, data),
    updateStatus: (id: string, status: string) =>
        api.patch<Product>(`/products/${id}/status`, { status }),
    remove: (id: string) => api.delete(`/products/${id}`),
    createPricePlan: (id: string, data: CreatePricePlanInput) =>
        api.post<PricePlan>(`/products/${id}/price-plans`, data),
    updatePricePlan: (id: string, planId: string, data: UpdatePricePlanInput) =>
        api.patch<PricePlan>(`/products/${id}/price-plans/${planId}`, data),
    removePricePlan: (id: string, planId: string) =>
        api.delete(`/products/${id}/price-plans/${planId}`),
};  