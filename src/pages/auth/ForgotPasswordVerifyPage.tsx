import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { authService } from '../../services/endpoints/auth';

/**
 * Verify OTP Page - Step 2: User verifies OTP sent to email
 * Verifies OTP and receives emailToken for password reset
 */
export default function ForgotPasswordVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const otpToken = location.state?.otpToken || '';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  // Redirect to forgot password if no email in state
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  // Handle resend timer
  useEffect(() => {
    if (!canResend && resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [resendTimer, canResend]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp || otp.length < 6) {
      setError('Iltimos 6 raqamli OTP kiriting');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifyForgotPasswordOtp(email, otp, otpToken);
      console.log('OTP verified:', response);
      
      // Navigate to reset password page with resetToken as URL parameter
      navigate(`/reset-password?token=${encodeURIComponent(response.resetToken)}&email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setError(
        err.response?.data?.message ||
        'OTP tasdiqlanmadi. Iltimos qayta urinib ko\'ring'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setResendLoading(true);
    try {
      await authService.resendForgotPasswordOtp(email);
      setCanResend(false);
      setResendTimer(60);
      // Optionally show success message
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'OTP qayta yuborishda xatolik'
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
          }}
        >
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <LockIcon sx={{ color: 'white', fontSize: 30 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              OTP ni tasdiqlang
            </Typography>
            <Typography color="textSecondary" sx={{ mt: 1 }}>
              {email}ga yuborilgan 6 raqamli kodni kiriting
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="OTP Code"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
              disabled={loading}
              placeholder="000000"
              inputProps={{
                maxLength: 8,
                style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em' },
              }}
              sx={{ mb: 3 }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={loading || !otp || otp.length < 6}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Davom etish'
              )}
            </Button>
          </Box>

          {/* Resend Code */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography color="textSecondary" sx={{ mb: 2, fontSize: '0.9rem' }}>
              Kod olmadingizmi?
            </Typography>
            <Button
              onClick={handleResend}
              disabled={!canResend || resendLoading}
              sx={{
                color: '#667eea',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {resendLoading ? (
                <CircularProgress size={20} sx={{ color: '#667eea' }} />
              ) : canResend ? (
                'Qayta yuborish'
              ) : (
                `Qayta yuborish (${resendTimer}s)`
              )}
            </Button>
          </Box>

          {/* Back Link */}
          <Box sx={{ textAlign: 'center', mt: 3, borderTop: '1px solid #eee', pt: 2 }}>
            <Button
              href="/forgot-password"
              sx={{
                color: '#999',
                textTransform: 'none',
                fontSize: '0.9rem',
              }}
            >
              Email belgisini o'zgartirish
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
