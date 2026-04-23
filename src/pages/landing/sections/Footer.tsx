import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Phone } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900 transition-colors duration-300 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
              Balance
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
              Zamonaviy bo'lib to'lashni boshqarish tizimi. Biznesingizni keyingi bosqichga olib chiqing.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                <Building2 className="w-5 h-5" />
                <span>Toshkent sh., Yunusobod tumani</span>
              </div>
              <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                <Phone className="w-5 h-5" />
                <span>+998 90 123 45 67</span>
              </div>
              <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                <Mail className="w-5 h-5" />
                <span>info@balance.uz</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-6">Platforma</h4>
            <ul className="space-y-4">
              <li>
                <a href="#features" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                  Xususiyatlar
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                  Ta'riflar
                </a>
              </li>
              <li>
                <button onClick={() => navigate('/login')} className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                  Kirish
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-6">Yuridik</h4>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                  Maxfiylik siyosati
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                  Foydalanish shartlari
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {t('landing.footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
