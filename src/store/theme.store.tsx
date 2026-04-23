import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
    mode: ThemeMode;
    toggleTheme: () => void;
    setTheme: (mode: ThemeMode) => void;
}

// Initialize theme from localStorage or system preference
const getInitialTheme = (): ThemeMode => {
    if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('theme-storage');
        if (savedTheme) {
            try {
                const parsed = JSON.parse(savedTheme);
                if (parsed.state?.mode === 'light' || parsed.state?.mode === 'dark') {
                    console.log('📦 Theme loaded from localStorage:', parsed.state.mode);
                    return parsed.state.mode;
                }
            } catch (e) {
                console.error('Failed to parse theme from localStorage', e);
            }
        }

        // Detect system preference
        const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        console.log('🎨 System preference detected:', systemPreference);
        return systemPreference;
    }
    return 'light';
};

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            mode: getInitialTheme(),
            toggleTheme: () => {
                set((state) => {
                    const newMode = state.mode === 'light' ? 'dark' : 'light';
                    console.log('🔄 Theme toggled:', state.mode, '→', newMode);
                    // Apply to document for Tailwind
                    applyThemeToDocument(newMode);
                    return { mode: newMode };
                });
            },
            setTheme: (mode) => {
                console.log('⚙️ Theme set to:', mode);
                applyThemeToDocument(mode);
                set({ mode });
            },
        }),
        { name: 'theme-storage' },
    ),
);

// Apply theme to document for Tailwind dark mode
const applyThemeToDocument = (mode: ThemeMode) => {
    if (typeof document !== 'undefined') {
        if (mode === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        console.log('✅ Dark class applied to document:', mode);
    }
};

// Create Material UI theme based on mode
export const createAppTheme = (mode: ThemeMode) => {
    return createTheme({
        palette: {
            mode,
            ...(mode === 'light'
                ? {
                    primary: {
                        main: '#2563eb',
                        light: '#60a5fa',
                        dark: '#1d4ed8',
                    },
                    secondary: {
                        main: '#0f172a',
                        light: '#334155',
                        dark: '#020617',
                    },
                    background: {
                        default: '#f4f7fb',
                        paper: '#ffffff',
                    },
                    text: {
                        primary: '#0f172a',
                        secondary: '#64748b',
                    },
                }
                : {
                    primary: {
                        main: '#60a5fa',
                        light: '#93c5fd',
                        dark: '#2563eb',
                    },
                    secondary: {
                        main: '#cbd5e1',
                        light: '#e2e8f0',
                        dark: '#94a3b8',
                    },
                    background: {
                        default: '#0f172a',
                        paper: '#111c2d',
                    },
                    text: {
                        primary: '#f8fafc',
                        secondary: '#cbd5e1',
                    },
                }),
        },
        typography: {
            fontFamily: '"Plus Jakarta Sans", "Segoe UI", "Inter", sans-serif',
            h1: { fontWeight: 800, letterSpacing: '-0.03em' },
            h2: { fontWeight: 800, letterSpacing: '-0.03em' },
            h3: { fontWeight: 700, letterSpacing: '-0.02em' },
            h4: { fontWeight: 700, letterSpacing: '-0.02em' },
            h5: { fontWeight: 700, letterSpacing: '-0.015em' },
            h6: { fontWeight: 700, letterSpacing: '-0.01em' },
            button: { fontWeight: 700 },
        },
        shape: {
            borderRadius: 8,
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                        borderRadius: 8,
                        paddingInline: 18,
                        boxShadow: 'none',
                    },
                    contained: {
                        boxShadow: '0 12px 24px rgba(37, 99, 235, 0.22)',
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 10,
                        boxShadow: mode === 'light'
                            ? '0 18px 48px rgba(15, 23, 42, 0.06)'
                            : '0 20px 48px rgba(2, 6, 23, 0.32)',
                        border: mode === 'light'
                            ? '1px solid rgba(148, 163, 184, 0.12)'
                            : '1px solid rgba(148, 163, 184, 0.16)',
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        borderRadius: 10,
                        boxShadow: mode === 'light'
                            ? '0 12px 32px rgba(15, 23, 42, 0.06)'
                            : '0 18px 42px rgba(2, 6, 23, 0.26)',
                        border: mode === 'light'
                            ? '1px solid rgba(148, 163, 184, 0.12)'
                            : '1px solid rgba(148, 163, 184, 0.14)',
                    },
                },
            },
            MuiTableHead: {
                styleOverrides: {
                    root: {
                        '& .MuiTableCell-root': {
                            fontWeight: 700,
                            color: mode === 'light' ? '#334155' : '#e2e8f0',
                            backgroundColor: mode === 'light' ? '#f8fafc' : '#162235',
                        },
                    },
                },
            },
            MuiTableCell: {
                styleOverrides: {
                    root: {
                        borderBottomColor: mode === 'light'
                            ? 'rgba(148, 163, 184, 0.14)'
                            : 'rgba(148, 163, 184, 0.12)',
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        borderRadius: 999,
                        fontWeight: 700,
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                    },
                },
            },
        },
    });
};

export function ThemeProvider({ children }: { children: ReactNode }) {
    const { mode } = useThemeStore();
    const theme = createAppTheme(mode);

    // Apply theme on mount and when mode changes
    useEffect(() => {
        applyThemeToDocument(mode);
        console.log('🏄 ThemeProvider mounted/updated with mode:', mode);
    }, [mode]);

    return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
}
