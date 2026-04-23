/**
 * Admin - Dashboard Page
 * 
 * Shows market-scoped statistics and metrics
 */

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    Card,
    CardContent,
} from '@mui/material';
import {
    People as PeopleIcon,
    ShoppingCart as ShoppingCartIcon,
    AttachMoney as AttachMoneyIcon,
    Warning as WarningIcon,
    Inventory as InventoryIcon,
} from '@mui/icons-material';
import { useAdminMarketStore } from '../../store/admin-market.store';
import { adminApi } from '../../api/endpoints/admin.api';

interface SummaryStats {
    totalCustomers: number;
    activeContracts: number;
    totalRevenue: string;
    overduePayments: number;
}

interface RevenueData {
    month: string;
    amount: string;
}

interface OverdueData {
    contractId: string;
    customerName: string;
    amount: string;
    daysOverdue: number;
}

interface Owner {
    id: string;
    fullName: string;
    phone: string;
    email: string;
}

interface MarketInfo {
    id: string;
    name: string;
    address: string;
    phone: string;
    status: string;
    owner: Owner;
    _count: {
        workers: number;
        products: number;
        customers: number;
        contracts: number;
    };
}

function StatCard({
    title,
    value,
    icon: Icon,
    color = 'primary',
}: {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}) {
    return (
        <Card>
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <div>
                        <Typography color="textSecondary" gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="h5" fontWeight="bold">
                            {value}
                        </Typography>
                    </div>
                    <Icon sx={{ fontSize: 40, color: `${color}.main`, opacity: 0.7 }} />
                </Box>
            </CardContent>
        </Card>
    );
}

