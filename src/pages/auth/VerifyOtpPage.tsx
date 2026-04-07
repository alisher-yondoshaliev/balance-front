import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { authApi } from '../../api';

const schema = z.object({
    otp: z.string().length(6, 'OTP 6 ta raqam bo\'lishi kerak'),
});

type FormData = z.infer<typeof schema>;

export default function VerifyOtpPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { email, otpToken } = location.state || {};
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        setError('');
        try {
            const res = await authApi.verifyOtp({ email, otp: data.otp, otpToken });
            navigate('/register', { state: { emailToken: res.data.emailToken } });
        } catch (err) {
            const axiosError = err as AxiosError<{ message: string }>;
            setError(axiosError.response?.data?.message || 'OTP noto\'g\'ri');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" mb={1}>
                Kodni tasdiqlang
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
                <strong>{email}</strong> ga yuborilgan 6 ta raqamli kodni kiriting
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <form onSubmit={handleSubmit(onSubmit)}>
                <TextField
                    fullWidth
                    label="OTP Kod"
                    inputProps={{ maxLength: 6, style: { letterSpacing: 8, fontSize: 24, textAlign: 'center' } }}
                    {...register('otp')}
                    error={!!errors.otp}
                    helperText={errors.otp?.message}
                    sx={{ mb: 3 }}
                />
                <Button fullWidth variant="contained" size="large" type="submit" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Tasdiqlash'}
                </Button>
            </form>
        </Box>
    );
}