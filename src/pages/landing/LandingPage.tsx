import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../../store/theme.store';
import { useLanguageStore } from '../../store/language.store';
import { Moon, Sun, Globe } from 'lucide-react';

import Hero from './sections/Hero';
import Features from './sections/Features';
import HowItWorks from './sections/HowItWorks';
import Pricing from './sections/Pricing';
import CTA from './sections/CTA';
import Footer from './sections/Footer';

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { mode, toggleTheme } = useThemeStore();
  const { language, toggleLanguage } = useLanguageStore();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 font-sans transition-colors duration-300">
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Balance
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium transition-colors">
              Xususiyatlar
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium transition-colors">
              Ta'riflar
            </a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
              title="Change Language"
            >
              <Globe className="w-5 h-5" />
              <span className="text-sm font-bold uppercase">{language}</span>
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Toggle Theme"
            >
              {mode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:block px-5 py-2.5 text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              Kirish
            </button>
            <button
              onClick={() => navigate('/send-otp')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/20"
            >
              Ro'yxatdan o'tish
            </button>
          </div>
        </div>
      </nav>

      {/* Sections */}
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
