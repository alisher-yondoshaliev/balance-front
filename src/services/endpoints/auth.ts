import apiClient from '../api/client';
import type {
    AuthResponse,
    LoginRequest,
    User,
    VerifyOtpRequest,
    RegisterWithOtpRequest,
    OtpResponse,
    EmailTokenResponse,
    ForgotPasswordRequest,
    ResendOtpRequest,
    ResetPasswordRequest,
} from '../../types';

export const authService = {
    // Login with email and password
    login: async (payload: LoginRequest): Promise<AuthResponse> => {
        const { data } = await apiClient.post('/auth/login', payload);
        return data;
    },

    // Register with email and password
    register: async (payload: RegisterWithOtpRequest): Promise<AuthResponse> => {
        const { data } = await apiClient.post('/auth/register', payload);
        return data;
    },

    // Send OTP to email
    sendOtp: async (email: string): Promise<OtpResponse> => {
        const { data } = await apiClient.post('/auth/send-otp', { email });
        return data;
    },

    // Verify OTP code
    verifyOtp: async (payload: VerifyOtpRequest): Promise<EmailTokenResponse> => {
        const { data } = await apiClient.post('/auth/verify-otp', payload);
        return data;
    },

    // Get current user info
    getCurrentUser: async (): Promise<User> => {
        const { data } = await apiClient.get('/auth/me');
        return data;
    },

    // Refresh access token
    refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
        const { data } = await apiClient.post('/auth/refresh', { refreshToken });
        return data;
    },

    // Logout - soft logout (no API call needed)
    logout: async (): Promise<void> => {
        // If backend has logout endpoint, call it here
        // await apiClient.post('/auth/logout');
    },

    // Google OAuth login
    googleLogin: (): void => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        window.location.href = `${apiUrl}/auth/google`;
    },

    // Handle Google OAuth callback
    googleCallback: async (code: string): Promise<AuthResponse> => {
        const { data } = await apiClient.post('/auth/google/callback', { code });
        return data;
    },

    // Forgot Password Flow - Send OTP
    sendForgotPasswordOtp: async (email: string): Promise<OtpResponse> => {
        const { data } = await apiClient.post('/auth/send-otp', {
            email,
            purpose: 'reset_password',
        } as ForgotPasswordRequest);
        return data;
    },

    // Forgot Password Flow - Verify OTP
    verifyForgotPasswordOtp: async (email: string, otp: string, otpToken: string): Promise<EmailTokenResponse> => {
        const { data } = await apiClient.post<EmailTokenResponse>('/auth/verify-otp', {
            email,
            otp,
            otpToken,
            purpose: 'reset_password',
        });
        return data;
    },

    // Resend OTP for forgot password
    resendForgotPasswordOtp: async (email: string): Promise<OtpResponse> => {
        const { data } = await apiClient.post('/auth/send-otp', {
            email,
            purpose: 'reset_password',
        } as ResendOtpRequest);
        return data;
    },

    // Reset password with email token
    resetPassword: async (payload: ResetPasswordRequest): Promise<{ message: string }> => {
        const { data } = await apiClient.post('/auth/reset-password', payload);
        return data;
    },

    // Change password
    changePassword: async (
        oldPassword: string,
        newPassword: string
    ): Promise<{ message: string }> => {
        const { data } = await apiClient.post('/auth/change-password', {
            oldPassword,
            newPassword,
        });
        return data;
    },
};
