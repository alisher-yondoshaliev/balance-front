import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../i18n';

type Language = 'en' | 'uz';

interface LanguageState {
    language: Language;
    setLanguage: (language: Language) => void;
    toggleLanguage: () => void;
}

// Get initial language from localStorage or default to 'uz'
const getInitialLanguage = (): Language => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('language-storage');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.state?.language === 'en' || parsed.state?.language === 'uz') {
                    console.log('📦 Language loaded from localStorage:', parsed.state.language);
                    return parsed.state.language;
                }
            } catch (e) {
                console.error('Failed to parse language from localStorage', e);
            }
        }
    }
    return 'uz';
};

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set) => ({
            language: getInitialLanguage(),
            setLanguage: (language) => {
                console.log('🌐 Language changed to:', language);
                set({ language });
                // Force component re-render by setting data attribute
                if (typeof document !== 'undefined') {
                    document.documentElement.setAttribute('data-language', language);
                    console.log('✅ Language attribute set on document:', language);
                }
                if (i18n.isInitialized) {
                    i18n.changeLanguage(language);
                }
            },
            toggleLanguage: () => {
                set((state) => {
                    const newLanguage = state.language === 'uz' ? 'en' : 'uz';
                    console.log('🔄 Language toggled:', state.language, '→', newLanguage);
                    if (typeof document !== 'undefined') {
                        document.documentElement.setAttribute('data-language', newLanguage);
                        console.log('✅ Language attribute updated on document:', newLanguage);
                    }
                    if (i18n.isInitialized) {
                        i18n.changeLanguage(newLanguage);
                    }
                    return { language: newLanguage };
                });
            },
        }),
        { name: 'language-storage' },
    ),
);

// Translations
export const translations = {
    en: {
        // Navigation
        dashboard: 'Dashboard',
        markets: 'Markets',
        users: 'Users',
        customers: 'Customers',
        categories: 'Categories',
        products: 'Products',
        contracts: 'Contracts',
        subscriptions: 'Subscriptions',
        settings: 'Settings',
        profile: 'Profile',

        // Common
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        search: 'Search',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        noData: 'No data available',

        // Settings
        settingsTitle: 'Settings',
        settingsSubtitle: 'Manage application settings and preferences',
        theme: 'Theme',
        language: 'Language',
        notifications: 'Notifications',
        privacy: 'Privacy',
        security: 'Security',
        darkMode: 'Dark Mode',
        lightMode: 'Light Mode',
        english: 'English',
        uzbek: 'Uzbek',

        // Notifications
        emailNotifications: 'Email Notifications',
        smsNotifications: 'SMS Notifications',
        pushNotifications: 'Push Notifications',
        weeklyReport: 'Weekly Report',
        monthlyReport: 'Monthly Report',

        // Privacy
        profileVisibility: 'Profile Visibility',
        showActivityStatus: 'Show Activity Status',
        allowDataAnalytics: 'Allow Data Analytics',

        // Account
        twoFactorAuth: 'Two-Factor Authentication',
        accountSecurity: 'Account Security',
        dataManagement: 'Data Management',
        downloadData: 'Download Data',
        deleteAccount: 'Delete Account',
    },
    uz: {
        // Navigation
        dashboard: 'Dashboard',
        markets: 'Marketlar',
        users: 'Foydalanuvchilar',
        customers: 'Mijozlar',
        categories: 'Kategoriyalar',
        products: 'Mahsulotlar',
        contracts: 'Shartnomalar',
        subscriptions: 'Obunalar',
        settings: 'Sozlamalar',
        profile: 'Profil',

        // Common
        save: 'Saqlash',
        cancel: 'Bekor qilish',
        delete: 'O\'chirish',
        edit: 'Tahrirlash',
        add: 'Qo\'shish',
        search: 'Qidirish',
        loading: 'Yuklanyapti...',
        error: 'Xatolik',
        success: 'Muvaffaqiyat',
        warning: 'Ogohlantirish',
        noData: 'Ma\'lumot topilmadi',

        // Settings
        settingsTitle: 'Sozlamalar',
        settingsSubtitle: 'Aplikatsion sozlamalari va xususiyatlarni boshqarish',
        theme: 'Mavzu',
        language: 'Til',
        notifications: 'Bildirishnomalar',
        privacy: 'Xususiyat',
        security: 'Xavfsizlik',
        darkMode: 'Tun Rejimi',
        lightMode: 'Kun Rejimi',
        english: 'English',
        uzbek: 'O\'zbek',

        // Notifications
        emailNotifications: 'Email bildirishnomalar',
        smsNotifications: 'SMS bildirishnomalar',
        pushNotifications: 'Push bildirishnomalar',
        weeklyReport: 'Haftaviy hisobot',
        monthlyReport: 'Oylik hisobot',

        // Privacy
        profileVisibility: 'Profilni boshqalar ko\'rsatish',
        showActivityStatus: 'Faoliyat holatini ko\'rsatish',
        allowDataAnalytics: 'Dannyalarni tahlil qilish uchun ruxsat berish',

        // Account
        twoFactorAuth: 'Ikki faktorli autentifikatsiya',
        accountSecurity: 'Akkaunt Xavfsizligi',
        dataManagement: 'Ma\'lumotlarni Boshqarish',
        downloadData: 'Ma\'lumotlarni Yuklab Olish',
        deleteAccount: 'Akkauntni O\'chirish',
    },
};

// Helper function to get translation
export const t = (key: keyof typeof translations.en, language?: Language): string => {
    const lang = language || useLanguageStore.getState().language;
    console.log('🔤 Getting translation:', key, 'for language:', lang);
    return translations[lang][key] || translations.en[key] || key;
};
