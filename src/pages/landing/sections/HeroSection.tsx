import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useThemeStore } from '../../../store/theme.store';

export const HeroSection: React.FC = () => {
    const { mode } = useThemeStore();

    return (
        <section className={`relative overflow-hidden py-20 sm:py-32 transition-colors duration-300 ${mode === 'dark'
            ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
            : 'bg-gradient-to-br from-white via-purple-50 to-pink-50'
            }`}>
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${mode === 'dark' ? 'bg-purple-500' : 'bg-purple-200'
                    }`}></div>
                <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${mode === 'dark' ? 'bg-pink-500' : 'bg-pink-200'
                    }`}></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left content */}
                    <div className="space-y-8">
                        {/* Badge */}
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${mode === 'dark'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-purple-100 text-purple-700 border border-purple-200'
                            }`}>
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                            🚀 Yangi O'zbekiston Startup
                        </div>

                        {/* Title */}
                        <div className="space-y-4">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                                Bo'lib to'lashni <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">boshqarish</span> endi oson
                            </h1>
                            <p className={`text-lg sm:text-xl ${mode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                Do'koningiz uchun zamonaviy installment boshqaruv tizimi. Shartnomalarni boshqaring, avtomatik to'lovlarni kuzating, mijozlar bazasini o'rganib chiqing.
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <a href="/send-otp" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all">
                                Boshlash
                                <ArrowRight size={20} />
                            </a>
                            <a href="#pricing" className={`inline-flex items-center justify-center px-6 py-3 font-semibold rounded-lg transition-all ${mode === 'dark'
                                ? 'bg-gray-800 hover:bg-gray-700'
                                : 'bg-gray-200 hover:bg-gray-300'
                                }`}>
                                Demo ko'rish
                            </a>
                        </div>

                        {/* Trust badges */}
                        <div className={`flex items-center gap-6 pt-8 border-t ${mode === 'dark' ? 'border-gray-700' : 'border-gray-200'
                            }`}>
                            <div className="text-center">
                                <div className="text-2xl font-bold">500+</div>
                                <div className={`text-sm ${mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Foydalanuvchilar</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">$2M+</div>
                                <div className={`text-sm ${mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Boshqarilan</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">99.9%</div>
                                <div className={`text-sm ${mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Uptime</div>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Illustration placeholder */}
                    <div className="relative">
                        <div className={`relative h-96 sm:h-full min-h-96 rounded-2xl overflow-hidden ${mode === 'dark'
                            ? 'bg-gradient-to-br from-gray-800 to-gray-700'
                            : 'bg-gradient-to-br from-purple-100 to-pink-100'
                            }`}>
                            {/* Dashboard preview mockup */}
                            <div className={`absolute inset-4 rounded-lg ${mode === 'dark' ? 'bg-gray-900/50' : 'bg-white/50'
                                } backdrop-blur-sm border ${mode === 'dark' ? 'border-gray-700' : 'border-gray-300'
                                }`}>
                                <div className={`h-10 border-b ${mode === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-300 bg-gray-50/50'} rounded-t-lg flex items-center px-4 gap-2`}>
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div className={`h-2 rounded ${mode === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} w-1/2`}></div>
                                    <div className={`h-2 rounded ${mode === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} w-full`}></div>
                                    <div className={`h-2 rounded ${mode === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} w-3/4`}></div>
                                    <div className="grid grid-cols-2 gap-3 pt-4">
                                        <div className={`h-20 rounded ${mode === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'}`}></div>
                                        <div className={`h-20 rounded ${mode === 'dark' ? 'bg-pink-500/20' : 'bg-pink-100'}`}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
