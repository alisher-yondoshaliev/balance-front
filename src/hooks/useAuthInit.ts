import { useCallback } from 'react';
import { useAuthStore } from '../store/auth.store';
import { authService } from '../services/endpoints/auth';
import { AxiosError } from 'axios';

/**
 * Initialize auth on app load
 * Checks if user has valid token and restores session
 */
export function useAuthInit() {
    const { setAuth, setIsInitializing, logout, accessToken } = useAuthStore();

    const initAuth = useCallback(async () => {
        setIsInitializing(true);
        try {
            // If no token, skip init
            if (!accessToken) {
                setIsInitializing(false);
                return;
            }

            // Fetch current user with existing token
            const user = await authService.getCurrentUser();
            const { refreshToken } = useAuthStore.getState();

            // Update user in store but keep existing tokens
            setAuth(user, accessToken, refreshToken || undefined);
        } catch (error) {
            const err = error as AxiosError;
            if (err.response?.status === 401) {
                // Token expired or invalid
                logout();
            }
            console.error('Auth init error:', error);
        } finally {
            setIsInitializing(false);
        }
    }, [accessToken, setAuth, setIsInitializing, logout]);

    return { initAuth };
}
