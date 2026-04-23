import { AlertCircle, Calendar, CheckCircle, Clock } from 'lucide-react';
import dayjs from 'dayjs';
import type { SubscriptionItem } from '../../api/endpoints/subscriptions.api';

interface CurrentSubscriptionCardProps {
    subscription: SubscriptionItem | null | undefined;
    isLoading?: boolean;
    onUpgrade: () => void;
}

// Skeleton loader for current subscription
function CurrentSubscriptionSkeleton() {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[1, 2, 3].map((i) => (
                    <div key={i}>
                        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-full"></div>
                    </div>
                ))}
            </div>
            <div className="flex gap-3">
                <div className="h-10 bg-gray-200 rounded flex-1"></div>
                <div className="h-10 bg-gray-200 rounded flex-1"></div>
            </div>
        </div>
    );
}

export function CurrentSubscriptionCard({
    subscription,
    isLoading = false,
    onUpgrade,
}: CurrentSubscriptionCardProps) {
    if (isLoading) {
        return <CurrentSubscriptionSkeleton />;
    }

    if (!subscription) {
        return (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="text-amber-600" size={24} />
                    <h3 className="text-lg font-semibold text-amber-900">Active obuna yo'q</h3>
                </div>
                <p className="text-amber-800 mb-4">
                    Hozircha sizda faol obuna mavjud emas. Iltimos, quyidagi tariflardan birini tanlang va to'lovni amalga oshiring.
                </p>
                <button
                    onClick={onUpgrade}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                    Obuna tariflarini ko'rish
                </button>
            </div>
        );
    }

    const isActive = subscription.isActive;
    const isExpired = !subscription.isActive;
    const endDate = dayjs(subscription.subEndDate);
    const daysRemaining = subscription.daysLeft;

    // Status indicator
    const getStatusInfo = () => {
        if (isExpired) {
            return {
                icon: AlertCircle,
                color: 'text-red-600',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
                label: 'Muddati tugagan',
                description: 'Obunangiz muddati tugagan. Yangi tarif tanlang.',
            };
        }
        if (daysRemaining <= 7 && daysRemaining > 0) {
            return {
                icon: Clock,
                color: 'text-orange-600',
                bgColor: 'bg-orange-50',
                borderColor: 'border-orange-200',
                label: `Muddati tugamoqda (${daysRemaining} kun)`,
                description: 'Obunangiz tez orada tugaydi. Davom etishni tavsiya qilinyapti.',
            };
        }
        return {
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            label: 'Faol',
            description: `Muddati tugamasligi ${daysRemaining} kun qoldi.`,
        };
    };

    const statusInfo = getStatusInfo();
    const StatusIcon = statusInfo.icon;

    return (
        <div
            className={`${statusInfo.bgColor} rounded-lg border-2 ${statusInfo.borderColor} p-6 transition-all duration-300`}
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-current border-opacity-20">
                <StatusIcon className={`${statusInfo.color} flex-shrink-0`} size={28} />
                <div>
                    <h3 className={`text-lg font-bold ${statusInfo.color}`}>
                        {subscription.plan?.name || 'Noma\'lum tarif'}
                    </h3>
                    <p className={`text-sm ${statusInfo.color} opacity-75`}>
                        {statusInfo.label}
                    </p>
                </div>
            </div>

            {/* Description */}
            <p className="text-gray-700 text-sm mb-6">{statusInfo.description}</p>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {/* End Date */}
                <div className="bg-white/50 rounded-lg p-4">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Tugash sanasi
                    </label>
                    <div className="mt-2 flex items-center gap-2">
                        <Calendar size={18} className="text-gray-400" />
                        <p className="font-semibold text-gray-900">
                            {endDate.format('DD.MM.YYYY')}
                        </p>
                    </div>
                </div>

                {/* Days Remaining */}
                <div className="bg-white/50 rounded-lg p-4">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Qolgan kunlar
                    </label>
                    <div className="mt-2 flex items-center gap-2">
                        <Clock size={18} className="text-gray-400" />
                        <p className="font-semibold text-gray-900">
                            {daysRemaining} kun
                        </p>
                    </div>
                </div>

                {/* Price */}
                <div className="bg-white/50 rounded-lg p-4">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Narxi
                    </label>
                    <div className="mt-2">
                        <p className="text-2xl font-bold text-gray-900">
                            {subscription.plan?.price.toLocaleString('uz-UZ')}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">so'm</p>
                    </div>
                </div>
            </div>

            {/* Description (if available) */}
            {subscription.plan?.description && (
                <div className="mb-6 bg-white/30 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Tarifning tavsifi:</h4>
                    <p className="text-sm text-gray-700">{subscription.plan.description}</p>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 flex-col sm:flex-row">
                {isExpired && (
                    <button
                        onClick={onUpgrade}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors active:scale-95"
                    >
                        Yangi tarif tanlash
                    </button>
                )}
                {isActive && daysRemaining <= 7 && (
                    <button
                        onClick={onUpgrade}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors active:scale-95"
                    >
                        Obunani yangilash
                    </button>
                )}
            </div>
        </div>
    );
}
