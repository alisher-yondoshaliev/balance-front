# Role-Based System - Working Examples

## Scenario 1: SUPERADMIN User Login

### Step 1: Login
```typescript
// User enters credentials
email: "admin@company.com"
password: "password123"
```

### Step 2: API Response
```json
{
  "user": {
    "id": "admin-123",
    "fullName": "System Administrator",
    "email": "admin@company.com",
    "role": "SUPERADMIN"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Step 3: Store Update
```typescript
// AuthStore.setAuth() called with:
- user: { id: "admin-123", role: "SUPERADMIN", ... }
- accessToken: "eyJhbGc..."
- refreshToken: "eyJhbGc..."

// Tokens saved to localStorage via interceptor
localStorage.accessToken = "eyJhbGc..."
localStorage.refreshToken = "eyJhbGc..."
```

### Step 4: App Init
```typescript
// App mounts
// useAuthInit() hook runs

// Calls GET /api/auth/me
// Response: { user: { role: "SUPERADMIN", ... } }

// Updates AuthStore.user
// Clears selectedMarket (via clearMarket())
useMarketStore.selectedMarket = null
```

### Step 5: Router Decision
```typescript
// Router checks user role
// user.role === "SUPERADMIN" → SuperAdminRoute passes
// User NOT in "OWNER|ADMIN|MANAGER|SELLER" → OwnerOrAdminRoute redirects

// SuperAdminLayout rendered with SUPERADMIN_MENU
```

### Step 6: Layout Rendering
```
SuperAdminLayout
├─ CommonHeader
│  ├─ Shows: "Balance" (no market name)
│  ├─ User avatar with dropdown
│  └─ Profile/Logout menu
├─ CommonSidebar
│  ├─ Dashboard
│  ├─ Barcha Marketlar (All Markets)
│  ├─ Foydalanuvchilar (Users)
│  ├─ Obuna Rejalar (Subscription Plans)
│  └─ Sozlamalar (Settings)
└─ Main Content (Outlet)
```

### Step 7: Navigate to Markets
```typescript
// User clicks "Barcha Marketlar" in sidebar
// navigate("/markets")

// MarketsPage renders

// MarketsPage checks:
isSuperAdmin(user?.role) === true

// Fetches using:
marketsApi.getAll()
// → GET /api/markets/all

