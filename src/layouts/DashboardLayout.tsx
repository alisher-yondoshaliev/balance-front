import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Drawer, useTheme, useMediaQuery } from '@mui/material';
import DashboardHeader from '../components/layouts/DashboardHeader';
import DashboardSidebar from '../components/layouts/DashboardSidebar';

const DRAWER_WIDTH = 272;
const COLLAPSED_DRAWER_WIDTH = 92;

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
  const [desktopCollapsed, setDesktopCollapsed] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem('dashboard-sidebar-collapsed') === 'true';
  });

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
      return;
    }

    setSidebarOpen(true);
  }, [isMobile]);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setSidebarOpen((prev) => !prev);
      return;
    }

    setDesktopCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem('dashboard-sidebar-collapsed', String(next));
      return next;
    });
  };

  const handleDrawerClose = () => {
    setSidebarOpen(false);
  };

  const currentDrawerWidth = isMobile
    ? DRAWER_WIDTH
    : desktopCollapsed
      ? COLLAPSED_DRAWER_WIDTH
      : DRAWER_WIDTH;

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f8fbff 0%, #f4f6fb 100%)',
      }}
    >
      {/* Header */}
      <DashboardHeader
        onMenuClick={handleDrawerToggle}
        drawerWidth={!isMobile ? currentDrawerWidth : 0}
        sidebarCollapsed={!isMobile && desktopCollapsed}
        isMobile={isMobile}
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
              borderRight: '1px solid rgba(148, 163, 184, 0.18)',
              backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
            },
          }}
        >
          <DashboardSidebar onItemClick={handleDrawerClose} />
        </Drawer>
      ) : (
        <Box
          sx={{
            width: currentDrawerWidth,
            flexShrink: 0,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
        >
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              pt: 8,
              height: '100vh',
              borderRight: `1px solid ${theme.palette.divider}`,
              backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
            }}
          >
            <DashboardSidebar collapsed={desktopCollapsed} />
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
        <Box
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            flex: 1,
            width: '100%',
            maxWidth: '1600px',
            mx: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
