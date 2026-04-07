import type { Role } from '../types';

// Role definitions with permissions
export const ROLES: Record<Role, { label: string; level: number }> = {
    SUPERADMIN: { label: 'KM Admin', level: 0 }, // Katta Manager - System Admin
    OWNER: { label: 'Market Egasi', level: 1 }, // Market Owner
    ADMIN: { label: 'Admin', level: 2 }, // Market Admin
    MANAGER: { label: 'Manager', level: 3 }, // Market Manager
    SELLER: { label: 'Sotuvchi', level: 4 }, // Seller
};

// Permission matrix - buni keyinchalik kengaytirishsa bo'ladi
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
    SUPERADMIN: [
        'view_all_markets',
        'manage_all_markets',
        'manage_users',
        'manage_roles',
        'view_reports',
        'system_settings',
    ],
    OWNER: [
        'view_own_market',
        'manage_own_market',
        'view_customers',
        'manage_products',
        'view_reports',
    ],
    ADMIN: [
        'view_own_market',
        'manage_own_market',
        'view_customers',
        'manage_products',
        'manage_contracts',
    ],
    MANAGER: [
        'view_own_market',
        'view_customers',
        'manage_products',
        'manage_contracts',
    ],
    SELLER: ['view_own_market', 'view_products', 'manage_products'],
};

// Role-based access control helper
export const canAccess = (userRole: Role, requiredRoles: Role[]): boolean => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return requiredRoles.includes(userRole);
};

// Get role level for hierarchy comparison
export const getRoleLevel = (role: Role): number => {
    return ROLES[role].level;
};

// Check if user role is higher than required role
export const hasHigherRole = (userRole: Role, requiredRole: Role): boolean => {
    return getRoleLevel(userRole) <= getRoleLevel(requiredRole);
};
