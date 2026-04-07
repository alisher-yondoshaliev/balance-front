import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuthStore } from '../../store/auth.store';
import { useMarketStore } from '../../store/market.store';
import { getMenuForRole } from '../../config/menuConfig';
import CommonHeader from './CommonHeader';
import CommonSidebar, { DRAWER_WIDTH } from './CommonSidebar';

export default function OwnerLayout() {
    const { user } = useAuthStore();
    const { selectedMarket } = useMarketStore();
    const [open, setOpen] = useState(true);

    if (!user || user.role === 'SUPERADMIN') {
        return null;
    }

    const menuItems = getMenuForRole(user.role);

    return (
        <Box sx={{ display: 'flex' }}>
            <CommonHeader
                open={open}
                onToggleSidebar={() => setOpen(!open)}
                selectedMarket={selectedMarket}
            />

            <CommonSidebar open={open} menuItems={menuItems} />

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
