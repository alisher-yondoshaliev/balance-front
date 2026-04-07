import api from '../axios';

export const subscriptionsApi = {
    getActiveSubscriptions: (marketId: string) =>
        api.get(`/markets/${marketId}/subscriptions`),

    getSubscriptionHistory: (marketId: string) =>
        api.get(`/markets/${marketId}/subscriptions/history`),

    renewSubscription: (marketId: string, data: { planId: string; paymentMethod: string }) =>
        api.post(`/markets/${marketId}/subscriptions/renew`, data),

    cancelSubscription: (marketId: string) =>
        api.post(`/markets/${marketId}/subscriptions/cancel`, {}),
};
