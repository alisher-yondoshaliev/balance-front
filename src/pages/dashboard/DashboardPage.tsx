import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Grid, Card, CardContent, Typography,
    CircularProgress, Alert, Table,
    TableBody, TableCell, TableHead, TableRow, Paper,
} from '@mui/material';
import {
    Description as DescriptionIcon,
    People as PeopleIcon,
    Inventory as InventoryIcon,
    Warning as WarningIcon,
    TrendingUp as TrendingUpIcon,
    AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api';
import { useMarketStore } from '../../store/market.store';
import { useAuthStore } from '../../store/auth.store';
import dayjs from 'dayjs';
import type { DebtorInfo } from '../../api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StatCard = ({ title, value, icon, color }: any) => (
    <Card>
        <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                    <Typography variant="body2" color="text.secondary">{title}</Typography>
                    <Typography variant="h6" fontWeight="bold">{value}</Typography>
                </Box>
                <Box sx={{ color: `${color}.main` }}>
                    {icon}
                </Box>
            </Box>
        </CardContent>
    </Card>
);

export default function DashboardPage() {
    const { selectedMarket, setSelectedMarket } = useMarketStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    console.log('[DashboardPage] Rendering, user:', user?.role, 'selectedMarket:', selectedMarket?.name);

    // Auto-select first market for OWNER if not selected (Google login case)
    useEffect(() => {
        // Only for OWNER role
        if (user?.role !== 'OWNER') {
            console.log('[DashboardPage] Not OWNER, skipping market selection');
            return;
        }

        // If market already selected, no need to do anything
        if (selectedMarket) {
            console.log('[DashboardPage] Market already selected:', selectedMarket.name);
            return;
        }

        // If marketId in user profile, use that
        if (user?.marketId) {
            console.log('[DashboardPage] User has marketId in profile:', user.marketId);
            // Will be set when market is fetched
            return;
        }

        // Otherwise redirect to markets to select one
        console.log('[DashboardPage] No market selected, redirecting to /markets');
        navigate('/markets');
    }, [user, selectedMarket, navigate, setSelectedMarket]);

    const marketId = selectedMarket?.id || '';

    console.log('[DashboardPage] marketId:', marketId);

    const { data: summary, isLoading, error } = useQuery({
        queryKey: ['dashboard-summary', marketId],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        queryFn: () => dashboardApi.getSummary(marketId).then((r: any) => r.data),
        enabled: !!marketId,
    });

    const { data: debtors } = useQuery<DebtorInfo[]>({
        queryKey: ['top-debtors', marketId],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        queryFn: () => dashboardApi.getTopDebtors(marketId).then((r: any) => r.data),
        enabled: !!marketId,
    });

    // Show loading while redirecting to markets
    if (user?.role === 'OWNER' && !marketId) {
        console.log('[DashboardPage] OWNER with no market, showing loading');
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (isLoading) {
        console.log('[DashboardPage] Loading dashboard data');
        return <CircularProgress />;
    }

    if (error) {
        console.error('[DashboardPage] Error loading dashboard:', error);
        return <Alert severity="error">Dashboard xatosi: {(error as Error).message || 'Xatolik yuz berdi'}</Alert>;
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Stat Cards */}
            <Grid container spacing={3} mb={3}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <StatCard
                        title="Jami shartnomalar"
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        value={(summary as any)?.contracts?.total || 0}
                        icon={<DescriptionIcon />}
                        color="primary"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <StatCard
                        title="Faol shartnomalar"
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        value={(summary as any)?.contracts?.active || 0}
                        icon={<TrendingUpIcon />}
                        color="success"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <StatCard
                        title="Muddati o'tgan"
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        value={(summary as any)?.installments?.overdue || 0}
                        icon={<WarningIcon />}
                        color="error"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <StatCard
                        title="Jami mijozlar"
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        value={(summary as any)?.customers?.total || 0}
                        icon={<PeopleIcon />}
                        color="info"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <StatCard
                        title="Jami mahsulotlar"
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        value={(summary as any)?.products?.total || 0}
                        icon={<InventoryIcon />}
                        color="warning"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <StatCard
                        title="Qolgan qarz"
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        value={`${Number((summary as any)?.amounts?.remain || 0).toLocaleString()} so'm`}
                        icon={<MoneyIcon />}
                        color="secondary"
                    />
                </Grid>
            </Grid>

            {/* Amounts */}
            <Grid container spacing={3} mb={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="body2" color="text.secondary">Jami summa</Typography>
                            <Typography variant="h6" fontWeight="bold" color="primary.main">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {Number((summary as any)?.amounts?.total || 0).toLocaleString()} so'm
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="body2" color="text.secondary">To'langan</Typography>
                            <Typography variant="h6" fontWeight="bold" color="success.main">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {Number((summary as any)?.amounts?.paid || 0).toLocaleString()} so'm
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="body2" color="text.secondary">Qoldi</Typography>
                            <Typography variant="h6" fontWeight="bold" color="error.main">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {Number((summary as any)?.amounts?.remain || 0).toLocaleString()} so'm
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Top Debtors and Recent Transactions */}
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" fontWeight="bold" mb={2}>
                            Eng ko'p qarzdorlar
                        </Typography>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Shartnoma</TableCell>
                                    <TableCell>Summa</TableCell>
                                    <TableCell>Muddati</TableCell>
                                    <TableCell align="right">Qarz</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {debtors?.slice(0, 5).map((d) => (
                                    <TableRow
                                        key={d.customerId}
                                        hover
                                        sx={{ cursor: 'pointer' }}
                                        onClick={() => navigate(`/customers/${d.customerId}`)}
                                    >
                                        <TableCell>{d.customerName}</TableCell>
                                        <TableCell>{d.contractCount}</TableCell>
                                        <TableCell>{d.daysOverdue} kun</TableCell>
                                        <TableCell align="right">
                                            {Number(d.remainAmount).toLocaleString()} so'm
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" fontWeight="bold" mb={2}>
                            So'nggi to'lovlar
                        </Typography>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell align="right">Summa</TableCell>
                                    <TableCell>Turi</TableCell>
                                    <TableCell>Sana</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {(summary as any)?.recentTransactions?.slice(0, 5).map((t: any) => (
                                    <TableRow key={t.id} hover>
                                        <TableCell>{t.id.slice(0, 8)}</TableCell>
                                        <TableCell align="right">
                                            {Number(t.amount).toLocaleString()} so'm
                                        </TableCell>
                                        <TableCell>
                                            {t.type === 'payment' ? 'To\'lov' : 'Qaytarish'}
                                        </TableCell>
                                        <TableCell>
                                            {dayjs(t.createdAt).format('DD.MM.YYYY')}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}