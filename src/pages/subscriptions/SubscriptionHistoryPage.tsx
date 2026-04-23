/**
 * Subscription History Page
 * Display current subscription and payment history for OWNER role
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Card,
    CardContent,
    Button,
    CircularProgress,
} from '@mui/material';
import { useGetSubscriptionHistory, useGetCurrentSubscription } from '../../hooks/useSubscriptions';
import { useAuthStore } from '../../store/auth.store';
import dayjs from 'dayjs';
import type { SubscriptionHistoryItem } from '../../api/endpoints/subscriptions.api';

export const SubscriptionHistoryPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    console.log('[SubscriptionHistoryPage] Mounted with user:', { userId: user?.id, role: user?.role });

    // Queries - enable when user is loaded
    const isUserReady = !!user?.id;
    const currentQuery = useGetCurrentSubscription(isUserReady);
    const historyQuery = useGetSubscriptionHistory(undefined, isUserReady);

    console.log('[SubscriptionHistoryPage] Query states:', {
        isUserReady,
        currentLoading: currentQuery.isLoading,
        currentError: currentQuery.isError,
        historyLoading: historyQuery.isLoading,
        historyError: historyQuery.isError,
    });

    // Loading state - while user data or queries are loading
    if (!isUserReady || currentQuery.isLoading || historyQuery.isLoading) {
        return (
            <Box sx={{ width: '100%', py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Check authorization after data is loaded
    if (user?.role !== 'OWNER') {
        return (
            <Box sx={{ width: '100%', py: 3 }}>
                <Container maxWidth="lg">
                    <Paper sx={{ p: 3, bgcolor: '#ffebee', borderColor: '#ef5350', border: '2px solid' }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <AlertCircle color="#c62828" size={24} style={{ flexShrink: 0, marginTop: 4 }} />
                            <Box>
                                <Typography variant="h6" sx={{ color: '#b71c1c', fontWeight: 'bold' }}>
                                    Access Denied
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#c62828', mt: 1 }}>
                                    Only subscription owners can view this page.
                                </Typography>
                                <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/dashboard')}>
                                    Go to Dashboard
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                </Container>
            </Box>
        );
    }

    // Error state
    if (currentQuery.isError || historyQuery.isError) {
        return (
            <Box sx={{ width: '100%', py: 3 }}>
                <Container maxWidth="lg">
                    <Paper sx={{ p: 3, bgcolor: '#ffebee', borderColor: '#ef5350', border: '2px solid' }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <AlertCircle color="#c62828" size={24} style={{ flexShrink: 0, marginTop: 4 }} />
                            <Box>
                                <Typography variant="h6" sx={{ color: '#b71c1c', fontWeight: 'bold' }}>
                                    Error Loading Data
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#c62828', mt: 1 }}>
                                    {currentQuery.isError ? 'Failed to load current subscription' : 'Failed to load history'}
                                </Typography>
                                <Button variant="contained" sx={{ mt: 2 }} onClick={() => window.location.reload()}>
                                    Retry
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                </Container>
            </Box>
        );
    }

    const currentSubscription = currentQuery.data;
    const history = historyQuery.data || [];
    const currentStatus = currentSubscription?.status ?? (currentSubscription?.isActive ? 'active' : 'expired');
    const currentStartDate = currentSubscription?.startDate ?? currentSubscription?.subStartDate ?? null;
    const currentEndDate = currentSubscription?.endDate ?? currentSubscription?.subEndDate ?? null;

    console.log('[SubscriptionHistoryPage] Rendering with:', {
        hasCurrentSubscription: !!currentSubscription,
        historyLength: history.length,
    });

    return (
        <Box sx={{ width: '100%', py: 3 }}>
            <Container maxWidth="lg">
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        My Subscriptions
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                        View your active subscription and payment history
                    </Typography>
                </Box>

                {/* Current Subscription Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Current Subscription
                    </Typography>

                    {currentSubscription ? (
                        <Card sx={{ mb: 2 }}>
                            <CardContent>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                                    {/* Plan Name */}
                                    <Box>
                                        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                                            Plan Name
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            {currentSubscription.plan?.name || 'Unknown'}
                                        </Typography>
                                    </Box>

                                    {/* Status */}
                                    <Box>
                                        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                                            Status
                                        </Typography>
                                        <Chip
                                            label={currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                                            sx={{
                                                bgcolor: currentStatus === 'active' ? '#4caf50' : undefined,
                                                color: currentStatus === 'active' ? '#fff' : undefined,
                                            }}
                                            variant="filled"
                                        />
                                    </Box>

                                    {/* Start Date */}
                                    <Box>
                                        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                                            Start Date
                                        </Typography>
                                        <Typography variant="body1">
                                            {currentStartDate ? dayjs(currentStartDate).format('MMM DD, YYYY') : 'N/A'}
                                        </Typography>
                                    </Box>

                                    {/* End Date */}
                                    <Box>
                                        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                                            End Date
                                        </Typography>
                                        <Typography variant="body1">
                                            {currentEndDate ? dayjs(currentEndDate).format('MMM DD, YYYY') : 'N/A'}
                                        </Typography>
                                    </Box>

                                    {/* Auto Renew */}
                                    <Box>
                                        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                                            Auto Renew
                                        </Typography>
                                        <Chip
                                            label={currentSubscription.autoRenew ? 'Enabled' : 'Disabled'}
                                            variant="outlined"
                                        />
                                    </Box>

                                    {/* Days Remaining */}
                                    <Box>
                                        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                                            Days Remaining
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                            {currentEndDate ? Math.max(0, dayjs(currentEndDate).diff(dayjs(), 'day')) : 0} days
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    ) : (
                        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                            <Typography variant="body1" color="textSecondary">
                                No active subscription. Subscribe to a plan to get started!
                            </Typography>
                            <Button
                                variant="contained"
                                sx={{ mt: 2 }}
                                onClick={() => navigate('/subscriptions')}
                            >
                                View Plans
                            </Button>
                        </Paper>
                    )}
                </Box>

                {/* Payment History Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Payment History
                    </Typography>

                    {/* Summary Cards */}
                    {history.length > 0 && (
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
                            {/* Total Paid */}
                            <Card>
                                <CardContent>
                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                        Total Paid
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                        $
                                        {history
                                            .filter((h: SubscriptionHistoryItem) => h.status === 'success')
                                            .reduce((sum: number, h: SubscriptionHistoryItem) => {
                                                const amount = Number(h.amount ?? 0);
                                                return sum + (isNaN(amount) ? 0 : amount);
                                            }, 0)
                                            .toFixed(2)}
                                    </Typography>
                                </CardContent>
                            </Card>

                            {/* Successful Payments */}
                            <Card>
                                <CardContent>
                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                        Successful Payments
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                                        {history.filter((h: SubscriptionHistoryItem) => h.status === 'success').length}
                                    </Typography>
                                </CardContent>
                            </Card>

                            {/* Total Transactions */}
                            <Card>
                                <CardContent>
                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                        Total Transactions
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                        {history.length}
                                    </Typography>
                                </CardContent>
                            </Card>

                            {/* Failed Payments */}
                            <Card>
                                <CardContent>
                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                        Failed Payments
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                                        {history.filter((h: SubscriptionHistoryItem) => h.status === 'failed').length}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    )}

                    {/* History Table */}
                    {history.length > 0 ? (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Plan</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Transaction ID</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {history.map((payment: SubscriptionHistoryItem, idx: number) => {
                                        const paymentStatus = payment.status ?? 'pending';

                                        return (
                                        <TableRow key={idx} hover>
                                            <TableCell>{dayjs(payment.paymentDate).format('MMM DD, YYYY')}</TableCell>
                                            <TableCell>{payment.plan?.name || 'Unknown'}</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>
                                                {Number(payment.amount ?? 0).toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                                                    sx={{
                                                        bgcolor: paymentStatus === 'success' ? '#4caf50' : paymentStatus === 'failed' ? '#f44336' : undefined,
                                                        color: (paymentStatus === 'success' || paymentStatus === 'failed') ? '#fff' : undefined,
                                                    }}
                                                    variant="filled"
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        fontFamily: 'monospace',
                                                        bgcolor: '#f5f5f5',
                                                        px: 1,
                                                        py: 0.5,
                                                        borderRadius: 1,
                                                    }}
                                                >
                                                    {payment.transactionId ? `${payment.transactionId.slice(0, 12)}...` : '—'}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                            <Typography variant="body1" color="textSecondary">
                                No payment history available
                            </Typography>
                        </Paper>
                    )}
                </Box>

                {/* Back Button */}
                <Box sx={{ mt: 3 }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/subscriptions')}
                    >
                        ← Back to Plans
                    </Button>
                </Box>
            </Container>
        </Box>
    );
};
