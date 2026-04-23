/**
 * Employee Filter Options
 * Maps UI labels to backend API values
 */

export const EMPLOYEE_FILTER_OPTIONS = {
    // Sort By - UI label -> Backend value
    sortBy: [
        { label: 'Ism', value: 'fullName' },
        { label: 'Email', value: 'email' },
        { label: 'Qo\'sh sanasi', value: 'createdAt' },
    ],

    // Order - UI label -> Backend value
    order: [
        { label: 'O\'sish tartibida', value: 'asc' },
        { label: 'Kamayish tartibida', value: 'desc' },
    ],

    // Status - UI label -> Backend value
    status: [
        { label: 'Hammasi', value: '' },
        { label: 'Faol', value: 'ACTIVE' },
        { label: 'Faol emas', value: 'INACTIVE' },
    ],

    // Role - UI label -> Backend value (UPPERCASE)
    role: [
        { label: 'Hammasi', value: '' },
        { label: 'Admin', value: 'ADMIN' },
        { label: 'Menejer', value: 'MANAGER' },
        { label: 'Sotuvchi', value: 'SELLER' },
    ],

    // Role options for form dialog creation
    formRole: [
        { label: 'Admin', value: 'ADMIN' },
        { label: 'Menejer', value: 'MANAGER' },
        { label: 'Sotuvchi', value: 'SELLER' },
    ],
};

/**
 * Get UI label from backend value
 */
export const getFilterLabel = (
    type: 'status' | 'role' | 'sortBy' | 'order',
    value: string
): string => {
    const options = EMPLOYEE_FILTER_OPTIONS[type];
    return options.find(opt => opt.value === value)?.label || value;
};

/**
 * Get status display label
 */
export const getStatusLabel = (status?: string): string => {
    return status?.toUpperCase() === 'ACTIVE' ? 'Faol' : 'Faol emas';
};

/**
 * Get role display label
 */
export const getRoleLabel = (role: string): string => {
    return EMPLOYEE_FILTER_OPTIONS.role.find(r => r.value === role)?.label || role;
};
