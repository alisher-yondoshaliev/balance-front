/**
 * Admin API Service
 * ADMIN role - access ONLY own market data
 * 
 * IMPORTANT: All endpoints must include marketId
 * 
 * Allowed APIs:
 * - Market: /markets/my-market/info
 * - Dashboard: /dashboard/summary?marketId, /dashboard/revenue?marketId, /dashboard/overdue?marketId
 * - Categories: /categories?marketId, /categories/:id
 * - Products: /products?marketId, /products/:id
 * - Price Plans: /products/:id/price-plans
 * - Customers: /customers?marketId, /customers/:id
 * - Contracts: /contracts?marketId, /contracts/:id
 * - Payments: /contracts/:id/pay
 * - Installments: /contracts/:id/installments
 * - Public: /subscriptions/plans (read-only)
 */

import api from '../axios';

// ============================================================================
// DASHBOARD API
// ============================================================================

export const dashboardApi = {
    /**
     * GET /dashboard/summary?marketId=
     * Get dashboard summary stats
     */
    getSummary: async (marketId: string | number) => {
        console.log('[dashboardApi] GET /dashboard/summary', { marketId });
        return api.get('/dashboard/summary', { params: { marketId } });
    },

    /**
     * GET /dashboard/revenue?marketId=
     * Get revenue data
     */
    getRevenue: async (marketId: string | number) => {
        console.log('[dashboardApi] GET /dashboard/revenue', { marketId });
        return api.get('/dashboard/revenue', { params: { marketId } });
    },

    /**
     * GET /dashboard/overdue?marketId=
     * Get overdue payments
     */
    getOverdue: async (marketId: string | number) => {
        console.log('[dashboardApi] GET /dashboard/overdue', { marketId });
        return api.get('/dashboard/overdue', { params: { marketId } });
    },
};

// ============================================================================
// MARKET API - Admin's own market information
// ============================================================================

export const marketApi = {
    /**
     * GET /markets/my-market/info
     * Get admin's own market information with stats
     */
    getMyMarketInfo: async () => {
        console.log('[marketApi] GET /markets/my-market/info');
        return api.get('/markets/my-market/info');
    },
};

// ============================================================================
// CATEGORIES API
// ============================================================================

export const categoryApi = {
    /**
     * GET /categories?marketId=
     * List all categories for market
     */
    getAll: async (marketId: string | number, params?: any) => {
        console.log('[categoryApi] GET /categories', { marketId, ...params });
        return api.get('/categories', { params: { marketId, ...params } });
    },

    /**
     * GET /categories/:id
     * Get single category
     */
    getById: async (id: string | number) => {
        console.log('[categoryApi] GET /categories/:id', { id });
        return api.get(`/categories/${id}`);
    },

    /**
     * POST /categories
     * Create new category
     */
    create: async (data: { name: string; imageUrl?: string; marketId: string | number }) => {
        console.log('[categoryApi] POST /categories', data);
        return api.post('/categories', data);
    },

    /**
     * PATCH /categories/:id
     * Update category
     */
    update: async (id: string | number, data: any) => {
        console.log('[categoryApi] PATCH /categories/:id', { id, data });
        return api.patch(`/categories/${id}`, data);
    },

    /**
     * DELETE /categories/:id
     * Delete category
     */
    delete: async (id: string | number) => {
        console.log('[categoryApi] DELETE /categories/:id', { id });
        return api.delete(`/categories/${id}`);
    },
};

// ============================================================================
// PRODUCTS API
// ============================================================================

export const productApi = {
    /**
     * GET /products?marketId=
     * List all products for market
     */
    getAll: async (marketId: string | number, params?: any) => {
        console.log('[productApi] GET /products', { marketId, ...params });
        return api.get('/products', { params: { marketId, ...params } });
    },

    /**
     * GET /products/:id
     * Get single product
     */
    getById: async (id: string | number) => {
        console.log('[productApi] GET /products/:id', { id });
        return api.get(`/products/${id}`);
    },

    /**
     * POST /products
     * Create new product
     */
    create: async (data: any) => {
        console.log('[productApi] POST /products', data);
        return api.post('/products', data);
    },

    /**
     * PATCH /products/:id
     * Update product
     */
    update: async (id: string | number, data: any) => {
        console.log('[productApi] PATCH /products/:id', { id, data });
        return api.patch(`/products/${id}`, data);
    },

    /**
     * PATCH /products/:id/status
     * Change product status
     */
    changeStatus: async (id: string | number, status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED') => {
        console.log('[productApi] PATCH /products/:id/status', { id, status });
        return api.patch(`/products/${id}/status`, { status });
    },

    /**
     * DELETE /products/:id
     * Delete product
     */
    delete: async (id: string | number) => {
        console.log('[productApi] DELETE /products/:id', { id });
        return api.delete(`/products/${id}`);
    },

    /**
     * POST /products/:id/price-plans
     * Create price plan
     */
    createPricePlan: async (productId: string | number, data: any) => {
        console.log('[productApi] POST /products/:id/price-plans', { productId, data });
        return api.post(`/products/${productId}/price-plans`, data);
    },

    /**
     * PATCH /products/:id/price-plans/:planId
     * Update price plan
     */
    updatePricePlan: async (productId: string | number, planId: string | number, data: any) => {
        console.log('[productApi] PATCH /products/:id/price-plans/:planId', { productId, planId, data });
        return api.patch(`/products/${productId}/price-plans/${planId}`, data);
    },

    /**
     * DELETE /products/:id/price-plans/:planId
     * Delete price plan
     */
    deletePricePlan: async (productId: string | number, planId: string | number) => {
        console.log('[productApi] DELETE /products/:id/price-plans/:planId', { productId, planId });
        return api.delete(`/products/${productId}/price-plans/${planId}`);
    },
};

