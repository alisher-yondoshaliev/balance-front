import type { Role } from './auth';

// API Response wrapper
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Menu item interface
export interface MenuItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    path: string;
    requiredRoles: Role[];
    children?: MenuItem[];
    badge?: number;
}

// Error interface
export interface ApiError {
    statusCode: number;
    message: string;
    errors?: Record<string, string[]>;
}

// Search/Filter interface
export interface SearchParams {
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}
