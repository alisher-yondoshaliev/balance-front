import { useTranslation } from 'react-i18next';
import { FileText, Calendar, Users, BarChart3, CreditCard, Store } from 'lucide-react';

export default function Features() {
  const { t } = useTranslation();

  const features = [
    {
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      title: t('landing.features.f1_title'),
      desc: t('landing.features.f1_desc'),
    },
    {
      icon: <Calendar className="w-6 h-6 text-purple-600" />,
      title: t('landing.features.f2_title'),
      desc: t('landing.features.f2_desc'),
    },
    {
      icon: <Users className="w-6 h-6 text-green-600" />,
      title: t('landing.features.f3_title'),
      desc: t('landing.features.f3_desc'),
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-orange-600" />,
      title: t('landing.features.f4_title'),
      desc: t('landing.features.f4_desc'),
    },
    {
      icon: <CreditCard className="w-6 h-6 text-pink-600" />,
      title: t('landing.features.f5_title'),
      desc: t('landing.features.f5_desc'),
    },
    {
      icon: <Store className="w-6 h-6 text-indigo-600" />,
      title: t('landing.features.f6_title'),
      desc: t('landing.features.f6_desc'),
    },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-800/50 transition-colors duration-300" id="features">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('landing.features.title')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('landing.features.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div 
              key={idx}
              className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
