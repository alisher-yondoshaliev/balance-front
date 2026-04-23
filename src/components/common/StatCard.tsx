import React from 'react';
import { Card, CardContent, Box, Typography, useTheme } from '@mui/material';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: 'primary' | 'success' | 'warning' | 'error' | 'info';
    trend?: {
        value: number;
        positive: boolean;
    };
    onClick?: () => void;
}

/**
 * StatCard Component
 * Displays a statistic with icon, title, value, and optional trend
 */
export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    color,
    trend,
    onClick,
}) => {
    const theme = useTheme();
    const colorMap = {
        primary: theme.palette.primary.main,
        success: theme.palette.success.main,
        warning: theme.palette.warning.main,
        error: theme.palette.error.main,
        info: theme.palette.info.main,
    };

    return (
        <Card
            sx={{
                cursor: onClick ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
                '&:hover': onClick ? {
                    boxShadow: 6,
                    transform: 'translateY(-4px)',
                } : {},
            }}
            onClick={onClick}
        >
            <CardContent>
                <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                    <Box flex={1}>
                        <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{ mb: 1, fontWeight: 500 }}
                        >
                            {title}
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                                fontSize: '1.5rem',
                                mb: trend ? 0.5 : 0,
                            }}
                        >
                            {value}
                        </Typography>
                        {trend && (
                            <Box
                                display="flex"
                                alignItems="center"
                                sx={{
                                    color: trend.positive ? theme.palette.success.main : theme.palette.error.main,
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                }}
                            >
                                <span>{trend.positive ? '↑' : '↓'}</span>
                                <span style={{ marginLeft: '4px' }}>{Math.abs(trend.value)}%</span>
                            </Box>
                        )}
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 56,
                            height: 56,
                            borderRadius: '12px',
                            backgroundColor: `${colorMap[color]}20`,
                            color: colorMap[color],
                            flexShrink: 0,
                        }}
                    >
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};
