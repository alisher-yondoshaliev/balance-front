import { createTheme } from '@mui/material/styles';

/**
 * Material UI Theme Configuration
 * Uses purple gradient as primary color scheme
 */
export const theme = createTheme({
    palette: {
        primary: {
            main: '#667eea',
            light: '#8896f0',
            dark: '#4c63d2',
        },
        secondary: {
            main: '#764ba2',
            light: '#9057b8',
            dark: '#5a3782',
        },
        background: {
            default: '#f8f9fa',
            paper: '#ffffff',
        },
        text: {
            primary: '#2d3748',
            secondary: '#718096',
        },
        error: {
            main: '#f56565',
        },
        warning: {
            main: '#ed8936',
        },
        success: {
            main: '#48bb78',
        },
        info: {
            main: '#4299e1',
        },
    },
    typography: {
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
        h1: {
            fontSize: '2.5rem',
            fontWeight: 700,
            letterSpacing: '-0.5px',
        },
        h2: {
            fontSize: '2rem',
            fontWeight: 700,
            letterSpacing: '-0.3px',
        },
        h3: {
            fontSize: '1.75rem',
            fontWeight: 700,
        },
        h4: {
            fontSize: '1.5rem',
            fontWeight: 700,
        },
        h5: {
            fontSize: '1.25rem',
            fontWeight: 700,
        },
        h6: {
            fontSize: '1rem',
            fontWeight: 700,
        },
        body1: {
            fontSize: '0.95rem',
            lineHeight: 1.6,
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.6,
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '8px',
                    padding: '10px 24px',
                },
                contained: {
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    '&:hover': {
                        boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    borderRadius: '12px',
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
                size: 'small',
            },
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                },
            },
        },
    },
});
