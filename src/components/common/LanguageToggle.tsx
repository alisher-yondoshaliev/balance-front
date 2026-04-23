import { IconButton, Tooltip, Box, Menu, MenuItem } from '@mui/material';
import { Globe } from 'lucide-react';
import { useLanguageStore } from '../../store/language.store';
import { useState } from 'react';

/**
 * Language Toggle Button Component
 * Switches between EN and UZ
 */
export function LanguageToggle() {
    const { language, toggleLanguage } = useLanguageStore();

    return (
        <Tooltip title={language === 'uz' ? 'English' : 'Uzbek'}>
            <IconButton
                onClick={toggleLanguage}
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
                <Globe size={20} />
                <Box sx={{ ml: 0.5, fontSize: '12px', fontWeight: 'bold' }}>
                    {language.toUpperCase()}
                </Box>
            </IconButton>
        </Tooltip>
    );
}

/**
 * Language Switcher with Dropdown Menu
 */
export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguageStore();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSelect = (lang: 'en' | 'uz') => {
        setLanguage(lang);
        handleClose();
    };

    return (
        <>
            <Tooltip title="Select Language">
                <IconButton
                    onClick={handleOpen}
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
                    <Globe size={20} />
                    <Box sx={{ ml: 0.5, fontSize: '12px', fontWeight: 'bold' }}>
                        {language.toUpperCase()}
                    </Box>
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        minWidth: '120px',
                    },
                }}
            >
                <MenuItem
                    onClick={() => handleSelect('uz')}
                    selected={language === 'uz'}
                    sx={{
                        bgcolor: language === 'uz' ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                    }}
                >
                    🇺🇿 Uzbek
                </MenuItem>
                <MenuItem
                    onClick={() => handleSelect('en')}
                    selected={language === 'en'}
                    sx={{
                        bgcolor: language === 'en' ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                    }}
                >
                    🇺🇸 English
                </MenuItem>
            </Menu>
        </>
    );
}
