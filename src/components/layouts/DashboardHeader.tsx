import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AppBar, Toolbar, Typography, IconButton, Box,
    Avatar, Menu, MenuItem, Divider, Tooltip,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Logout as LogoutIcon,
    AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/auth.store';

interface DashboardHeaderProps {
    onMenuClick: () => void;
    drawerWidth?: number;
    sidebarCollapsed?: boolean;
    isMobile?: boolean;
}

/**
 * Dashboard Header Component
 * - AppBar with logo/branding
 * - Mobile menu toggle
 * - User avatar dropdown menu
 * - Logout functionality
 */
export default function DashboardHeader({
    onMenuClick,
    drawerWidth = 0,
    sidebarCollapsed = false,
    isMobile = false,
}: DashboardHeaderProps) {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { user } = useAuthStore();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleProfile = () => {
        handleMenuClose();
        navigate('/profile');
    };

    const handleLogout = async () => {
        handleMenuClose();
        await logout();
    };

    const userInitials = user?.fullName
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase() || 'U';

    return (
        <AppBar
            position="fixed"
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                width: `calc(100% - ${drawerWidth}px)`,
                ml: `${drawerWidth}px`,
                transition: (theme) =>
                    theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                backgroundColor: 'rgba(255,255,255,0.9)',
                color: 'inherit',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(148, 163, 184, 0.16)',
                boxShadow: '0 12px 30px rgba(15, 23, 42, 0.06)',
            }}
        >
            <Toolbar sx={{ minHeight: 72 }}>
                <Tooltip title="Toggle Sidebar">
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={onMenuClick}
                        sx={{
                            mr: 2,
                            color: '#3b82f6',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            backgroundColor: 'rgba(255,255,255,0.72)',
                            '&:hover': {
                                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                            },
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                </Tooltip>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                            color: '#fff',
                            fontWeight: 800,
                            fontSize: '1rem',
                            boxShadow: '0 12px 24px rgba(37, 99, 235, 0.28)',
                            flexShrink: 0,
                        }}
                    >
                        BM
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            variant="h6"
                            noWrap
                            sx={{
                                fontWeight: 800,
                                color: '#0f172a',
                                letterSpacing: '-0.02em',
                                lineHeight: 1.1,
                            }}
                        >
                            Balance Market
                        </Typography>
                        <Typography
                            variant="caption"
                            noWrap
                            sx={{ color: 'text.secondary', display: 'block', mt: 0.35 }}
                        >
                            {isMobile
                                ? 'Boshqaruv paneli'
                                : sidebarCollapsed
                                    ? 'Compact navigation'
                                    : 'Smart market management dashboard'}
                        </Typography>
                    </Box>
                </Box>

                {/* User Menu */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title={user?.fullName || 'User'}>
                        <IconButton
                            onClick={handleMenuOpen}
                            sx={{
                                p: 0,
                                '&:hover': {
                                    backgroundColor: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? 'rgba(255, 255, 255, 0.1)'
                                            : 'rgba(0, 0, 0, 0.04)',
                                },
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 42,
                                    height: 42,
                                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    boxShadow: '0 10px 24px rgba(37, 99, 235, 0.26)',
                                }}
                            >
                                {userInitials}
                            </Avatar>
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* User Dropdown Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    <MenuItem disabled>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {user?.fullName}
                        </Typography>
                    </MenuItem>
                    <MenuItem disabled sx={{ opacity: 0.7, cursor: 'default' }}>
                        <Typography variant="caption" color="textSecondary">
                            {user?.email}
                        </Typography>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleProfile}>
                        <AccountCircleIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                        Profili koʻrish
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                        <LogoutIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                        Chiqish
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
}
