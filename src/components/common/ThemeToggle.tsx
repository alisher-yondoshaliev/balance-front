import { IconButton, Tooltip, Box } from '@mui/material';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../../store/theme.store';

/**
 * Theme Toggle Button Component
 * Switches between light and dark mode
 */
export function ThemeToggle() {
    const { mode, toggleTheme } = useThemeStore();

    return (
        <Tooltip title={mode === 'light' ? 'Dark Mode' : 'Light Mode'}>
            <IconButton
                onClick={toggleTheme}
                color="inherit"
                size="small"
                sx={{
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        bgcolor: 'rgba(102, 126, 234, 0.1)',
                    },
                }}
            >
                {mode === 'light' ? (
                    <Moon size={20} className="text-gray-700" />
                ) : (
                    <Sun size={20} className="text-yellow-400" />
                )}
            </IconButton>
        </Tooltip>
    );
}

/**
 * Theme Switcher with visual indication
 */
export function ThemeSwitcher() {
    const { mode, setTheme } = useThemeStore();

    return (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Tooltip title="Light Mode">
                <IconButton
                    size="small"
                    onClick={() => setTheme('light')}
                    sx={{
                        padding: '8px',
                        bgcolor: mode === 'light' ? 'primary.main' : 'rgba(102, 126, 234, 0.1)',
                        color: mode === 'light' ? 'white' : 'primary.main',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            bgcolor: 'primary.main',
                            color: 'white',
                        },
                    }}
                >
                    <Sun size={18} />
                </IconButton>
            </Tooltip>
            <Tooltip title="Dark Mode">
                <IconButton
                    size="small"
                    onClick={() => setTheme('dark')}
                    sx={{
                        padding: '8px',
                        bgcolor: mode === 'dark' ? 'primary.main' : 'rgba(102, 126, 234, 0.1)',
                        color: mode === 'dark' ? 'white' : 'primary.main',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            bgcolor: 'primary.main',
                            color: 'white',
                        },
                    }}
                >
                    <Moon size={18} />
                </IconButton>
            </Tooltip>
        </Box>
    );
}
