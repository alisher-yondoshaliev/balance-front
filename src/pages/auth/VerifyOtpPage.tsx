import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    otp: z.string().length(6, 'OTP 6 ta raqam bo\'lishi kerak'),
});

type FormData = z.infer<typeof schema>;

export default function VerifyOtpPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { email, otpToken } = location.state || {};
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
                    onClick={() => navigate('/send-otp')}
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
                    Kodni tasdiqlang
                </Typography>
                <Typography
                    variant="body1"
                    color="textSecondary"
                    sx={{
                        mb: 3,
                        fontSize: '1rem',
                    }}
                >
                    <strong>{email}</strong> ga yuborilgan 6 ta raqamli kodni kiriting
                </Typography>

                {/* Error Alert */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* OTP Field */}
                    <Box sx={{ mb: 3 }}>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                fontWeight: 600,
                                mb: 0.8,
                                color: '#2c3e50',
                            }}
                        >
                            Tasdiqlash kodi
                        </Typography>
                        <TextField
                            fullWidth
                            placeholder="000000"
                            inputProps={{
                                maxLength: 6,
                                style: { letterSpacing: 8, fontSize: 24, textAlign: 'center', fontWeight: 700 },
                            }}
                            {...register('otp')}
                            error={!!errors.otp}
                            helperText={errors.otp?.message}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1,
                                    fontWeight: 700,
                                },
                            }}
                        />
                    </Box>

                    {/* Verify Button */}
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
                            '&:hover': {
                                opacity: 0.9,
                            },
                        }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Tasdiqlash'}
                    </Button>
                </form>

                {/* Resend Code */}
                <Typography
                    variant="body2"
                    textAlign="center"
                    sx={{
                        mt: 4,
                        color: '#2c3e50',
                    }}
                >
                    Kod olmadingizmi?{' '}
                    <Button
                        onClick={() => navigate('/send-otp')}
                        sx={{
                            color: '#667eea',
                            fontWeight: 700,
                            textTransform: 'none',
                            p: 0,
                            minWidth: 'auto',
                            '&:hover': {
                                bgcolor: 'transparent',
                                textDecoration: 'underline',
                            },
                        }}
                    >
                        Yana yuborish
                    </Button>
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
                                🔐
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
                            Xavfsiz kirishni ta'minlash
                        </Typography>
                    </Stack>
                </Box>
            )}
        </Box>
    );
}