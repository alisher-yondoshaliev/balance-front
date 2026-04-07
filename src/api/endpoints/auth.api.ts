import api from '../axios';

export const authApi = {
    sendOtp: (email: string) =>
        api.post('/auth/send-otp', { email }),

    verifyOtp: (data: { email: string; otp: string; otpToken: string }) =>
        api.post('/auth/verify-otp', data),

    register: (data: { emailToken: string; fullName: string; password: string }) =>
        api.post('/auth/register', data),

    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),

    getMe: () => api.get('/auth/me'),

    changePassword: (data: { oldPassword: string; newPassword: string }) =>
        api.patch('/auth/change-password', data),
};