import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useThemeStore } from '../../../store/theme.store';

export const CTASection: React.FC = () => {
    const { mode } = useThemeStore();

    return (
        <section className={`py-20 sm:py-32 transition-colors duration-300 ${mode === 'dark'
            ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-t border-gray-700'
            : 'bg-gradient-to-r from-purple-100 to-pink-100'
            }`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-3xl sm:text-5xl font-bold">
                            Bugunoq boshlang
                        </h2>
                        <p className={`text-lg ${mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Balance bilan bo'lib-to'lash tizimini modernizatsiya qiling. Hech qanday kredit kartasi kerak emas.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <a href="/send-otp" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all">
                            Ro'yxatdan o'tish
                            <ArrowRight size={20} />
                        </a>
                        <a href="mailto:support@balance.uz" className={`inline-flex items-center justify-center px-8 py-4 font-semibold rounded-lg transition-all ${mode === 'dark'
                            ? 'bg-gray-800 hover:bg-gray-700'
                            : 'bg-white hover:bg-gray-50'
                            }`}>
                            Savol so'rash
                        </a>
                    </div>

                    {/* Trust indicators */}
                    <div className={`flex items-center justify-center gap-4 text-sm pt-4 ${mode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                        <span>✅ Bepul sinab ko\'rish</span>
                        <span>•</span>
                        <span>✅ Hech qanday kredit kartasi</span>
                        <span>•</span>
                        <span>✅ 24/7 Qo'llab-quvvatlash</span>
                    </div>
                </div>
            </div>
        </section>
    );
};