// Response: [ { markets... } ]
// Displays all markets in read-only cards
// No card selection functionality (click disabled)
// No "Market qo'shish" button (only for OWNER)
```

---

## Scenario 2: OWNER User Login

### Step 1: Login
```typescript
email: "owner@market1.com"
password: "password123"
```

### Step 2: API Response
```json
{
  "user": {
    "id": "owner-456",
    "fullName": "Market Owner",
    "email": "owner@market1.com",
    "role": "OWNER",
    "marketId": "market-1"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Step 3: Store Update
```typescript
// AuthStore.setAuth() called
// MarketStore.selectedMarket left as null initially
// (Will be set when user navigates to markets)
```

### Step 4: App Init
```typescript
// useAuthInit() hook runs

// Calls GET /api/auth/me
// Response: { user: { role: "OWNER", ... } }

// Updates AuthStore.user
// isSuperAdmin(user.role) === false → Does NOT clear market
// selectedMarket remains as is (null or persisted value)
```

### Step 5: Router Decision
```typescript
// Router checks user role
// user.role === "OWNER" → OwnerOrAdminRoute passes
// OwnersLayout rendered with filtered OWNER_MENU
```

### Step 6: Layout Rendering
```
OwnerLayout
├─ CommonHeader
│  ├─ Shows: "Balance" + selected market name (if any)
│  ├─ User avatar with dropdown
│  └─ Profile/Logout menu
├─ CommonSidebar
│  ├─ Dashboard
│  ├─ Marketim (My Markets)
│  ├─ Foydalanuvchilar (Users)
│  ├─ Mijozlar (Customers)
│  ├─ Kategoriyalar (Categories)
│  ├─ Mahsulotlar (Products)
│  ├─ Shartnomalar (Contracts)
│  └─ Obuna (Subscriptions)
└─ Main Content (Outlet)
```

### Step 7: Navigate to Markets
```typescript
// User clicks "Marketim" in sidebar
// navigate("/markets")

// MarketsPage renders

// MarketsPage checks:
isSuperAdmin(user?.role) === false
// pageTitle = "Marketlar" (not "Barcha Marketlar")

// Fetches using:
marketsApi.getMyMarkets()
// → GET /api/markets

// Response: [ { id: "market-1", name: "Market 1", ... } ]
// Displays market cards with selection functionality
// Shows "Market qo'shish" button
```

### Step 8: Select Market
```typescript
// User clicks on market card
// Card onClick handler triggers

// setSelectedMarket(market) called
// MarketStore.selectedMarket = { id: "market-1", name: "Market 1", ... }
// Card shows "Tanlangan" (Selected) badge

// Header now shows:
// "Balance"
// "Market 1" (market name displayed below)
```

### Step 9: Navigate to Other Pages
```typescript
// User clicks "Mihozlar" (Customers)
// navigate("/customers")

// CustomersPage renders
// Can access useMarketStore.selectedMarket
// Queries only fetch data for that market

// Example:
const { selectedMarket } = useMarketStore();
const { data: customers } = useQuery({
  queryKey: ['customers', selectedMarket?.id],
  queryFn: () => customersApi.getByMarket(selectedMarket!.id)
})
```

---

## Scenario 3: Role-Based Route Blocking

### SUPERADMIN trying to access OWNER page
```typescript
// SUPERADMIN navigates to /products
// Router evaluates routes

// SuperAdminRoute wraps paths: /dashboard, /markets, /users, /subscriptions
// /products is in OwnerOrAdminRoute (different route)

// OwnerOrAdminRoute.tsx checks:
- isAuthenticated? YES
- user.role in ['OWNER', 'ADMIN', 'MANAGER', 'SELLER']? NO

// Redirects to /dashboard
// SuperAdminLayout renders instead
```

### OWNER trying to access SUPERADMIN only feature
```typescript
// OWNER navigates to /users
// Router evaluates routes

// OwnerOrAdminRoute wraps /users for OWNER
// OWNER has access to /users

// But /subscriptions (admin plans) might have role check inside:
const { user } = useAuthStore();
if (isSuperAdmin(user?.role)) {
  // Show admin features
} else {
  // Show user features or deny access
}
```

---

## API Calls Example Flow

### SUPERADMIN Flow
```
Login
  ↓
GET /api/auth/me → { role: "SUPERADMIN" }
  ↓
Navigate to /markets
  ↓
GET /api/markets/all → [ all markets ]
  ↓
Navigate to /users
  ↓
GET /api/users → [ all users ]
  ↓
API calls use Authorization: Bearer token
  ↓
Header: "Balance" (no market context)
```

### OWNER Flow
```
Login
  ↓
GET /api/auth/me → { role: "OWNER", marketId: "market-1" }
  ↓
Navigate to /markets
  ↓
GET /api/markets → [ market-1 ]
  ↓
Click market → setSelectedMarket(market-1)
  ↓
Navigate to /customers
  ↓
GET /api/customers?marketId=market-1 → [ customers for market-1 ]
  ↓
API calls use:
  - Authorization: Bearer token
  - marketId from context
  ↓
Header: "Balance" + "Market 1"
```

---

## Key Differences Summary

| Feature | SUPERADMIN | OWNER |
|---------|-----------|-------|
| Layout | SuperAdminLayout | OwnerLayout |
| Market in Header | ✗ No | ✓ Yes (if selected) |
| Markets API | GET /api/markets/all | GET /api/markets |
| Market Selection | ✗ No | ✓ Yes |
| Menu Items | 5 items (admin focused) | 8+ items (market focused) |
| Market Context | None | Required (except dashboard) |
| Can Create Markets | ✗ No | ✓ Yes |
| Can Manage Status | ✓ Yes | ✗ No |
| Users Page | All users | Market users only |
| Subscriptions | Manage plans | Purchase/manage subs |

---

## Testing Checklist

### SUPERADMIN
- [ ] Login as SUPERADMIN
- [ ] Verify SuperAdminLayout renders
- [ ] Header does NOT show market name
- [ ] Sidebar shows 5 items (Dashboard, Barcha Marketlar, Foydalanuvchilar, Obuna Rejalar, Sozlamalar)
- [ ] Click "Barcha Marketlar" → /markets page shows all markets
- [ ] Cards cannot be selected (no click highlight)
- [ ] No "Market qo'shish" button

### OWNER
- [ ] Login as OWNER
- [ ] Verify OwnerLayout renders
- [ ] Navigate to /markets
- [ ] Click on a market card
- [ ] Header shows market name
- [ ] Card shows "Tanlangan" badge
- [ ] Navigate to /customers
- [ ] Data shown is for selected market only

### Route Protection
- [ ] SUPERADMIN access /customers → redirected to /dashboard
- [ ] OWNER cannot see /subscriptions → greyed out or not shown
- [ ] Session logout → redirected to /login
- [ ] Access /dashboard without auth → redirected to /login
