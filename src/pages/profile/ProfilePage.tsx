import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Alert,
    Grid,
    Divider,
    Button,
    Container,
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Badge as BadgeIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import { authApi } from '../../api/endpoints/auth.api';
import { useAuthStore } from '../../store/auth.store';
import type { User } from '../../types';

export default function ProfilePage() {
    const navigate = useNavigate();
    const { setUser } = useAuthStore();
    const [userData, setUserData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await authApi.getMe();
                const user = response.data.data || response.data;
                setUserData(user);
                setUser(user);
            } catch (err) {
                const error = err as { response?: { data?: { message?: string } } };
                setError(
                    error.response?.data?.message || 'Profilni yuklab olishda xatolik yuz berdi'
                );
                console.error('Profile fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [setUser]);

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '80vh',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert
                    severity="error"
                    sx={{
                        mb: 3,
                        '& .MuiAlert-message': { width: '100%' },
                    }}
                >
                    {error}
                </Alert>
                <Button variant="contained" onClick={() => navigate('/dashboard')}>
                    Orqaga
                </Button>
            </Container>
        );
    }

    if (!userData) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="warning">Foydalanuvchi ma'lumotlari topilmadi</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Grid container spacing={3}>
                {/* Header */}
                <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                            Mening Profilim
                        </Typography>
                        <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => navigate('/profile/edit')}
                            sx={{ display: 'none' }} // Hide edit button for now
                        >
                            Tahrirlash
                        </Button>
                    </Box>
                </Grid>

                {/* Profile Card */}
                <Grid size={{ xs: 12 }}>
                    <Card>
                        <CardContent>
                            <Grid container spacing={3}>
                                {/* ID */}
                                <Grid size={{ xs: 12 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            p: 2,
                                            bgcolor: 'action.hover',
                                            borderRadius: 1,
                                        }}
                                    >
                                        <BadgeIcon color="primary" sx={{ fontSize: 28 }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                ID
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                                                {userData.id}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>

                                <Divider sx={{ gridColumn: '1/-1' }} />

                                {/* Full Name */}
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: 2,
                                        }}
                                    >
                                        <PersonIcon color="primary" sx={{ mt: 1, fontSize: 24 }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                To'liq Ism
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                {userData.fullName}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>

                                {/* Email */}
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: 2,
                                        }}
                                    >
                                        <EmailIcon color="primary" sx={{ mt: 1, fontSize: 24 }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Email
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                {userData.email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>

                                <Divider sx={{ gridColumn: '1/-1' }} />

                                {/* Role Badge */}
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Rol
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                display: 'inline-block',
                                                mt: 1,
                                                px: 2,
                                                py: 0.5,
                                                bgcolor:
                                                    userData.role === 'SUPERADMIN'
                                                        ? 'error.light'
                                                        : userData.role === 'OWNER'
                                                            ? 'info.light'
                                                            : userData.role === 'ADMIN'
                                                                ? 'warning.light'
                                                                : 'success.light',
                                                color:
                                                    userData.role === 'SUPERADMIN'
                                                        ? 'error.dark'
                                                        : userData.role === 'OWNER'
                                                            ? 'info.dark'
                                                            : userData.role === 'ADMIN'
                                                                ? 'warning.dark'
                                                                : 'success.dark',
                                                borderRadius: 1,
                                                fontWeight: 500,
                                            }}
                                        >
                                            {getRoleLabel(userData.role)}
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Status Badge */}
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Holat
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                display: 'inline-block',
                                                mt: 1,
                                                px: 2,
                                                py: 0.5,
                                                bgcolor:
                                                    userData.status === 'ACTIVE'
                                                        ? 'success.light'
                                                        : userData.status === 'INACTIVE'
                                                            ? 'warning.light'
                                                            : 'error.light',
                                                color:
                                                    userData.status === 'ACTIVE'
                                                        ? 'success.dark'
                                                        : userData.status === 'INACTIVE'
                                                            ? 'warning.dark'
                                                            : 'error.dark',
                                                borderRadius: 1,
                                                fontWeight: 500,
                                            }}
                                        >
                                            {getStatusLabel(userData.status)}
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Divider sx={{ gridColumn: '1/-1' }} />

                                {/* Phone */}
                                {userData.phone && (
                                    <Grid size={{ xs: 12 }}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Telefon
                                            </Typography>
                                            <Typography variant="body2">{userData.phone}</Typography>
                                        </Box>
                                    </Grid>
                                )}

                                {/* Created Date */}
                                <Grid size={{ xs: 12 }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Akkaunt Yaratilgan Sana
                                        </Typography>
                                        <Typography variant="body2">
                                            {new Date(userData.createdAt).toLocaleDateString('uz-UZ', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Action Buttons */}
                <Grid size={{ xs: 12 }} sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="contained" onClick={() => navigate('/change-password')}>
                        Parolni O'zgartirish
                    </Button>
                    <Button variant="outlined" onClick={() => navigate('/dashboard')}>
                        Orqaga
                    </Button>
                </Grid>
            </Grid>
        </Container>
    );
}

// Helper functions
function getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
        SUPERADMIN: 'Super Admin',
        OWNER: 'Egasi',
        ADMIN: 'Admin',
        MANAGER: 'Menejer',
        SELLER: 'Sotuvchi',
    };
    return labels[role] || role;
}

function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        ACTIVE: 'Faol',
        INACTIVE: 'Faol emas',
        BLOCKED: 'Bloklandi',
        EXPIRED: 'Muddati Tugadi',
    };
    return labels[status] || status;
}
