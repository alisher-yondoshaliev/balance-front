import { useState, useEffect } from 'react';
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
    Skeleton,
    Chip,
    Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { marketsApi } from '../../../api/endpoints/markets.api';
import { useAuthStore } from '../../../store/auth.store';
import type { Market } from '../../../types';

const marketSchema = z.object({
    name: z.string().min(2, 'Bozor nomi kamida 2 ta belgi bo\'lishi kerak'),
    address: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
});

type MarketFormData = z.infer<typeof marketSchema>;

interface MarketSettingsSectionProps {
    onShowToast: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void;
}

export default function MarketSettingsSection({ onShowToast }: MarketSettingsSectionProps) {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);

    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<MarketFormData>({
        resolver: zodResolver(marketSchema),
        defaultValues: {
            name: '',
            address: '',
            phone: '',
        },
    });

    const watchedValues = watch();
    const isChanged = selectedMarket && (
        watchedValues.name !== selectedMarket.name ||
        watchedValues.address !== selectedMarket.address ||
        watchedValues.phone !== selectedMarket.phone
    );

    // Fetch user's market (OWNER can only have one market)
    const { isLoading: isLoadingMarkets, data: marketsResponse, error: marketsError } = useQuery({
        queryKey: ['markets', user?.id],
        queryFn: async () => {
            return marketsApi.getMyMarkets();
        },
        enabled: !!user?.id,
    });

    const markets = marketsResponse?.data || [];

    // Set initial market data
    useEffect(() => {
        if (markets.length > 0 && !selectedMarket) {
            const market = markets[0];
            setSelectedMarket(market);
            reset({
                name: market.name,
                address: market.address || '',
                phone: market.phone || '',
            });
        }
    }, [markets, selectedMarket, reset]);

    // Update market mutation
    const updateMarketMutation = useMutation({
        mutationFn: async (data: MarketFormData) => {
            if (!selectedMarket?.id) throw new Error('Market ID is missing');
            return marketsApi.update(selectedMarket.id, data);
        },
        onSuccess: (response) => {
            const updatedMarket = response.data;
            setSelectedMarket(updatedMarket);
            queryClient.invalidateQueries({ queryKey: ['markets'] });
            onShowToast('Bozor sozlamalari muvaffaqiyatli yangilandi', 'success');
            setIsEditing(false);
        },
        onError: (err) => {
            const axiosError = err as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Bozor sozlamalarini yangilashda xatolik yuz berdi';
            onShowToast(errorMessage, 'error');
        },
    });

    const onSubmit = (data: MarketFormData) => {
        updateMarketMutation.mutate(data);
    };

    if (isLoadingMarkets) {
        return (
            <Card>
                <CardHeader title="Bozor Sozlamalari" subheader="Sizning bozoringizni boshqarish" />
                <CardContent>
                    <Stack spacing={2}>
                        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                        <Skeleton variant="rectangular" height={40} width="200px" sx={{ borderRadius: 1 }} />
                    </Stack>
                </CardContent>
            </Card>
        );
    }

    if (marketsError) {
        return (
            <Card>
                <CardHeader title="Bozor Sozlamalari" subheader="Sizning bozoringizni boshqarish" />
                <CardContent>
                    <Alert severity="error">
                        Bozor ma'lumotlarini yuklashda xatolik yuz berdi
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    if (markets.length === 0) {
        return (
            <Card>
                <CardHeader title="Bozor Sozlamalari" subheader="Sizning bozoringizni boshqarish" />
                <CardContent>
                    <Alert severity="info">
                        Sizda hech qanday bozor yo'q. Bozor yaratish uchun administratorga murojaat qiling.
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader
                title="Bozor Sozlamalari"
                subheader="Sizning bozoringizni boshqarish"
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
                            <TextField
                                fullWidth
                                label="Bozor nomi"
                                {...register('name')}
                                error={!!errors.name}
                                helperText={errors.name?.message}
                                disabled={updateMarketMutation.isPending}
                            />

                            <TextField
                                fullWidth
                                label="Manzil"
                                {...register('address')}
                                error={!!errors.address}
                                helperText={errors.address?.message}
                                disabled={updateMarketMutation.isPending}
                                multiline
                                rows={3}
                            />

                            <TextField
                                fullWidth
                                label="Telefon"
                                {...register('phone')}
                                error={!!errors.phone}
                                helperText={errors.phone?.message}
                                disabled={updateMarketMutation.isPending}
                            />

                            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={!isChanged || updateMarketMutation.isPending}
                                    startIcon={updateMarketMutation.isPending && <CircularProgress size={20} />}
                                >
                                    Saqlash
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => {
                                        setIsEditing(false);
                                        if (selectedMarket) {
                                            reset({
                                                name: selectedMarket.name,
                                                address: selectedMarket.address || '',
                                                phone: selectedMarket.phone || '',
                                            });
                                        }
                                    }}
                                    disabled={updateMarketMutation.isPending}
                                >
                                    Bekor qilish
                                </Button>
                            </Stack>
                        </Stack>
                    </form>
                ) : (
                    <Stack spacing={3}>
                        {selectedMarket && (
                            <>
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Bozor nomi
                                        </Typography>
                                        {selectedMarket.status && (
                                            <Chip
                                                label={selectedMarket.status === 'ACTIVE' ? 'Faol' : 'Faol emas'}
                                                size="small"
                                                color={selectedMarket.status === 'ACTIVE' ? 'success' : 'default'}
                                                variant="outlined"
                                            />
                                        )}
                                    </Box>
                                    <Typography variant="body1" fontWeight={500}>
                                        {selectedMarket.name}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        Manzil
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {selectedMarket.address || '-'}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        Telefon
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {selectedMarket.phone || '-'}
                                    </Typography>
                                </Box>

                                {selectedMarket.createdAt && (
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            Yaratilgan sana
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            {new Date(selectedMarket.createdAt).toLocaleDateString('uz-UZ')}
                                        </Typography>
                                    </Box>
                                )}
                            </>
                        )}
                    </Stack>
                )}

                <Alert severity="info" sx={{ mt: 3 }}>
                    💡 Faqat sizning bozoringizni tahrirlash mumkin. Bozor ochish yoki o'chirish uchun administratorga murojaat qiling.
                </Alert>
            </CardContent>
        </Card>
    );
}


