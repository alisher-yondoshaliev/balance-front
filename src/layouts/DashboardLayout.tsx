import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Drawer, useTheme, useMediaQuery } from '@mui/material';
import DashboardHeader from '../components/layouts/DashboardHeader';
import DashboardSidebar from '../components/layouts/DashboardSidebar';

const DRAWER_WIDTH = 260;

/**
 * Dashboard Layout - Main layout for authenticated pages
 * Contains:
 * - Header with user menu
 * - Sidebar with navigation
 * - Content area with page outlet
 */
export default function DashboardLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleDrawerClose = () => {
    setSidebarOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Header */}
      <DashboardHeader
        onMenuClick={handleDrawerToggle}
        drawerWidth={!isMobile ? DRAWER_WIDTH : 0}
      />

      {/* Sidebar */}
      {isMobile ? (
        <Drawer
          open={sidebarOpen}
          onClose={handleDrawerClose}
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              marginTop: '64px',
            },
          }}
        >
          <DashboardSidebar onItemClick={handleDrawerClose} />
        </Drawer>
      ) : (
        <Box
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            borderRight: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ position: 'sticky', top: 0, pt: 8 }}>
            <DashboardSidebar />
          </Box>
        </Box>
      )}

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          pt: 8,
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, flex: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}