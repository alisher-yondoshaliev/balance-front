import { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Stack,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { authApi } from '../../../api/endpoints/auth.api';

const passwordSchema = z.object({
    oldPassword: z.string().min(6, 'Parol kamida 6 ta belgi'),
    newPassword: z.string().min(6, 'Parol kamida 6 ta belgi'),
    confirmPassword: z.string().min(6, 'Parol kamida 6 ta belgi'),
})
    .refine((d) => d.newPassword === d.confirmPassword, {
        message: 'Parollar mos kelmadi',
        path: ['confirmPassword'],
    })
    .refine((d) => d.oldPassword !== d.newPassword, {
        message: 'Yangi parol eski parol bilan bir xil bo\'lmasligi kerak',
        path: ['newPassword'],
    });

type PasswordFormData = z.infer<typeof passwordSchema>;

interface PasswordSettingsSectionProps {
    onShowToast: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void;
}

export default function PasswordSettingsSection({ onShowToast }: PasswordSettingsSectionProps) {
    const [successAlert, setSuccessAlert] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const updatePasswordMutation = useMutation({
        mutationFn: async (data: { oldPassword: string; newPassword: string }) => {
            return authApi.changePassword({
                oldPassword: data.oldPassword,
                newPassword: data.newPassword,
            });
        },
        onSuccess: () => {
            reset();
            setSuccessAlert(true);
            onShowToast('Parol muvaffaqiyatli o\'zgartirildi', 'success');
            setTimeout(() => setSuccessAlert(false), 5000);
        },
        onError: (err) => {
            const axiosError = err as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Parolni o\'zgartirishda xatolik yuz berdi';
            onShowToast(errorMessage, 'error');
        },
    });

    const onSubmit = (data: PasswordFormData) => {
        updatePasswordMutation.mutate({
            oldPassword: data.oldPassword,
            newPassword: data.newPassword,
        });
    };

    return (
        <Card>
            <CardHeader
                title="Parol Sozlamalari"
                subheader="Sizning akkaunt parolini o'zgartirish"
            />
            <CardContent>
                {successAlert && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        ✅ Parol muvaffaqiyatli o'zgartirildi
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={2}>
                        <TextField
                            fullWidth
                            label="Eski parol"
                            type="password"
                            {...register('oldPassword')}
                            error={!!errors.oldPassword}
                            helperText={errors.oldPassword?.message}
                            disabled={updatePasswordMutation.isPending}
                        />

                        <TextField
                            fullWidth
                            label="Yangi parol"
                            type="password"
                            {...register('newPassword')}
                            error={!!errors.newPassword}
                            helperText={errors.newPassword?.message}
                            disabled={updatePasswordMutation.isPending}
                        />

                        <TextField
                            fullWidth
                            label="Yangi parolni tasdiqlang"
                            type="password"
                            {...register('confirmPassword')}
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword?.message}
                            disabled={updatePasswordMutation.isPending}
                        />

                        <Box sx={{ display: 'flex', gap: 1, pt: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={updatePasswordMutation.isPending}
                                startIcon={updatePasswordMutation.isPending && <CircularProgress size={20} />}
                            >
                                Parolni o'zgartirish
                            </Button>
                            <Button
                                type="button"
                                variant="outlined"
                                onClick={() => {
                                    reset();
                                    setSuccessAlert(false);
                                }}
                                disabled={updatePasswordMutation.isPending}
                            >
                                Bekor qilish
                            </Button>
                        </Box>
                    </Stack>
                </form>

                <Alert severity="info" sx={{ mt: 3 }}>
                    💡 Xavfsiz parol uchun tafsiyalar:
                    <ul style={{ margin: '8px 0 0 20px', paddingLeft: 0 }}>
                        <li>Kamida 6 ta belgi</li>
                        <li>Katta va kichik harflar</li>
                        <li>Raqamlar va maxsus belgilar</li>
                    </ul>
                </Alert>
            </CardContent>
        </Card>
    );
}
