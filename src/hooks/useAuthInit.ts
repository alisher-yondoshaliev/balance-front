import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { authApi } from '../api/endpoints/auth.api';
import { isSuperAdmin } from '../utils/roles';
import { useMarketStore } from '../store/market.store';

/**
 * Hook to initialize auth on app load
 * - Verify accessToken is still valid
 * - Refresh user data from /api/auth/me
 * - Initialize market for OWNER users if needed
 */
export function useAuthInit() {
    const { isAuthenticated, setUser, logout } = useAuthStore();
    const { selectedMarket, clearMarket } = useMarketStore();

    useEffect(() => {
        const initAuth = async () => {
            if (!isAuthenticated) return;

            try {
                // Fetch fresh user data from server
                const response = await authApi.getMe();
                const user = response.data.data || response.data;

                // Update user in store
                setUser(user);

                // Clear market selection for SUPERADMIN
                if (isSuperAdmin(user.role)) {
                    clearMarket();
                }
                // For OWNER, keep the selected market if available
                // Otherwise it will be selected when they go to markets page
            } catch (error) {
                console.error('Auth init failed:', error);
                logout();
            }
        };

        initAuth();
    }, [isAuthenticated, setUser, logout, clearMarket]);
}
