import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Typography, TextField, Button, Alert, CircularProgress, Divider } from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { authApi } from '../../api';

const schema = z.object({
    email: z.string().email('Email noto\'g\'ri'),
});

type FormData = z.infer<typeof schema>;

export default function SendOtpPage() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        setError('');
        try {
            const res = await authApi.sendOtp(data.email);
            navigate('/verify-otp', {
                state: { email: data.email, otpToken: res.data.otpToken },
            });
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
                Ro'yxatdan o'tish
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
                Emailingizni kiriting, tasdiqlash kodi yuboramiz
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
                    label="Email"
                    type="email"
                    {...register('email')}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={{ mb: 3 }}
                />
                <Button fullWidth variant="contained" size="large" type="submit" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Kod yuborish'}
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