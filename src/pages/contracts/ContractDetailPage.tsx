import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Grid, Card, CardContent, Chip,
    Table, TableBody, TableCell, TableHead, TableRow,
    Paper, Button, CircularProgress, Alert, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    Payment as PaymentIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { contractsApi } from '../../api';
import type { ContractStatus, InstallmentStatus } from '../../types';
import dayjs from 'dayjs';

const statusColors: Record<ContractStatus, 'success' | 'default' | 'warning' | 'info' | 'error'> = {
    active: 'success',
    draft: 'default',
    expired: 'warning',
    terminated: 'error',
};

const installmentColors: Record<InstallmentStatus, 'success' | 'default' | 'warning' | 'info' | 'error'> = {
    paid: 'success',
    pending: 'default',
    overdue: 'warning',
    cancelled: 'error',
};

export default function ContractDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [payOpen, setPayOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedInstallment, setSelectedInstallment] = useState<any>(null);

    const { data: contract, isLoading } = useQuery({
        queryKey: ['contract', id],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        queryFn: () => contractsApi.getOne(id!).then((r: any) => r.data),
    });

    const { register, handleSubmit, reset } = useForm();

    const payMutation = useMutation({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mutationFn: (data: any) => contractsApi.pay(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contract', id] });
            setPayOpen(false);
            reset();
        },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onPay = (data: any) => {
        payMutation.mutate({
            installmentId: selectedInstallment.id,
            amount: Number(data.amount),
            note: data.note,
        });
    };

    if (isLoading) return <CircularProgress />;
    if (!contract) return <Alert severity="error">Shartnoma topilmadi</Alert>;

    return (
        <Box>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Button startIcon={<BackIcon />} onClick={() => navigate('/contracts')}>
                    Orqaga
                </Button>
                <Typography variant="h5" fontWeight="bold">
                    {contract.contractNumber}
                </Typography>
                <Chip
                    label={contract.status}
                    color={statusColors[contract.status as ContractStatus] || 'default'}
                />
            </Box>

            <Grid container spacing={3}>
                {/* Contract Info */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" mb={2}>
                                Shartnoma ma'lumotlari
                            </Typography>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography color="text.secondary">Mijoz:</Typography>
                                <Typography fontWeight="bold">{contract.customer?.fullName}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography color="text.secondary">Telefon:</Typography>
                                <Typography>{contract.customer?.phone}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography color="text.secondary">Muddat:</Typography>
                                <Typography>{contract.termMonths} oy</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography color="text.secondary">Boshlanish:</Typography>
                                <Typography>{dayjs(contract.startDate).format('DD.MM.YYYY')}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography color="text.secondary">Tugash:</Typography>
                                <Typography>{dayjs(contract.endDate).format('DD.MM.YYYY')}</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Payment Info */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" mb={2}>
                                To'lov ma'lumotlari
                            </Typography>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography color="text.secondary">Jami summa:</Typography>
                                <Typography fontWeight="bold">
                                    {Number(contract.totalAmount).toLocaleString()} so'm
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography color="text.secondary">Boshlang'ich to'lov:</Typography>
                                <Typography>{Number(contract.downPayment).toLocaleString()} so'm</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography color="text.secondary">Oylik to'lov:</Typography>
                                <Typography>{Number(contract.monthlyAmount).toLocaleString()} so'm</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography color="text.secondary">To'langan:</Typography>
                                <Typography color="success.main" fontWeight="bold">
                                    {Number(contract.paidAmount).toLocaleString()} so'm
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Typography color="text.secondary">Qoldi:</Typography>
                                <Typography color="error.main" fontWeight="bold">
                                    {Number(contract.remainAmount).toLocaleString()} so'm
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Items */}
                <Grid size={{ xs: 12 }}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" fontWeight="bold" mb={2}>Mahsulotlar</Typography>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Mahsulot</TableCell>
                                    <TableCell align="right">Miqdor</TableCell>
                                    <TableCell align="right">Narx</TableCell>
                                    <TableCell align="right">Foiz</TableCell>
                                    <TableCell align="right">Jami</TableCell>
                                    <TableCell align="right">Oylik</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {contract.items?.map((item: any) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.productName}</TableCell>
                                        <TableCell align="right">{item.quantity}</TableCell>
                                        <TableCell align="right">{Number(item.basePrice).toLocaleString()}</TableCell>
                                        <TableCell align="right">{item.interestRate}%</TableCell>
                                        <TableCell align="right">{Number(item.totalPrice).toLocaleString()}</TableCell>
                                        <TableCell align="right">{Number(item.monthlyPrice).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                </Grid>

                {/* Installments */}
                <Grid size={{ xs: 12 }}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" fontWeight="bold" mb={2}>To'lov jadvali</Typography>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>Sana</TableCell>
                                    <TableCell align="right">Summa</TableCell>
                                    <TableCell align="right">To'langan</TableCell>
                                    <TableCell>Holat</TableCell>
                                    <TableCell align="right">Amal</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {contract.installments?.map((inst: any) => (
                                    <TableRow key={inst.id}>
                                        <TableCell>{inst.orderIndex}</TableCell>
                                        <TableCell>{dayjs(inst.dueDate).format('DD.MM.YYYY')}</TableCell>
                                        <TableCell align="right">{Number(inst.amount).toLocaleString()}</TableCell>
                                        <TableCell align="right">{Number(inst.paidAmount).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={inst.status}
                                                size="small"
                                                color={installmentColors[inst.status as InstallmentStatus] || 'default'}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            {inst.status !== 'PAID' && contract.status === 'ACTIVE' && (
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<PaymentIcon />}
                                                    onClick={() => { setSelectedInstallment(inst); setPayOpen(true); }}
                                                >
                                                    To'lash
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                </Grid>
            </Grid>

            {/* Pay Dialog */}
            <Dialog open={payOpen} onClose={() => setPayOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>To'lov qabul qilish</DialogTitle>
                <form onSubmit={handleSubmit(onPay)}>
                    <DialogContent>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            To'lov #{selectedInstallment?.orderIndex} —
                            Summa: {Number(selectedInstallment?.amount || 0).toLocaleString()} so'm
                        </Typography>
                        <TextField
                            fullWidth
                            label="To'lov miqdori"
                            type="number"
                            {...register('amount')}
                            defaultValue={selectedInstallment?.amount}
                            sx={{ mb: 2 }}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Izoh"
                            {...register('note')}
                            multiline
                            rows={2}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setPayOpen(false)}>Bekor qilish</Button>
                        <Button type="submit" variant="contained" disabled={payMutation.isPending}>
                            To'lash
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
}