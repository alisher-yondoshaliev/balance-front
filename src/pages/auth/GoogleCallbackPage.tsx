import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { useAuthStore } from '../../store/auth.store';

export default function GoogleCallbackPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { setAuth } = useAuthStore();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const token = searchParams.get('accessToken') || searchParams.get('token');
            const refreshToken = searchParams.get('refreshToken');
            const userParam = searchParams.get('user');
            const errorParam = searchParams.get('error');

            // Agar error bo'lsa
            if (errorParam) {
                setError('Google authentication failed: ' + errorParam);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
                return;
            }

            // Token'lar mavjud bo'lsa
            if (token && refreshToken && userParam) {
                try {
                    // User data'ni decode qilish
                    const userData = JSON.parse(decodeURIComponent(userParam));

                    // localStorage'ga saqlash
                    localStorage.setItem('accessToken', token);
                    localStorage.setItem('refreshToken', refreshToken);
                    localStorage.setItem('user', JSON.stringify(userData));

                    // Zustand store'ga ham saqlash
                    setAuth(userData, token, refreshToken);

                    // Dashboardga redirect
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 1000);
                } catch (parseError) {
                    console.error('User data parse error:', parseError);
                    setError('Authentication ma\'lumotlari noto\'g\'ri');
                    setTimeout(() => {
                        navigate('/login');
                    }, 3000);
                }
            } else {
                // Token'lar yo'q
                setError('Token ma\'lumotlari topilmadi');
                console.error('Missing params:', {
                    hasToken: !!token,
                    hasRefreshToken: !!refreshToken,
                    hasUser: !!userParam
                });
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        } catch (err) {
            console.error('GoogleCallbackPage error:', err);
            setError('Noma\'lum xatolik yuz berdi');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        }
    }, [searchParams, setAuth, navigate]);

    if (error) {
        return (
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minHeight="100vh"
                gap={2}
                px={2}
            >
                <Alert severity="error">
                    {error}
                </Alert>
                <Typography variant="body2" color="text.secondary">
                    3 soniya ichida login page'ga yo'naltirilasiz...
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            gap={2}
        >
            <CircularProgress />
            <Typography variant="body1">
                Google bilan authorizatsiya qilinyapdi...
            </Typography>
            <Typography variant="caption" color="text.secondary">
                Iltimos kutib turing
            </Typography>
        </Box>
    );
}
