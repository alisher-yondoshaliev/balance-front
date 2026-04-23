import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function CTA() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-blue-600 dark:bg-blue-900 transition-colors duration-300" />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90 dark:opacity-50" />
      
      <div className="container mx-auto px-6 relative z-10 text-center">
        <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
          {t('landing.cta.title')}
        </h2>
        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
          {t('landing.cta.subtitle')}
        </p>
        <button
          onClick={() => navigate('/send-otp')}
          className="px-8 py-4 bg-white text-blue-600 hover:bg-gray-50 rounded-xl font-bold text-lg transition-colors shadow-xl"
        >
          {t('landing.cta.button')}
        </button>
      </div>
    </section>
  );
}
