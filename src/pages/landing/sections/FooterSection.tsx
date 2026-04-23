import React from 'react';
import { useThemeStore } from '../../../store/theme.store';

export const FooterSection: React.FC = () => {
    const { mode } = useThemeStore();

    return (
        <footer className={`transition-colors duration-300 ${mode === 'dark'
                ? 'bg-gray-900 border-t border-gray-800'
                : 'bg-gray-900 border-t border-gray-800'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">B</span>
                            </div>
                            <span className="font-bold text-xl text-white">Balance</span>
                        </div>
                        <p className="text-gray-400 text-sm">
                            O'zbekistonning eng zamonaviy bo'lib-to'lash boshqaruv tizimi.
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Mahsulot</h3>
                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">Xususiyatlar</a></li>
                            <li><a href="#pricing" className="hover:text-white transition-colors">Narxlar</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Xavfsizlik</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Kompaniya</h3>
                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">Biz Haqida</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Karyera</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Kontakt</a></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Huquqiy</h3>
                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">Shartlar</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Xususiyat</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Cookie</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Lisenzia</a></li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-800 pt-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-gray-400 text-sm">
                            © 2024 Balance. Barcha huquqlar himoyalangan.
                        </p>
                        <div className="flex gap-6">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                Twitter
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                LinkedIn
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                Facebook
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
