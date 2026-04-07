import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import PublicLayout from '../layouts/PublicLayout';

// Route Protectors
import {
    PrivateRoute,
    PublicRoute,
    RoleBasedRoute
} from '../components/protectedRoutes';

// Landing Page
import LandingPage from '../pages/landing/LandingPage';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import SendOtpPage from '../pages/auth/SendOtpPage';
import VerifyOtpPage from '../pages/auth/VerifyOtpPage';
import RegisterPage from '../pages/auth/RegisterPage';
import GoogleCallbackPage from '../pages/auth/GoogleCallbackPage';
import ChangePasswordPage from '../pages/auth/ChangePasswordPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ForgotPasswordVerifyPage from '../pages/auth/ForgotPasswordVerifyPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

// Dashboard Pages
import DashboardPage from '../pages/dashboard/DashboardPage';

// Markets
import MarketsPage from '../pages/markets/MarketsPage';
import MarketDetailPage from '../pages/markets/MarketDetailPage';

// Users
import UsersPage from '../pages/users/UsersPage';
import EmployeesPage from '../pages/employees/EmployeesPage';

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

/**
 * Root redirect logic - redirects based on auth state
 */
function RootRedirect() {
    const { isAuthenticated } = useAuthStore();
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />;
}

/**
 * Main Router Component
 * Organizes routes into:
 * 1. Public landing page
 * 2. Public auth pages
 * 3. Private authenticated pages
 * 4. Catch-all redirect
 */
export default function AppRouter() {
    return (
        <Routes>
            {/* ============ Landing Page ============ */}
            <Route
                path="/"
                element={
                    <PublicRoute>
                        <PublicLayout />
                    </PublicRoute>
                }
            >
                <Route index element={<LandingPage />} />
            </Route>

            {/* ============ Public Auth Routes ============ */}
            <Route
                element={
                    <PublicRoute>
                        <AuthLayout />
                    </PublicRoute>
                }
            >
                <Route path="/login" element={<LoginPage />} />
                <Route path="/send-otp" element={<SendOtpPage />} />
                <Route path="/verify-otp" element={<VerifyOtpPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/forgot-password/verify" element={<ForgotPasswordVerifyPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* ============ Private Auth Routes ============ */}
            <Route
                element={
                    <PrivateRoute>
                        <AuthLayout />
                    </PrivateRoute>
                }
            >
                <Route path="/change-password" element={<ChangePasswordPage />} />
            </Route>

            {/* ============ Dashboard Routes (All require auth) ============ */}
            <Route
                element={
                    <PrivateRoute>
                        <DashboardLayout />
                    </PrivateRoute>
                }
            >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />

                {/* Markets - Available for SUPERADMIN, OWNER, ADMIN */}
                <Route
                    path="/markets"
                    element={
                        <RoleBasedRoute allowedRoles={['SUPERADMIN', 'OWNER', 'ADMIN']}>
                            <MarketsPage />
                        </RoleBasedRoute>
                    }
                />
                <Route
                    path="/markets/:id"
                    element={
                        <RoleBasedRoute allowedRoles={['SUPERADMIN', 'OWNER', 'ADMIN']}>
                            <MarketDetailPage />
                        </RoleBasedRoute>
                    }
                />

                {/* Market Users - Available for SUPERADMIN, OWNER, ADMIN */}
                <Route
                    path="/markets/:marketId/users"
                    element={
                        <RoleBasedRoute allowedRoles={['SUPERADMIN', 'OWNER', 'ADMIN']}>
                            <UsersPage />
                        </RoleBasedRoute>
                    }
                />

                {/* Employees by Selected Market - Available for SUPERADMIN, OWNER, ADMIN */}
                <Route
                    path="/employees"
                    element={
                        <RoleBasedRoute allowedRoles={['SUPERADMIN', 'OWNER', 'ADMIN']}>
                            <EmployeesPage />
                        </RoleBasedRoute>
                    }
                />

                {/* System Users - Available for SUPERADMIN, OWNER */}
                <Route
                    path="/users"
                    element={
                        <RoleBasedRoute allowedRoles={['SUPERADMIN', 'OWNER']}>
                            <UsersPage />
                        </RoleBasedRoute>
                    }
                />

                {/* Customers - Available for most roles */}
                <Route
                    path="/customers"
                    element={
                        <RoleBasedRoute allowedRoles={['SUPERADMIN', 'OWNER', 'ADMIN', 'MANAGER']}>
                            <CustomersPage />
                        </RoleBasedRoute>
                    }
                />
                <Route
                    path="/customers/:id"
                    element={
                        <RoleBasedRoute allowedRoles={['SUPERADMIN', 'OWNER', 'ADMIN', 'MANAGER']}>
                            <CustomerDetailPage />
                        </RoleBasedRoute>
                    }
                />

                {/* Products - Available for most roles */}
                <Route
                    path="/products"
                    element={
                        <RoleBasedRoute allowedRoles={['SUPERADMIN', 'OWNER', 'ADMIN', 'MANAGER']}>
                            <ProductsPage />
                        </RoleBasedRoute>
                    }
                />
                <Route
                    path="/products/:id"
                    element={
                        <RoleBasedRoute allowedRoles={['SUPERADMIN', 'OWNER', 'ADMIN', 'MANAGER']}>
                            <ProductDetailPage />
                        </RoleBasedRoute>
                    }
                />

                {/* Categories - Available for SUPERADMIN, OWNER, ADMIN */}
                <Route
                    path="/categories"
                    element={
                        <RoleBasedRoute allowedRoles={['SUPERADMIN', 'OWNER', 'ADMIN']}>
                            <CategoriesPage />
                        </RoleBasedRoute>
                    }
                />

                {/* Contracts - Available for SUPERADMIN, OWNER, ADMIN */}
                <Route
                    path="/contracts"
                    element={
                        <RoleBasedRoute allowedRoles={['SUPERADMIN', 'OWNER', 'ADMIN']}>
                            <ContractsPage />
                        </RoleBasedRoute>
                    }
                />
                <Route
                    path="/contracts/create"
                    element={
                        <RoleBasedRoute allowedRoles={['SUPERADMIN', 'OWNER', 'ADMIN']}>
                            <CreateContractPage />
                        </RoleBasedRoute>
                    }
                />
                <Route
                    path="/contracts/:id"
                    element={
                        <RoleBasedRoute allowedRoles={['SUPERADMIN', 'OWNER', 'ADMIN']}>
                            <ContractDetailPage />
                        </RoleBasedRoute>
                    }
                />

                {/* Subscriptions - Available for SUPERADMIN, OWNER, ADMIN */}
                <Route
                    path="/subscriptions"
                    element={
                        <RoleBasedRoute allowedRoles={['SUPERADMIN', 'OWNER', 'ADMIN']}>
                            <SubscriptionsPage />
                        </RoleBasedRoute>
                    }
                />
            </Route>

            {/* ============ Catch All & Redirects ============ */}
            <Route path="*" element={<RootRedirect />} />
        </Routes>
    );
}