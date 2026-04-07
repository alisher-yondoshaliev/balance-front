export type Role = 'SUPERADMIN' | 'OWNER' | 'ADMIN' | 'MANAGER' | 'SELLER';
export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'INACTIVE' | 'EXPIRED';
export type MarketStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'EXPIRED' | 'PENDING';
export type ContractStatus = 'DRAFT' | 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';
export type InstallmentStatus = 'PENDING' | 'DUE' | 'PAID' | 'OVERDUE' | 'PARTIAL';
export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: Role;
  status: UserStatus;
  marketId?: string;
  subEndDate?: string;
  createdAt: string;
}

export interface Market {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  status: MarketStatus;
  ownerId: string;
  createdAt: string;
}

export interface Category {
  id: string;
  marketId: string;
  name: string;
  imageUrl?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  marketId: string;
  categoryId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  stock: number;
  basePrice: number;
  status: ProductStatus;
  category?: Category;
  pricePlans?: PricePlan[];
}

export interface PricePlan {
  id: string;
  productId: string;
  termMonths: number;
  interestRate: number;
  totalPrice: number;
  monthlyPrice: number;
}

export interface Customer {
  id: string;
  marketId: string;
  fullName: string;
  phone: string;
  address?: string;
  passportSeria?: string;
  birthDate?: string;
  note?: string;
  createdAt: string;
}

export interface Contract {
  id: string;
  contractNumber: string;
  marketId: string;
  customerId: string;
  staffId: string;
  termMonths: number;
  downPayment: number;
  totalAmount: number;
  monthlyAmount: number;
  paidAmount: number;
  remainAmount: number;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  note?: string;
  customer?: Customer;
  items?: ContractItem[];
  installments?: Installment[];
}

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

export interface SubscriptionPlan {
  id: string;
  name: string;
  duration: number;
  price: number;
  description?: string;
  isActive: boolean;
}