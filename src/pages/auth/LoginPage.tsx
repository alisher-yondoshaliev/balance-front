import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box, Typography, TextField, Button,
    Alert, CircularProgress, FormControlLabel, Checkbox,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { authApi } from '../../api';
import { useAuthStore } from '../../store/auth.store';

const schema = z.object({
    email: z.string().email('Email noto\'g\'ri'),
    password: z.string().min(6, 'Parol kamida 6 ta belgi'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        setError('');
        try {
            const res = await authApi.login(data);
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
            <Typography variant="h4" fontWeight="bold" mb={1}>
                Kirish
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
                Hisobingizga kiring
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <form onSubmit={handleSubmit(onSubmit)}>
                <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    {...register('email')}
                    error={!!errors.email}
                    helperText={errors.email?.message}
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

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <FormControlLabel
                        control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />}
                        label="7 kun esda tuting"
                    />
                    <Link to="/forgot-password" style={{ color: '#1976d2', textDecoration: 'none', fontSize: '14px' }}>
                        Parolni unutdim
                    </Link>
                </Box>

                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    type="submit"
                    disabled={loading}
                    sx={{
                        bgcolor: '#6C3FB8',
                        '&:hover': { bgcolor: '#5a2f99' },
                        mb: 2,
                    }}
                >
                    {loading ? <CircularProgress size={24} /> : 'Kirish'}
                </Button>
            </form>

            <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={() => (window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`)}
                sx={{ mb: 2 }}
            >
                Google bilan kirish
            </Button>

            <Typography variant="body2" textAlign="center" mt={2}>
                Hisobingiz yo'qmi?{' '}
                <Link to="/send-otp" style={{ color: '#1976d2', fontWeight: 'bold', textDecoration: 'none' }}>
                    Ro'yxatdan o'ting
                </Link>
            </Typography>
        </Box>
    );
}