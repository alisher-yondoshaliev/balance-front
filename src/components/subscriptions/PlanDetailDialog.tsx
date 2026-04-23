/**
 * Plan Detail Dialog Component
 * Displays detailed information about a plan fetched from GET /api/subscriptions/plans/{id}
 */

import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Chip,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    CircularProgress,
    Alert,
} from '@mui/material';
import { Check as CheckIcon, X } from 'lucide-react';
import { useGetPlanById } from '../../hooks/useSubscriptions';
import { getPlanFeatures } from '../../utils/planFeatures';
import type { SubscriptionPlan } from '../../types/subscription.types';

interface PlanDetailDialogProps {
    open: boolean;
    planId: string | null;
    onClose: () => void;
    onSubscribe?: (plan: SubscriptionPlan) => void;
    isSubscribing?: boolean;
    isDisabled?: boolean;
}

export const PlanDetailDialog: React.FC<PlanDetailDialogProps> = ({
    open,
    planId,
    onClose,
    onSubscribe,
    isSubscribing = false,
    isDisabled = false,
}) => {
    // Fetch detailed plan data from API: GET /api/subscriptions/plans/{id}
    const { data: plan, isLoading, isError, error } = useGetPlanById(planId);

    console.log('[PlanDetailDialog] State:', {
        planId,
        open,
        isLoading,
        isError,
        plan,
    });

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>
                {isLoading ? 'Loading Plan Details...' : plan?.name || 'Plan Details'}
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                {isLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                )}

                {isError && (
                    <Alert severity="error">
                        Failed to load plan details: {error instanceof Error ? error.message : 'Unknown error'}
                    </Alert>
                )}

                {plan && !isLoading && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* Plan Description */}
                        {plan.description && (
                            <Typography variant="body2" color="textSecondary">
                                {plan.description}
                            </Typography>
                        )}

                        <Divider />

                        {/* Price and Duration */}
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                    ${typeof plan.price === 'string' ? plan.price : plan.price.toFixed(2)}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    / {plan.duration} days
                                </Typography>
                            </Box>
                            <Typography variant="caption" color="textSecondary">
                                Includes {plan.duration} days of full access
                            </Typography>
                        </Box>

                        {/* Status */}
                        <Box>
                            <Chip
                                label={plan.isActive ? 'Active' : 'Inactive'}
                                color={plan.isActive ? 'success' : 'default'}
                                size="small"
                            />
                        </Box>

                        <Divider />

                        {/* Features */}
                        {(() => {
                            const features = getPlanFeatures(plan);
                            return (
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        Features Included:
                                    </Typography>
                                    <List dense>
                                        {features.map((feature, idx) => (
                                            <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                                                <ListItemIcon sx={{ minWidth: 28 }}>
                                                    <CheckIcon size={16} color="green" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={feature}
                                                    primaryTypographyProps={{ variant: 'body2' }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            );
                        })()}

                        {/* Specifications */}
                        {(plan.maxUsers || plan.maxStorage) && (
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    Specifications:
                                </Typography>
                                <List dense>
                                    {plan.maxUsers && (
                                        <ListItem sx={{ py: 0.5, px: 0 }}>
                                            <Typography variant="body2" color="textSecondary" sx={{ flex: 1 }}>
                                                Maximum Users:
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                {plan.maxUsers}
                                            </Typography>
                                        </ListItem>
                                    )}
                                    {plan.maxStorage && (
                                        <ListItem sx={{ py: 0.5, px: 0 }}>
                                            <Typography variant="body2" color="textSecondary" sx={{ flex: 1 }}>
                                                Storage:
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                {plan.maxStorage} GB
                                            </Typography>
                                        </ListItem>
                                    )}
                                </List>
                            </Box>
                        )}

                        {/* Plan Metadata */}
                        <Box sx={{ pt: 1, borderTop: '1px solid #e0e0e0' }}>
                            <Typography variant="caption" color="textSecondary">
                                Plan ID: {plan.id}
                            </Typography>
                            <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                                Created: {new Date(plan.createdAt).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                                Updated: {new Date(plan.updatedAt).toLocaleDateString()}
                            </Typography>
                        </Box>
                    </Box>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} startIcon={<X size={18} />}>
                    Close
                </Button>
                {plan && onSubscribe && (
                    <Button
                        onClick={() => onSubscribe(plan)}
                        variant="contained"
                        disabled={isSubscribing || isLoading || isDisabled}
                        title={isDisabled ? 'You already have an active subscription' : ''}
                    >
                        {isSubscribing ? 'Processing...' : isDisabled ? 'Subscription Active' : 'Subscribe Now'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};
