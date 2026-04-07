import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  LinearProgress,
} from '@mui/material';
import { Lock as LockIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { authService } from '../../services/endpoints/auth';

/**
 * Reset Password Page - Step 3: User sets new password
 * Final step of password reset process
 */
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailToken = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check for emailToken and redirect if missing
  useEffect(() => {
    console.log('ResetPasswordPage - emailToken:', emailToken, 'email:', email);
    if (!emailToken) {
      console.warn('No emailToken found, redirecting to forgot-password');
      const timer = setTimeout(() => {
        navigate('/forgot-password');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const validatePassword = (pwd: string): { isValid: boolean; issues: string[] } => {
    const issues: string[] = [];

    if (pwd.length < 8) {
      issues.push('Kamida 8 ta belgidan iborat bo\'lishi kerak');
    }
    if (!/[A-Z]/.test(pwd)) {
      issues.push('Kamida bir ta bosh harf bo\'lishi kerak');
    }
    if (!/[a-z]/.test(pwd)) {
      issues.push('Kamida bir ta kichik harf bo\'lishi kerak');
    }
    if (!/[0-9]/.test(pwd)) {
      issues.push('Kamida bir ta raqam bo\'lishi kerak');
    }
    if (!/[!@#$%^&*]/.test(pwd)) {
      issues.push('Kamida bir ta maxsus belgi bo\'lishi kerak (!@#$%^&*)');
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  };

  const getPasswordStrength = () => {
    if (!password) return 0;
    const validation = validatePassword(password);
    return validation.isValid ? 100 : (100 - validation.issues.length * 20);
  };

  const strength = getPasswordStrength();
  const validation = validatePassword(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validation.isValid) {
      setError('Parol shartlariga javob bermaydi');
      return;
    }

    if (!passwordsMatch) {
      setError('Parollar mos emas');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({
        resetToken: emailToken,
        newPassword: password,
      });

      setSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(
        err.response?.data?.message ||
        'Parol o\'zgartirishda xatolik. Iltimos qayta urinib ko\'ring'
      );
    } finally {
      setLoading(false);
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
        {success ? (
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <Typography sx={{ color: 'white', fontSize: '3rem' }}>✓</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Parol muvaffaqiyatli o'zgartirildi
            </Typography>
            <Typography color="textSecondary" sx={{ mb: 3 }}>
              Tizimga kirish uchun yangi parol bilan login qiling
            </Typography>
            <Typography color="textSecondary" sx={{ fontSize: '0.9rem' }}>
              Nextirish uchun kuting...
            </Typography>
          </Paper>
        ) : !emailToken ? (
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Yo'naltirish...</Typography>
          </Paper>
        ) : (
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
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
              Yangi parol o'rnatish
            </Typography>
            <Typography color="textSecondary" sx={{ mt: 1 }}>
              "{email}" uchun yangi parol yarating
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* New Password Field */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Yangi parol"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Password Strength Indicator */}
              {password && (
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="textSecondary">
                      Parol kuchi:
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color:
                          strength === 100
                            ? '#4caf50'
                            : strength >= 60
                            ? '#ff9800'
                            : '#f44336',
                        fontWeight: 600,
                      }}
                    >
                      {strength === 100 ? 'Kuchli' : strength >= 60 ? 'O\'rtacha' : 'Zaif'}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={strength}
                    sx={{
                      height: 6,
                      borderRadius: 1,
                      backgroundColor: '#f0f0f0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor:
                          strength === 100
                            ? '#4caf50'
                            : strength >= 60
                            ? '#ff9800'
                            : '#f44336',
                      },
                    }}
                  />

                  {/* Validation Issues */}
                  {validation.issues.length > 0 && (
                    <Box sx={{ mt: 1.5 }}>
                      {validation.issues.map((issue, idx) => (
                        <Typography
                          key={idx}
                          variant="caption"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 0.5,
                            color: '#f44336',
                          }}
                        >
                          ✕ {issue}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            {/* Confirm Password Field */}
            <TextField
              fullWidth
              label="Parolni tasdiqlang"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              error={confirmPassword.length > 0 && !passwordsMatch}
              helperText={
                confirmPassword.length > 0 && !passwordsMatch
                  ? 'Parollar mos emas'
                  : ''
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={loading || !validation.isValid || !passwordsMatch}
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
                'Parolni o\'zgartirish'
              )}
            </Button>
          </Box>

          {/* Footer Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Button
              href="/login"
              sx={{
                color: '#667eea',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              Tizimga kirish
            </Button>
          </Box>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
