/**
 * Subscription Plans Page (Public)
 * Display all subscription plans and allow users to subscribe
 */

import React, { useState, useMemo } from 'react';
import { Box, Container, CircularProgress, Paper, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { AlertCircle } from 'lucide-react';
import { useGetPlans, useMakePayment, useGetCurrentSubscription, useGetSubscriptionHistory } from '../../hooks/useSubscriptions';
import { PlanCard } from '../../components/subscriptions/PlanCard';
import { useAuthStore } from '../../store/auth.store';
import dayjs from 'dayjs';
import type { SubscriptionPlan } from '../../types/subscription.types';

export const SubscriptionPlansPage: React.FC = () => {
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [renderError, setRenderError] = useState<string | null>(null);
    const { user } = useAuthStore();

    // Queries & Mutations
    const plansQuery = useGetPlans();
    const paymentMutation = useMakePayment();
    const currentSubscriptionQuery = useGetCurrentSubscription(!!user?.id);
    const historyQuery = useGetSubscriptionHistory(undefined, !!user?.id);

    // Check if user has active subscription
    const hasActiveSubscription = currentSubscriptionQuery.data?.status === 'active';
    const activeSubscriptionEndDate = currentSubscriptionQuery.data?.endDate;
    const currentSubscription = currentSubscriptionQuery.data;
    const paymentHistory = historyQuery.data?.data || [];

    // Add error boundary for render errors
    React.useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            console.error('[SubscriptionPlansPage] Uncaught error:', event.error);
            setRenderError(event.error?.message || 'An error occurred');
        };

        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);

    // Safe data extraction with memoization
    const plans = useMemo(() => {
        try {
            const data = plansQuery.data?.data;
            console.log('[SubscriptionPlansPage] Plans data:', {
                exists: !!data,
                isArray: Array.isArray(data),
                length: Array.isArray(data) ? data.length : 0,
                raw: data
            });

            // Ensure it's an array
            if (!Array.isArray(data)) {
                console.warn('[SubscriptionPlansPage] Plans is not an array:', data);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('[SubscriptionPlansPage] Error extracting plans:', error);
            return [];
        }
    }, [plansQuery.data?.data]);

    // Handle plan selection with error handling
    const handleSelectPlan = async (plan: SubscriptionPlan | undefined) => {
        if (!plan?.id) {
            console.error('[SubscriptionPlansPage] Invalid plan:', plan);
            setRenderError('Invalid plan selected');
            return;
        }

        // Prevent selecting if already has active subscription
        if (hasActiveSubscription) {
            console.warn('[SubscriptionPlansPage] User already has active subscription');
            setRenderError('❌ You already have an active subscription. Please wait until it expires before purchasing a new one.');
            return;
        }

        setSelectedPlanId(plan.id);
        try {
            const result = await paymentMutation.mutateAsync({ planId: plan.id });
            console.log('[SubscriptionPlansPage] Payment response:', {
                fullResponse: result,
                hasPaymentUrl: !!result?.paymentUrl,
                hasRedirectUrl: !!result?.redirectUrl,
                hasPaymentData: !!result?.payment,
                message: result?.message,
            });

            // Check if subscription was successful (no redirect needed)
            if (result?.payment || (result?.message && result.message.includes('muvaffaqiyatli'))) {
                console.log('[SubscriptionPlansPage] Subscription successful!', result);
                const endDate = result?.payment?.endDate ? new Date(result.payment.endDate).toLocaleDateString() : 'N/A';
                setRenderError(`✓ Success! ${result?.plan?.name || 'Plan'} activated. You now have access until ${endDate}`);

                // Refresh current subscription after 2 seconds
                setTimeout(() => {
                    window.location.href = '/subscriptions/history';
                }, 2000);
                return;
            }

            // Handle redirect URLs
            const paymentUrl = result?.paymentUrl || result?.url || result?.redirectUrl;

            if (paymentUrl) {
                console.log('[SubscriptionPlansPage] Redirecting to payment URL:', paymentUrl);
                window.location.href = paymentUrl;
            } else {
                console.warn('[SubscriptionPlansPage] No payment URL in response:', result);
                console.warn('[SubscriptionPlansPage] Response keys:', Object.keys(result || {}));
                setRenderError(`Payment initiated but no redirect URL. Response: ${JSON.stringify(result)}`);
            }
        } catch (error) {
            console.error('[SubscriptionPlansPage] Payment initiation failed:', error);
            setRenderError(error instanceof Error ? error.message : 'Payment failed');
            setSelectedPlanId(null);
        }
    };

    // Render states
    const isLoading = plansQuery.isLoading;
    const hasError = plansQuery.isError;
    const plansCount = plans.length;

    console.log('[SubscriptionPlansPage] Render state:', {
        isLoading,
        hasError,
        plansCount,
        queryState: plansQuery.status,
        renderError,
    });

    // If there's a render error, show error UI
    if (renderError) {
        return (
            <Box sx={{ width: '100%', py: 3 }}>
                <Container maxWidth="lg">
                    <Paper sx={{ p: 3, bgcolor: '#ffebee', borderColor: '#ef5350', border: '2px solid' }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <AlertCircle color="red" size={24} style={{ flexShrink: 0, marginTop: 4 }} />
                            <Box>
                                <Typography variant="h6" sx={{ color: '#b71c1c', fontWeight: 'bold' }}>
                                    Rendering Error
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#c62828', mt: 1 }}>
                                    {renderError}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Container>
            </Box>
        );
    }

    // Main render
    return (
        <Box sx={{ width: '100%', py: 3 }}>
            <Container maxWidth="lg">
                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Simple, Transparent Pricing
                    </Typography>
                    <Typography variant="h6" color="textSecondary">
                        Choose the perfect plan for your needs
                    </Typography>
                </Box>

                {/* Error State - Display if API error */}
                {hasError && (
                    <Paper sx={{ mb: 3, p: 2, bgcolor: '#ffebee', borderColor: '#ef5350', border: '2px solid' }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <AlertCircle color="#c62828" size={24} style={{ flexShrink: 0, marginTop: 4 }} />
                            <Box>
                                <Typography variant="h6" sx={{ color: '#b71c1c', fontWeight: 'bold' }}>
                                    Error Loading Plans
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#c62828', mt: 1 }}>
                                    Failed to load subscription plans. Please try refreshing the page.
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                )}

                {/* Active Subscription Alert */}
                {hasActiveSubscription && (
                    <Paper sx={{ p: 3, mb: 4, bgcolor: '#fff3e0', borderLeft: '4px solid #ff9800' }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <AlertCircle color="#ff9800" size={24} style={{ flexShrink: 0, marginTop: 2 }} />
                            <Box>
                                <Typography variant="h6" sx={{ color: '#e65100', fontWeight: 'bold' }}>
                                    Active Subscription
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#bf360c', mt: 1 }}>
                                    You already have an active subscription. You can purchase a new plan after your current subscription expires on{' '}
                                    <strong>{activeSubscriptionEndDate ? new Date(activeSubscriptionEndDate).toLocaleDateString() : 'N/A'}</strong>.
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                )}

                {/* Current Subscription Details Card */}
                {currentSubscription && hasActiveSubscription && (
                    <Card sx={{ mb: 4, borderLeft: '4px solid #4caf50' }}>
                        <CardContent>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#1976d2' }}>
                                📋 Your Active Subscription
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                                <Box>
                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                                        Plan
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                        {currentSubscription.plan?.name || 'Unknown'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                                        Status
                                    </Typography>
                                    <Chip
                                        label="Active"
                                        sx={{ bgcolor: '#4caf50', color: '#fff', fontWeight: 'bold' }}
                                    />
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                                        Expires
                                    </Typography>
                                    <Typography variant="body1">
                                        {currentSubscription.endDate ? dayjs(currentSubscription.endDate).format('MMM DD, YYYY') : 'N/A'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                                        Days Remaining
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                        {currentSubscription.endDate ? Math.max(0, dayjs(currentSubscription.endDate).diff(dayjs(), 'day')) : 0} days
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                )}

                {/* Recent Payment History */}
                {paymentHistory && paymentHistory.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                            💳 Recent Payments
                        </Typography>
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Plan</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paymentHistory.slice(0, 5).map((payment: any, idx: number) => (
                                        <TableRow key={idx} hover>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {payment.paymentDate ? dayjs(payment.paymentDate).format('MMM DD, YYYY') : 'N/A'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{payment.plan?.name || 'Unknown'}</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>
                                                ${typeof payment.amount === 'string' ? parseFloat(payment.amount).toFixed(2) : payment.amount?.toFixed(2) || '0.00'}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: payment.status === 'success' ? '#4caf50' : payment.status === 'failed' ? '#f44336' : '#2196f3',
                                                        color: '#fff',
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}

                {/* Loading State */}
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : plansCount > 0 ? (
                    /* Plans Grid - Display when data exists */
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                            gap: 3,
                        }}
                    >
                        {plans.map((plan: SubscriptionPlan | undefined) => {
                            if (!plan?.id) {
                                console.warn('[SubscriptionPlansPage] Skipping invalid plan:', plan);
                                return null;
                            }

                            return (
                                <Box key={plan.id}>
                                    <PlanCard
                                        plan={plan}
                                        onSelect={handleSelectPlan}
                                        isLoading={paymentMutation.isPending && selectedPlanId === plan.id}
                                        isDisabled={hasActiveSubscription}
                                    />
                                </Box>
                            );
                        })}
                    </Box>
                ) : (
                    /* Empty State - Display when no plans available */
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <AlertCircle color="gray" size={48} style={{ margin: '0 auto 16px' }} />
                        <Typography variant="h6" sx={{ color: '#424242', mb: 1 }}>
                            No plans available
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Please contact support if this persists.
                        </Typography>
                    </Paper>
                )}

                {/* Payment Error Alert */}
                {paymentMutation.isError && (
                    <Paper sx={{ mt: 3, p: 2, bgcolor: '#ffebee' }}>
                        <Typography variant="body1" sx={{ color: '#c62828', fontWeight: 'bold' }}>
                            Payment initiation failed. Please try again.
                        </Typography>
                        {paymentMutation.error && (
                            <Typography variant="body2" sx={{ color: '#d32f2f', mt: 1 }}>
                                Error details: {String(paymentMutation.error)}
                            </Typography>
                        )}
                    </Paper>
                )}

                {/* Info Section */}
                <Paper sx={{ mt: 4, p: 3, bgcolor: '#f5f5f5' }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                        All plans include
                    </Typography>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                            gap: 2,
                        }}
                    >
                        {[
                            'Full access to all features',
                            '24/7 customer support',
                            'Automatic backups',
                            'Free upgrades & updates',
                        ].map((feature, idx) => (
                            <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                <Box
                                    sx={{
                                        width: 20,
                                        height: 20,
                                        bgcolor: '#2196f3',
                                        borderRadius: '50%',
                                        flexShrink: 0,
                                        mt: 0.25,
                                    }}
                                />
                                <Typography variant="body2">{feature}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};
