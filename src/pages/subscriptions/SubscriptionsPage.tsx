import { useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Paper,
    Skeleton,
    Snackbar,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import {
    Block as BlockIcon,
    CheckCircle as CheckCircleIcon,
    CreditCard as CreditCardIcon,
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { extractApiErrorMessage } from '../../api/error';
import {
    normalizeCurrentSubscription,
    normalizeSubscriptionHistory,
    subscriptionsApi,
    type PaymentInput,
    type SubscriptionHistoryItem,
    type SubscriptionPlan,
} from '../../api/endpoints/subscriptions.api';
import PageHeader from '../../components/common/PageHeader';

const ACTIVE_SUBSCRIPTION_MESSAGE =
    'Yangi obuna olish uchun avval joriy obunani bekor qiling.';

type HistoryWithAliases = SubscriptionHistoryItem & {
    startDate?: string;
    endDate?: string;
    createdAt?: string;
};

const formatCurrency = (amount?: number) =>
    Number(amount ?? 0).toLocaleString('uz-UZ');

const formatDate = (value?: string) =>
    value ? dayjs(value).format('DD.MM.YYYY') : '—';

const formatDateTime = (value?: string) =>
    value ? dayjs(value).format('DD.MM.YYYY HH:mm') : '—';

const getHistoryDates = (item: SubscriptionHistoryItem) => {
    const historyItem = item as HistoryWithAliases;

    return {
        startDate: historyItem.startDate ?? historyItem.subStartDate,
        endDate: historyItem.endDate ?? historyItem.subEndDate,
        paidDate: historyItem.createdAt ?? historyItem.paymentDate,
    };
};

export default function SubscriptionsPage() {
    const queryClient = useQueryClient();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [cancelOpen, setCancelOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
    const [toast, setToast] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error' | 'info';
    }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const currentQuery = useQuery({
        queryKey: ['subscriptions-current'],
        queryFn: async () =>
            normalizeCurrentSubscription((await subscriptionsApi.getCurrent()).data),
        retry: false,
    });

    const plansQuery = useQuery({
        queryKey: ['subscriptions-plans'],
        queryFn: async () => (await subscriptionsApi.getPlans()).data,
    });

    const historyQuery = useQuery({
        queryKey: ['subscriptions-history'],
        queryFn: async () =>
            normalizeSubscriptionHistory((await subscriptionsApi.getHistory()).data),
    });

    const subscription = currentQuery.data ?? null;
    const isSubActive = subscription?.isActive === true;
    const plans = useMemo(
        () => (plansQuery.data ?? []).filter((plan) => plan.isActive !== false),
        [plansQuery.data],
    );
    const history = historyQuery.data ?? [];

    const refreshSubscriptionData = async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['subscriptions-current'] }),
            queryClient.invalidateQueries({ queryKey: ['subscriptions-plans'] }),
            queryClient.invalidateQueries({ queryKey: ['subscriptions-history'] }),
        ]);
    };

    const payMutation = useMutation({
        mutationFn: (payload: PaymentInput) => subscriptionsApi.pay(payload),
        onSuccess: async (response) => {
            await refreshSubscriptionData();
            setConfirmOpen(false);
            setSelectedPlan(null);
            setToast({
                open: true,
                message:
                    typeof response.data?.message === 'string' && response.data.message.trim()
                        ? response.data.message
                        : "To'lov muvaffaqiyatli amalga oshirildi!",
                severity: 'success',
            });
        },
        onError: (error) => {
            setToast({
                open: true,
                message: extractApiErrorMessage(
                    error,
                    "To'lovni amalga oshirib bo'lmadi.",
                ),
                severity: 'error',
            });
        },
    });

    const cancelMutation = useMutation({
        mutationFn: () => subscriptionsApi.cancel(),
        onSuccess: async (response) => {
            await refreshSubscriptionData();
            setCancelOpen(false);
            setConfirmOpen(false);
            setSelectedPlan(null);
            setToast({
                open: true,
                message:
                    typeof response.data?.message === 'string' && response.data.message.trim()
                        ? response.data.message
                        : 'Obuna muvaffaqiyatli bekor qilindi.',
                severity: 'success',
            });
        },
        onError: (error) => {
            setToast({
                open: true,
                message: extractApiErrorMessage(
                    error,
                    "Obunani bekor qilib bo'lmadi.",
                ),
                severity: 'error',
            });
        },
    });

    const handleSubscribeClick = (plan: SubscriptionPlan) => {
        if (isSubActive) {
            setToast({
                open: true,
                message: ACTIVE_SUBSCRIPTION_MESSAGE,
                severity: 'info',
            });
            return;
        }

        setSelectedPlan(plan);
        setConfirmOpen(true);
    };

    const handleConfirmPay = () => {
        if (!selectedPlan) {
            return;
        }

        if (isSubActive) {
            setConfirmOpen(false);
            setSelectedPlan(null);
            setToast({
                open: true,
                message: ACTIVE_SUBSCRIPTION_MESSAGE,
                severity: 'info',
            });
            return;
        }

        payMutation.mutate({ planId: selectedPlan.id });
    };

    const isAnyLoading =
        currentQuery.isLoading || plansQuery.isLoading || historyQuery.isLoading;

    if (isAnyLoading) {
        return (
            <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 3 } }}>
                <Stack spacing={3}>
                    <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 1 }} />
                </Stack>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 3 } }}>
            <Stack spacing={3}>
                <PageHeader
                    eyebrow="Subscriptions"
                    title="Obunalar"
                    subtitle="Tariflar, faol obuna va to'lov tarixini bir ekranda boshqaring."
                />

                <Card>
                    <CardHeader
                        title="Joriy Obuna"
                        subheader="Sizning aktual obuna rejimi"
                    />
                    <CardContent>
                        {isSubActive && subscription ? (
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Stack spacing={1}>
                                        <Typography color="primary" fontWeight="bold" variant="overline">
                                            Faol Tarif
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="text.primary">
                                            {subscription.plan?.name || 'Standard'}
                                        </Typography>
                                        <Typography variant="h6" color="text.secondary">
                                            {Number(subscription.plan?.price ?? 0).toLocaleString('uz-UZ')} so'm
                                        </Typography>
                                        {subscription.plan?.description ? (
                                            <Typography variant="body2" color="text.secondary" sx={{ pt: 0.5 }}>
                                                {subscription.plan.description}
                                            </Typography>
                                        ) : null}
                                        <Box sx={{ pt: 1 }}>
                                            <Button
                                                variant="outlined"
                                                color="warning"
                                                startIcon={<BlockIcon />}
                                                onClick={() => setCancelOpen(true)}
                                                disabled={cancelMutation.isPending}
                                                sx={{ textTransform: 'none', fontWeight: 600 }}
                                            >
                                                {cancelMutation.isPending
                                                    ? 'Bekor qilinmoqda...'
                                                    : 'Obunani bekor qilish'}
                                            </Button>
                                        </Box>
                                    </Stack>
                                </Grid>

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
                                                    Boshlanish
                                                </Typography>
                                                <Typography fontWeight="medium" variant="body2" sx={{ mt: 0.5 }}>
                                                    {formatDate(subscription.subStartDate ?? undefined)}
                                                </Typography>
                                            </Grid>

                                            <Grid size={{ xs: 6 }}>
                                                <Typography color="text.secondary" variant="body2">
                                                    Tugash sanasi
                                                </Typography>
                                                <Typography fontWeight="medium" variant="body2" sx={{ mt: 0.5 }}>
                                                    {formatDate(subscription.subEndDate)}
                                                </Typography>
                                            </Grid>

                                            <Grid size={{ xs: 6 }}>
                                                <Typography color="text.secondary" variant="body2">
                                                    Muddat
                                                </Typography>
                                                <Typography fontWeight="medium" variant="body2" sx={{ mt: 0.5 }}>
                                                    {subscription.plan?.duration} kun
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Grid>
                            </Grid>
                        ) : (
                            <Alert severity="warning">
                                Sizda hech qanday faol obuna yo&apos;q. Quyidan reja tanlang va to&apos;lov qiling.
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader
                        title="Mavjud Rejalar"
                        subheader="Obuna rejasini tanlang va yangilang"
                    />
                    <CardContent>
                        {isSubActive ? (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                {ACTIVE_SUBSCRIPTION_MESSAGE}
                            </Alert>
                        ) : null}

                        <Grid container spacing={2}>
                            {plans.length > 0 ? (
                                plans.map((plan: SubscriptionPlan) => {
                                    const isCurrentPlan =
                                        isSubActive &&
                                        subscription?.plan?.id === plan.id;
                                    const isPurchaseBlocked = isSubActive;

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
                                                    opacity: isPurchaseBlocked && !isCurrentPlan ? 0.84 : 1,
                                                    '&:hover': {
                                                        transform: 'translateY(-4px)',
                                                        boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                                                        borderColor: 'primary.main',
                                                    },
                                                }}
                                            >
                                                <Stack spacing={2}>
                                                    {isCurrentPlan ? (
                                                        <Chip
                                                            icon={<CheckCircleIcon />}
                                                            label="Joriy reja"
                                                            color="primary"
                                                            size="small"
                                                            sx={{ alignSelf: 'flex-start' }}
                                                        />
                                                    ) : null}

                                                    <Typography variant="h6" fontWeight="bold">
                                                        {plan.name}
                                                    </Typography>

                                                    {plan.description ? (
                                                        <Typography variant="body2" color="text.secondary">
                                                            {plan.description}
                                                        </Typography>
                                                    ) : null}

                                                    <Box>
                                                        <Typography variant="h4" fontWeight="bold" color="primary">
                                                            {Number(plan.price ?? 0).toLocaleString('uz-UZ')}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            so&apos;m / {plan.duration} kun
                                                        </Typography>
                                                    </Box>

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
                                                        disabled={isCurrentPlan || isPurchaseBlocked}
                                                        onClick={() => handleSubscribeClick(plan)}
                                                        startIcon={
                                                            isCurrentPlan
                                                                ? <CheckCircleIcon />
                                                                : !isPurchaseBlocked
                                                                  ? <CreditCardIcon />
                                                                  : undefined
                                                        }
                                                    >
                                                        {isCurrentPlan
                                                            ? 'Joriy reja'
                                                            : isPurchaseBlocked
                                                              ? 'Avval bekor qiling'
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

                <Card>
                    <CardHeader
                        title="To'lov Tarixi"
                        subheader="Barcha o'tgan to'lovlar"
                    />
                    <CardContent>
                        {historyQuery.isError ? (
                            <Alert severity="error">
                                {extractApiErrorMessage(
                                    historyQuery.error,
                                    "To'lov tarixini yuklab bo'lmadi.",
                                )}
                            </Alert>
                        ) : history.length > 0 ? (
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
                                        {history.map((item: SubscriptionHistoryItem, idx: number) => {
                                            const { startDate, endDate, paidDate } = getHistoryDates(item);

                                            return (
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
                                                    <TableCell>{formatDate(startDate)}</TableCell>
                                                    <TableCell>{formatDate(endDate)}</TableCell>
                                                    <TableCell>{formatDateTime(paidDate)}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </Paper>
                        ) : (
                            <Alert severity="info">To'lov tarixi bo'sh</Alert>
                        )}
                    </CardContent>
                </Card>
            </Stack>

            <Dialog
                open={confirmOpen}
                onClose={() => !payMutation.isPending && setConfirmOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Obunani tasdiqlash</DialogTitle>
                <DialogContent>
                    {selectedPlan ? (
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
                                    <Typography variant="h5" fontWeight="bold" color="primary">
                                        {Number(selectedPlan.price ?? 0).toLocaleString('uz-UZ')} so&apos;m
                                    </Typography>
                                </Stack>
                            </Paper>

                            <Alert severity="info">
                                To&apos;lov so&apos;rovi backendga faqat tanlangan reja identifikatori bilan yuboriladi.
                            </Alert>
                        </Stack>
                    ) : null}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={() => setConfirmOpen(false)}
                        disabled={payMutation.isPending}
                    >
                        Bekor qilish
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirmPay}
                        disabled={payMutation.isPending || !selectedPlan || isSubActive}
                        startIcon={
                            payMutation.isPending ? (
                                <CircularProgress size={18} color="inherit" />
                            ) : (
                                <CreditCardIcon />
                            )
                        }
                    >
                        {payMutation.isPending ? 'To\'lov qilinmoqda...' : "To'lash"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={cancelOpen}
                onClose={() => !cancelMutation.isPending && setCancelOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Obunani bekor qilish</DialogTitle>
                <DialogContent>
                    <Typography color="text.secondary">
                        Joriy obunani bekor qilgach, yangi tarif sotib olish imkoniyati ochiladi.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={() => setCancelOpen(false)}
                        disabled={cancelMutation.isPending}
                    >
                        Ortga
                    </Button>
                    <Button
                        color="warning"
                        variant="contained"
                        onClick={() => cancelMutation.mutate()}
                        disabled={cancelMutation.isPending}
                        startIcon={
                            cancelMutation.isPending ? (
                                <CircularProgress size={18} color="inherit" />
                            ) : (
                                <BlockIcon />
                            )
                        }
                    >
                        {cancelMutation.isPending ? 'Bekor qilinmoqda...' : 'Bekor qilish'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={toast.open}
                autoHideDuration={5000}
                onClose={() => setToast((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={toast.severity}
                    variant="filled"
                    onClose={() => setToast((prev) => ({ ...prev, open: false }))}
                    sx={{ width: '100%' }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
