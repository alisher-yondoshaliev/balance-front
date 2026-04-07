import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Loading Screen Component
 * Shows a centered spinner while app is initializing
 */
export default function LoadingScreen() {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                backgroundColor: '#f8f9fa',
                gap: 2,
            }}
        >
            <CircularProgress
                sx={{
                    color: '#667eea',
                }}
            />
            <Typography
                variant="body1"
                sx={{
                    color: 'textSecondary',
                    fontWeight: 500,
                }}
            >
                Iltimos, kuting...
            </Typography>
        </Box>
    );
}
