import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, Card, CardContent, TextField,
    Select, MenuItem, FormControl, InputLabel,
    CircularProgress, Alert, Grid,
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { contractsApi, customersApi, productsApi } from '../../api';
import { useMarketStore } from '../../store/market.store';
import type { Customer } from '../../types';

interface CreateContractForm {
    customerId: string;
    productIds: string[];
    termMonths: number;
    downPayment: number;
    note: string;
}

export default function CreateContractPage() {
    const navigate = useNavigate();
    const { selectedMarket } = useMarketStore();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<CreateContractForm>();

    const marketId = selectedMarket?.id || '';

    const { data: customers } = useQuery({
        queryKey: ['customers', marketId],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        queryFn: () => customersApi.getAll(marketId).then((r: any) => r.data),
        enabled: !!marketId,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useQuery<any[]>({
        queryKey: ['products', marketId],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        queryFn: () => productsApi.getAll(marketId).then((r: any) => r.data),
        enabled: !!marketId,
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateContractForm) =>
            contractsApi.create({
                customerId: data.customerId,
                staffId: '',
                termMonths: data.termMonths,
                downPayment: data.downPayment,
                items: [],
                note: data.note,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contracts'] });
            navigate('/contracts');
        },
        onError: () => {
            setError('Shartnoma yaratishda xatolik');
        },
    });

    const onSubmit = async (data: CreateContractForm) => {
        setLoading(true);
        setError('');
        try {
            await createMutation.mutateAsync(data);
        } finally {
            setLoading(false);
        }
    };

    if (!marketId) return <Alert severity="info">Iltimos, market tanlang</Alert>;

    return (
        <Box>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Button startIcon={<BackIcon />} onClick={() => navigate('/contracts')}>
                    Orqaga
                </Button>
                <Typography variant="h5" fontWeight="bold">
                    Yangi shartnoma
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Card>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Grid container spacing={2} mb={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Mijoz</InputLabel>
                                    <Select
                                        {...register('customerId')}
                                        label="Mijoz"
                                    >
                                        {customers?.map((c: Customer) => (
                                            <MenuItem key={c.id} value={c.id}>{c.fullName}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Muddat (oyda)"
                                    type="number"
                                    {...register('termMonths')}
                                    error={!!errors.termMonths}
                                    helperText={errors.termMonths?.message}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Boshlang'ich to'lov"
                                    type="number"
                                    {...register('downPayment')}
                                    error={!!errors.downPayment}
                                    helperText={errors.downPayment?.message}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Izoh"
                                    multiline
                                    rows={3}
                                    {...register('note')}
                                />
                            </Grid>
                        </Grid>

                        <Box display="flex" gap={2} justifyContent="flex-end">
                            <Button variant="outlined" onClick={() => navigate('/contracts')}>
                                Bekor qilish
                            </Button>
                            <Button
                                variant="contained"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Yaratish'}
                            </Button>
                        </Box>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
}