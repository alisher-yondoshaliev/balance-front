# Role-Based System Implementation Guide

## Overview
This frontend implements a role-based access control (RBAC) system with separate flows for SUPERADMIN and OWNER/ADMIN/MANAGER/SELLER users.

## Architecture

### Key Concepts

1. **SUPERADMIN vs OWNER**
   - **SUPERADMIN**: System administrator with access to all markets globally
     - No market selection needed (reads all markets via `/api/markets/all`)
     - Sees global dashboard
     - Cannot operate without a specific market context
   
   - **OWNER/ADMIN/MANAGER/SELLER**: Market-specific users
     - Work with assigned markets (reads via `/api/markets`)
     - Must select a market to operate
     - See market-specific data

### Layouts

#### `SuperAdminLayout` (`src/components/layouts/SuperAdminLayout.tsx`)
- Used exclusively for SUPERADMIN users
- Shows SUPERADMIN_MENU (Markets, Users, Subscriptions, Dashboard, Settings)
- Header does NOT show market name
- Sidebar is role-specific

#### `OwnerLayout` (`src/components/layouts/OwnerLayout.tsx`)
- Used for OWNER, ADMIN, MANAGER, SELLER users
- Shows filtered menus based on user role
- Header shows selected market name (when a market is selected)
- Market selection logic is maintained

### Route Protection

#### Protected Routes (`src/components/protectedRoutes.tsx`)

**`<PrivateRoute>`**
- Basic authentication check
- Redirects unauthenticated users to `/login`
- Used in AuthLayout for private pages like change-password

**`<PublicRoute>`**
- Prevents authenticated users from accessing auth pages
- Redirects authenticated users to `/dashboard`
- Used for login, signup, OTP pages

**`<SuperAdminRoute>`**
- Only allows SUPERADMIN role
- Non-SUPERADMIN users redirected to `/dashboard` with OwnerLayout
- Wraps entire SuperAdminLayout

**`<OwnerOrAdminRoute>`**
- Allows OWNER, ADMIN, MANAGER, SELLER roles
- SUPERADMIN users redirected to `/dashboard` with SuperAdminLayout
- Wraps entire OwnerLayout

### Router Structure

```
Routes
├─ Public Routes (PublicRoute)
│  └─ AuthLayout
│     ├─ /login
│     ├─ /send-otp
│     ├─ /verify-otp
│     ├─ /register
│     └─ /auth/google/callback
│
├─ Private Auth Routes (PrivateRoute)
│  └─ AuthLayout
│     └─ /change-password
│
├─ SUPERADMIN Routes (SuperAdminRoute)
│  └─ SuperAdminLayout
│     ├─ /dashboard (superadmin dashboard)
│     ├─ /profile
│     ├─ /markets (all markets, read-only or admin operations)
│     ├─ /users
│     └─ /subscriptions
│
└─ OWNER/ADMIN/MANAGER/SELLER Routes (OwnerOrAdminRoute)
   └─ OwnerLayout
      ├─ /dashboard
      ├─ /profile
      ├─ /markets (user's own markets)
      ├─ /users
      ├─ /customers
      ├─ /products
      ├─ /categories
      ├─ /contracts
      └─ /subscriptions
```

### Menu Configuration

#### `src/config/menuConfig.ts`

**`SUPERADMIN_MENU`**
- Dashboard
- Barcha Marketlar (All Markets)
- Foydalanuvchilar (Users)
- Obuna Rejalar (Subscription Plans)
- Sozlamalar (Settings)

**`OWNER_MENU`**
- Filtered based on user role
- Includes market-specific items
- Subscription only for OWNER

### API Endpoints by Role

#### Markets
- **SUPERADMIN**: `GET /api/markets/all` → All markets
- **OWNER**: `GET /api/markets` → Owner's markets
- **Status management**: `PATCH /api/markets/:id/status` → SUPERADMIN only

#### Users & Subscriptions
- **SUPERADMIN**: Full CRUD
- **OWNER**: Share access with selected market

