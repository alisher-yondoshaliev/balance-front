import api from '../axios';

export const usersApi = {
    getUsers: (marketId: string) =>
        api.get(`/markets/${marketId}/users`),

    getUser: (id: string) =>
        api.get(`/users/${id}`),

    createUser: (data: { email: string; fullName: string; role: string; marketId: string }) =>
        api.post('/users', data),

    updateUser: (id: string, data: { fullName?: string; role?: string; status?: string }) =>
        api.patch(`/users/${id}`, data),

    deleteUser: (id: string) =>
        api.delete(`/users/${id}`),

    updateUserStatus: (id: string, status: string) =>
        api.patch(`/users/${id}/status`, { status }),
};
