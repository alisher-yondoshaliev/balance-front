/**
 * Subscription Types and Interfaces
 */

// Plan Types
export interface SubscriptionPlan {
    id: string;
    name: string;
    description?: string;
    price: number;
    duration: number; // in days
    features: string[];
    isActive: boolean;
    maxUsers?: number;
    maxStorage?: number; // in GB
    createdAt: string;
    updatedAt: string;
}

export interface CreatePlanInput {
    name: string;
    description?: string;
    price: number;
    duration: number;
    features: string[];
    isActive?: boolean;
    maxUsers?: number;
    maxStorage?: number;
}

export interface UpdatePlanInput extends Partial<CreatePlanInput> { }

// Subscription Types
export interface CurrentSubscription {
    id: string;
    userId: string;
    planId: string;
    plan: SubscriptionPlan;
    status: 'active' | 'expired' | 'cancelled' | 'pending';
    startDate: string;
    endDate: string;
    autoRenew: boolean;
    paymentMethodId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface SubscriptionHistory {
    id: string;
    userId: string;
    planId: string;
    plan: SubscriptionPlan;
    amount: number;
    currency: string;
    status: 'success' | 'pending' | 'failed' | 'refunded';
    paymentMethod: string;
    paymentDate: string;
    transactionId: string;
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaymentInput {
    planId: string;
    paymentMethod?: string;
}

export interface PaymentResponse {
    message?: string;
    paymentUrl?: string;
    url?: string;
    redirectUrl?: string;
    subscriptionId?: string;
    transactionId?: string;
    payment?: {
        id: string;
        amount: string | number;
        startDate: string;
        endDate: string;
    };
    plan?: {
        name: string;
        duration: number;
    };
}

// List Response Types
export interface PlanListResponse {
    data: SubscriptionPlan[];
    total: number;
    page?: number;
    limit?: number;
}

export interface SubscriptionHistoryResponse {
    data: SubscriptionHistory[];
    total: number;
    page?: number;
    limit?: number;
}

// Query Parameters
export interface GetPlansQuery {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    order?: 'asc' | 'desc';
}

export interface GetHistoryQuery {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
}
