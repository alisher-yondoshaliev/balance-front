import type { ReactNode } from 'react';
import {
    Dashboard as DashboardIcon,
    Store as StoreIcon,
    People as PeopleIcon,
    Inventory as InventoryIcon,
    Category as CategoryIcon,
    Description as DescriptionIcon,
    Person as PersonIcon,
    CreditCard as CreditCardIcon,
    Settings as SettingsIcon,
} from '@mui/icons-material';
import type { Role } from '../types';

export interface MenuItem {
    title: string;
    path: string;
    icon: ReactNode;
    roles: Role[];
}

export const SUPERADMIN_MENU: MenuItem[] = [
    { title: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, roles: ['SUPERADMIN'] },
    { title: 'Barcha Marketlar', path: '/markets', icon: <StoreIcon />, roles: ['SUPERADMIN'] },
    { title: 'Foydalanuvchilar', path: '/users', icon: <PeopleIcon />, roles: ['SUPERADMIN'] },
    { title: 'Obuna Rejalar', path: '/subscriptions', icon: <CreditCardIcon />, roles: ['SUPERADMIN'] },
    { title: 'Sozlamalar', path: '/settings', icon: <SettingsIcon />, roles: ['SUPERADMIN'] },
];

export const OWNER_MENU: MenuItem[] = [
    { title: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, roles: ['OWNER', 'ADMIN', 'MANAGER'] },
    { title: 'Marketim', path: '/markets', icon: <StoreIcon />, roles: ['OWNER'] },
    { title: 'Foydalanuvchilar', path: '/users', icon: <PeopleIcon />, roles: ['OWNER', 'ADMIN'] },
    { title: 'Mijozlar', path: '/customers', icon: <PersonIcon />, roles: ['OWNER', 'ADMIN', 'MANAGER'] },
    { title: 'Kategoriyalar', path: '/categories', icon: <CategoryIcon />, roles: ['OWNER', 'ADMIN', 'MANAGER', 'SELLER'] },
    { title: 'Mahsulotlar', path: '/products', icon: <InventoryIcon />, roles: ['OWNER', 'ADMIN', 'MANAGER', 'SELLER'] },
    { title: 'Shartnomalar', path: '/contracts', icon: <DescriptionIcon />, roles: ['OWNER', 'ADMIN', 'MANAGER'] },
    { title: 'Obuna', path: '/subscriptions', icon: <CreditCardIcon />, roles: ['OWNER'] },
];

export const getMenuForRole = (role: Role | undefined): MenuItem[] => {
    if (!role) return [];
    if (role === 'SUPERADMIN') return SUPERADMIN_MENU;
    return OWNER_MENU.filter((item) => item.roles.includes(role));
};
