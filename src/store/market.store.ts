import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Market } from '../types';

interface MarketState {
  selectedMarket: Market | null;
  setSelectedMarket: (market: Market | null) => void;
  clearMarket: () => void;
}

export const useMarketStore = create<MarketState>()(
  persist(
    (set) => ({
      selectedMarket: null,
      // Only set market if provided, allowing null for SUPERADMIN
      setSelectedMarket: (market) => set({ selectedMarket: market }),
      clearMarket: () => set({ selectedMarket: null }),
    }),
    { name: 'market-storage' },
  ),
);