export default function AdminDashboard() {
    // ============================================================================
    // STATE
    // ============================================================================

    const { adminMarketId } = useAdminMarketStore();

    const [marketInfo, setMarketInfo] = useState<MarketInfo | null>(null);
    const [summary, setSummary] = useState<SummaryStats | null>(null);
    const [revenue, setRevenue] = useState<RevenueData[]>([]);
    const [overdue, setOverdue] = useState<OverdueData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ============================================================================
    // SECURITY CHECK: Admin must have market assigned
    // ============================================================================

    useEffect(() => {
        if (!adminMarketId) {
            console.warn('[AdminDashboard] ❌ NO MARKET ASSIGNED');
            setError('Market not assigned. Contact administrator.');
            setLoading(false);
            return;
        }

        fetchDashboardData();
    }, [adminMarketId]);

    // ============================================================================
    // FETCH DASHBOARD DATA
    // ============================================================================

    const fetchDashboardData = async () => {
        if (!adminMarketId) {
            console.error('[AdminDashboard] ❌ No marketId - STOPPING API calls');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log('[AdminDashboard] Fetching dashboard for market:', adminMarketId);

            // Fetch all dashboard data in parallel
            const [marketRes, summaryRes, revenueRes, overdueRes] = await Promise.all([
                adminApi.market.getMyMarketInfo(),
                adminApi.dashboard.getSummary(adminMarketId),
                adminApi.dashboard.getRevenue(adminMarketId),
                adminApi.dashboard.getOverdue(adminMarketId),
            ]);

            // Handle market info
            const marketData = marketRes.data;
            setMarketInfo(marketData);

            // Handle summary
            const summaryData = summaryRes.data;
            setSummary(summaryData);

            // Handle revenue
            let revenueData = Array.isArray(revenueRes.data)
                ? revenueRes.data
                : revenueRes.data?.data || [];
            setRevenue(revenueData);

            // Handle overdue
            const overdueData = overdueRes.data;
            setOverdue(Array.isArray(overdueData) ? overdueData : overdueData?.items || []);

            console.log('[AdminDashboard] ✅ Fetched dashboard data');
        } catch (err) {
            console.error('[AdminDashboard] ❌ Error fetching dashboard:', err);
            const message = err instanceof Error ? err.message : 'Failed to fetch dashboard';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // ============================================================================
    // RENDER
    // ============================================================================

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (!adminMarketId) {
        return (
            <Alert severity="error">
                ❌ Market not assigned. Admin can only access their assigned market.
            </Alert>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* HEADER */}
            <Box mb={3}>
                <Typography variant="h5" fontWeight="bold">
                    Dashboard
                </Typography>
                {marketInfo && (
                    <Box mt={1.5} p={2} bgcolor="#f5f5f5" borderRadius={1}>
                        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
                            <div>
                                <Typography variant="body2" color="textSecondary">
                                    Market Name
                                </Typography>
                                <Typography variant="body1" fontWeight="bold">
                                    {marketInfo.name}
                                </Typography>
                            </div>
                            <div>
                                <Typography variant="body2" color="textSecondary">
                                    Status
                                </Typography>
                                <Typography
                                    variant="body1"
                                    fontWeight="bold"
                                    sx={{ color: marketInfo.status === 'ACTIVE' ? 'green' : 'red' }}
                                >
                                    {marketInfo.status}
                                </Typography>
                            </div>
                            <div>
                                <Typography variant="body2" color="textSecondary">
                                    Address
                                </Typography>
                                <Typography variant="body2">
                                    {marketInfo.address}
                                </Typography>
                            </div>
                            <div>
                                <Typography variant="body2" color="textSecondary">
                                    Phone
                                </Typography>
                                <Typography variant="body2">
                                    {marketInfo.phone}
                                </Typography>
                            </div>
                            {marketInfo.owner && (
                                <>
                                    <div>
                                        <Typography variant="body2" color="textSecondary">
                                            Owner
                                        </Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                            {marketInfo.owner.fullName}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography variant="body2" color="textSecondary">
                                            Owner Phone
                                        </Typography>
                                        <Typography variant="body2">
                                            {marketInfo.owner.phone}
                                        </Typography>
                                    </div>
                                </>
                            )}
                        </Box>
                    </Box>
                )}
            </Box>

            {/* ERROR ALERT */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* STAT CARDS */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
                <StatCard
                    title="Total Customers"
                    value={summary?.totalCustomers || 0}
                    icon={PeopleIcon}
                    color="primary"
                />
                <StatCard
                    title="Active Contracts"
                    value={summary?.activeContracts || 0}
                    icon={ShoppingCartIcon}
                    color="success"
                />
                <StatCard
                    title="Total Revenue"
                    value={summary?.totalRevenue || '0'}
                    icon={AttachMoneyIcon}
                    color="success"
                />
                <StatCard
                    title="Overdue Payments"
                    value={summary?.overduePayments || 0}
                    icon={WarningIcon}
                    color="error"
                />
            </Box>

            {/* MARKET COUNT STATS */}
            {marketInfo?._count && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
                    <StatCard
                        title="Workers"
                        value={marketInfo._count.workers}
                        icon={PeopleIcon}
                        color="primary"
                    />
                    <StatCard
                        title="Products"
                        value={marketInfo._count.products}
                        icon={InventoryIcon}
                        color="success"
                    />
                    <StatCard
                        title="Customers"
                        value={marketInfo._count.customers}
                        icon={PeopleIcon}
                        color="success"
                    />
                    <StatCard
                        title="Contracts"
                        value={marketInfo._count.contracts}
                        icon={ShoppingCartIcon}
                        color="warning"
                    />
                </Box>
            )}

            {/* REVENUE CHART & OVERDUE */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                        Revenue by Month
                    </Typography>
                    {revenue?.length > 0 ? (
                        <Box>
                            {revenue.map((item, index) => (
                                <Box key={index} display="flex" justifyContent="space-between" py={1} borderBottom="1px solid #eee">
                                    <Typography>{item.month}</Typography>
                                    <Typography fontWeight="bold">{item.amount}</Typography>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Typography color="textSecondary">No revenue data</Typography>
                    )}
                </Paper>

                {/* OVERDUE PAYMENTS */}
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                        Overdue Payments
                    </Typography>
                    {overdue?.length > 0 ? (
                        <Box>
                            {overdue.map((item, index) => (
                                <Box key={index} p={1} mb={1} bgcolor="#fff3cd" borderRadius={1}>
                                    <Typography variant="body2" fontWeight="bold">
                                        {item.customerName}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Amount: {item.amount} • {item.daysOverdue} days overdue
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Typography color="textSecondary">No overdue payments</Typography>
                    )}
                </Paper>
            </Box>
        </Box >
    );
}
