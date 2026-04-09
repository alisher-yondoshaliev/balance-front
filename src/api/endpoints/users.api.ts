import api from '../axios';
import type { MarketUsersQueryParams } from '../../types/resources';

export const usersApi = {
    // Get all system users or market users
    getUsers: (marketId?: string | number, params?: MarketUsersQueryParams) => {
        if (marketId) {
            // Get market-specific users using route param with query parameters
            console.log(`[API] GET /markets/${marketId}/users with params:`, params);
            return api.get(`/markets/${marketId}/users`, { params });
        }
        // Get all system users
        console.log('[API] GET /users');
        return api.get('/users');
    },

    getUser: (id: string) =>
        api.get(`/users/${id}`),

    createUser: (data: {
        email: string;
        fullName: string;
        role: string;
        phone?: string;
        password?: string;
        marketId?: string
    }) =>
        api.post('/users', data),

    updateUser: (id: string, data: { fullName?: string; email?: string; role?: string; phone?: string }) =>
        api.patch(`/users/${id}`, data),

    deleteUser: (id: string) =>
        api.delete(`/users/${id}`),

    updateUserStatus: (id: string, status: string) =>
        api.patch(`/users/${id}/status`, { status }),
};
