import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Email as EmailIcon } from '@mui/icons-material';
import { authService } from '../../services/endpoints/auth';

/**
 * Forgot Password Page - Step 1: User enters email
 * Sends OTP to user's email for password reset
 */
export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Iltimos, to\'g\'ri email address kiriting');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.sendForgotPasswordOtp(email);
      setSuccess(true);
      // Redirect to OTP verification page after 2 seconds
      // Pass both email and otpToken to verify page
      setTimeout(() => {
        navigate('/forgot-password/verify', { 
          state: { 
            email,
            otpToken: response.otpToken 
          } 
        });
      }, 1500);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'OTP yuborishda xatolik. Iltimos qayta urinib ko\'ring'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
              ✓ OTP yuborildi
            </Typography>
            <Typography color="textSecondary">
              Nextirish uchun kuting...
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

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
              <EmailIcon sx={{ color: 'white', fontSize: 30 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Parolni tiklash
            </Typography>
            <Typography color="textSecondary" sx={{ mt: 1 }}>
              Email manzilingiz orqali parolingizni tiklang
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
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="example@gmail.com"
              sx={{ mb: 3 }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={loading || !email}
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
                'OTP ga yuborish'
              )}
            </Button>
          </Box>

          {/* Footer Links */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography color="textSecondary" sx={{ mb: 1 }}>
              Parol esiga tushdi?
            </Typography>
            <Button
              href="/login"
              sx={{
                color: '#667eea',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Tizimga kirish
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
