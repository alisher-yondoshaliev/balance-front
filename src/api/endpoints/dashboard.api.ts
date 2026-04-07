import api from '../axios';

export interface DashboardSummary {
    totalCustomers: number;
    activeContracts: number;
    totalRevenue: number;
    pendingPayments: number;
    recentTransactions: Transaction[];
}

export interface DebtorInfo {
    customerId: string;
    customerName: string;
    remainAmount: number;
    daysOverdue: number;
    contractCount: number;
}

export interface Transaction {
    id: string;
    contractId: string;
    amount: number;
    type: 'payment' | 'refund';
    createdAt: string;
}

export const dashboardApi = {
    getSummary: (marketId: string) =>
        api.get<DashboardSummary>('/dashboard/summary', { params: { marketId } }),
    getRevenue: (marketId: string) =>
        api.get<{ revenue: number }>('/dashboard/revenue', { params: { marketId } }),
    getTopDebtors: (marketId: string) =>
        api.get<DebtorInfo[]>('/dashboard/top-debtors', { params: { marketId } }),
    getOverdue: (marketId: string) =>
        api.get<{ overdueCount: number; overdueAmount: number }>('/dashboard/overdue', { params: { marketId } }),
};