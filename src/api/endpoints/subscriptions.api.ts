import api from '../axios';

export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    features: string[];
}

export interface CurrentSubscription {
    id: string;
    planId: string;
    plan: SubscriptionPlan;
    status: 'active' | 'inactive' | 'expired';
    startDate: string;
    endDate: string;
    renewalDate: string;
}

export interface SubscriptionHistory {
    id: string;
    planId: string;
    plan: SubscriptionPlan;
    status: 'active' | 'inactive' | 'expired' | 'cancelled';
    startDate: string;
    endDate: string;
    amount: number;
    paymentDate: string;
}

export interface PaymentInput {
    planId: string;
    paymentMethod: string;
}

export const subscriptionsApi = {
    getCurrent: () =>
        api.get<CurrentSubscription>('/subscriptions/current'),

    getHistory: () =>
        api.get<{ items: SubscriptionHistory[] }>('/subscriptions/history'),

    pay: (data: PaymentInput) =>
        api.post('/subscriptions/pay', data),
};
