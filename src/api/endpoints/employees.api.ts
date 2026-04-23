/**
 * Employees API
 * Handles market-specific employee/user endpoints
 */

import api from '../axios';
import type { MarketUsersQueryParams, MarketUsersResponse } from '../../types/resources';

export interface CreateEmployeePayload {
    fullName: string;
    email: string;
    phone?: string;
    password?: string;
    role: string;
    marketId?: string;
}

export interface UpdateEmployeePayload {
    fullName?: string;
    email?: string;
    phone?: string;
    role?: string;
    status?: string;
}

export const employeesApi = {
    /**
     * GET /api/markets/:marketId/users
     * Get employees for a specific market with filtering, sorting, pagination
     */
    getMarketEmployees: async (
        marketId: string | number,
        params?: MarketUsersQueryParams
    ): Promise<{ data: MarketUsersResponse }> => {
        console.log(`[employeesApi] GET /markets/${marketId}/users`);
        console.log('[employeesApi] Query params:', params);

        const response = await api.get<MarketUsersResponse>(
            `/markets/${marketId}/users`,
            { params }
        );

        console.log('[employeesApi] Response:', response.data);
        return response;
    },

    /**
     * POST /api/users
     * Create a new employee
     */
    createEmployee: async (payload: CreateEmployeePayload) => {
        console.log('[employeesApi] POST /users', payload);
        return api.post('/users', payload);
    },

    /**
     * PATCH /api/users/:id
     * Update employee information
     */
    updateEmployee: async (id: string | number, payload: UpdateEmployeePayload) => {
        console.log(`[employeesApi] PATCH /users/${id}`, payload);
        return api.patch(`/users/${id}`, payload);
    },

    /**
     * DELETE /api/users/:id
     * Delete an employee
     */
    deleteEmployee: async (id: string | number) => {
        console.log(`[employeesApi] DELETE /users/${id}`);
        return api.delete(`/users/${id}`);
    },

    /**
     * PATCH /api/users/:id/status
     * Update employee status
     */
    updateEmployeeStatus: async (id: string | number, status: 'ACTIVE' | 'INACTIVE') => {
        console.log(`[employeesApi] PATCH /users/${id}/status`, { status });
        return api.patch(`/users/${id}/status`, { status });
    },
};
