/**
 * Beautiful Error Alert Component
 * Reusable error display with icons and better styling
 */

import React from 'react';
import { Box, Paper, Typography, Button, IconButton } from '@mui/material';
import { AlertCircle, X } from 'lucide-react';

interface ErrorAlertProps {
    title?: string;
    message: string;
    onRetry?: () => void;
    onDismiss?: () => void;
    type?: 'market' | 'permission' | 'general';
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
    title,
    message,
    onRetry,
    onDismiss,
    type = 'general',
}) => {
    const getBackgroundColor = () => {
        switch (type) {
            case 'market':
                return '#fff3e0'; // Amber
            case 'permission':
                return '#ffebee'; // Red
            default:
                return '#f5f5f5'; // Grey
        }
    };

    const getBorderColor = () => {
        switch (type) {
            case 'market':
                return '#ff9800';
            case 'permission':
                return '#f44336';
            default:
                return '#e0e0e0';
        }
    };

    const getIconColor = () => {
        switch (type) {
            case 'market':
                return '#ff9800';
            case 'permission':
                return '#f44336';
            default:
                return '#757575';
        }
    };

    const getTitleColor = () => {
        switch (type) {
            case 'market':
                return '#e65100';
            case 'permission':
                return '#b71c1c';
            default:
                return '#424242';
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Paper
                sx={{
                    p: 3,
                    bgcolor: getBackgroundColor(),
                    borderLeft: `4px solid ${getBorderColor()}`,
                    borderRadius: 1,
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-start',
                }}
            >
                {/* Icon */}
                <Box sx={{ flexShrink: 0, pt: 0.5 }}>
                    <AlertCircle size={28} color={getIconColor()} />
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1 }}>
                    {title && (
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 'bold',
                                color: getTitleColor(),
                                mb: 1,
                            }}
                        >
                            {title}
                        </Typography>
                    )}
                    <Typography
                        variant="body2"
                        sx={{
                            color: getTitleColor(),
                            lineHeight: 1.6,
                            mb: title ? 2 : 0,
                        }}
                    >
                        {message}
                    </Typography>

                    {/* Action Buttons */}
                    {(onRetry || onDismiss) && (
                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                            {onRetry && (
                                <Button
                                    size="small"
                                    variant="contained"
                                    sx={{
                                        bgcolor: type === 'permission' ? '#f44336' : type === 'market' ? '#ff9800' : '#757575',
                                        color: '#fff',
                                        '&:hover': {
                                            bgcolor: type === 'permission' ? '#d32f2f' : type === 'market' ? '#f57c00' : '#616161',
                                        },
                                    }}
                                    onClick={onRetry}
                                >
                                    Qayta Urinib Ko'ring
                                </Button>
                            )}
                            {onDismiss && (
                                <Button
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        borderColor: getIconColor(),
                                        color: getIconColor(),
                                    }}
                                    onClick={onDismiss}
                                >
                                    Yopish
                                </Button>
                            )}
                        </Box>
                    )}
                </Box>

                {/* Close Button */}
                {onDismiss && (
                    <Box sx={{ flexShrink: 0 }}>
                        <IconButton
                            size="small"
                            onClick={onDismiss}
                            sx={{ color: getIconColor() }}
                        >
                            <X size={20} />
                        </IconButton>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};
