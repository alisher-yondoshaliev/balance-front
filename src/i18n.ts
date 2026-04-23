import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Landing page translations
const resources = {
  en: {
    translation: {
      landing: {
        hero: {
          title: "Installment management is now easy",
          subtitle: "Modern installment management system for your store",
          start: "Get Started",
          demo: "View Demo",
        },
        features: {
          title: "Core Features",
          subtitle: "Everything you need to grow your business",
          f1_title: "Contract Management",
          f1_desc: "Create and track business contracts easily.",
          f2_title: "Automated Payment Schedule",
          f2_desc: "Automatically calculate and track installment schedules.",
          f3_title: "Customer Base",
          f3_desc: "Keep full details of your customers in one place.",
          f4_title: "Dashboard Statistics",
          f4_desc: "Real-time analytics and financial reports.",
          f5_title: "Subscription System",
          f5_desc: "Manage your SaaS subscription plans.",
          f6_title: "Multi-store Support",
          f6_desc: "Manage multiple branches or stores easily.",
        },
        howItWorks: {
          title: "How It Works",
          subtitle: "3 simple steps to start managing your installments",
          step1_title: "Register",
          step1_desc: "Sign up and create your store profile.",
          step2_title: "Add Products & Customers",
          step2_desc: "Build your inventory and customer base.",
          step3_title: "Create Contracts",
          step3_desc: "Start selling on installments and tracking payments.",
        },
        pricing: {
          title: "Pricing Plans",
          subtitle: "Choose the best plan for your business size",
          duration: "days",
          select: "Select Plan",
          noPlans: "No plans available right now.",
        },
        cta: {
          title: "Start Today",
          subtitle: "Sign up now and get full access to Balance platform features.",
          button: "Sign Up",
        },
        footer: {
          copyright: "© 2024 Balance. All rights reserved.",
        }
      }
    }
  },
  uz: {
    translation: {
      landing: {
        hero: {
          title: "Bo'lib to'lashni boshqarish endi oson",
          subtitle: "Do'koningiz uchun zamonaviy installment boshqaruv tizimi",
          start: "Boshlash",
          demo: "Demo ko'rish",
        },
        features: {
          title: "Asosiy Xususiyatlar",
          subtitle: "Sizning biznesingizni o'stirish uchun barcha vositalar",
          f1_title: "Shartnomalarni boshqarish",
          f1_desc: "Biznes shartnomalarini osongina yarating va kuzating.",
          f2_title: "Avtomatik to'lov jadvali",
          f2_desc: "To'lov jadvallarini avtomatik hisoblang va kuzatib boring.",
          f3_title: "Mijozlar bazasi",
          f3_desc: "Mijozlaringiz haqidagi barcha ma'lumotlarni bir joyda saqlang.",
          f4_title: "Dashboard statistika",
          f4_desc: "Haqiqiy vaqtdagi tahlillar va moliyaviy hisobotlar.",
          f5_title: "Obuna tizimi",
          f5_desc: "SaaS obuna rejalarini boshqaring va to'lovlarni qabul qiling.",
          f6_title: "Ko'p do'kon qo'llab-quvvatlash",
          f6_desc: "Bir nechta filial yoki do'konlarni bitta akkauntdan boshqaring.",
        },
        howItWorks: {
          title: "Qanday ishlaydi",
          subtitle: "Boshlash uchun 3 oddiy qadam",
          step1_title: "Ro'yxatdan o'ting",
          step1_desc: "Ro'yxatdan o'ting va do'kon profilingizni yarating.",
          step2_title: "Mahsulot va mijoz qo'shing",
          step2_desc: "O'z bazangizni yarating: mahsulotlar va mijozlarni kiriting.",
          step3_title: "Shartnoma tuzing",
          step3_desc: "Bo'lib to'lashga soting va to'lovlarni kuzating.",
        },
        pricing: {
          title: "Ta'riflar",
          subtitle: "Biznesingiz o'lchamiga mos rejani tanlang",
          duration: "kun",
          select: "Tanlash",
          noPlans: "Hozircha ta'riflar mavjud emas.",
        },
        cta: {
          title: "Bugunoq boshlang",
          subtitle: "Bepul ro'yxatdan o'ting va Balance platformasining imkoniyatlaridan foydalaning.",
          button: "Ro'yxatdan o'tish",
        },
        footer: {
          copyright: "© 2024 Balance. Barcha huquqlar himoyalangan.",
        }
      }
    }
  }
};

const savedLanguage = typeof window !== 'undefined' 
  ? (() => {
      try {
        const saved = localStorage.getItem('language-storage');
        return saved ? JSON.parse(saved).state?.language : 'uz';
      } catch (e) {
        return 'uz';
      }
    })()
  : 'uz';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage || 'uz',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
