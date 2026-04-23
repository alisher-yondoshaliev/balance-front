import React from 'react';
import { Zap, Users, FileText, BarChart3, CreditCard, Package } from 'lucide-react';
import { useThemeStore } from '../../../store/theme.store';

const features = [
    {
        icon: FileText,
        title_uz: 'Shartnomalarni Boshqarish',
        title_en: 'Contract Management',
        description_uz: 'Barcha shartnomalarni bir joyda boshqaring, avtomatik yangilanishlar va reminders',
        description_en: 'Manage all contracts in one place with automatic updates and reminders',
    },
    {
        icon: CreditCard,
        title_uz: 'Avtomatik To\'lovlar',
        title_en: 'Automatic Payments',
        description_uz: 'To\'lov jadvalini o\'rnatib qo\'ying va sistem avtomatik kuzatib tursin',
        description_en: 'Set payment schedules and let the system track them automatically',
    },
    {
        icon: Users,
        title_uz: 'Mijozlar Bazasi',
        title_en: 'Customer Database',
        description_uz: 'Barcha mijozlarni xotirada saqlang va ularni bevosita boshqaring',
        description_en: 'Keep all customers organized and manage them directly',
    },
    {
        icon: BarChart3,
        title_uz: 'Dashboard Statistika',
        title_en: 'Dashboard Analytics',
        description_uz: 'Real-time statistika va analytics orqali biznesni kuzating',
        description_en: 'Track your business with real-time statistics and analytics',
    },
    {
        icon: Package,
        title_uz: 'Ko\'p Do\'kon',
        title_en: 'Multi-Store Support',
        description_uz: 'Bir nechta do\'koningizni bir platformadan boshqaring',
        description_en: 'Manage multiple stores from a single platform',
    },
    {
        icon: Zap,
        title_uz: 'Obuna Tizimi',
        title_en: 'Subscription System',
        description_uz: 'Moslashtirilgan obuna rejalari va avtomatik yangilash',
        description_en: 'Custom subscription plans with automatic renewals',
    },
];

export const FeaturesSection: React.FC = () => {
    const { mode } = useThemeStore();

    return (
        <section className={`py-20 sm:py-32 transition-colors duration-300 ${mode === 'dark'
                ? 'bg-gray-800'
                : 'bg-gray-50'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                        Qanday Ishlaydi?
                    </h2>
                    <p className={`text-lg ${mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Balance biznesni o'stirishda yordam beradigan eng muhim xususiyatlar
                    </p>
                </div>

                {/* Features grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className={`p-8 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer ${mode === 'dark'
                                        ? 'bg-gray-700/50 hover:bg-gray-700 border border-gray-600'
                                        : 'bg-white hover:bg-purple-50 border border-gray-200'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${mode === 'dark'
                                        ? 'bg-purple-500/20'
                                        : 'bg-purple-100'
                                    }`}>
                                    <Icon className={`w-6 h-6 ${mode === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title_uz}</h3>
                                <p className={`${mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {feature.description_uz}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
