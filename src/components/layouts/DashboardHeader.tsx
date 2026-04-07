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
                backgroundColor: '#fff',
                color: 'inherit',
                boxShadow: (theme) =>
                    `0 2px 8px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'}`,
            }}
        >
            <Toolbar>
                <Tooltip title="Toggle Sidebar">
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={onMenuClick}
                        sx={{
                            mr: 2,
                            display: { xs: 'flex', sm: 'none' },
                            color: '#667eea',
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                </Tooltip>

                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        flex: 1,
                    }}
                >
                    Balance Market
                </Typography>

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
                                    width: 40,
                                    height: 40,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
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
