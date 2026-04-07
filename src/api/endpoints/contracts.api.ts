import api from '../axios';
import type { Contract, Installment } from '../../types';

export interface CreateContractInput {
    customerId: string;
    staffId: string;
    termMonths: number;
    downPayment: number;
    items: Array<{ productId: string; quantity: number }>;
    note?: string;
}

export interface UpdateContractInput {
    termMonths?: number;
    downPayment?: number;
    note?: string;
}

export interface PaymentInput {
    amount: number;
    paymentMethod: string;
}

export const contractsApi = {
    getAll: (marketId: string) =>
        api.get<Contract[]>('/contracts', { params: { marketId } }),
    getOne: (id: string) => api.get<Contract>(`/contracts/${id}`),
    create: (data: CreateContractInput) => api.post<Contract>('/contracts', data),
    update: (id: string, data: UpdateContractInput) => api.patch<Contract>(`/contracts/${id}`, data),
    remove: (id: string) => api.delete(`/contracts/${id}`),
    updateStatus: (id: string, status: string) =>
        api.patch<Contract>(`/contracts/${id}/status`, { status }),
    pay: (id: string, data: PaymentInput) => api.post<Contract>(`/contracts/${id}/pay`, data),
    getInstallments: (id: string) => api.get<Installment[]>(`/contracts/${id}/installments`),
};