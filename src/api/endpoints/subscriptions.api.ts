import api from '../axios';

export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    duration: number;
    description?: string | null;
    isActive: boolean;
}

export interface CurrentSubscription {
    id?: string;
    plan: SubscriptionPlan;
    subEndDate: string;
    isActive: boolean;
    daysLeft: number;
    subStartDate?: string | null;
}

export interface SubscriptionHistoryItem {
    id: string;
    planId: string;
    plan?: SubscriptionPlan | null;
    amount: number;
    paymentDate: string;
    paymentMethod?: string;
    status?: string;
    subStartDate?: string;
    subEndDate?: string;
}

export interface PaymentInput {
    planId: string;
}

export interface SubscriptionPaymentResponse {
    message?: string;
    [key: string]: unknown;
}

export interface SubscriptionActionResponse {
    message?: string;
    [key: string]: unknown;
}

export type CurrentSubscriptionApiResponse =
    | CurrentSubscription
    | { subscription: CurrentSubscription | null }
    | null;

export type SubscriptionHistoryApiResponse =
    | { items: SubscriptionHistoryItem[] }
    | SubscriptionHistoryItem[];

export const normalizeCurrentSubscription = (
    data: CurrentSubscriptionApiResponse,
): CurrentSubscription | null => {
    if (!data) {
        return null;
    }

    if ('subscription' in data) {
        return data.subscription ?? null;
    }

    return data;
};

export const normalizeSubscriptionHistory = (
    data: SubscriptionHistoryApiResponse | null | undefined,
): SubscriptionHistoryItem[] => {
    if (!data) {
        return [];
    }

    if (Array.isArray(data)) {
        return data;
    }

    return Array.isArray(data.items) ? data.items : [];
};

export const subscriptionsApi = {
    getPlans: () => api.get<SubscriptionPlan[]>('/subscriptions/plans'),

    getCurrent: () =>
        api.get<CurrentSubscriptionApiResponse>('/subscriptions/current'),

    getHistory: () =>
        api.get<SubscriptionHistoryApiResponse>('/subscriptions/history'),

    pay: (data: PaymentInput) =>
        api.post<SubscriptionPaymentResponse>('/subscriptions/pay', data),

    cancel: () =>
        api.post<SubscriptionActionResponse>('/subscriptions/cancel'),
};
