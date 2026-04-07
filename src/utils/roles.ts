import type { Role } from '../types';

export const ROLES = {
    SUPERADMIN: 'SUPERADMIN',
    OWNER: 'OWNER',
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    SELLER: 'SELLER',
} as const;

export const ROLE_LABELS: Record<Role, string> = {
    SUPERADMIN: 'Super Admin',
    OWNER: 'Egasi',
    ADMIN: 'Admin',
    MANAGER: 'Menejer',
    SELLER: 'Sotuvchi',
};

export const isSuperAdmin = (role?: Role) => role === ROLES.SUPERADMIN;
export const isOwner = (role?: Role) => role === ROLES.OWNER;
export const isAdmin = (role?: Role) => role === ROLES.ADMIN;
export const isManager = (role?: Role) => role === ROLES.MANAGER;
export const isSeller = (role?: Role) => role === ROLES.SELLER;

export const hasAccessTo = (userRole: Role | undefined, requiredRoles: Role[]): boolean => {
    if (!userRole) return false;
    return requiredRoles.includes(userRole);
};
