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
                        main: '#667eea',
                        light: '#8b9ff5',
                        dark: '#5568d3',
                    },
                    secondary: {
                        main: '#f093fb',
                        light: '#f5a8ff',
                        dark: '#da5fe0',
                    },
                    background: {
                        default: '#f8f9fa',
                        paper: '#ffffff',
                    },
                    text: {
                        primary: '#2d3748',
                        secondary: '#718096',
                    },
                }
                : {
                    primary: {
                        main: '#667eea',
                        light: '#8b9ff5',
                        dark: '#5568d3',
                    },
                    secondary: {
                        main: '#f093fb',
                        light: '#f5a8ff',
                        dark: '#da5fe0',
                    },
                    background: {
                        default: '#1a202c',
                        paper: '#2d3748',
                    },
                    text: {
                        primary: '#f7fafc',
                        secondary: '#cbd5e0',
                    },
                }),
        },
        typography: {
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            h1: { fontWeight: 600 },
            h2: { fontWeight: 600 },
            h3: { fontWeight: 600 },
            h4: { fontWeight: 600 },
            h5: { fontWeight: 600 },
            h6: { fontWeight: 600 },
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                        borderRadius: '8px',
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: '12px',
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
