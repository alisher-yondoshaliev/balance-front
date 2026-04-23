import { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Button,
    CircularProgress,
    Alert,
    Stack,
    Skeleton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    Typography,
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    CreditCard as CreditCardIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '../../../api/endpoints/subscriptions.api';
import type { SubscriptionPlan } from '../../../api/endpoints/subscriptions.api';
import dayjs from 'dayjs';

interface SubscriptionSettingsSectionProps {
    onShowToast: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void;
}

export default function SubscriptionSettingsSection({
    onShowToast,
}: SubscriptionSettingsSectionProps) {
    const queryClient = useQueryClient();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

    // ── Joriy obuna ───────────────────────────────────
    const { data: currentSubResponse, isLoading: isLoadingCurrent } = useQuery({
        queryKey: ['subscriptions-current'],
        queryFn: () => subscriptionsApi.getCurrent(),
        retry: false,
    });
    const currentSub = currentSubResponse?.data;
    const subscription = currentSub?.subscription ?? null;
    const isSubActive = subscription?.isActive === true;

    // ── Planlar ───────────────────────────────────────
    const { data: plansResponse, isLoading: isLoadingPlans } = useQuery({
        queryKey: ['subscriptions-plans'],
        queryFn: () => subscriptionsApi.getPlans(),
    });
    const plans: SubscriptionPlan[] = plansResponse?.data || [];

    // ── Tarix ─────────────────────────────────────────
    const { data: historyResponse, isLoading: isLoadingHistory } = useQuery({
        queryKey: ['subscriptions-history'],
        queryFn: () => subscriptionsApi.getHistory(),
    });
    // Backend to'g'ridan array qaytaradi
    const history = Array.isArray(historyResponse?.data) ? historyResponse.data : [];

    // ── To'lov mutatsiyasi ────────────────────────────
    const payMutation = useMutation({
        mutationFn: (planId: string) =>
            subscriptionsApi.pay(planId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscriptions-current'] });
            queryClient.invalidateQueries({ queryKey: ['subscriptions-history'] });
            setConfirmOpen(false);
            setSelectedPlan(null);
            onShowToast("Obuna muvaffaqiyatli faollashtirildi! ✓", 'success');
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || "To'lovda xatolik yuz berdi";
            onShowToast(msg, 'error');
        },
    });

    const handleSubscribeClick = (plan: SubscriptionPlan) => {
        setSelectedPlan(plan);
        setConfirmOpen(true);
    };

    const handleConfirmPay = () => {
        if (selectedPlan) {
            payMutation.mutate(selectedPlan.id);
        }
    };

    const isAnyLoading = isLoadingCurrent || isLoadingPlans || isLoadingHistory;

    if (isAnyLoading) {
        return (
            <Card>
                <CardHeader
                    title="Obuna Sozlamalari"
                    subheader="Sizning obuna rejimini boshqarish"
                />
                <CardContent>
                    <Stack spacing={2}>
                        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
                        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1 }} />
                        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
                    </Stack>
                </CardContent>
            </Card>
        );
    }

    return (
        <Stack spacing={3}>

            {/* ── 1. Joriy obuna ── */}
            <Card>
                <CardHeader
                    title="Joriy Obuna"
                    subheader="Sizning aktual obuna rejimi"
                />
                <CardContent>
                    {isSubActive && subscription ? (
                        <Grid container spacing={3}>
                            {/* Chap: Plan nomi va narxi */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Stack spacing={1}>
                                    <Typography
                                        color="primary"
                                        fontWeight="bold"
                                        variant="overline"
                                    >
                                        Faol Tarif
                                    </Typography>
                                    <Typography
                                        variant="h4"
                                        fontWeight="bold"
                                        color="text.primary"
                                    >
                                        {subscription.plan?.name || 'Standard'}
                                    </Typography>
                                    <Typography variant="h6" color="text.secondary">
                                        {Number(subscription.plan?.price ?? 0).toLocaleString('uz-UZ')} so'm
                                    </Typography>
                                </Stack>
                            </Grid>

                            {/* O'ng: Sanalar */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: 2,
                                        bgcolor: 'background.paper',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                    }}
                                >
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography color="text.secondary" variant="body2">
                                                Status
                                            </Typography>
                                            <Chip
                                                label="Faol"
                                                color="success"
                                                size="small"
                                                sx={{ mt: 0.5, fontWeight: 'bold' }}
                                            />
                                        </Grid>

                                        <Grid size={{ xs: 6 }}>
                                            <Typography color="text.secondary" variant="body2">
                                                Qolgan kunlar
                                            </Typography>
                                            <Chip
                                                label={`${subscription.daysLeft} kun`}
                                                color={
                                                    subscription.daysLeft > 7
                                                        ? 'success'
                                                        : subscription.daysLeft > 0
                                                            ? 'warning'
                                                            : 'error'
                                                }
                                                size="small"
                                                sx={{ mt: 0.5, fontWeight: 'bold' }}
                                            />
                                        </Grid>

                                        <Grid size={{ xs: 6 }}>
                                            <Typography color="text.secondary" variant="body2">
                                                Tugash sanasi
                                            </Typography>
                                            <Typography
                                                fontWeight="medium"
                                                variant="body2"
                                                sx={{ mt: 0.5 }}
                                            >
                                                {dayjs(subscription.subEndDate).format('DD.MM.YYYY')}
                                            </Typography>
                                        </Grid>

                                        <Grid size={{ xs: 6 }}>
                                            <Typography color="text.secondary" variant="body2">
                                                Muddat
                                            </Typography>
                                            <Typography
                                                fontWeight="medium"
                                                variant="body2"
                                                sx={{ mt: 0.5 }}
                                            >
                                                {subscription.plan?.duration} kun
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>
                        </Grid>
                    ) : (
                        <Alert severity="warning">
                            ⚠️ Sizda hech qanday faol obuna yo'q. Quyidan reja tanlang va to'lov qiling.
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* ── 2. Mavjud rejalar ── */}
            <Card>
                <CardHeader
                    title="Mavjud Rejalar"
                    subheader="Obuna rejasini tanlang va yangilang"
                />
                <CardContent>
                    <Grid container spacing={2}>
                        {plans.length > 0 ? (
                            plans.map((plan: SubscriptionPlan) => {
                                const isCurrentPlan =
                                    isSubActive &&
                                    subscription?.plan?.id === plan.id;

                                return (
                                    <Grid key={plan.id} size={{ xs: 12, sm: 6, md: 4 }}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                borderRadius: 2,
                                                border: '2px solid',
                                                borderColor: isCurrentPlan
                                                    ? 'primary.main'
                                                    : 'divider',
                                                position: 'relative',
                                                transition: 'transform 0.2s, box-shadow 0.2s',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                                                    borderColor: 'primary.main',
                                                },
                                            }}
                                        >
                                            <Stack spacing={2}>
                                                {isCurrentPlan && (
                                                    <Chip
                                                        icon={<CheckCircleIcon />}
                                                        label="Joriy reja"
                                                        color="primary"
                                                        size="small"
                                                        sx={{ alignSelf: 'flex-start' }}
                                                    />
                                                )}

                                                <Typography variant="h6" fontWeight="bold">
                                                    {plan.name}
                                                </Typography>

                                                {plan.description && (
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        {plan.description}
                                                    </Typography>
                                                )}

                                                <Box>
                                                    <Typography
                                                        variant="h4"
                                                        fontWeight="bold"
                                                        color="primary"
                                                    >
                                                        {Number(plan.price ?? 0).toLocaleString('uz-UZ')}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        so'm / {plan.duration} kun
                                                    </Typography>
                                                </Box>

                                                {/* Xususiyatlar ro'yxati */}
                                                <Stack spacing={0.5}>
                                                    <Typography variant="body2">
                                                        ✓ {plan.duration} kunlik foydalanish
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        ✓ Cheksiz shartnomalar
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        ✓ Barcha modullar mavjud
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        ✓ Texnik yordam
                                                    </Typography>
                                                </Stack>

                                                <Button
                                                    variant={isCurrentPlan ? 'outlined' : 'contained'}
                                                    fullWidth
                                                    disabled={isCurrentPlan}
                                                    onClick={() => handleSubscribeClick(plan)}
                                                    startIcon={
                                                        isCurrentPlan
                                                            ? <CheckCircleIcon />
                                                            : <CreditCardIcon />
                                                    }
                                                >
                                                    {isCurrentPlan
                                                        ? 'Joriy reja'
                                                        : isSubActive
                                                            ? 'Yangilash'
                                                            : 'Obuna bo\'lish'}
                                                </Button>
                                            </Stack>
                                        </Paper>
                                    </Grid>
                                );
                            })
                        ) : (
                            <Grid size={{ xs: 12 }}>
                                <Alert severity="info">
                                    Hech qanday obuna rejasi mavjud emas
                                </Alert>
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </Card>

            {/* ── 3. To'lov tarixi ── */}
            <Card>
                <CardHeader
                    title="To'lov Tarixi"
                    subheader="Barcha o'tgan to'lovlar"
                />
                <CardContent>
                    {history.length > 0 ? (
                        <Paper elevation={0} sx={{ overflow: 'auto' }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                                        <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Reja nomi</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Muddat</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                            Summa
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Boshlanish</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Tugash</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>To'langan sana</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {history.map((item: any, idx: number) => (
                                        <TableRow key={item.id} hover>
                                            <TableCell>{idx + 1}</TableCell>
                                            <TableCell sx={{ fontWeight: 500 }}>
                                                {item.plan?.name || '—'}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={`${item.plan?.duration ?? '?'} kun`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 500 }}>
                                                {Number(item.amount ?? 0).toLocaleString('uz-UZ')} so'm
                                            </TableCell>
                                            <TableCell>
                                                {item.startDate
                                                    ? dayjs(item.startDate).format('DD.MM.YYYY')
                                                    : '—'}
                                            </TableCell>
                                            <TableCell>
                                                {item.endDate
                                                    ? dayjs(item.endDate).format('DD.MM.YYYY')
                                                    : '—'}
                                            </TableCell>
                                            <TableCell>
                                                {item.createdAt
                                                    ? dayjs(item.createdAt).format('DD.MM.YYYY HH:mm')
                                                    : '—'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Paper>
                    ) : (
                        <Alert severity="info">To'lov tarixi bo'sh</Alert>
                    )}
                </CardContent>
            </Card>

            {/* ── 4. Tasdiqlash dialogi ── */}
            <Dialog
                open={confirmOpen}
                onClose={() => !payMutation.isPending && setConfirmOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Obunani tasdiqlash</DialogTitle>
                <DialogContent>
                    {selectedPlan && (
                        <Stack spacing={2} sx={{ pt: 1 }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: 2,
                                    bgcolor: 'grey.50',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                <Stack spacing={1}>
                                    <Typography variant="h6" fontWeight="bold">
                                        {selectedPlan.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Muddat: {selectedPlan.duration} kun
                                    </Typography>
                                    <Typography
                                        variant="h5"
                                        fontWeight="bold"
                                        color="primary"
                                    >
                                        {Number(selectedPlan.price ?? 0).toLocaleString('uz-UZ')} so'm
                                    </Typography>
                                </Stack>
                            </Paper>

                            <Alert severity="info">
                                To'lovdan so'ng obunangiz darhol faollashadi.
                                Tugash sanasi:{' '}
                                <strong>
                                    {dayjs().add(selectedPlan.duration, 'day').format('DD.MM.YYYY')}
                                </strong>
                            </Alert>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setConfirmOpen(false)}
                        disabled={payMutation.isPending}
                    >
                        Bekor qilish
                    </Button>
                    <Button
                        onClick={handleConfirmPay}
                        variant="contained"
                        disabled={payMutation.isPending}
                        startIcon={
                            payMutation.isPending
                                ? <CircularProgress size={18} color="inherit" />
                                : <CreditCardIcon />
                        }
                    >
                        {payMutation.isPending ? 'Yuklanmoqda...' : 'To\'lash'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}