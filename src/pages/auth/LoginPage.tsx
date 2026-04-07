import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress,
    FormControlLabel,
    Checkbox,
    Stack,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { authApi } from '../../api';
import { useAuthStore } from '../../store/auth.store';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
                    Xush kelibsiz
                </Typography>
                <Typography
                    variant="body1"
                    color="textSecondary"
                    sx={{
                        mb: 3,
                        fontSize: '1rem',
                    }}
                >
                    Iltimos, o'zingizning ma'lumotlarini kiriting
                </Typography>

                {/* Error Alert */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Email Field */}
                    <Box sx={{ mb: 2 }}>
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

                    {/* Password Field */}
                    <Box sx={{ mb: 2 }}>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                fontWeight: 600,
                                mb: 0.8,
                                color: '#2c3e50',
                            }}
                        >
                            Parol
                        </Typography>
                        <TextField
                            fullWidth
                            type="password"
                            placeholder="••••••••"
                            {...register('password')}
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1,
                                    fontWeight: 500,
                                },
                            }}
                        />
                    </Box>

                    {/* Remember & Forgot Password */}
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={3}
                    >
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    sx={{
                                        '&.Mui-checked': {
                                            color: '#667eea',
                                        },
                                    }}
                                />
                            }
                            label={
                                <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 500, color: '#2c3e50' }}
                                >
                                    7 kun esda tuting
                                </Typography>
                            }
                        />
                        <Link
                            to="/forgot-password"
                            style={{
                                color: '#667eea',
                                textDecoration: 'none',
                                fontSize: '14px',
                                fontWeight: 600,
                            }}
                        >
                            Parolni unutdim
                        </Link>
                    </Box>

                    {/* Sign In Button */}
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
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Kirish'}
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

                {/* Google Sign In */}
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
                    Google bilan kirish
                </Button>

                {/* Sign Up Link */}
                <Typography
                    variant="body2"
                    textAlign="center"
                    sx={{
                        color: '#2c3e50',
                    }}
                >
                    Hisobingiz yo'qmi?{' '}
                    <Link
                        to="/send-otp"
                        style={{
                            color: '#667eea',
                            fontWeight: 700,
                            textDecoration: 'none',
                        }}
                    >
                        Ro'yxatdan o'ting
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
                                ✓
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
                            Balance-ga xush kelibsiz!
                        </Typography>
                    </Stack>
                </Box>
            )}
        </Box>
    );
}