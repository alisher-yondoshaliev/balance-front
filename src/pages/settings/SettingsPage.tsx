import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Switch,
    FormControlLabel,
    Button,
    Alert,
    Grid,
    Paper,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Visibility as VisibilityIcon,
    Palette as PaletteIcon,
    Storage as StorageIcon,
    Security as SecurityIcon,
    Settings as SettingsIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
    Language as LanguageIcon,
} from '@mui/icons-material';
import { useThemeStore } from '../../store/theme.store';
import { useLanguageStore } from '../../store/language.store';

interface NotificationSettings {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    weeklyReport: boolean;
    monthlyReport: boolean;
}

interface PrivacySettings {
    profileVisible: boolean;
    showActivityStatus: boolean;
    allowDataAnalytics: boolean;
}

export default function SettingsPage() {
    const [saveSuccess, setSaveSuccess] = useState(false);
    const navigate = useNavigate();
    const { mode, setTheme } = useThemeStore();
    const { language, setLanguage } = useLanguageStore();

    // Notification settings
    const [notifications, setNotifications] = useState<NotificationSettings>({
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        weeklyReport: true,
        monthlyReport: true,
    });

    // Privacy settings
    const [privacy, setPrivacy] = useState<PrivacySettings>({
        profileVisible: true,
        showActivityStatus: true,
        allowDataAnalytics: true,
    });

    const handleNotificationChange = (key: keyof NotificationSettings) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handlePrivacyChange = (key: keyof PrivacySettings) => {
        setPrivacy(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleSaveSettings = () => {
        // TODO: Implement API call to save settings
        console.log('Saving settings:', { notifications, privacy });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <SettingsIcon sx={{ fontSize: 32, color: '#667eea' }} />
                    <Box>
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                            Sozlamalar
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Aplikatsion sozlamalari va xususiyatlarni boshqarish
                        </Typography>
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    sx={{ bgcolor: '#667eea', '&:hover': { bgcolor: '#5568d3' } }}
                    onClick={() => navigate('/profile')}
                >
                    👤 Profil
                </Button>
            </Box>

            {saveSuccess && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    ✅ Sozlamalar muvaffaqiyatli saqlandi
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Notification Settings */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardHeader
                            avatar={<NotificationsIcon sx={{ color: '#667eea' }} />}
                            title="Bildirishnomalar"
                            subheader="Qanday tur bildirishnomalarni qabul qilishni tanlang"
                        />
                        <Divider />
                        <CardContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={notifications.emailNotifications}
                                        onChange={() => handleNotificationChange('emailNotifications')}
                                    />
                                }
                                label="Email bildirishnomalar"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={notifications.smsNotifications}
                                        onChange={() => handleNotificationChange('smsNotifications')}
                                    />
                                }
                                label="SMS bildirishnomalar"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={notifications.pushNotifications}
                                        onChange={() => handleNotificationChange('pushNotifications')}
                                    />
                                }
                                label="Push bildirishnomalar"
                            />
                            <Divider sx={{ my: 1 }} />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={notifications.weeklyReport}
                                        onChange={() => handleNotificationChange('weeklyReport')}
                                    />
                                }
                                label="Haftaviy hisobot"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={notifications.monthlyReport}
                                        onChange={() => handleNotificationChange('monthlyReport')}
                                    />
                                }
                                label="Oylik hisobot"
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Privacy Settings */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardHeader
                            avatar={<VisibilityIcon sx={{ color: '#667eea' }} />}
                            title="Xususiyat"
                            subheader="Sizning ma'lumotlarining ko'rinishini boshqarish"
                        />
                        <Divider />
                        <CardContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={privacy.profileVisible}
                                        onChange={() => handlePrivacyChange('profileVisible')}
                                    />
                                }
                                label="Profilni boshqalar ko'rsatish"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={privacy.showActivityStatus}
                                        onChange={() => handlePrivacyChange('showActivityStatus')}
                                    />
                                }
                                label="Faoliyat holatini ko'rsatish"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={privacy.allowDataAnalytics}
                                        onChange={() => handlePrivacyChange('allowDataAnalytics')}
                                    />
                                }
                                label="Dannyalarni tahlil qilish uchun ruxsat berish"
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Account Settings */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardHeader
                            avatar={<SecurityIcon sx={{ color: '#667eea' }} />}
                            title="Akkaunt Xavfsizligi"
                            subheader="Sizning akkauntingizning xavfsizligini ta'minlash"
                        />
                        <Divider />
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                                    🔐 Ikki faktorli autentifikatsiya
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Akkauntingizga qo'shimcha xavfsizlik qatlami qo'shish
                                </Typography>
                            </Paper>
                            <Button variant="outlined" fullWidth sx={{ mt: 1 }}>
                                Faollantirish
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* System Settings */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardHeader
                            avatar={<PaletteIcon sx={{ color: '#667eea' }} />}
                            title="Tizim Sozlamalari"
                            subheader="Interfeys va mavzularni tanlash"
                        />
                        <Divider />
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Theme Toggle */}
                            <Box>
                                <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
                                    🎨 Mavzu
                                </Typography>
                                <ToggleButtonGroup
                                    value={mode}
                                    exclusive
                                    onChange={(_, newMode) => {
                                        if (newMode) setTheme(newMode);
                                    }}
                                    fullWidth
                                >
                                    <ToggleButton value="light" sx={{ py: 1.5 }}>
                                        <LightModeIcon sx={{ mr: 1 }} />
                                        Kun Rejimi
                                    </ToggleButton>
                                    <ToggleButton value="dark" sx={{ py: 1.5 }}>
                                        <DarkModeIcon sx={{ mr: 1 }} />
                                        Tun Rejimi
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Box>

                            {/* Language Toggle */}
                            <Box>
                                <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
                                    <LanguageIcon sx={{ mr: 1, fontSize: 18, verticalAlign: 'middle' }} />
                                    Til
                                </Typography>
                                <ToggleButtonGroup
                                    value={language}
                                    exclusive
                                    onChange={(_, newLanguage) => {
                                        if (newLanguage) setLanguage(newLanguage);
                                    }}
                                    fullWidth
                                >
                                    <ToggleButton value="uz" sx={{ py: 1.5 }}>
                                        🇺🇿 O'zbek
                                    </ToggleButton>
                                    <ToggleButton value="en" sx={{ py: 1.5 }}>
                                        🇺🇸 English
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Data Management */}
                <Grid size={{ xs: 12 }}>
                    <Card>
                        <CardHeader
                            avatar={<StorageIcon sx={{ color: '#667eea' }} />}
                            title="Ma'lumotlarni Boshqarish"
                            subheader="Sizning ma'lumotlar va backuplar bilan ishlash"
                        />
                        <Divider />
                        <CardContent>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                                <Paper sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center' }}>
                                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                                        💾 Ma'lumotlarni Yuklab Olish
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                                        Barcha ma'lumotlarni CSV formatida yuklab oling
                                    </Typography>
                                    <Button variant="outlined" fullWidth>
                                        Yuklab Olish
                                    </Button>
                                </Paper>
                                <Paper sx={{ p: 2, bgcolor: '#fff3cd', textAlign: 'center' }}>
                                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                                        🗑️ Akkauntni O'chirish
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                                        Barcha ma'lumotlar bilan akkaunt o'chiring
                                    </Typography>
                                    <Button variant="contained" color="error" fullWidth>
                                        O'chirish
                                    </Button>
                                </Paper>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Save Button */}
                <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button variant="outlined">
                            Bekor qilish
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSaveSettings}
                        >
                            Sozlamalarni Saqlash
                        </Button>
                    </Box>
                </Grid>

                {/* Info Section */}
                <Grid size={{ xs: 12 }}>
                    <Paper sx={{ p: 2, bgcolor: '#e3f2fd' }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>ℹ️ Muhim:</strong> Siz barcha sozlamalarni istalgan vaqtda o'zgartirishingiz mumkin.
                            Agar sizda savollar bo'lsa, biz bilan bog'laning.
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}
