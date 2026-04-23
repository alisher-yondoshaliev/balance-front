/**
 * Dashboard Subscription Page
 * Display current subscription for OWNER role
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader } from 'lucide-react';
import { useGetCurrentSubscription } from '../../hooks/useSubscriptions';
import { SubscriptionInfo } from '../../components/subscriptions/SubscriptionInfo';
import { useAuthStore } from '../../store/auth.store';

export const DashboardSubscriptionPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    // Check authorization
    React.useEffect(() => {
        if (user?.role !== 'OWNER') {
            navigate('/dashboard', { replace: true });
        }
    }, [user, navigate]);

    // Queries
    const subscriptionQuery = useGetCurrentSubscription(user?.role === 'OWNER');

    if (subscriptionQuery.isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="animate-spin mx-auto mb-4" size={32} />
                    <p className="text-gray-600 font-medium">Loading subscription...</p>
                </div>
            </div>
        );
    }

    if (subscriptionQuery.isError) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 flex items-center gap-4">
                        <AlertCircle className="text-red-600 flex-shrink-0" size={32} />
                        <div>
                            <h2 className="text-lg font-bold text-red-900">Error Loading Subscription</h2>
                            <p className="text-red-800 mt-1">
                                Failed to load your subscription. Please try again.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                        Your Subscription
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Manage your subscription and billing information
                    </p>
                </div>

                {/* Subscription Info */}
                <SubscriptionInfo
                    subscription={(subscriptionQuery.data as unknown as import('../../types/subscription.types').CurrentSubscription) || null}
                    isLoading={subscriptionQuery.isLoading}
                    onUpgrade={() => navigate('/subscriptions/plans')}
                />

                {/* Quick Actions */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* View History */}
                    <button
                        onClick={() => navigate('/subscriptions/history')}
                        className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all text-left"
                    >
                        <h3 className="font-bold text-gray-900 mb-2">Payment History</h3>
                        <p className="text-gray-600 text-sm">
                            View all your past payments and invoices
                        </p>
                    </button>

                    {/* Upgrade Plan */}
                    <button
                        onClick={() => navigate('/subscriptions/plans')}
                        className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all text-left"
                    >
                        <h3 className="font-bold text-gray-900 mb-2">Upgrade Plan</h3>
                        <p className="text-gray-600 text-sm">
                            Switch to a different plan
                        </p>
                    </button>

                    {/* Support */}
                    <button
                        onClick={() => window.open('mailto:support@example.com')}
                        className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all text-left"
                    >
                        <h3 className="font-bold text-gray-900 mb-2">Contact Support</h3>
                        <p className="text-gray-600 text-sm">
                            Need help? Get in touch with our team
                        </p>
                    </button>
                </div>
            </div>
        </div>
    );
};
