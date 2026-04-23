import { useMemo } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
    Box, List, ListItem, ListItemButton, ListItemIcon,
    ListItemText, Typography, Tooltip,
} from '@mui/material';
import { useAuthStore } from '../../store/auth.store';
import { getMenuItemsByRole } from '../../config/menu';

interface DashboardSidebarProps {
    onItemClick?: () => void;
    collapsed?: boolean;
}

/**
 * Dashboard Sidebar Component
 * - Displays menu items filtered by user role
 * - Shows active route highlighting
 * - Collapsible menu items support
 */
export default function DashboardSidebar({ onItemClick, collapsed = false }: DashboardSidebarProps) {
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
                backgroundColor: 'transparent',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Box
                sx={{
                    px: collapsed ? 1.5 : 2.25,
                    pt: 2,
                    pb: collapsed ? 1 : 1.5,
                }}
            >
                <Box
                    sx={{
                        px: collapsed ? 1 : 1.25,
                        py: 1.25,
                        borderRadius: 3,
                        background: collapsed
                            ? 'rgba(37, 99, 235, 0.08)'
                            : 'linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(59, 130, 246, 0.04) 100%)',
                        border: '1px solid rgba(59, 130, 246, 0.12)',
                    }}
                >
                    <Typography
                        variant="overline"
                        sx={{
                            fontSize: collapsed ? '0.58rem' : '0.68rem',
                            fontWeight: 800,
                            color: '#2563eb',
                            letterSpacing: '0.16em',
                            display: 'block',
                            textAlign: collapsed ? 'center' : 'left',
                        }}
                    >
                        {collapsed ? 'NAV' : 'NAVIGATION'}
                    </Typography>

                    {!collapsed && (
                        <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary', fontWeight: 600 }}>
                            Barcha bo'limlarga tez kirish
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* Menu Items */}
            <List sx={{ px: collapsed ? 1 : 1.5, flex: 1 }}>
                {menuItems.map((item) => {
                    const IconComponent = item.icon;
                    const active = isActive(item.path);

                    return (
                        <ListItem
                            key={item.path}
                            disablePadding
                            sx={{ mb: 0.75 }}
                        >
                            <Tooltip title={collapsed ? item.label : ''} placement="right">
                                <ListItemButton
                                    component={RouterLink}
                                    to={item.path}
                                    selected={active}
                                    onClick={onItemClick}
                                    sx={{
                                        minHeight: 48,
                                        px: collapsed ? 1.25 : 1.5,
                                        py: 1,
                                        borderRadius: 3,
                                        justifyContent: collapsed ? 'center' : 'flex-start',
                                        color: active ? '#0f172a' : '#334155',
                                        backgroundColor: active ? 'rgba(37, 99, 235, 0.12)' : 'transparent',
                                        border: active
                                            ? '1px solid rgba(37, 99, 235, 0.16)'
                                            : '1px solid transparent',
                                        fontWeight: active ? 700 : 600,
                                        transition: 'all 0.22s ease',
                                        '&:hover': {
                                            backgroundColor: active
                                                ? 'rgba(37, 99, 235, 0.14)'
                                                : 'rgba(148, 163, 184, 0.08)',
                                        },
                                        '& .MuiListItemIcon-root': {
                                            color: active ? '#2563eb' : '#64748b',
                                            minWidth: collapsed ? 0 : 40,
                                            mr: collapsed ? 0 : 1,
                                            justifyContent: 'center',
                                        },
                                    }}
                                >
                                    <ListItemIcon>
                                        <Box
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: active
                                                    ? 'rgba(37, 99, 235, 0.12)'
                                                    : 'transparent',
                                            }}
                                        >
                                            <IconComponent fontSize="small" />
                                        </Box>
                                    </ListItemIcon>
                                    {!collapsed && (
                                        <ListItemText
                                            primary={item.label}
                                            primaryTypographyProps={{
                                                variant: 'body2',
                                                sx: {
                                                    fontWeight: 'inherit',
                                                },
                                            }}
                                        />
                                    )}
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>
                    );
                })}
            </List>

            {/* Footer */}
            <Box
                sx={{
                    p: collapsed ? 1.5 : 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'rgba(255,255,255,0.7)',
                }}
            >
                {collapsed ? (
                    <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                        BM
                    </Typography>
                ) : (
                    <>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 700 }}>
                            Balance Market
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            v 1.0.0
                        </Typography>
                    </>
                )}
            </Box>
        </Box>
    );
}
