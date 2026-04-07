import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Box, Typography, TextField, Button, Alert, CircularProgress, Divider } from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { authApi } from '../../api';
import { useAuthStore } from '../../store/auth.store';

const schema = z.object({
    fullName: z.string().min(3, 'Ism kamida 3 ta belgi'),
    password: z.string().min(6, 'Parol kamida 6 ta belgi'),
    confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
    message: 'Parollar mos kelmadi',
    path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { emailToken } = location.state || {};
    const { setAuth } = useAuthStore();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        setError('');
        try {
            const res = await authApi.register({
                emailToken,
                fullName: data.fullName,
                password: data.password,
            });
            setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
            navigate('/dashboard');
        } catch (err) {
            const axiosError = err as AxiosError<{ message: string }>;
            setError(axiosError.response?.data?.message || 'Xatolik yuz berdi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" mb={1}>
                Ma'lumotlarni kiriting
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
                Hisobingizni yarating
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <span>{error}</span>
                        {error.includes('ro\'yxatdan o\'tgan') && (
                            <Link to="/login" style={{ color: '#d32f2f', fontWeight: 'bold', textDecoration: 'underline' }}>
                                Kirish
                            </Link>
                        )}
                    </Box>
                </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
                <TextField
                    fullWidth
                    label="To'liq ism"
                    {...register('fullName')}
                    error={!!errors.fullName}
                    helperText={errors.fullName?.message}
                    sx={{ mb: 2 }}
                />
                <TextField
                    fullWidth
                    label="Parol"
                    type="password"
                    {...register('password')}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    sx={{ mb: 2 }}
                />
                <TextField
                    fullWidth
                    label="Parolni tasdiqlang"
                    type="password"
                    {...register('confirmPassword')}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    sx={{ mb: 3 }}
                />
                <Button fullWidth variant="contained" size="large" type="submit" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Ro\'yxatdan o\'tish'}
                </Button>
            </form>

            <Divider sx={{ my: 3 }}>yoki</Divider>

            <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={() => (window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`)}
                sx={{ mb: 2 }}
            >
                Google bilan davom etish
            </Button>

            <Typography variant="body2" textAlign="center" mt={2}>
                Akkauntingiz bor ekan?{' '}
                <Link to="/login" style={{ color: '#1976d2', fontWeight: 'bold', textDecoration: 'none' }}>
                    Kirish
                </Link>
            </Typography>
        </Box>
    );
}