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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../../store/auth.store';
import { authService } from '../../services/endpoints/auth';
import type { User } from '../../types';

// Change Password Schema
const changePasswordSchema = z.object({
    oldPassword: z.string().min(6, 'Parol kamida 6 ta belgi'),
    newPassword: z.string().min(6, 'Parol kamida 6 ta belgi'),
    confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Parollar mos kelmadi',
    path: ['confirmPassword'],
}).refine((d) => d.oldPassword !== d.newPassword, {
    message: 'Yangi parol eski parol bilan bir xil bo\'lmasligi kerak',
    path: ['newPassword'],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ProfilePage() {
    const navigate = useNavigate();
    const { user: storeUser } = useAuthStore();
    const [userData, setUserData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Modal state
    const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
    });

    const onChangePassword = async (data: ChangePasswordFormData) => {
        setPasswordLoading(true);
        setPasswordError('');
        setPasswordSuccess('');
        try {
            await authService.changePassword(data.oldPassword, data.newPassword);
            setPasswordSuccess('Parol muvaffaqiyatli o\'zgartirildi');
            reset();
            setTimeout(() => {
                setOpenPasswordDialog(false);
            }, 2000);
        } catch (err: any) {
            setPasswordError(
                err.response?.data?.message || 'Parolni o\'zgartirishda xatolik yuz berdi'
            );
        } finally {
            setPasswordLoading(false);
        }
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // First try to get user from store
                if (storeUser) {
                    setUserData(storeUser);
                    setLoading(false);
                    return;
                }

                // If not in store, call API
                const response = await authService.getCurrentUser();
                setUserData(response);
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
    }, [storeUser]);

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
                            <Grid container spacing={4}>
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
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                                To'liq Ism
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
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
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                                Email
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5, wordBreak: 'break-all' }}>
                                                {userData.email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>

                                <Divider sx={{ gridColumn: '1/-1' }} />

                                {/* Role Badge */}
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', mb: 1 }}>
                                            Rol
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                display: 'inline-block',
                                                px: 2,
                                                py: 0.75,
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
                                                fontWeight: 600,
                                            }}
                                        >
                                            {getRoleLabel(userData.role)}
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Status Badge */}
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', mb: 1 }}>
                                            Holat
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                display: 'inline-block',
                                                px: 2,
                                                py: 0.75,
                                                bgcolor: getStatusColor(userData.status).bg,
                                                color: getStatusColor(userData.status).text,
                                                borderRadius: 1,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {getStatusLabel(userData.status)}
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Created Date */}
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', mb: 1 }}>
                                            Akkaunt Yaratilgan
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {new Date(userData.createdAt).toLocaleDateString('uz-UZ', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Phone - if exists */}
                                {userData.phone && (
                                    <>
                                        <Divider sx={{ gridColumn: '1/-1' }} />
                                        <Grid size={{ xs: 12 }}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                                    Telefon
                                                </Typography>
                                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                    {userData.phone}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </>
                                )}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Action Buttons */}
                <Grid size={{ xs: 12 }} sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                        variant="contained" 
                        onClick={() => setOpenPasswordDialog(true)}
                    >
                        Parolni O'zgartirish
                    </Button>
                    <Button variant="outlined" onClick={() => navigate('/dashboard')}>
                        Orqaga
                    </Button>
                </Grid>
            </Grid>

            {/* Change Password Modal */}
            <Dialog 
                open={openPasswordDialog} 
                onClose={() => {
                    setOpenPasswordDialog(false);
                    setPasswordError('');
                    setPasswordSuccess('');
                    reset();
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Parolni o'zgartirish
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        {passwordError && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {passwordError}
                            </Alert>
                        )}
                        {passwordSuccess && (
                            <Alert severity="success" sx={{ mb: 2 }}>
                                {passwordSuccess}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit(onChangePassword)}>
                            <TextField
                                fullWidth
                                label="Eski parol"
                                type="password"
                                {...register('oldPassword')}
                                error={!!errors.oldPassword}
                                helperText={errors.oldPassword?.message}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="Yangi parol"
                                type="password"
                                {...register('newPassword')}
                                error={!!errors.newPassword}
                                helperText={errors.newPassword?.message}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="Parolni tasdiqlang"
                                type="password"
                                {...register('confirmPassword')}
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword?.message}
                                sx={{ mb: 2 }}
                            />
                        </form>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => {
                            setOpenPasswordDialog(false);
                            setPasswordError('');
                            setPasswordSuccess('');
                            reset();
                        }}
                        disabled={passwordLoading}
                    >
                        Bekor qilish
                    </Button>
                    <Button 
                        onClick={handleSubmit(onChangePassword)}
                        variant="contained"
                        disabled={passwordLoading}
                    >
                        {passwordLoading ? <CircularProgress size={24} /> : 'O\'zgartirish'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

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

function getStatusLabel(status: string | undefined): string {
    if (!status) return 'Noma\'lum';
    const normalized = status.toLowerCase();
    const labels: Record<string, string> = {
        active: 'Faol',
        inactive: 'Faol emas',
    };
    return labels[normalized] || 'Noma\'lum';
}

function getStatusColor(status: string | undefined): { bg: string; text: string } {
    if (!status) return { bg: 'error.light', text: 'error.dark' };
    const normalized = status.toLowerCase();
    if (normalized === 'active') return { bg: 'success.light', text: 'success.dark' };
    if (normalized === 'inactive') return { bg: 'warning.light', text: 'warning.dark' };
    return { bg: 'error.light', text: 'error.dark' };
}
