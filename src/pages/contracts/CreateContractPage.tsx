import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, Card, CardContent, TextField,
    Select, MenuItem, FormControl, InputLabel,
    CircularProgress, Alert, Grid,
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { contractsApi, customersApi, productsApi } from '../../api';
import { useMarketStore } from '../../store/market.store';
import type { Customer, Product } from '../../types';

interface CreateContractForm {
    customerId: string;
    productId: string;
    quantity: number;
    termMonths: number;
    downPayment: number;
    startDate: string;
    note: string;
}

export default function CreateContractPage() {
    const navigate = useNavigate();
    const { selectedMarket } = useMarketStore();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');

    const { control, handleSubmit, formState: { errors } } = useForm<CreateContractForm>({
        defaultValues: {
            quantity: 1,
            startDate: new Date().toISOString().split('T')[0],
        }
    });

    const marketId = selectedMarket?.id || '';

    const { data: customers } = useQuery({
        queryKey: ['customers', marketId],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        queryFn: () => customersApi.getAll(marketId).then((r: any) => r.data),
        enabled: !!marketId,
    });

    const { data: products } = useQuery({
        queryKey: ['products', marketId],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        queryFn: () => productsApi.getAll(marketId).then((r: any) => r.data),
        enabled: !!marketId,
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateContractForm) =>
            contractsApi.create({
                marketId,
                customerId: data.customerId,
                termMonths: data.termMonths,
                downPayment: data.downPayment,
                startDate: data.startDate,
                items: [{
                    productId: data.productId,
                    quantity: data.quantity,
                }],
                note: data.note,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contracts'] });
            navigate('/contracts');
        },
        onError: (err) => {
            setError((err as any)?.message || 'Shartnoma yaratishda xatolik');
        },
    });

    const onSubmit = handleSubmit(async (data) => {
        setError('');
        createMutation.mutate(data);
    });

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
                    <form onSubmit={onSubmit}>
                        <Grid container spacing={2} mb={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="customerId"
                                    control={control}
                                    rules={{ required: 'Mijoz majburiy' }}
                                    render={({ field }) => (
                                        <FormControl fullWidth error={!!errors.customerId}>
                                            <InputLabel>Mijoz</InputLabel>
                                            <Select {...field} label="Mijoz">
                                                {customers?.map((c: Customer) => (
                                                    <MenuItem key={c.id} value={c.id}>
                                                        {c.fullName}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="productId"
                                    control={control}
                                    rules={{ required: 'Mahsulot majburiy' }}
                                    render={({ field }) => (
                                        <FormControl fullWidth error={!!errors.productId}>
                                            <InputLabel>Mahsulot</InputLabel>
                                            <Select {...field} label="Mahsulot">
                                                {products?.map((p: Product) => (
                                                    <MenuItem key={p.id} value={p.id}>
                                                        {p.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="quantity"
                                    control={control}
                                    rules={{ required: 'Miqdor majburiy', min: 1 }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Miqdor"
                                            type="number"
                                            inputProps={{ min: 1 }}
                                            error={!!errors.quantity}
                                            helperText={errors.quantity?.message}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="startDate"
                                    control={control}
                                    rules={{ required: 'Boshlash sanasi majburiy' }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Boshlash sanasi"
                                            type="date"
                                            InputLabelProps={{ shrink: true }}
                                            error={!!errors.startDate}
                                            helperText={errors.startDate?.message}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="termMonths"
                                    control={control}
                                    rules={{ required: 'Muddat majburiy', min: 1 }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Muddat (oyda)"
                                            type="number"
                                            inputProps={{ min: 1 }}
                                            error={!!errors.termMonths}
                                            helperText={errors.termMonths?.message}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="downPayment"
                                    control={control}
                                    rules={{ required: 'Boshlang\'ich to\'lov majburiy', min: 0 }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Boshlang'ich to'lov"
                                            type="number"
                                            inputProps={{ min: 0 }}
                                            error={!!errors.downPayment}
                                            helperText={errors.downPayment?.message}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name="note"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Izoh"
                                            multiline
                                            rows={3}
                                        />
                                    )}
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
                                disabled={createMutation.isPending}
                            >
                                {createMutation.isPending ? <CircularProgress size={24} /> : 'Yaratish'}
                            </Button>
                        </Box>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
}