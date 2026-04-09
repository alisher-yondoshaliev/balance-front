import api from '../axios';
import type { Category, CreateCategoryPayload, UpdateCategoryPayload, CategoriesQueryParams } from '../../types/category.types';

/**
 * Categories API Service
 * Handles all category-related API calls
 */
export const categoriesApi = {
    /**
     * GET /api/categories
     * Get all categories for a market
     */
    getCategories: (params?: CategoriesQueryParams) => {
        console.log('[categoriesApi] GET /categories', { params });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return api.get<any>('/categories', { params }).then(response => {
            // Handle both response.data.data and response.data formats
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = Array.isArray(response.data) ? response.data : ((response.data as any)?.data || response.data) as Category[];
            return { ...response, data: Array.isArray(data) ? data : [] };
        });
    },

    /**
     * GET /api/categories/:id
     * Get a single category by ID
     */
    getCategoryById: (id: string) => {
        console.log('[categoriesApi] GET /categories/:id', { id });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return api.get<any>(`/categories/${id}`).then(response => {
            // Handle both wrapped and unwrapped responses
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = (response.data as any)?.id ? response.data : ((response.data as any)?.data || response.data) as Category;
            return { ...response, data };
        });
    },

    /**
     * POST /api/categories
     * Create a new category
     * Body: { marketId, name, imageUrl? }
     */
    createCategory: (payload: CreateCategoryPayload) => {
        console.log('[categoriesApi] POST /categories - REQUEST', {
            endpoint: '/categories',
            payload,
            hasMarketId: !!payload.marketId,
            hasName: !!payload.name,
            hasImageUrl: !!payload.imageUrl,
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return api.post<any>('/categories', payload).then(response => {
            console.log('[categoriesApi] POST /categories - SUCCESS', {
                status: response.status,
                data: response.data,
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = (response.data as any)?.id ? response.data : ((response.data as any)?.data || response.data) as Category;
            return { ...response, data };
        }).catch(err => {
            console.error('[categoriesApi] POST /categories - ERROR', {
                status: err?.response?.status,
                message: err?.response?.data?.message,
                error: err?.message,
            });
            throw err;
        });
    },

    /**
     * PATCH /api/categories/:id
     * Update an existing category
     * Body: { name?, imageUrl? } (NO marketId)
     */
    updateCategory: (id: string, payload: UpdateCategoryPayload) => {
        console.log('[categoriesApi] PATCH /categories/:id - REQUEST', {
            id,
            endpoint: `/categories/${id}`,
            payload,
            hasName: !!payload.name,
            hasImageUrl: !!payload.imageUrl,
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return api.patch<any>(`/categories/${id}`, payload).then(response => {
            console.log('[categoriesApi] PATCH /categories/:id - SUCCESS', {
                status: response.status,
                data: response.data,
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = (response.data as any)?.id ? response.data : ((response.data as any)?.data || response.data) as Category;
            return { ...response, data };
        }).catch(err => {
            console.error('[categoriesApi] PATCH /categories/:id - ERROR', {
                status: err?.response?.status,
                message: err?.response?.data?.message,
                error: err?.message,
            });
            throw err;
        });
    },

    /**
     * DELETE /api/categories/:id
     * Delete a category
     */
    deleteCategory: (id: string) => {
        console.log('[categoriesApi] DELETE /categories/:id', { id });
        return api.delete(`/categories/${id}`);
    },
};