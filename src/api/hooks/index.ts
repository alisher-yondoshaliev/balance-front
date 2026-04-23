/**
 * REACT QUERY HOOKS - Data fetching & state management
 * Pattern: Service → Hook → Component
 * 
 * All hooks include:
 * - Loading state
 * - Error state
 * - Refetch capability
 * - Automatic cache invalidation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    customersApi,
    contractsApi,
    productsApi,
    categoriesApi,
    dashboardApi,
    subscriptionsApi,
    type CreateCustomerInput,
    type UpdateCustomerInput,
    type CreateContractInput,
    type CreateProductInput,
} from '../index';

// ============================================================================
// QUERY KEY FACTORY
// ============================================================================

export const queryKeys = {
    // Customers
    customers: {
        all: ['customers'] as const,
        byMarket: (marketId: string) => [...queryKeys.customers.all, marketId] as const,
        detail: (id: string) => [...queryKeys.customers.all, 'detail', id] as const,
    },
    // Contracts
    contracts: {
        all: ['contracts'] as const,
        byMarket: (marketId: string) => [...queryKeys.contracts.all, marketId] as const,
        detail: (id: string) => [...queryKeys.contracts.all, 'detail', id] as const,
    },
    // Products
    products: {
        all: ['products'] as const,
        byMarket: (marketId: string) => [...queryKeys.products.all, marketId] as const,
        detail: (id: string) => [...queryKeys.products.all, 'detail', id] as const,
    },
    // Categories
    categories: {
        all: ['categories'] as const,
        byMarket: (marketId: string) => [...queryKeys.categories.all, marketId] as const,
    },
    // Dashboard
    dashboard: {
        all: ['dashboard'] as const,
        summary: (marketId: string) => [...queryKeys.dashboard.all, 'summary', marketId] as const,
    },
    // Subscriptions
    subscriptions: {
        all: ['subscriptions'] as const,
        plans: ['subscriptions', 'plans'] as const,
    },
};

// ============================================================================
// CUSTOMERS HOOKS
// ============================================================================

export const useCustomers = (params?: {
    marketId?: string;
    search?: string;
    page?: number;
    limit?: number;
}) => {
    return useQuery({
        queryKey: params?.marketId ? queryKeys.customers.byMarket(params.marketId) : queryKeys.customers.all,
        queryFn: () => customersAPI.getAll(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        retry: 1,
    });
};

export const useCustomerById = (id: string | null) => {
    return useQuery({
        queryKey: id ? queryKeys.customers.detail(id) : queryKeys.customers.all,
        queryFn: () => (id ? customersAPI.getById(id) : null),
        enabled: !!id,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });
};

export const useCreateCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCustomerInput) => customersAPI.create(data),
        onSuccess: () => {
            // Invalidate all customer queries
            queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
        },
        onError: (error) => {
            console.error('Create customer error:', handleApiError(error));
        },
    });
};

export const useUpdateCustomer = (customerId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateCustomerInput) => customersAPI.update(customerId, data),
        onSuccess: () => {
            // Invalidate specific customer
            queryClient.invalidateQueries({
                queryKey: queryKeys.customers.detail(customerId),
            });
            // Invalidate all customer list queries
            queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
        },
        onError: (error) => {
            console.error('Update customer error:', handleApiError(error));
        },
    });
};

export const useDeleteCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => customersAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
        },
        onError: (error) => {
            console.error('Delete customer error:', handleApiError(error));
        },
    });
};

// ============================================================================
// CONTRACTS HOOKS
// ============================================================================

export const useContracts = (params?: {
    marketId?: string;
    page?: number;
    limit?: number;
}) => {
    return useQuery({
        queryKey: params?.marketId ? queryKeys.contracts.byMarket(params.marketId) : queryKeys.contracts.all,
        queryFn: () => contractsAPI.getAll(params),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });
};

export const useContractById = (id: string | null) => {
    return useQuery({
        queryKey: id ? queryKeys.contracts.detail(id) : queryKeys.contracts.all,
        queryFn: () => (id ? contractsAPI.getById(id) : null),
        enabled: !!id,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });
};

export const useCreateContract = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateContractInput) => contractsAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.contracts.all });
        },
        onError: (error) => {
            console.error('Create contract error:', handleApiError(error));
        },
    });
};

export const useUpdateContract = (contractId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<CreateContractInput>) =>
            contractsAPI.update(contractId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.contracts.detail(contractId),
            });
            queryClient.invalidateQueries({ queryKey: queryKeys.contracts.all });
        },
        onError: (error) => {
            console.error('Update contract error:', handleApiError(error));
        },
    });
};

export const useDeleteContract = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => contractsAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.contracts.all });
        },
        onError: (error) => {
            console.error('Delete contract error:', handleApiError(error));
        },
    });
};

// ============================================================================
// PRODUCTS HOOKS
// ============================================================================

export const useProducts = (params?: {
    marketId?: string;
    page?: number;
    limit?: number;
}) => {
    return useQuery({
        queryKey: params?.marketId ? queryKeys.products.byMarket(params.marketId) : queryKeys.products.all,
        queryFn: () => productsAPI.getAll(params),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });
};

export const useProductById = (id: string | null) => {
    return useQuery({
        queryKey: id ? queryKeys.products.detail(id) : queryKeys.products.all,
        queryFn: () => (id ? productsAPI.getById(id) : null),
        enabled: !!id,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });
};

export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateProductInput) => productsAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
        onError: (error) => {
            console.error('Create product error:', handleApiError(error));
        },
    });
};

export const useUpdateProduct = (productId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<CreateProductInput>) =>
            productsAPI.update(productId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.products.detail(productId),
            });
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
        onError: (error) => {
            console.error('Update product error:', handleApiError(error));
        },
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => productsAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
        onError: (error) => {
            console.error('Delete product error:', handleApiError(error));
        },
    });
};

// ============================================================================
// CATEGORIES HOOKS
// ============================================================================

export const useCategories = (params?: {
    marketId?: string;
    page?: number;
    limit?: number;
}) => {
    return useQuery({
        queryKey: params?.marketId ? queryKeys.categories.byMarket(params.marketId) : queryKeys.categories.all,
        queryFn: () => categoriesAPI.getAll(params),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCategoryInput) => categoriesAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
        },
        onError: (error) => {
            console.error('Create category error:', handleApiError(error));
        },
    });
};

export const useUpdateCategory = (categoryId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<CreateCategoryInput>) =>
            categoriesAPI.update(categoryId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
        },
        onError: (error) => {
            console.error('Update category error:', handleApiError(error));
        },
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => categoriesAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
        },
        onError: (error) => {
            console.error('Delete category error:', handleApiError(error));
        },
    });
};

// ============================================================================
// DASHBOARD HOOKS
// ============================================================================

export const useDashboardSummary = (marketId: string | null) => {
    return useQuery({
        queryKey: marketId ? queryKeys.dashboard.summary(marketId) : queryKeys.dashboard.all,
        queryFn: () => (marketId ? dashboardAPI.getSummary(marketId) : null),
        enabled: !!marketId,
        staleTime: 1000 * 60 * 2, // 2 minutes - dashboard updates frequently
        gcTime: 1000 * 60 * 5,
        retry: 2,
    });
};

// ============================================================================
// SUBSCRIPTIONS HOOKS
// ============================================================================

export const useSubscriptionPlans = () => {
    return useQuery({
        queryKey: queryKeys.subscriptions.plans,
        queryFn: () => subscriptionsAPI.getPlans(),
        staleTime: 1000 * 60 * 60, // 1 hour - plans rarely change
        gcTime: 1000 * 60 * 60 * 2, // 2 hours
        retry: 2,
    });
};

// ============================================================================
// USAGE EXAMPLES IN COMPONENTS
// ============================================================================


// ============================================================================
// Usage Examples
// ============================================================================
// For customer list:
// const { data, isLoading, error } = useCustomers({ marketId, page, limit });
//
// For creating customer:
// const { mutateAsync, isPending } = useCreateCustomer();
// await mutateAsync({ name, phone, email, marketId });

