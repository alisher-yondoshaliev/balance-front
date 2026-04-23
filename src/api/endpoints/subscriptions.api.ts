import api from '../axios';

export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    duration: number;
    description?: string | null;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    features?: string[];
    maxUsers?: number;
    maxStorage?: number;
}

export interface CurrentSubscription {
    id?: string;
    plan: SubscriptionPlan;
    subEndDate: string;
    isActive: boolean;
    daysLeft: number;
    subStartDate?: string | null;
    status?: string;
    startDate?: string | null;
    endDate?: string | null;
    autoRenew?: boolean;
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
    startDate?: string;
    endDate?: string;
    createdAt?: string;
    updatedAt?: string;
    transactionId?: string;
    currency?: string;
    userId?: string;
}

export interface PaymentInput {
    planId: string;
}

export interface SubscriptionPaymentResponse {
    message?: string;
    paymentUrl?: string;
    url?: string;
    redirectUrl?: string;
    payment?: {
        id?: string;
        amount?: number | string;
        startDate?: string;
        endDate?: string;
    };
    plan?: {
        id?: string;
        name?: string;
        duration?: number;
    };
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

export type SubscriptionItem = CurrentSubscription;
export type CurrentSubscriptionResponse = CurrentSubscriptionApiResponse;
export type PaymentHistory = SubscriptionHistoryItem;

export const normalizeCurrentSubscription = (
    data: CurrentSubscriptionApiResponse,
): CurrentSubscription | null => {
    if (!data) {
        return null;
    }

    if ('subscription' in data) {
        const subscription = data.subscription ?? null;
        if (!subscription) {
            return null;
        }

        return {
            ...subscription,
            startDate: subscription.startDate ?? subscription.subStartDate ?? null,
            endDate: subscription.endDate ?? subscription.subEndDate ?? null,
            status:
                subscription.status ??
                (subscription.isActive ? 'active' : 'expired'),
        };
    }

    return {
        ...data,
        startDate: data.startDate ?? data.subStartDate ?? null,
        endDate: data.endDate ?? data.subEndDate ?? null,
        status: data.status ?? (data.isActive ? 'active' : 'expired'),
    };
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
