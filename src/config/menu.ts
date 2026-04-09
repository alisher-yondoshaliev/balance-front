import type { Role } from '../types';
import type { SvgIconTypeMap } from '@mui/material';
import type { OverridableComponent } from '@mui/material/OverridableComponent';
import {
    Dashboard as DashboardIcon,
    Store as StoreIcon,
    People as PeopleIcon,
    Person as PersonIcon,
    Tag as TagIcon,
    ShoppingBag as ShoppingBagIcon,
    Description as DescriptionIcon,
    CreditCard as SubscriptionIcon,
    Settings as SettingsIcon,
} from '@mui/icons-material';

type IconComponent = OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;

interface MenuItemConfig {
    id: string;
    label: string;
    icon: IconComponent;
    path: string;
    requiredRoles: Role[];
}

/**
 * Menu configuration with role-based access
 * Icons stored as components, not JSX elements
 */
export const MENU_ITEMS: MenuItemConfig[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: DashboardIcon,
        path: '/dashboard',
        requiredRoles: ['SUPERADMIN', 'OWNER', 'ADMIN', 'MANAGER', 'SELLER'],
    },
    {
        id: 'markets',
        label: 'Marketlar',
        icon: StoreIcon,
        path: '/markets',
        requiredRoles: ['SUPERADMIN', 'OWNER', 'ADMIN'],
    },
    {
        id: 'users',
        label: 'Foydalanuvchilar',
        icon: PeopleIcon,
        path: '/users',
        requiredRoles: ['SUPERADMIN', 'OWNER', 'ADMIN'],
    },
    {
        id: 'customers',
        label: 'Mijozlar',
        icon: PersonIcon,
        path: '/customers',
        requiredRoles: ['SUPERADMIN', 'OWNER', 'ADMIN', 'MANAGER'],
    },
    {
        id: 'categories',
        label: 'Kategoriyalar',
        icon: TagIcon,
        path: '/categories',
        requiredRoles: ['SUPERADMIN', 'OWNER', 'ADMIN', 'MANAGER'],
    },
    {
        id: 'products',
        label: 'Mahsulotlar',
        icon: ShoppingBagIcon,
        path: '/products',
        requiredRoles: ['SUPERADMIN', 'OWNER', 'ADMIN', 'MANAGER', 'SELLER'],
    },
    {
        id: 'contracts',
        label: 'Shartnomalar',
        icon: DescriptionIcon,
        path: '/contracts',
        requiredRoles: ['SUPERADMIN', 'OWNER', 'ADMIN', 'MANAGER'],
    },
    {
        id: 'subscriptions',
        label: 'Obunalar',
        icon: SubscriptionIcon,
        path: '/subscriptions',
        requiredRoles: ['SUPERADMIN', 'OWNER', 'ADMIN'],
    },
    {
        id: 'settings',
        label: 'Sozlamalar',
        icon: SettingsIcon,
        path: '/settings',
        requiredRoles: ['SUPERADMIN', 'OWNER', 'ADMIN'],
    },
];

/**
 * Filter menu items by user role
 */
export const getMenuItemsByRole = (userRole: Role): MenuItemConfig[] => {
    return MENU_ITEMS.filter((item) => item.requiredRoles.includes(userRole));
};
