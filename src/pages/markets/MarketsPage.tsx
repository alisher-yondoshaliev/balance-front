import { useState } from 'react';
import {
    Box, Typography, Button, Card, CardContent,
    CardActions, Grid, Chip, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField,
    CircularProgress, IconButton,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Store as StoreIcon,
    MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { marketsApi } from '../../api';
import type { CreateMarketInput, UpdateMarketInput } from '../../api';
import { useAuthStore } from '../../store/auth.store';
import { useMarketStore } from '../../store/market.store';
import { isSuperAdmin } from '../../utils/roles';
import type { Market, MarketStatus } from '../../types';

const statusColors: Record<MarketStatus, 'success' | 'warning' | 'error' | 'default'> = {
    active: 'success',
    inactive: 'error',
};

export default function MarketsPage() {
    const { user } = useAuthStore();
    const { selectedMarket, setSelectedMarket } = useMarketStore();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [editItem, setEditItem] = useState<Market | null>(null);

    // Fetch markets - only own markets
    const { data: markets, isLoading } = useQuery({
        queryKey: ['markets'],
        queryFn: () =>
            marketsApi.getMyMarkets().then((r) => r.data),
    });

    const { register, handleSubmit, reset, setValue } = useForm<CreateMarketInput>();

    const createMutation = useMutation({
        mutationFn: (data: CreateMarketInput) => marketsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['markets'] });
            setOpen(false);
            reset();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateMarketInput }) =>
            marketsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['markets'] });
            setOpen(false);
            setEditItem(null);
            reset();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: marketsApi.remove,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['markets'] }),
    });

    const onSubmit = (data: CreateMarketInput) => {
        if (editItem) {
            updateMutation.mutate({ id: editItem.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (market: Market) => {
        setEditItem(market);
        setValue('name', market.name);
        setValue('address', market.address);
        setValue('phone', market.phone);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditItem(null);
        reset();
    };

    if (isLoading) return <CircularProgress />;

    const pageTitle = isSuperAdmin(user?.role) ? 'Barcha Marketlar' : 'Marketlar';
    const canCreateMarket = user?.role === 'OWNER';
    const canManageStatus = isSuperAdmin(user?.role);

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold">{pageTitle}</Typography>
                {canCreateMarket && (
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
                        Market qo'shish
                    </Button>
                )}
            </Box>

            {!markets || markets.length === 0 ? (
                <Box
                    sx={{
                        textAlign: 'center',
                        py: 8,
                        bgcolor: '#f5f5f5',
                        borderRadius: 2,
                    }}
                >
                    <Typography color="text.secondary">Market topilmadi</Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {markets.map((market: Market) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={market.id}>
                            <Card
                                sx={{
                                    border: !isSuperAdmin(user?.role) && selectedMarket?.id === market.id ? '2px solid' : '1px solid',
                                    borderColor: !isSuperAdmin(user?.role) && selectedMarket?.id === market.id ? 'primary.main' : 'divider',
                                    cursor: !isSuperAdmin(user?.role) ? 'pointer' : 'default',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        boxShadow: 2,
                                    },
                                }}
                                onClick={() => !isSuperAdmin(user?.role) && setSelectedMarket(market)}
                            >
                                <CardContent>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <StoreIcon color="primary" />
                                        <Typography variant="h6" fontWeight="bold">
                                            {market.name}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {market.address || 'Manzil kiritilmagan'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {market.phone || 'Telefon kiritilmagan'}
                                    </Typography>
                                    <Box>
                                        <Chip
                                            label={market.status}
                                            size="small"
                                            color={statusColors[market.status] || 'default'}
                                        />
                                        {!isSuperAdmin(user?.role) && selectedMarket?.id === market.id && (
                                            <Chip label="Tanlangan" size="small" color="primary" sx={{ ml: 1 }} />
                                        )}
                                    </Box>
                                </CardContent>
                                <CardActions>
                                    {canCreateMarket && (
                                        <>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(market);
                                                }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteMutation.mutate(market.id);
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </>
                                    )}
                                    {canManageStatus && (
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // TODO: Implement status management
                                            }}
                                        >
                                            <MoreVertIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{editItem ? 'Market tahrirlash' : 'Yangi market'}</DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent>
                        <TextField fullWidth label="Nomi" {...register('name')} sx={{ mb: 2 }} required />
                        <TextField fullWidth label="Manzil" {...register('address')} sx={{ mb: 2 }} />
                        <TextField fullWidth label="Telefon" {...register('phone')} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Bekor qilish</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {editItem ? 'Saqlash' : 'Yaratish'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
}