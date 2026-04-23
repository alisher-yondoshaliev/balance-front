import { useEffect } from 'react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from './store/theme.store';
import Router from './router';
import { useAuthInit } from './hooks/useAuthInit';
import LoadingScreen from './components/common/LoadingScreen';
import { useAuthStore } from './store/auth.store';

/**
 * Main App Component
 * - Initializes authentication on mount
 * - Provides Material UI theme
 * - Sets up main router
 * - Shows loading screen during auth init
 */
function AppContent() {
  const { isInitializing } = useAuthStore();
  const { initAuth } = useAuthInit();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (isInitializing) {
    return <LoadingScreen />;
  }

  return <Router />;
}

export default function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <AppContent />
    </ThemeProvider>
  );
}