// ============================================================================
// CUSTOMERS API
// ============================================================================

export const customerApi = {
    /**
     * GET /customers?marketId=
     * List all customers for market
     */
    getAll: async (marketId: string | number, params?: any) => {
        console.log('[customerApi] GET /customers', { marketId, ...params });
        return api.get('/customers', { params: { marketId, ...params } });
    },

    /**
     * GET /customers/:id
     * Get single customer
     */
    getById: async (id: string | number) => {
        console.log('[customerApi] GET /customers/:id', { id });
        return api.get(`/customers/${id}`);
    },

    /**
     * POST /customers
     * Create new customer
     */
    create: async (data: any) => {
        console.log('[customerApi] POST /customers', data);
        return api.post('/customers', data);
    },

    /**
     * PATCH /customers/:id
     * Update customer
     */
    update: async (id: string | number, data: any) => {
        console.log('[customerApi] PATCH /customers/:id', { id, data });
        return api.patch(`/customers/${id}`, data);
    },

    /**
     * DELETE /customers/:id
     * Delete customer
     */
    delete: async (id: string | number) => {
        console.log('[customerApi] DELETE /customers/:id', { id });
        return api.delete(`/customers/${id}`);
    },
};

// ============================================================================
// CONTRACTS API
// ============================================================================

export const contractApi = {
    /**
     * GET /contracts?marketId=
     * List all contracts for market
     */
    getAll: async (marketId: string | number, params?: any) => {
        console.log('[contractApi] GET /contracts', { marketId, ...params });
        return api.get('/contracts', { params: { marketId, ...params } });
    },

    /**
     * GET /contracts/:id
     * Get single contract
     */
    getById: async (id: string | number) => {
        console.log('[contractApi] GET /contracts/:id', { id });
        return api.get(`/contracts/${id}`);
    },

    /**
     * POST /contracts
     * Create new contract
     */
    create: async (data: any) => {
        console.log('[contractApi] POST /contracts', data);
        return api.post('/contracts', data);
    },

    /**
     * PATCH /contracts/:id
     * Update contract
     */
    update: async (id: string | number, data: any) => {
        console.log('[contractApi] PATCH /contracts/:id', { id, data });
        return api.patch(`/contracts/${id}`, data);
    },

    /**
     * PATCH /contracts/:id/status
     * Change contract status
     */
    changeStatus: async (id: string | number, status: string) => {
        console.log('[contractApi] PATCH /contracts/:id/status', { id, status });
        return api.patch(`/contracts/${id}/status`, { status });
    },

    /**
     * GET /contracts/:id/installments
     * Get contract installments
     */
    getInstallments: async (id: string | number) => {
        console.log('[contractApi] GET /contracts/:id/installments', { id });
        return api.get(`/contracts/${id}/installments`);
    },

    /**
     * POST /contracts/:id/pay
     * Record payment
     */
    recordPayment: async (id: string | number, data: any) => {
        console.log('[contractApi] POST /contracts/:id/pay', { id, data });
        return api.post(`/contracts/${id}/pay`, data);
    },
};

// ============================================================================
// PUBLIC API (Read-only)
// ============================================================================

export const publicApi = {
    /**
     * GET /subscriptions/plans
     * Get available subscription plans (no auth required)
     */
    getSubscriptionPlans: async () => {
        console.log('[publicApi] GET /subscriptions/plans');
        return api.get('/subscriptions/plans');
    },
};

// ============================================================================
// ADMIN API EXPORT
// ============================================================================

export const adminApi = {
    dashboard: dashboardApi,
    market: marketApi,
    category: categoryApi,
    product: productApi,
    customer: customerApi,
    contract: contractApi,
    public: publicApi,
};
