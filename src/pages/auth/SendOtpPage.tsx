import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Stack,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { authApi } from '../../api';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const schema = z.object({
    email: z.string().email('Email noto\'g\'ri'),
});

type FormData = z.infer<typeof schema>;

export default function SendOtpPage() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fff' }}>
            {/* Left Side - Form */}
            <Box
                sx={{
                    flex: isMobile ? 1 : '0 0 50%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    p: isMobile ? 2 : 6,
                    maxWidth: 'none',
                    paddingLeft: isMobile ? 2 : 8,
                    paddingRight: isMobile ? 2 : 8,
                }}
            >
                {/* Back Button */}
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/')}
                    sx={{
                        alignSelf: 'flex-start',
                        mb: 4,
                        color: '#667eea',
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        '&:hover': {
                            bgcolor: '#f5f5f5',
                        },
                    }}
                >
                    Orqaga
                </Button>

                {/* Title */}
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 800,
                        mb: 1,
                        color: '#2c3e50',
                    }}
                >
                    Ro'yxatdan o'tish
                </Typography>
                <Typography
                    variant="body1"
                    color="textSecondary"
                    sx={{
                        mb: 3,
                        fontSize: '1rem',
                    }}
                >
                    Emailingizni kiriting, tasdiqlash kodi yuboramiz
                </Typography>

                {/* Error Alert */}
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

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Email Field */}
                    <Box sx={{ mb: 3 }}>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                fontWeight: 600,
                                mb: 0.8,
                                color: '#2c3e50',
                            }}
                        >
                            Elektron pochta
                        </Typography>
                        <TextField
                            fullWidth
                            type="email"
                            placeholder="name@example.com"
                            {...register('email')}
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1,
                                    fontWeight: 500,
                                },
                            }}
                        />
                    </Box>

                    {/* Send Code Button */}
                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        type="submit"
                        disabled={loading}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            fontWeight: 700,
                            textTransform: 'none',
                            fontSize: '1rem',
                            py: 1.5,
                            borderRadius: 1,
                            mb: 2,
                            '&:hover': {
                                opacity: 0.9,
                            },
                        }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Kod yuborish'}
                    </Button>
                </form>

                {/* Divider */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                    }}
                >
                    <Box sx={{ flex: 1, height: '1px', bgcolor: '#e0e0e0' }} />
                    <Typography variant="body2" color="textSecondary" sx={{ px: 1.5 }}>
                        yoki
                    </Typography>
                    <Box sx={{ flex: 1, height: '1px', bgcolor: '#e0e0e0' }} />
                </Box>

                {/* Google Sign Up */}
                <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    onClick={() => (window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`)}
                    sx={{
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '1rem',
                        py: 1.5,
                        borderRadius: 1,
                        borderColor: '#e0e0e0',
                        color: '#2c3e50',
                        mb: 3,
                        '&:hover': {
                            bgcolor: '#f5f5f5',
                            borderColor: '#e0e0e0',
                        },
                    }}
                >
                    <Box
                        component="img"
                        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDAgQzQuNDggMCAwIDQuNDggMCAxMEMwIDE0Ljk3IDMuMjUgMTkuMDIgNy43NyAxOS45NEw3Ljc3IDEyLjY5SDE1Ljg4QzE1LjM4IDE3Ljc0IDEyLjk4IDIwIDEwIDIwQzUuNDIgMjAgMiAxNi41OCAyIDEyQzIgNy40MiA1LjQyIDQgMTAgNEMxMS44IDQgMTMuNDcgNC42NSAxNC43NyA1LjcyTDE3LjkxIDIuNjNDMTYuMDIgMC45MSAxMy41IDAgMTAgMFoiIGZpbGw9IiMxRjJBRjAiLz4KPC9zdmc+"
                        sx={{ mr: 1, width: 20, height: 20 }}
                    />
                    Google bilan davom etish
                </Button>

                {/* Sign In Link */}
                <Typography
                    variant="body2"
                    textAlign="center"
                    sx={{
                        color: '#2c3e50',
                    }}
                >
                    Akkauntingiz bor ekan?{' '}
                    <Link
                        to="/login"
                        style={{
                            color: '#667eea',
                            fontWeight: 700,
                            textDecoration: 'none',
                        }}
                    >
                        Kirish
                    </Link>
                </Typography>
            </Box>

            {/* Right Side - Illustration */}
            {!isMobile && (
                <Box
                    sx={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            width: '400px',
                            height: '400px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.1)',
                            top: '-100px',
                            right: '-50px',
                        },
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            width: '300px',
                            height: '300px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.05)',
                            bottom: '-50px',
                            left: '-100px',
                        },
                    }}
                >
                    <Stack
                        sx={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1,
                            textAlign: 'center',
                        }}
                    >
                        <Box
                            sx={{
                                width: '300px',
                                height: '300px',
                                borderRadius: '50%',
                                bgcolor: 'rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 3,
                                backdropFilter: 'blur(10px)',
                            }}
                        >
                            <Typography
                                variant="h1"
                                sx={{
                                    color: 'white',
                                    fontWeight: 800,
                                    fontSize: '100px',
                                    opacity: 0.9,
                                }}
                            >
                                ✉️
                            </Typography>
                        </Box>
                        <Typography
                            variant="h5"
                            sx={{
                                color: 'white',
                                fontWeight: 700,
                                maxWidth: '300px',
                            }}
                        >
                            Emailni tekshirib ko'ring
                        </Typography>
                    </Stack>
                </Box>
            )}
        </Box>
    );
}