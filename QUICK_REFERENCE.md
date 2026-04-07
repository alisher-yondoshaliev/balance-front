# Role-Based System - Quick Reference Guide

## Quick Facts

| Aspect | SUPERADMIN | OWNER/ADMIN/MANAGER/SELLER |
|--------|-----------|---------------------------|
| **Layout** | SuperAdminLayout | OwnerLayout |
| **Route Guard** | SuperAdminRoute | OwnerOrAdminRoute |
| **Access** | All global data | Market-specific data |
| **Header** | "Balance" | "Balance" + market name |
| **Market Selection** | Not available | Available when needed |
| **Menu Items** | 5 items (admin-focused) | 8+ items (market-focused) |
| **Markets API** | GET /api/markets/all | GET /api/markets |
| **Can Create Markets** | No | Yes (OWNER only) |
| **Can Manage Status** | Yes | No |

---

## API Quick Reference

### Role Detection
```typescript
import { isSuperAdmin, isOwner, isAdmin, isManager, isSeller } from '@/utils/roles';

const { user } = useAuthStore();

if (isSuperAdmin(user?.role)) {
  // Show SUPERADMIN UI
}
```

### Menu for Current Role
```typescript
import { getMenuForRole } from '@/config/menuConfig';

const { user } = useAuthStore();
const menu = getMenuForRole(user?.role);
// Returns appropriate menu items
```

### Market Context
```typescript
import { useMarketStore } from '@/store/market.store';

const { selectedMarket, setSelectedMarket, clearMarket } = useMarketStore();

// SUPERADMIN: selectedMarket will always be null
// OWNER: selectedMarket is set after user clicks a market
```

### Protected Routes
```typescript
import { 
  PrivateRoute, 
  PublicRoute, 
  SuperAdminRoute, 
  OwnerOrAdminRoute,
  RoleBasedRoute 
} from '@/components/protectedRoutes';

// In router:
<Route element={<SuperAdminRoute><SuperAdminLayout /></SuperAdminRoute>}>
  {/* Only SUPERADMIN can access */}
</Route>

<Route element={<OwnerOrAdminRoute><OwnerLayout /></OwnerOrAdminRoute>}>
  {/* Only OWNER/ADMIN/MANAGER/SELLER can access */}
</Route>

<Route element={<RoleBasedRoute allowedRoles={['OWNER', 'ADMIN']}>
  {/* Custom role check */}
</RoleBasedRoute>}
```

---

## Common Patterns

### Pattern 1: Conditional Rendering by Role
```typescript
import { isSuperAdmin } from '@/utils/roles';
import { useAuthStore } from '@/store/auth.store';

export function MyComponent() {
  const { user } = useAuthStore();

  return (
    <div>
      {isSuperAdmin(user?.role) ? (
        <div>SUPERADMIN content</div>
      ) : (
        <div>Regular user content</div>
      )}
    </div>
  );
}
```

### Pattern 2: Role-Based API Calls
```typescript
import { marketsApi } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { isSuperAdmin } from '@/utils/roles';
import { useAuthStore } from '@/store/auth.store';

export function MarketsComponent() {
  const { user } = useAuthStore();

  const { data: markets } = useQuery({
    queryKey: ['markets'],
    queryFn: () =>
      isSuperAdmin(user?.role)
        ? marketsApi.getAll() // GET /api/markets/all
        : marketsApi.getMyMarkets(), // GET /api/markets
  });
}
```

### Pattern 3: Market-Dependent Queries
```typescript
import { useMarketStore } from '@/store/market.store';
import { useQuery } from '@tanstack/react-query';
import { customersApi } from '@/api';

export function CustomersComponent() {
  const { selectedMarket } = useMarketStore();

  const { data: customers } = useQuery({
    queryKey: ['customers', selectedMarket?.id],
    queryFn: () => customersApi.getByMarket(selectedMarket!.id),
    enabled: !!selectedMarket, // Only fetch when market is selected
  });
}
```

### Pattern 4: Adding Menu Items Per Role
```typescript
// In src/config/menuConfig.ts

// Add new item to OWNER_MENU
export const OWNER_MENU: MenuItem[] = [
  // ... existing items
  { 
    title: 'Reports', 
    path: '/reports',
    icon: <ReportIcon />,
    roles: ['OWNER', 'ADMIN'] // Only these roles see it
  },
];

// For SUPERADMIN only:
export const SUPERADMIN_MENU: MenuItem[] = [
  // ... existing items
  { 
    title: 'System Health', 
    path: '/system-health',
    icon: <HealthIcon />,
    roles: ['SUPERADMIN']
  },
];
```

### Pattern 5: Creating a New Page (Role-Protected)
```typescript
// src/pages/reports/ReportsPage.tsx
import { useAuthStore } from '@/store/auth.store';
import { isManager } from '@/utils/roles';

export default function ReportsPage() {
  const { user } = useAuthStore();

  // This is already protected by router, but can double-check
  if (!isManager(user?.role) && !['OWNER', 'ADMIN'].includes(user?.role || '')) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    // Component content
  );
}

// In router:
import ReportsPage from '@/pages/reports/ReportsPage';

<Route element={<OwnerOrAdminRoute><OwnerLayout /></OwnerOrAdminRoute>}>
  <Route path="/reports" element={<ReportsPage />} />
</Route>
```

---

## Debugging Tips

