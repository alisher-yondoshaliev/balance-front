import React from 'react';
import { Check } from 'lucide-react';
import { useThemeStore } from '../../../store/theme.store';
import api from '../../../api/axios';

interface PricingPlan {
    id: string;
    name: string;
    price: number;
    duration: number;
    features: string[];
    isPopular?: boolean;
}

export const PricingSection: React.FC = () => {
    const { mode } = useThemeStore();
    const [plans, setPlans] = React.useState<PricingPlan[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchPlans = async () => {
            try {
                setLoading(true);
                const response = await api.get('/subscriptions/plans');
                const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
                setPlans(data);
            } catch (err) {
                console.error('Error fetching plans:', err);
                setError('Rejalari yuklashda xatolik');
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    if (loading) {
        return (
            <section className={`py-20 sm:py-32 transition-colors duration-300 ${mode === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className={`inline-block px-4 py-2 rounded-lg ${mode === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                            } animate-pulse`}>
                            Rejalari yuklanyapti...
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (error || plans.length === 0) {
        return (
            <section className={`py-20 sm:py-32 transition-colors duration-300 ${mode === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <p className={mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                            {error || 'Rejalari topilmadi'}
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="pricing" className={`py-20 sm:py-32 transition-colors duration-300 ${mode === 'dark'
            ? 'bg-gray-800'
            : 'bg-gray-50'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                        Oddiy va Shaffof Narxlar
                    </h2>
                    <p className={`text-lg ${mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Har qanday biznes uchun ideal reja tanlang
                    </p>
                </div>

                {/* Pricing cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {plans.map((plan, index) => (
                        <div
                            key={plan.id}
                            className={`relative rounded-2xl transition-all duration-300 overflow-hidden ${plan.isPopular || index === Math.floor(plans.length / 2)
                                ? 'ring-2 ring-purple-500 transform md:scale-105'
                                : ''
                                } ${mode === 'dark'
                                    ? 'bg-gray-700/50 hover:bg-gray-700 border border-gray-600'
                                    : 'bg-white hover:shadow-xl border border-gray-200'
                                }`}
                        >
                            {/* Popular badge */}
                            {(plan.isPopular || index === Math.floor(plans.length / 2)) && (
                                <div className="absolute top-0 right-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold py-2 text-center">
                                    ⭐ ENG AQ SOTILGAN
                                </div>
                            )}

                            <div className={`p-8 ${(plan.isPopular || index === Math.floor(plans.length / 2)) ? 'pt-16' : ''}`}>
                                {/* Plan name */}
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>

                                {/* Price */}
                                <div className="mb-6">
                                    <span className="text-4xl font-bold">
                                        {plan.price.toLocaleString('uz-UZ')} UZS
                                    </span>
                                    <span className={`ml-2 ${mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                        / {plan.duration} kun
                                    </span>
                                </div>

                                {/* CTA Button */}
                                <button className={`w-full py-3 rounded-lg font-semibold mb-8 transition-all ${plan.isPopular || index === Math.floor(plans.length / 2)
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                                    : mode === 'dark'
                                        ? 'bg-gray-600 hover:bg-gray-500 text-white'
                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                                    }`}>
                                    Tanlash
                                </button>

                                {/* Features */}
                                <div className="space-y-4">
                                    {plan.features && plan.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <Check className={`w-5 h-5 flex-shrink-0 ${mode === 'dark' ? 'text-green-400' : 'text-green-600'
                                                }`} />
                                            <span className={mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer note */}
                <div className="text-center mt-12">
                    <p className={`${mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Har bir rejada 14 kunlik bepul sinab ko\'rish davri mavjud
                    </p>
                </div>
            </div>
        </section>
    );
};
