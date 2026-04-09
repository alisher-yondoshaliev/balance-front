/**
 * Category Types
 */

export interface Category {
    id: string;
    name: string;
    imageUrl?: string;
    marketId: string;
    createdAt?: string;
    updatedAt?: string;
    status?: 'active' | 'inactive';
}

export interface CreateCategoryPayload {
    name: string;
    imageUrl?: string;
    marketId: string;
}

export interface UpdateCategoryPayload {
    name?: string;
    imageUrl?: string;
}

export interface CategoriesQueryParams {
    marketId?: string;
    search?: string;
}
