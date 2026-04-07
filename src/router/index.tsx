import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import SuperAdminLayout from '../components/layouts/SuperAdminLayout';
import OwnerLayout from '../components/layouts/OwnerLayout';

// Route Protectors
import {
    PrivateRoute,
    PublicRoute,
    SuperAdminRoute,
    OwnerOrAdminRoute,
} from '../components/protectedRoutes';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import SendOtpPage from '../pages/auth/SendOtpPage';
import VerifyOtpPage from '../pages/auth/VerifyOtpPage';
import RegisterPage from '../pages/auth/RegisterPage';
import GoogleCallbackPage from '../pages/auth/GoogleCallbackPage';
import ChangePasswordPage from '../pages/auth/ChangePasswordPage';

// Dashboard Pages
import DashboardPage from '../pages/dashboard/DashboardPage';

// Markets
import MarketsPage from '../pages/markets/MarketsPage';
import MarketDetailPage from '../pages/markets/MarketDetailPage';

// Users
import UsersPage from '../pages/users/UsersPage';

// Customers
import CustomersPage from '../pages/customers/CustomersPage';
import CustomerDetailPage from '../pages/customers/CustomerDetailPage';

// Products
import ProductsPage from '../pages/products/ProductsPage';
import ProductDetailPage from '../pages/products/ProductDetailPage';

// Categories
import CategoriesPage from '../pages/categories/CategoriesPage';

// Contracts
import ContractsPage from '../pages/contracts/ContractsPage';
import ContractDetailPage from '../pages/contracts/ContractDetailPage';
import CreateContractPage from '../pages/contracts/CreateContractPage';

// Subscriptions
import SubscriptionsPage from '../pages/subscriptions/SubscriptionsPage';

// Profile
import ProfilePage from '../pages/profile/ProfilePage';

export default function AppRouter() {
    return (
        <Routes>
            {/* ============ Public Auth Routes ============ */}
            <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/send-otp" element={<SendOtpPage />} />
                <Route path="/verify-otp" element={<VerifyOtpPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
            </Route>

            {/* ============ Private Auth Routes ============ */}
            <Route element={<PrivateRoute><AuthLayout /></PrivateRoute>}>
                <Route path="/change-password" element={<ChangePasswordPage />} />
            </Route>

            {/* ============ SUPERADMIN Routes ============ */}
            <Route element={<SuperAdminRoute><SuperAdminLayout /></SuperAdminRoute>}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/markets" element={<MarketsPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/subscriptions" element={<SubscriptionsPage />} />
            </Route>

            {/* ============ OWNER/ADMIN/MANAGER/SELLER Routes ============ */}
            <Route element={<OwnerOrAdminRoute><OwnerLayout /></OwnerOrAdminRoute>}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/markets" element={<MarketsPage />} />
                <Route path="/markets/:id" element={<MarketDetailPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/customers/:id" element={<CustomerDetailPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/contracts" element={<ContractsPage />} />
                <Route path="/contracts/create" element={<CreateContractPage />} />
                <Route path="/contracts/:id" element={<ContractDetailPage />} />
                <Route path="/subscriptions" element={<SubscriptionsPage />} />
            </Route>

            {/* ============ Catch All & Redirects ============ */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}