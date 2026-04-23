/**
 * Plan Detail Dialog Component
 * Displays detailed information about a plan
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
    Divider,
} from '@mui/material';
import type { SubscriptionPlan } from '../../api/endpoints/subscriptions.api';

interface PlanDetailDialogProps {
    open: boolean;
    plan: SubscriptionPlan | null;
    onClose: () => void;
    onSubscribe?: (plan: SubscriptionPlan) => void;
    isSubscribing?: boolean;
    isDisabled?: boolean;
}

export const PlanDetailDialog: React.FC<PlanDetailDialogProps> = ({
    open,
    plan,
    onClose,
    onSubscribe,
    isSubscribing = false,
    isDisabled = false,
}) => {
    if (!plan) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>
                {plan.name || 'Plan Details'}
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
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
                                {plan.price.toLocaleString('uz-UZ')} so'm
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                / {plan.duration} kun
                            </Typography>
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                            {plan.duration} kun oximiyat beradi
                        </Typography>
                    </Box>

                    {/* Status */}
                    <Box>
                        <Chip
                            label={plan.isActive ? 'Faol' : 'Nofaol'}
                            color={plan.isActive ? 'success' : 'default'}
                            size="small"
                        />
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} variant="outlined">
                    Bekor qilish
                </Button>
                {onSubscribe && (
                    <Button
                        onClick={() => onSubscribe(plan)}
                        variant="contained"
                        disabled={isSubscribing || isDisabled || !plan.isActive}
                    >
                        {isSubscribing ? 'Obuna qilinmoqda...' : 'Obuna bo\'lish'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};
