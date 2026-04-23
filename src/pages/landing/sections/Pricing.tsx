import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { subscriptionsApi } from '../../../api/endpoints/subscriptions.api';
import { Check } from 'lucide-react';

export default function Pricing() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => subscriptionsApi.getPlans().then(r => r.data),
  });

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-800/50 transition-colors duration-300" id="pricing">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('landing.pricing.title')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('landing.pricing.subtitle')}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !plans || plans.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            {t('landing.pricing.noPlans')}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col relative overflow-hidden transition-transform hover:-translate-y-1"
              >
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                      {plan.price.toLocaleString()} so'm
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 font-medium">
                      / 30 {t('landing.pricing.duration')}
                    </span>
                  </div>
                </div>

                <div className="flex-grow space-y-4 mb-8">
                  {plan.features?.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-gray-600 dark:text-gray-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => navigate('/send-otp')}
                  className="w-full py-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl transition-colors border border-gray-200 dark:border-gray-700"
                >
                  {t('landing.pricing.select')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
