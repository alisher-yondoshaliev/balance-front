import { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    TextField,
    Button,
    CircularProgress,
    Stack,
    Skeleton,
    Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../../api/endpoints/auth.api';
import { useAuthStore } from '../../../store/auth.store';

const profileSchema = z.object({
    fullName: z.string().min(2, 'Ism kamida 2 ta belgi bo\'lishi kerak'),
    phone: z.string().optional().nullable(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileSettingsSectionProps {
    onShowToast: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void;
}

export default function ProfileSettingsSection({ onShowToast }: ProfileSettingsSectionProps) {
    const queryClient = useQueryClient();
    const { user, setUser } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: user?.fullName || '',
            phone: user?.phone || '',
        },
    });

    const watchedValues = watch();
    const isChanged = watchedValues.fullName !== user?.fullName || watchedValues.phone !== user?.phone;

    // Fetch current user data
    const { isLoading: isLoadingMe } = useQuery({
        queryKey: ['auth-me'],
        queryFn: async () => {
            const response = await authApi.getMe();
            if (response.data) {
                setUser(response.data);
                reset({
                    fullName: response.data.fullName,
                    phone: response.data.phone || '',
                });
            }
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
    });

    // Update profile mutation
    const updateMutation = useMutation({
        mutationFn: async (data: ProfileFormData) => Promise.resolve(data),
        onSuccess: (data) => {
            if (user) {
                setUser({
                    ...user,
                    fullName: data.fullName,
                    phone: data.phone ?? undefined,
                });
            }
            queryClient.invalidateQueries({ queryKey: ['auth-me'] });
            onShowToast('Profil muvaffaqiyatli yangilandi', 'success');
            setIsEditing(false);
        },
        onError: () => {
            onShowToast('Profilni yangilashda xatolik yuz berdi', 'error');
        },
    });

    const onSubmit = (data: ProfileFormData) => {
        updateMutation.mutate(data);
    };

    if (isLoadingMe) {
        return (
            <Card>
                <CardHeader title="Profil Sozlamalari" subheader="Sizning asosiy ma'lumotlarni boshqarish" />
                <CardContent>
                    <Stack spacing={2}>
                        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                        <Skeleton variant="rectangular" height={40} width="200px" sx={{ borderRadius: 1 }} />
                    </Stack>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader
                title="Profil Sozlamalari"
                subheader="Sizning asosiy ma'lumotlarni boshqarish"
                action={
                    !isEditing && (
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setIsEditing(true)}
                        >
                            Tahrirlash
                        </Button>
                    )
                }
            />
            <CardContent>
                {isEditing ? (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Stack spacing={2}>
                            <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    value={user?.email}
                                    disabled
                                    size="small"
                                />
                            </Box>

                            <TextField
                                fullWidth
                                label="To'liq ism"
                                {...register('fullName')}
                                error={!!errors.fullName}
                                helperText={errors.fullName?.message}
                                disabled={updateMutation.isPending}
                            />

                            <TextField
                                fullWidth
                                label="Telefon"
                                {...register('phone')}
                                error={!!errors.phone}
                                helperText={errors.phone?.message}
                                disabled={updateMutation.isPending}
                            />

                            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={!isChanged || updateMutation.isPending}
                                    startIcon={updateMutation.isPending && <CircularProgress size={20} />}
                                >
                                    Saqlash
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => {
                                        setIsEditing(false);
                                        reset();
                                    }}
                                    disabled={updateMutation.isPending}
                                >
                                    Bekor qilish
                                </Button>
                            </Stack>
                        </Stack>
                    </form>
                ) : (
                    <Stack spacing={2}>
                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                Email
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                                {user?.email}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                To'liq ism
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                                {user?.fullName}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                Telefon
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                                {user?.phone || '-'}
                            </Typography>
                        </Box>
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
}