#### Dashboard
- **SUPERADMIN**: Global summary
- **OWNER/ADMIN/MANAGER**: Market-specific summary

## Data Flow

### Login Flow
```
1. User enters credentials
2. API returns: { user, accessToken, refreshToken }
3. AuthStore.setAuth() stores tokens and user info
4. Tokens stored in localStorage (via interceptor)
5. User redirected to /dashboard
6. Router checks user.role → SuperAdminRoute or OwnerOrAdminRoute
7. Appropriate layout rendered
```

### App Initialization
```
1. App mounts
2. useAuthInit hook executes
3. Checks if user is authenticated
4. Calls GET /api/auth/me to verify and refresh user data
5. For SUPERADMIN: clears selectedMarket
6. For OWNER: keeps selectedMarket if available
7. Updates AuthStore.user with fresh data
```

### Market Selection (OWNER flow)
```
1. OWNER navigates to /markets
2. MarketsPage fetches: GET /api/markets
3. User clicks on a market card
4. selectedMarket stored in MarketStore
5. Header shows selected market name
6. All subsequent operations use selectedMarket context
```

### Market Display (SUPERADMIN flow)
```
1. SUPERADMIN navigates to /markets
2. MarketsPage displays title: "Barcha Marketlar" (All Markets)
3. MarketsPage fetches: GET /api/markets/all
4. Cards are view-only (no selection click)
5. SUPERADMIN can manage status (if implemented)
6. No market context needed for other pages
```

## Key Files

### Utilities
- `src/utils/roles.ts` - Role helpers and constants
- `src/config/menuConfig.ts` - Menu configurations by role
- `src/hooks/useAuthInit.ts` - Auth initialization on app load

### Layouts
- `src/components/layouts/CommonHeader.tsx` - Shared header (market name hidden for SUPERADMIN)
- `src/components/layouts/CommonSidebar.tsx` - Shared sidebar (menus by role)
- `src/components/layouts/SuperAdminLayout.tsx` - SUPERADMIN layout
- `src/components/layouts/OwnerLayout.tsx` - OWNER/ADMIN/MANAGER/SELLER layout

### Route Protection
- `src/components/protectedRoutes.tsx` - All route guard components

### Stores
- `src/store/auth.store.ts` - User, tokens, authentication state
- `src/store/market.store.ts` - Selected market (null for SUPERADMIN)

### Router
- `src/router/index.tsx` - Main routing configuration with role-based layouts

## Important Notes

1. **Market Selection for SUPERADMIN**: Intentionally cleared to prevent confusion. SUPERADMIN doesn't operate with market context.

2. **Header Market Display**: Only shown for OWNER/ADMIN/MANAGER/SELLER when `selectedMarket` is not null.

3. **Backward Compatibility**: Old `DashboardLayout` is kept but not used in router. Can be removed in future cleanup.

4. **Protected Routes Check**: Both layout level (SuperAdminRoute, OwnerOrAdminRoute) AND individual page routes should validate role if needed.

5. **API Interceptor**: Token refresh and Authorization header handling already in place via `src/api/axios.ts`.

## Testing Role-Based Access

### SUPERADMIN Testing
1. Login as SUPERADMIN
2. Verify layout is SuperAdminLayout
3. Verify header doesn't show market name
4. Verify sidebar shows SUPERADMIN_MENU
5. Navigate to /markets → shows "Barcha Marketlar"
6. Verify GET /api/markets/all is called

### OWNER Testing
1. Login as OWNER
2. Verify layout is OwnerLayout
3. Navigate to /markets
4. Select a market
5. Verify header shows selected market name
6. Verify GET /api/markets is called
7. Navigate to other pages → market context is maintained

## Future Enhancements

- [ ] Status management dropdown for SUPERADMIN on markets
- [ ] Settings page for SUPERADMIN
- [ ] Role-specific dashboard summaries
- [ ] Audit logging by role
- [ ] Permission matrix UI for SUPERADMIN
