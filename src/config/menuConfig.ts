import type { ComponentType } from 'react';
import {
    Dashboard as DashboardIcon,
    Store as StoreIcon,
    People as PeopleIcon,
    Inventory as InventoryIcon,
    Category as CategoryIcon,
    Description as DescriptionIcon,
    Person as PersonIcon,
    CreditCard as CreditCardIcon,
} from '@mui/icons-material';
import type { Role } from '../types';

export interface MenuItem {
    title: string;
    path: string;
    icon: ComponentType<any>;
    roles: Role[];
}

export const OWNER_MENU: MenuItem[] = [
    { title: 'Dashboard', path: '/dashboard', icon: DashboardIcon, roles: ['OWNER', 'ADMIN', 'MANAGER'] },
    { title: 'Marketlar', path: '/markets', icon: StoreIcon, roles: ['OWNER', 'ADMIN', 'MANAGER'] },
    { title: 'Xodimlar', path: '/users', icon: PeopleIcon, roles: ['OWNER', 'ADMIN'] },
    { title: 'Mijozlar', path: '/customers', icon: PersonIcon, roles: ['OWNER', 'ADMIN', 'MANAGER'] },
    { title: 'Kategoriyalar', path: '/categories', icon: CategoryIcon, roles: ['OWNER', 'ADMIN', 'MANAGER', 'SELLER'] },
    { title: 'Mahsulotlar', path: '/products', icon: InventoryIcon, roles: ['OWNER', 'ADMIN', 'MANAGER', 'SELLER'] },
    { title: 'Shartnomalar', path: '/contracts', icon: DescriptionIcon, roles: ['OWNER', 'ADMIN', 'MANAGER'] },
    { title: 'Obuna', path: '/subscriptions', icon: CreditCardIcon, roles: ['OWNER'] },
];

export const getMenuForRole = (role: Role | undefined): MenuItem[] => {
    if (!role) return [];
    return OWNER_MENU.filter((item) => item.roles.includes(role));
};
