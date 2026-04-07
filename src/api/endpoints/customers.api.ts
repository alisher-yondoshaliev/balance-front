import api from '../axios';
import type { Customer, Contract } from '../../types';

export interface CreateCustomerInput {
    fullName: string;
    phone: string;
    address?: string;
    passportSeria?: string;
    birthDate?: string;
    note?: string;
}

export interface UpdateCustomerInput {
    fullName?: string;
    phone?: string;
    address?: string;
    passportSeria?: string;
    birthDate?: string;
    note?: string;
}

export const customersApi = {
    getAll: (marketId: string) =>
        api.get<Customer[]>('/customers', { params: { marketId } }),
    getOne: (id: string) => api.get<Customer>(`/customers/${id}`),
    create: (data: CreateCustomerInput) => api.post<Customer>('/customers', data),
    update: (id: string, data: UpdateCustomerInput) => api.patch<Customer>(`/customers/${id}`, data),
    remove: (id: string) => api.delete(`/customers/${id}`),
    getContracts: (id: string) => api.get<Contract[]>(`/customers/${id}/contracts`),
};