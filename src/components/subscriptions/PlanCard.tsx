/**
 * PlanCard Component
 * Displays a subscription plan in card format using Material UI
 */

import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardActions,
    Typography,
    Button,
    Chip,
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
} from '@mui/material';
import { Check as CheckIcon, Info } from 'lucide-react';
import { PlanDetailDialog } from './PlanDetailDialog';
import { getPlanFeatures } from '../../utils/planFeatures';
import type { SubscriptionPlan } from '../../types/subscription.types';

interface PlanCardProps {
    plan: SubscriptionPlan;
    isSelected?: boolean;
    onSelect?: (plan: SubscriptionPlan) => void;
    onEdit?: (plan: SubscriptionPlan) => void;
    onDelete?: (planId: string) => void;
    showActions?: boolean;
    isLoading?: boolean;
    isDisabled?: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({
    plan,
    isSelected = false,
    onSelect,
    onEdit,
    onDelete,
    showActions = false,
    isLoading = false,
    isDisabled = false,
}) => {
    const [showDetails, setShowDetails] = useState(false);

    if (!plan) {
        console.warn('[PlanCard] No plan provided');
        return null;
    }

    return (
        <>
            <Card
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    border: isSelected ? '2px solid #2196f3' : '1px solid #e0e0e0',
                    boxShadow: isSelected ? '0 0 0 3px rgba(33, 150, 243, 0.1)' : 1,
                    '&:hover': {
                        boxShadow: 3,
                        transform: 'translateY(-2px)',
                    },
                }}
            >
                {/* Header with title and selected badge */}
                <CardHeader
                    title={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                            <Typography variant="h6" component="span" sx={{ fontWeight: 'bold', flex: 1 }}>
                                {plan.name || 'Plan'}
                            </Typography>
                            {isSelected && <Chip label="Active" color="primary" size="small" icon={<CheckIcon size={16} />} />}
                        </Box>
                    }
                    subheader={plan.description}
                    sx={{
                        background: 'linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%)',
                        borderBottom: '1px solid #e0e0e0',
                    }}
                />

                {/* Body content */}
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Price */}
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                            <Typography variant="h4" component="span" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                ${typeof plan.price === 'string' ? plan.price : plan.price.toFixed(2)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                /{plan.duration}d
                            </Typography>
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                            {plan.duration} days of access
                        </Typography>
                    </Box>

                    <Divider />

                    {/* Features */}
                    {(() => {
                        const features = getPlanFeatures(plan);
                        return (
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    Features:
                                </Typography>
                                <List dense sx={{ pt: 0 }}>
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

                    {/* Specs */}
                    {(plan.maxUsers || plan.maxStorage) && (
                        <Box sx={{ pt: 1, borderTop: '1px solid #e0e0e0' }}>
                            {plan.maxUsers && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                                    <Typography variant="body2" color="textSecondary">
                                        Max Users:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                        {plan.maxUsers}
                                    </Typography>
                                </Box>
                            )}
                            {plan.maxStorage && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                                    <Typography variant="body2" color="textSecondary">
                                        Storage:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                        {plan.maxStorage}GB
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    )}

                    {/* Status Badge */}
                    <Box sx={{ mt: 1 }}>
                        <Chip
                            label={plan.isActive ? 'Active' : 'Inactive'}
                            color={plan.isActive ? 'success' : 'default'}
                            size="small"
                        />
                    </Box>
                </CardContent>

                {/* Actions */}
                <CardActions sx={{ pt: 1, borderTop: '1px solid #e0e0e0', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {/* View Details Button - Uses GET /api/subscriptions/plans/{id} */}
                    <Button
                        size="small"
                        startIcon={<Info size={16} />}
                        onClick={() => setShowDetails(true)}
                        sx={{ textTransform: 'none' }}
                    >
                        Details
                    </Button>

                    {!showActions && onSelect && (
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={() => onSelect(plan)}
                            disabled={isLoading || isDisabled}
                            title={isDisabled ? 'You already have an active subscription' : ''}
                            sx={{ textTransform: 'none', fontWeight: 'bold' }}
                        >
                            {isLoading ? 'Loading...' : isDisabled ? 'Subscription Active' : 'Subscribe'}
                        </Button>
                    )}

                    {showActions && (
                        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                            <Button variant="outlined" fullWidth size="small" onClick={() => onEdit?.(plan)}>
                                Edit
                            </Button>
                            <Button variant="outlined" color="error" fullWidth size="small" onClick={() => onDelete?.(plan.id)}>
                                Delete
                            </Button>
                        </Box>
                    )}
                </CardActions>
            </Card>

            {/* Detail Dialog - Fetches plan details from GET /api/subscriptions/plans/{id} */}
            <PlanDetailDialog
                open={showDetails}
                planId={plan.id}
                onClose={() => setShowDetails(false)}
                onSubscribe={isDisabled ? undefined : onSelect}
                isSubscribing={isLoading}
                isDisabled={isDisabled}
            />
        </>
    );
};
