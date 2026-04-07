import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    Tooltip,
    Box,
} from '@mui/material';
import {
    Menu as MenuIcon,
    ChevronLeft as ChevronLeftIcon,
    Logout as LogoutIcon,
    AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../../store/auth.store';
import { isSuperAdmin } from '../../utils/roles';
import type { Market } from '../../types';

interface CommonHeaderProps {
    open: boolean;
    onToggleSidebar: () => void;
    selectedMarket?: Market | null;
}

export default function CommonHeader({ open, onToggleSidebar, selectedMarket }: CommonHeaderProps) {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppBar
            position="fixed"
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    onClick={onToggleSidebar}
                    edge="start"
                    sx={{ mr: 2 }}
                >
                    {open ? <ChevronLeftIcon /> : <MenuIcon />}
                </IconButton>

                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <Typography variant="h6" noWrap>
                        Balance
                    </Typography>
                    {/* Show market info only for OWNER/ADMIN/MANAGER/SELLER, not for SUPERADMIN */}
                    {!isSuperAdmin(user?.role) && selectedMarket && (
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            {selectedMarket.name}
                        </Typography>
                    )}
                </Box>

                <Tooltip title={user?.fullName || ''}>
                    <IconButton
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                        color="inherit"
                        sx={{ ml: 2 }}
                    >
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                            {user?.fullName?.[0]}
                        </Avatar>
                    </IconButton>
                </Tooltip>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                >
                    <MenuItem disabled>
                        <Typography variant="body2">{user?.email}</Typography>
                    </MenuItem>
                    <MenuItem disabled>
                        <Typography variant="caption" color="text.secondary">
                            {user?.role}
                        </Typography>
                    </MenuItem>
                    <Divider />
                    <MenuItem
                        onClick={() => {
                            setAnchorEl(null);
                            navigate('/profile');
                        }}
                    >
                        <AccountCircleIcon fontSize="small" sx={{ mr: 1 }} />
                        Profil
                    </MenuItem>
                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                        <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                        Chiqish
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
}
