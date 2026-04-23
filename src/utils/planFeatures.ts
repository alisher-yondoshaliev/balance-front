/**
 * Plan Features Utility
 * Helper functions for subscription plan features
 */

import type { SubscriptionPlan } from '../api/endpoints/subscriptions.api';

/**
 * Get features for a plan with descriptions
 */
export const getPlanFeatures = (plan: SubscriptionPlan | null | undefined): string[] => {
    if (!plan) return [];
    return plan.features || [];
};

/**
 * Get plan description
 */
export const getPlanDescription = (plan: SubscriptionPlan | null | undefined): string => {
    if (!plan) return '';
    return (plan as unknown as Record<string, unknown>).description as string || '';
};

/**
 * Get plan duration
 */
export const getPlanDuration = (plan: SubscriptionPlan | null | undefined): number => {
    if (!plan) return 30;
    const apiPlan = plan as unknown as Record<string, unknown>;
    return (apiPlan.durationDays || apiPlan.duration || 30) as number;
};

/**
 * Check if plan is popular
 */
export const isPlanPopular = (plan: SubscriptionPlan | null | undefined): boolean => {
    if (!plan) return false;
    return (plan as unknown as Record<string, unknown>).isPopular as boolean || false;
};
