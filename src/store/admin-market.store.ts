/**
 * Admin Market Store
 * 
 * ADMIN role - works ONLY inside assigned market
 * 
 * Goals:
 * 1. Extract marketId from user.marketId
 * 2. Store it globally
 * 3. Provide it to all API calls
 * 4. Never allow undefined.map
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminMarketState {
    // Current admin's market ID
    adminMarketId: string | null;

    // Set admin's market from user
    setAdminMarket: (marketId: string | null) => void;

    // Clear admin market
    clearAdminMarket: () => void;

    // Check if admin has market assigned
    hasMarket: () => boolean;
}

/**
 * Admin Market Store - manages admin's assigned market
 * 
 * Usage:
 * const { adminMarketId } = useAdminMarketStore();
 * 
 * if (!useAdminMarketStore().hasMarket()) {
 *   return <LoadingScreen message="Market not assigned" />;
 * }
 */
export const useAdminMarketStore = create<AdminMarketState>()(
    persist(
        (set, get) => ({
            adminMarketId: null,

            setAdminMarket: (marketId) => {
                if (marketId) {
                    console.log('[AdminMarketStore] Admin assigned to market:', marketId);
                } else {
                    console.warn('[AdminMarketStore] Clearing admin market');
                }
                set({ adminMarketId: marketId });
            },

            clearAdminMarket: () => {
                console.log('[AdminMarketStore] Clearing admin market');
                set({ adminMarketId: null });
            },

            hasMarket: () => {
                const state = get();
                return !!state.adminMarketId;
            },
        }),
        {
            name: 'admin-market-storage',
            partialize: (state) => ({
                adminMarketId: state.adminMarketId,
            }),
        },
    ),
);
