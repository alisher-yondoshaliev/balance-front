import { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Tabs,
    Tab,
    Skeleton,
    Alert,
    Snackbar,
} from '@mui/material';
import {
    Person as PersonIcon,
    Lock as LockIcon,
    Store as StoreIcon,
    CreditCard as CreditCardIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../../store/auth.store';
import ProfileSettingsSection from './sections/ProfileSettingsSection';
import PasswordSettingsSection from './sections/PasswordSettingsSection';
import MarketSettingsSection from './sections/MarketSettingsSection';
import SubscriptionSettingsSection from './sections/SubscriptionSettingsSection';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`settings-tabpanel-${index}`}
            aria-labelledby={`settings-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

interface Toast {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
}

export default function SettingsPageNew() {
    const [tabValue, setTabValue] = useState(0);
    const [toast, setToast] = useState<Toast>({
        open: false,
        message: '',
        severity: 'success',
    });
    const { user, isInitializing } = useAuthStore();

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const showToast = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
        setToast({
            open: true,
            message,
            severity,
        });
    };

    const handleCloseToast = () => {
        setToast({ ...toast, open: false });
    };

    // Only show OWNER settings
    const isOwner = user?.role === 'OWNER';

    if (isInitializing) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Skeleton variant="text" width="300px" height={40} sx={{ mb: 3 }} />
                <Skeleton variant="rectangular" height={60} sx={{ mb: 3, borderRadius: 1 }} />
                <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 1 }} />
            </Container>
        );
    }

    if (!isOwner) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mt: 2 }}>
                    Sizda ushbu sahifaga kirish huquqi yo'q. Faqat OWNER roli ushbu funksiyaga kira oladi.
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" color="text.primary">
                    Sozlamalar
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Sizning profil, parol, bozor va obuna sozlamalari
                </Typography>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 0 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="settings tabs"
                    sx={{
                        '& .MuiTab-root': {
                            py: 2,
                            px: 2,
                            minHeight: 'auto',
                            textTransform: 'none',
                            fontSize: '1rem',
                            fontWeight: 500,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            },
                        },
                        '& .MuiTab-iconWrapper': {
                            marginRight: 1,
                        },
                    }}
                >
                    <Tab
                        icon={<PersonIcon />}
                        iconPosition="start"
                        label="Profil"
                        id="settings-tab-0"
                        aria-controls="settings-tabpanel-0"
                    />
                    <Tab
                        icon={<LockIcon />}
                        iconPosition="start"
                        label="Parol"
                        id="settings-tab-1"
                        aria-controls="settings-tabpanel-1"
                    />
                    <Tab
                        icon={<StoreIcon />}
                        iconPosition="start"
                        label="Bozor"
                        id="settings-tab-2"
                        aria-controls="settings-tabpanel-2"
                    />
                    <Tab
                        icon={<CreditCardIcon />}
                        iconPosition="start"
                        label="Obuna"
                        id="settings-tab-3"
                        aria-controls="settings-tabpanel-3"
                    />
                </Tabs>
            </Box>

            {/* Tab Panels */}
            <TabPanel value={tabValue} index={0}>
                <ProfileSettingsSection onShowToast={showToast} />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                <PasswordSettingsSection onShowToast={showToast} />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
                <MarketSettingsSection onShowToast={showToast} />
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
                <SubscriptionSettingsSection onShowToast={showToast} />
            </TabPanel>

            {/* Toast Notification */}
            <Snackbar
                open={toast.open}
                autoHideDuration={6000}
                onClose={handleCloseToast}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}
