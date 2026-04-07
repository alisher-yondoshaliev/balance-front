import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { authApi } from '../../api';

const schema = z.object({
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

type FormData = z.infer<typeof schema>;

export default function ChangePasswordPage() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await authApi.changePassword({
                oldPassword: data.oldPassword,
                newPassword: data.newPassword,
            });
            setSuccess('Parol muvaffaqiyatli o\'zgartirildi');
            reset();
            setTimeout(() => navigate('/dashboard'), 2000);
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
                Parolni o'zgartirish
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
                Yangi parol o'rnatish
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <form onSubmit={handleSubmit(onSubmit)}>
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
                    sx={{ mb: 3 }}
                />
                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    type="submit"
                    disabled={loading}
                    sx={{
                        bgcolor: '#6C3FB8',
                        '&:hover': { bgcolor: '#5a2f99' },
                    }}
                >
                    {loading ? <CircularProgress size={24} /> : 'Parolni o\'zgartirish'}
                </Button>
            </form>

            <Typography variant="body2" textAlign="center" mt={3}>
                <Button
                    size="small"
                    onClick={() => navigate('/dashboard')}
                    sx={{ textTransform: 'none' }}
                >
                    Orqaga qaytish
                </Button>
            </Typography>
        </Box>
    );
}
