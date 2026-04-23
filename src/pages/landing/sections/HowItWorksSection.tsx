import React from 'react';
import { useThemeStore } from '../../../store/theme.store';

const steps = [
    {
        number: '01',
        title_uz: 'Ro\'yxatdan o\'ting',
        title_en: 'Sign Up',
        description_uz: 'Balance akkauntingizni yarating va 2 daqiqada tayyor bo\'ling',
        description_en: 'Create your Balance account and get ready in 2 minutes',
    },
    {
        number: '02',
        title_uz: 'Mahsulot va Mijoz',
        title_en: 'Add Products & Customers',
        description_uz: 'Mahsulotlaringiz va mijozlaringiz haqida ma\'lumot kiritib qo\'ying',
        description_en: 'Add your products and customers to the system',
    },
    {
        number: '03',
        title_uz: 'Shartnoma Tuzing',
        title_en: 'Create Contract',
        description_uz: 'Shartnoma tuzing va avtomatik to\'lovlarni o\'rnatib qo\'ying',
        description_en: 'Create contracts and set up automatic payment schedules',
    },
];

export const HowItWorksSection: React.FC = () => {
    const { mode } = useThemeStore();

    return (
        <section className={`py-20 sm:py-32 transition-colors duration-300 ${mode === 'dark'
            ? 'bg-gray-900'
            : 'bg-white'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                        3 Qadamda Boshlang
                    </h2>
                    <p className={`text-lg ${mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Qadim boshlamasdan to\'lash tizimingizni o\'rnating
                    </p>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="relative">
                            {/* Connector line */}
                            {index < steps.length - 1 && (
                                <div className={`hidden md:block absolute top-24 left-1/2 w-1/2 h-0.5 ${mode === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                                    }`}></div>
                            )}

                            {/* Step card */}
                            <div className="relative">
                                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full font-bold text-lg mb-6 ${mode === 'dark'
                                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500'
                                    : 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300'
                                    }`}>
                                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                                        {step.number}
                                    </span>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{step.title_uz}</h3>
                                <p className={`${mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {step.description_uz}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
