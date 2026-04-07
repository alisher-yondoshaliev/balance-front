import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LoginRequest, RegisterWithOtpRequest, VerifyOtpRequest } from '../types';
import { useAuthStore } from '../store/auth.store';
import { authService } from '../services/endpoints/auth';
import type { AxiosError } from 'axios';

/**
 * useAuth Hook
 * Provides authentication operations with loading and error states
 */
export function useAuth() {
    const navigate = useNavigate();
    const { setAuth, logout: storeLogout, user, isAuthenticated } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Login with email and password
    const login = useCallback(
        async (credentials: LoginRequest) => {
            setLoading(true);
            setError(null);
            try {
                const response = await authService.login(credentials);
                setAuth(response.user, response.accessToken, response.refreshToken);
                navigate('/dashboard');
                return response;
            } catch (err) {
                const axiosErr = err as AxiosError<{ message: string }>;
                const message = axiosErr.response?.data?.message || 'Login failed';
                setError(message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [setAuth, navigate]
    );

    // Register with OTP verification
    const register = useCallback(
        async (data: RegisterWithOtpRequest) => {
            setLoading(true);
            setError(null);
            try {
                const response = await authService.register(data);
                setAuth(response.user, response.accessToken, response.refreshToken);
                navigate('/dashboard');
                return response;
            } catch (err) {
                const axiosErr = err as AxiosError<{ message: string }>;
                const message = axiosErr.response?.data?.message || 'Registration failed';
                setError(message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [setAuth, navigate]
    );

    // Send OTP to email
    const sendOtp = useCallback(async (email: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authService.sendOtp(email);
            return response;
        } catch (err) {
            const axiosErr = err as AxiosError<{ message: string }>;
            const message = axiosErr.response?.data?.message || 'Failed to send OTP';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Verify OTP code
    const verifyOtp = useCallback(async (data: VerifyOtpRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authService.verifyOtp(data);
            return response;
        } catch (err) {
            const axiosErr = err as AxiosError<{ message: string }>;
            const message = axiosErr.response?.data?.message || 'Invalid OTP';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Google login
    const loginWithGoogle = useCallback(() => {
        authService.googleLogin();
    }, []);

    // Logout
    const logout = useCallback(async () => {
        setLoading(true);
        try {
            await authService.logout();
            storeLogout();
            navigate('/');
        } catch (err) {
            console.error('Logout error:', err);
            storeLogout();
            navigate('/');
        } finally {
            setLoading(false);
        }
    }, [storeLogout, navigate]);

    // Change password
    const changePassword = useCallback(
        async (oldPassword: string, newPassword: string) => {
            setLoading(true);
            setError(null);
            try {
                const response = await authService.changePassword(oldPassword, newPassword);
                return response;
            } catch (err) {
                const axiosErr = err as AxiosError<{ message: string }>;
                const message = axiosErr.response?.data?.message || 'Failed to change password';
                setError(message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return {
        user,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        sendOtp,
        verifyOtp,
        loginWithGoogle,
        logout,
        changePassword,
    };
}
