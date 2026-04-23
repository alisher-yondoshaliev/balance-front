/**
 * SubscriptionInfo Component
 * Displays current subscription information
 */

import React from 'react';
import { AlertCircle, CheckCircle, Calendar, Clock } from 'lucide-react';
import dayjs from 'dayjs';
import type { CurrentSubscription } from '../../types/subscription.types';

interface SubscriptionInfoProps {
    subscription: CurrentSubscription | null;
    isLoading?: boolean;
    onUpgrade?: () => void;
}

export const SubscriptionInfo: React.FC<SubscriptionInfoProps> = ({
    subscription,
    isLoading = false,
    onUpgrade,
}) => {
    if (isLoading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-4 bg-gray-200 rounded w-3/4"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!subscription) {
        return (
            <div className="bg-amber-50 rounded-lg border-2 border-amber-200 p-6">
                <div className="flex items-center gap-4">
                    <AlertCircle className="text-amber-600 flex-shrink-0" size={24} />
                    <div>
                        <h3 className="font-bold text-amber-900">No Active Subscription</h3>
                        <p className="text-amber-800 text-sm mt-1">
                            You don't have an active subscription yet.
                        </p>
                        {onUpgrade && (
                            <button
                                onClick={onUpgrade}
                                className="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
                            >
                                View Plans
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const now = dayjs();
    const endDate = dayjs(subscription.endDate);
    const daysRemaining = endDate.diff(now, 'day');
    const isExpiring = daysRemaining <= 7 && daysRemaining > 0;
    const isExpired = subscription.status === 'expired' || daysRemaining <= 0;

    const getStatusInfo = () => {
        if (isExpired) {
            return {
                icon: AlertCircle,
                color: 'bg-red-50',
                borderColor: 'border-red-200',
                textColor: 'text-red-700',
                label: 'Expired',
            };
        }
        if (isExpiring) {
            return {
                icon: Clock,
                color: 'bg-yellow-50',
                borderColor: 'border-yellow-200',
                textColor: 'text-yellow-700',
                label: 'Expiring Soon',
            };
        }
        return {
            icon: CheckCircle,
            color: 'bg-green-50',
            borderColor: 'border-green-200',
            textColor: 'text-green-700',
            label: 'Active',
        };
    };

    const statusInfo = getStatusInfo();
    const StatusIcon = statusInfo.icon;

    return (
        <div className={`${statusInfo.color} rounded-lg border-2 ${statusInfo.borderColor} p-6`}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <StatusIcon className={statusInfo.textColor} size={28} />
                <div>
                    <h2 className={`text-xl font-bold ${statusInfo.textColor}`}>
                        {subscription.plan?.name || 'Unknown Plan'}
                    </h2>
                    <p className={`text-sm ${statusInfo.textColor}`}>{statusInfo.label}</p>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Start Date */}
                <div className="bg-white/50 rounded-lg p-4">
                    <label className="text-xs font-semibold text-gray-600 uppercase">Start Date</label>
                    <div className="mt-2 flex items-center gap-2">
                        <Calendar size={18} className="text-gray-400" />
                        <p className="font-semibold text-gray-900">
                            {dayjs(subscription.startDate).format('MMM DD, YYYY')}
                        </p>
                    </div>
                </div>

                {/* End Date */}
                <div className="bg-white/50 rounded-lg p-4">
                    <label className="text-xs font-semibold text-gray-600 uppercase">End Date</label>
                    <div className="mt-2 flex items-center gap-2">
                        <Calendar size={18} className="text-gray-400" />
                        <p className="font-semibold text-gray-900">
                            {endDate.format('MMM DD, YYYY')}
                        </p>
                    </div>
                </div>

                {/* Days Remaining */}
                <div className="bg-white/50 rounded-lg p-4">
                    <label className="text-xs font-semibold text-gray-600 uppercase">Days Remaining</label>
                    <div className="mt-2">
                        <p className="text-2xl font-bold text-gray-900">
                            {Math.max(0, daysRemaining)}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">days</p>
                    </div>
                </div>

                {/* Price */}
                <div className="bg-white/50 rounded-lg p-4">
                    <label className="text-xs font-semibold text-gray-600 uppercase">Price</label>
                    <div className="mt-2">
                        <p className="text-2xl font-bold text-gray-900">
                            ${subscription.plan?.price.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">per {subscription.plan?.duration} days</p>
                    </div>
                </div>
            </div>

            {/* Auto-Renew Status */}
            {subscription.autoRenew && (
                <div className="bg-white/50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-700">
                        <span className="font-semibold">Auto-Renewal:</span> Enabled (will renew automatically)
                    </p>
                </div>
            )}

            {/* Action Buttons */}
            {(isExpired || isExpiring) && onUpgrade && (
                <button
                    onClick={onUpgrade}
                    className={`w-full py-3 px-4 font-semibold rounded-lg transition-colors text-white ${isExpired
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-yellow-600 hover:bg-yellow-700'
                        }`}
                >
                    {isExpired ? 'Renew Subscription' : 'Upgrade Now'}
                </button>
            )}
        </div>
    );
};
