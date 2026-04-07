import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Box, List, ListItem, ListItemButton, ListItemIcon,
    ListItemText, Typography,
} from '@mui/material';
import { useAuthStore } from '../../store/auth.store';
import { getMenuItemsByRole } from '../../config/menu';

interface DashboardSidebarProps {
    onItemClick?: () => void;
}

/**
 * Dashboard Sidebar Component
 * - Displays menu items filtered by user role
 * - Shows active route highlighting
 * - Collapsible menu items support
 */
export default function DashboardSidebar({ onItemClick }: DashboardSidebarProps) {
    const { user } = useAuthStore();
    const { pathname } = useLocation();

    // Get role-filtered menu items
    const menuItems = useMemo(
        () => getMenuItemsByRole(user?.role as any),
        [user?.role]
    );

    // Track which menus are active based on current pathname
    const isActive = (path: string): boolean => {
        if (path === '/dashboard' && pathname === '/dashboard') return true;
        if (path !== '/dashboard' && pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                overflow: 'auto',
                backgroundColor: '#f8f9fa',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Menu Header */}
            <Box sx={{ p: 2, pb: 1 }}>
                <Typography
                    variant="overline"
                    sx={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: 'textSecondary',
                        letterSpacing: '0.5px',
                    }}
                >
                    Navigation
                </Typography>
            </Box>

            {/* Menu Items */}
            <List sx={{ px: 1, flex: 1 }}>
                {menuItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                        <ListItem
                            key={item.path}
                            disablePadding
                            sx={{ mb: 0.5 }}
                        >
                            <ListItemButton
                                href={item.path}
                                selected={isActive(item.path)}
                                onClick={onItemClick}
                                sx={{
                                    borderRadius: '8px',
                                    mx: 1,
                                    color: isActive(item.path) ? '#667eea' : 'textPrimary',
                                    backgroundColor: isActive(item.path)
                                        ? 'rgba(102, 126, 234, 0.1)'
                                        : 'transparent',
                                    fontWeight: isActive(item.path) ? 600 : 500,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(102, 126, 234, 0.08)',
                                    },
                                    '& .MuiListItemIcon-root': {
                                        color: isActive(item.path) ? '#667eea' : 'inherit',
                                        minWidth: 40,
                                    },
                                }}
                            >
                                <ListItemIcon>
                                    <IconComponent />
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{
                                        variant: 'body2',
                                        sx: {
                                            fontWeight: 'inherit',
                                        },
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            {/* Footer */}
            <Box
                sx={{
                    p: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: '#fff',
                }}
            >
                <Typography variant="caption" color="textSecondary" display="block">
                    Balance Market
                </Typography>
                <Typography variant="caption" color="textSecondary">
                    v 1.0.0
                </Typography>
            </Box>
        </Box>
    );
}
