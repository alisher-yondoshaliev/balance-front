import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography,
  IconButton, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Avatar, Menu,
  MenuItem, Divider, Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Store as StoreIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  CreditCard as CreditCardIcon,
  ChevronLeft as ChevronLeftIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../store/auth.store';
import { useMarketStore } from '../store/market.store';

const DRAWER_WIDTH = 260;

const menuItems = [
  { title: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, roles: ['SUPERADMIN', 'OWNER', 'ADMIN', 'MANAGER'] },
  { title: 'Marketlar', path: '/markets', icon: <StoreIcon />, roles: ['SUPERADMIN', 'OWNER'] },
  { title: 'Foydalanuvchilar', path: '/users', icon: <PeopleIcon />, roles: ['SUPERADMIN', 'OWNER'] },
  { title: 'Mijozlar', path: '/customers', icon: <PersonIcon />, roles: ['SUPERADMIN', 'OWNER', 'ADMIN', 'MANAGER'] },
  { title: 'Kategoriyalar', path: '/categories', icon: <CategoryIcon />, roles: ['SUPERADMIN', 'OWNER', 'ADMIN', 'MANAGER', 'SELLER'] },
  { title: 'Mahsulotlar', path: '/products', icon: <InventoryIcon />, roles: ['SUPERADMIN', 'OWNER', 'ADMIN', 'MANAGER', 'SELLER'] },
  { title: 'Shartnomalar', path: '/contracts', icon: <DescriptionIcon />, roles: ['SUPERADMIN', 'OWNER', 'ADMIN', 'MANAGER'] },
  { title: 'Obuna', path: '/subscriptions', icon: <CreditCardIcon />, roles: ['OWNER'] },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { selectedMarket } = useMarketStore();
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const filteredMenu = menuItems.filter(
    (item) => user?.role && item.roles.includes(user.role),
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => setOpen(!open)}
            edge="start"
            sx={{ mr: 2 }}
          >
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>

          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Balance
            {selectedMarket && (
              <Typography component="span" variant="body2" sx={{ ml: 2, opacity: 0.8 }}>
                — {selectedMarket.name}
              </Typography>
            )}
          </Typography>

          <Tooltip title={user?.fullName || ''}>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} color="inherit">
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
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>
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

      {/* Drawer */}
      <Drawer
        variant="persistent"
        open={open}
        sx={{
          width: open ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 1 }}>
          <List>
            {filteredMenu.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    mx: 1,
                    borderRadius: 2,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      '& .MuiListItemIcon-root': { color: 'white' },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.title} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: open ? `${DRAWER_WIDTH}px` : 0,
          transition: 'margin 0.2s',
          minHeight: '100vh',
          bgcolor: '#f5f5f5',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}