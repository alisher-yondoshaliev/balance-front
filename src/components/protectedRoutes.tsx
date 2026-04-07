import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { isSuperAdmin } from '../../utils/roles';
import type { Role } from '../../types';

interface RoleBasedRouteProps {
    children: React.ReactNode;
    allowedRoles: Role[];
}

export function RoleBasedRoute({ children, allowedRoles }: RoleBasedRouteProps) {
    const { user, isAuthenticated } = useAuthStore();

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        if (isSuperAdmin(user.role)) {
            return <Navigate to="/dashboard" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}

interface SuperAdminRouteProps {
    children: React.ReactNode;
}

export function SuperAdminRoute({ children }: SuperAdminRouteProps) {
    const { user, isAuthenticated } = useAuthStore();

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    if (!isSuperAdmin(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}

interface OwnerOrAdminRouteProps {
    children: React.ReactNode;
}

export function OwnerOrAdminRoute({ children }: OwnerOrAdminRouteProps) {
    const { user, isAuthenticated } = useAuthStore();

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    if (isSuperAdmin(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    if (!['OWNER', 'ADMIN', 'MANAGER', 'SELLER'].includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}

interface PrivateRouteProps {
    children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
    const { isAuthenticated } = useAuthStore();
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

interface PublicRouteProps {
    children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
    const { isAuthenticated } = useAuthStore();
    return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
}
