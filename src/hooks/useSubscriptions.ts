/**
 * Subscription Hooks
 * Wrapper hooks for subscription API calls using React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    normalizeCurrentSubscription,
    normalizeSubscriptionHistory,
    subscriptionsApi,
    type PaymentInput,
} from '../api/endpoints/subscriptions.api';

// Query Keys
const subscriptionKeys = {
    plans: ['subscriptions', 'plans'] as const,
    current: ['subscriptions', 'current'] as const,
    history: ['subscriptions', 'history'] as const,
};

// Queries
export const useGetPlans = () => {
    return useQuery({
        queryKey: subscriptionKeys.plans,
        queryFn: () => subscriptionsApi.getPlans().then(r => r.data),
        staleTime: 1000 * 60 * 60, // 1 hour
        gcTime: 1000 * 60 * 60 * 2, // 2 hours
    });
};

export const useGetCurrentSubscription = (enabled = true) => {
    return useQuery({
        queryKey: subscriptionKeys.current,
        queryFn: () =>
            subscriptionsApi.getCurrent().then((r) => normalizeCurrentSubscription(r.data)),
        enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
    });
};

export const useGetSubscriptionHistory = (marketId?: string, enabled = true) => {
    return useQuery({
        queryKey: [subscriptionKeys.history, marketId],
        queryFn: () =>
            subscriptionsApi.getHistory().then((r) => normalizeSubscriptionHistory(r.data)),
        enabled,
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 15, // 15 minutes
    });
};

export const useGetPlanById = (planId: string | null) => {
    const { data: plans, isLoading } = useGetPlans();
    return {
        data: plans?.find(p => p.id === planId) || null,
        isLoading,
        isError: false,
        error: null,
    };
};

// Mutations
export const useMakePayment = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: PaymentInput) => subscriptionsApi.pay(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.current });
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.history });
        },
    });
};

export const useCreatePlan = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: unknown) => Promise.resolve(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.plans });
        },
    });
};

export const useUpdatePlan = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: unknown) => Promise.resolve(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.plans });
        },
    });
};

export const useDeletePlan = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: unknown) => Promise.resolve(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.plans });
        },
    });
};