### Check User Role
```typescript
// In browser console
localStorage.getItem('auth-storage') // See stored auth state
// Look for: "role": "SUPERADMIN" or "role": "OWNER"
```

### Check Selected Market
```typescript
// In browser console
localStorage.getItem('market-storage')
// Should be null for SUPERADMIN
// Should have market ID for OWNER with selection
```

### Trace API Calls
```typescript
// In browser DevTools → Network tab
// Check these requests:
// 1. POST /api/auth/login (login)
// 2. GET /api/auth/me (app init)
// 3. GET /api/markets/all (SUPERADMIN)
// 4. GET /api/markets (OWNER)
```

### Monitor Route Protection
```typescript
// In browser console
// Set breakpoint in protectedRoutes.tsx functions
// Check if SuperAdminRoute/OwnerOrAdminRoute are blocking correctly
```

---

## Common Issues & Solutions

### Issue: SUPERADMIN sees market name in header
**Solution:** Check that CommonHeader uses `!isSuperAdmin(user?.role)` condition
```typescript
// CommonHeader.tsx
{!isSuperAdmin(user?.role) && selectedMarket && (
  <Typography>{selectedMarket.name}</Typography>
)}
```

### Issue: SUPERADMIN can select markets
**Solution:** Verify MarketsPage onClick is disabled:
```typescript
onClick={() => !isSuperAdmin(user?.role) && setSelectedMarket(market)}
```

### Issue: Wrong API endpoint is called
**Solution:** Check MarketsPage uses correct function:
```typescript
queryFn: () =>
  isSuperAdmin(user?.role)
    ? marketsApi.getAll() // ✓ All markets
    : marketsApi.getMyMarkets(), // ✓ My markets only
```

### Issue: Routes don't redirect properly
**Solution:** Verify route protection:
```typescript
// Router should have:
<Route element={<SuperAdminRoute><SuperAdminLayout /></SuperAdminRoute>}>
  {/* SUPERADMIN ONLY routes */}
</Route>

<Route element={<OwnerOrAdminRoute><OwnerLayout /></OwnerOrAdminRoute>}>
  {/* OWNER routes */}
</Route>
```

### Issue: Market selection doesn't persist
**Solution:** Ensure MarketStore uses persist middleware:
```typescript
// shop/market.store.ts
export const useMarketStore = create<MarketState>()(
  persist(
    (set) => ({ /* ... */ }),
    { name: 'market-storage' } // ← Enables persistence
  ),
);
```

---

## Testing Helper Commands

### Test SUPERADMIN Flow
```typescript
// In browser console, after login as SUPERADMIN
const authState = JSON.parse(localStorage.getItem('auth-storage') || '{}');
console.log('Role:', authState.state.user.role); // → "SUPERADMIN"

const marketState = JSON.parse(localStorage.getItem('market-storage') || '{}');
console.log('Selected Market:', marketState.state.selectedMarket); // → null
```

### Test OWNER Flow
```typescript
// After login as OWNER and selecting market
const authState = JSON.parse(localStorage.getItem('auth-storage') || '{}');
console.log('Role:', authState.state.user.role); // → "OWNER"

const marketState = JSON.parse(localStorage.getItem('market-storage') || '{}');
console.log('Market:', marketState.state.selectedMarket.name); // → "Market Name"
```

### Force Layout Re-render
```typescript
// If layout doesn't update, force refresh
// In browser console
location.href = '/dashboard'; // Redirect and reload
```

---

## File Location Quick Map

```
src/
├── api/
│   └── endpoints/
│       └── auth.api.ts ← getMe() for user role
│
├── components/
│   ├── layouts/
│   │   ├── CommonHeader.tsx ← Shared header
│   │   ├── CommonSidebar.tsx ← Shared sidebar
│   │   ├── SuperAdminLayout.tsx ← SUPERADMIN layout
│   │   └── OwnerLayout.tsx ← OWNER layout
│   └── protectedRoutes.tsx ← Route protection guards
│
├── config/
│   └── menuConfig.ts ← Menu items by role
│
├── hooks/
│   └── useAuthInit.ts ← Auth initialization
│
├── pages/
│   ├── markets/
│   │   └── MarketsPage.tsx ← Role-based markets logic
│   └── ...
│
├── router/
│   └── index.tsx ← Role-based route structure
│
├── store/
│   ├── auth.store.ts ← User role state
│   └── market.store.ts ← Selected market state
│
├── utils/
│   └── roles.ts ← Role helper functions
│
└── App.tsx ← useAuthInit hook
```

---

## Key Takeaways

1. **SUPERADMIN** = System-level admin, no market context needed
2. **OWNER/ADMIN/MANAGER/SELLER** = Market-specific users
3. **Layout determines what user sees** (header, sidebar, available pages)
4. **Routes are protected** at the layout level
5. **APIs adapt** based on role (getAll vs getMyMarkets)
6. **Market selection is OWNER-only** feature
7. **Use role helpers** not string comparisons: `isSuperAdmin()` not `=== 'SUPERADMIN'`
8. **Menu is centralized** in menuConfig.ts - easy to modify per role

---

## Need Help?

Refer to these docs in order:
1. **Quick Reference** (this file) - Fast lookup
2. **ROLE_BASED_SYSTEM.md** - Architecture overview
3. **ROLE_BASED_EXAMPLES.md** - Specific examples
4. **ROLE_BASED_IMPLEMENTATION.md** - What changed and why
5. **DEPLOYMENT_CHECKLIST.md** - Testing and deployment
