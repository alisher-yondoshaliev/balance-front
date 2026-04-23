import { useTranslation } from 'react-i18next';

export default function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      number: "01",
      title: t('landing.howItWorks.step1_title'),
      desc: t('landing.howItWorks.step1_desc'),
    },
    {
      number: "02",
      title: t('landing.howItWorks.step2_title'),
      desc: t('landing.howItWorks.step2_desc'),
    },
    {
      number: "03",
      title: t('landing.howItWorks.step3_title'),
      desc: t('landing.howItWorks.step3_desc'),
    },
  ];

  return (
    <section className="py-24 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('landing.howItWorks.title')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('landing.howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gray-100 dark:bg-gray-800 -z-10" />
          
          {steps.map((step, idx) => (
            <div key={idx} className="relative text-center">
              <div className="w-24 h-24 mx-auto bg-white dark:bg-gray-900 border-4 border-blue-50 dark:border-blue-900/30 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {step.number}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
