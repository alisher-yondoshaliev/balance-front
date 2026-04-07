import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User, AuthState } from '../types';

interface AuthActions {
    setAuth: (user: User, accessToken: string, refreshToken?: string) => void;
    setUser: (user: User) => void;
    setAccessToken: (token: string) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

export const useAuthStore = create<AuthStore>()(
    devtools(
        persist(
            (set) => ({
                ...initialState,
                setAuth: (user, accessToken, refreshToken?) => {
                    set({
                        user,
                        accessToken,
                        refreshToken: refreshToken || null,
                        isAuthenticated: true,
                        error: null,
                    });
                },
                setUser: (user) => {
                    set({ user });
                },
                setAccessToken: (token) => {
                    set({ accessToken: token });
                },
                logout: () => {
                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        isAuthenticated: false,
                        error: null,
                    });
                },
                setLoading: (loading) => {
                    set({ isLoading: loading });
                },
                setError: (error) => {
                    set({ error });
                },
            }),
            {
                name: 'balance-auth-storage',
                partialize: (state) => ({
                    user: state.user,
                    accessToken: state.accessToken,
                    refreshToken: state.refreshToken,
                    isAuthenticated: state.isAuthenticated,
                }),
            }
        )
    )
);
