import { Check, AlertCircle } from 'lucide-react';
import type { SubscriptionPlan } from '../../api/endpoints/subscriptions.api';

interface PricingCardsProps {
    plans: SubscriptionPlan[];
    isLoading?: boolean;
    onSelectPlan: (planId: string) => void;
    currentPlanId?: string;
}

// Skeleton loader for pricing cards
function PricingCardSkeleton() {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 h-full flex flex-col animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
            <div className="space-y-3 flex-1 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                ))}
            </div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
    );
}

export function PricingCards({
    plans,
    isLoading = false,
    onSelectPlan,
    currentPlanId,
}: PricingCardsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <PricingCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (!plans || plans.length === 0) {
        return (
            <div className="flex items-center justify-center p-8 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3 text-blue-700">
                    <AlertCircle size={20} />
                    <span>Hozircha tariflar mavjud emas</span>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => {
                const isCurrentPlan = plan.id === currentPlanId;

                return (
                    <div
                        key={plan.id}
                        className={`relative bg-white rounded-lg border-2 transition-all duration-300 overflow-hidden flex flex-col h-full ${isCurrentPlan
                                ? 'border-blue-500 shadow-lg'
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                            }`}
                    >
                        {/* Popular badge */}
                         {!!((plan as unknown as Record<string, unknown>).isPopular) && (
                            <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-bl-lg text-sm font-semibold">
                                Mashhur
                            </div>
                        )}

                        {/* Current plan indicator */}
                        {isCurrentPlan && (
                            <div className="absolute top-0 left-0 bg-green-500 text-white px-3 py-1 rounded-br-lg text-sm font-semibold">
                                Faol
                            </div>
                        )}

                        <div className="p-6 flex flex-col h-full">
                            {/* Plan name */}
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>

                            {/* Description */}
                             {plan.description && (
                                 <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                            )}

                            {/* Price */}
                            <div className="mb-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-gray-900">
                                        {plan.price.toLocaleString('uz-UZ')}
                                    </span>
                                    <span className="text-gray-600 text-sm">so'm</span>
                                </div>
                                <p className="text-gray-500 text-sm mt-1">
                                    {plan.duration} kun uchun
                                </p>
                            </div>

                            {/* Plan info */}
                            <div className="mb-6 flex-1">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Tarif ma'lumoti:</h4>
                                <ul className="space-y-2">
                                    <li className="text-gray-700 text-sm flex items-center gap-2">
                                        <Check className="text-green-500 flex-shrink-0" size={16} />
                                        <span>{plan.duration} kun uchun kirish</span>
                                    </li>
                                    <li className="text-gray-700 text-sm flex items-center gap-2">
                                        <Check className="text-green-500 flex-shrink-0" size={16} />
                                        <span>Status: {plan.isActive ? 'Faol' : 'Nofaol'}</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Action button */}
                            <button
                                onClick={() => onSelectPlan(plan.id)}
                                disabled={isCurrentPlan}
                                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors duration-200 ${isCurrentPlan
                                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-500 hover:bg-blue-600 text-white active:scale-95'
                                    }`}
                            >
                                {isCurrentPlan ? 'Faol tarif' : 'Tanlash'}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
