import { useLocation, useNavigate } from 'react-router-dom';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Box,
} from '@mui/material';
import type { MenuItem } from '../../config/menuConfig';

const DRAWER_WIDTH = 260;

interface CommonSidebarProps {
    open: boolean;
    menuItems: MenuItem[];
}

export default function CommonSidebar({ open, menuItems }: CommonSidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();

    return (
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
                    {menuItems.map((item) => (
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
    );
}

export { DRAWER_WIDTH };
