// Status type definitions
export type MarketStatus = 'active' | 'inactive';
export type ContractStatus = 'draft' | 'active' | 'expired' | 'terminated';
export type InstallmentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type ProductStatus = 'active' | 'inactive';

// Market interface
export interface Market {
    id: string;
    name: string;
    description?: string;
    logo?: string;
    phone?: string;
    address?: string;
    status: MarketStatus;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
}

// User interface (for other users, not auth)
export interface UserResource {
    id: string;
    email: string;
    fullName: string;
    avatar?: string;
    role: string;
    marketId?: string;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

// Customer interface
export interface Customer {
    id: string;
    fullName: string;
    email?: string;
    phone?: string;
    address?: string;
    passportSeria?: string;
    birthDate?: string;
    note?: string;
    avatar?: string;
    marketId: string;
    status: 'active' | 'inactive';
    totalPurchases?: number;
    createdAt: string;
    updatedAt: string;
}

// Category interface
export interface Category {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    marketId: string;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

// Product interface
export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    originalPrice?: number;
    image?: string;
    categoryId: string;
    marketId: string;
    stock: number;
    status: ProductStatus;
    pricePlans?: PricePlan[];
    createdAt: string;
    updatedAt: string;
}

// Price Plan interface
export interface PricePlan {
    id: string;
    productId: string;
    name: string;
    termMonths: number;
    interestRate: number;
    totalPrice: number;
    monthlyPrice: number;
}

// Contract Item interface
export interface ContractItem {
    id: string;
    contractId: string;
    productId: string;
    productName: string;
    quantity: number;
    basePrice: number;
    totalPrice: number;
    monthlyPrice: number;
}

// Installment interface
export interface Installment {
    id: string;
    contractId: string;
    orderIndex: number;
    dueDate: string;
    amount: number;
    paidAmount: number;
    status: InstallmentStatus;
    paidAt?: string;
}

// Contract interface
export interface Contract {
    id: string;
    contractNumber: string;
    type: 'supplier' | 'customer' | 'service' | 'other';
    title: string;
    description?: string;
    status: ContractStatus;
    startDate: string;
    endDate?: string;
    marketId: string;
    customerId?: string;
    customer?: Customer;
    createdBy: string;
    items?: ContractItem[];
    installments?: Installment[];
    createdAt: string;
    updatedAt: string;
}

// Subscription interface
export interface Subscription {
    id: string;
    plan: 'free' | 'basic' | 'professional' | 'enterprise';
    status: 'active' | 'inactive' | 'cancelled';
    marketId: string;
    startDate: string;
    endDate?: string;
    price: number;
    features: string[];
    createdAt: string;
    updatedAt: string;
}

// Dashboard stats
export interface DashboardStats {
    totalMarkets: number;
    totalCustomers: number;
    totalRevenue: number;
    totalOrders: number;
    recentActivity: Activity[];
}

export interface Activity {
    id: string;
    type: 'order' | 'customer' | 'product' | 'market';
    title: string;
    description?: string;
    timestamp: string;
}
