import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';

export default function Hero() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-white dark:bg-gray-900 pt-32 pb-20 lg:pt-48 lg:pb-32 transition-colors duration-300">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 dark:opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-8">
          <span className="flex h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400"></span>
          Balance v2.0 is live
        </div>

        <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8 max-w-4xl mx-auto leading-tight">
          {t('landing.hero.title')}
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
          {t('landing.hero.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/send-otp')}
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
          >
            {t('landing.hero.start')}
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto px-8 py-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700"
          >
            <Play className="w-5 h-5" />
            {t('landing.hero.demo')}
          </button>
        </div>
      </div>
    </section>
  );
}
