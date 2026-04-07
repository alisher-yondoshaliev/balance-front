# Role-Based System - Deployment Checklist

## Pre-Deployment Verification

### ✅ Files Created
- [x] `src/utils/roles.ts` - Role constants and helpers
- [x] `src/config/menuConfig.ts` - Menu configurations by role
- [x] `src/components/layouts/CommonHeader.tsx` - Shared header component
- [x] `src/components/layouts/CommonSidebar.tsx` - Shared sidebar component
- [x] `src/components/layouts/SuperAdminLayout.tsx` - SUPERADMIN layout
- [x] `src/components/layouts/OwnerLayout.tsx` - OWNER/ADMIN/MANAGER/SELLER layout
- [x] `src/components/protectedRoutes.tsx` - Route protection components
- [x] `src/hooks/useAuthInit.ts` - Auth initialization hook

### ✅ Files Modified
- [x] `src/router/index.tsx` - Updated with role-based routes
- [x] `src/store/market.store.ts` - Allow null market selection
- [x] `src/pages/markets/MarketsPage.tsx` - Role-based UI and API selection
- [x] `src/App.tsx` - Added useAuthInit hook

### ✅ Documentation Created
- [x] `ROLE_BASED_SYSTEM.md` - Complete architecture documentation
- [x] `ROLE_BASED_EXAMPLES.md` - Working examples and scenarios
- [x] `ROLE_BASED_IMPLEMENTATION.md` - What was changed and why

---

## Code Quality Checks

### TypeScript/Syntax
```bash
# Run type check
npm run type-check
# or
tsc --noEmit
```

**Expected:** No errors related to:
- Missing imports in router
- Type mismatches in layouts
- Route protection logic

### Linting
```bash
# Run ESLint
npm run lint
```

**Expected:** No errors in:
- layouts/CommonHeader.tsx
- layouts/CommonSidebar.tsx
- layouts/SuperAdminLayout.tsx
- layouts/OwnerLayout.tsx
- components/protectedRoutes.tsx
- router/index.tsx
- pages/markets/MarketsPage.tsx

---

## Manual Testing

### Test Case 1: SUPERADMIN User
```
Pre-condition: SUPERADMIN account exists and can login

Steps:
1. Open http://localhost:5173/login
2. Login with SUPERADMIN credentials
3. Verify redirected to /dashboard
4. Verify SuperAdminLayout renders
5. Verify header shows only "Balance" (no market name)
6. Verify sidebar shows: Dashboard, Barcha Marketlar, Foydalanuvchilar, Obuna Rejalar, Sozlamalar
7. Click "Barcha Marketlar"
8. Verify /markets page shows all markets
9. Verify cards are NOT clickable (no visual feedback on click)
10. Verify no "Market qo'shish" button
11. Verify "Tanlangan" badge is NOT shown

Result: PASS/FAIL
Expected: PASS
```

### Test Case 2: OWNER User
```
Pre-condition: OWNER account exists and can login

Steps:
1. Open http://localhost:5173/login
2. Login with OWNER credentials
3. Verify redirected to /dashboard
4. Verify OwnerLayout renders
5. Verify header shows "Balance" with no market name initially
6. Verify sidebar shows: Dashboard, Marketim, Foydalanuvchilar, Mijozlar, Kategoriyalar, Mahsulotlar, Shartnomalar, Obuna
7. Click "Marketim"
8. Verify /markets page shows only owner's markets
9. Click on a market card
10. Verify card is highlighted with primary color border
11. Verify "Tanlangan" badge appears on card
12. Verify header now shows "Balance" + market name
13. Verify "Market qo'shish" button is visible
14. Click "Mijozlar"
15. Verify customer data for selected market is shown

Result: PASS/FAIL
Expected: PASS
```

### Test Case 3: Route Protection - SUPERADMIN Access Denied
```
Pre-condition: SUPERADMIN user is logged in

Steps:
1. Navigate to http://localhost:5173/markets
2. Verify SUPERADMIN can access (shows all markets)
3. Navigate to http://localhost:5173/customers
4. Verify redirected to /dashboard with SuperAdminLayout
5. Customers page should NOT render

Result: PASS/FAIL
Expected: Redirect to /dashboard with SuperAdminLayout
```

### Test Case 4: Route Protection - OWNER Access
```
Pre-condition: OWNER user is logged in

Steps:
1. Navigate to http://localhost:5173/customers
2. Verify /customers page opens with customer list
3. Navigate to http://localhost:5173/users
4. Verify /users page opens if OWNER has access
5. Or verify redirected if no access

Result: PASS/FAIL
Expected: Either page opens or permissions are enforced
```

### Test Case 5: App Rehydration
```
Pre-condition: User has logged in as SUPERADMIN

Steps:
1. Login as SUPERADMIN
2. Navigate to /dashboard
3. Hard refresh (Ctrl+Shift+R)
4. Verify app still shows SUPERADMIN layout
5. Verify no market is selected
6. Verify user data is preserved

Result: PASS/FAIL
Expected: PASS (Zustand persist middleware should restore state)
```

### Test Case 6: Market Store Behavior
```
Pre-condition: Both SUPERADMIN and OWNER test accounts

SUPERADMIN Flow:
1. Login as SUPERADMIN
2. Open DevTools → Application → LocalStorage
3. Search for "market-storage"
4. Verify selectedMarket is null
5. Navigate to /markets
6. Still verify selectedMarket is null
Result: PASS

OWNER Flow:
1. Login as OWNER
2. Navigate to /markets
3. Click market
4. Verify market-storage contains: { selectedMarket: { id, name, ... } }
Result: PASS
```

---

## Browser DevTools Console

### Expected No Errors
```
❌ DO NOT SEE:
- Cannot read property 'role' of undefined
- Uncaught TypeError in layouts
- Failed to load component
- Import errors in router

✅ Should see:
- Network requests to /api/auth/me
- Network requests to /api/markets or /api/markets/all
- Normal React console (may have warnings, but no critical errors)
```

---

## API Integration Tests

### Verify Correct API Endpoints Are Called

**SUPERADMIN User:**
```
Open DevTools → Network tab
1. Login → POST /api/auth/login ✓
2. App init → GET /api/auth/me ✓
3. Navigate to /markets → GET /api/markets/all ✓ (NOT /api/markets)
```

**OWNER User:**
```
Open DevTools → Network tab
1. Login → POST /api/auth/login ✓
2. App init → GET /api/auth/me ✓
3. Navigate to /markets → GET /api/markets ✓ (NOT /api/markets/all)
4. Select market → No API call (local state only) ✓
5. Navigate to /customers → GET /api/customers?marketId=... ✓
```

---

## Performance Regression Check

### Load Times (Compare with Previous)
| Page | SUPERADMIN | OWNER | Notes |
|------|-----------|-------|-------|
| /dashboard | < 2s | < 2s | Should be same |
| /markets | < 2s | < 2s | Should be same |
| /customers | Should not render for SUPERADMIN | < 2s | New protection |
| /users | < 2s | < 2s | May vary by role |

---

## Rollback Procedure (If Issues)

If critical issues are found:

```bash
# 1. Revert last 4 commits
git revert HEAD~3..HEAD

# 2. Or restore from backup
git checkout main -- src/router/index.tsx
git checkout main -- src/store/market.store.ts
git checkout main -- src/pages/markets/MarketsPage.tsx
git checkout main -- src/App.tsx

# 3. Delete new directories
rm -rf src/components/layouts
rm -rf src/config
rm -rf src/utils/roles.ts
rm -rf src/hooks/useAuthInit.ts

# 4. Restore old DashboardLayout if needed
# Restore from git or backup
```

---

## Sign-Off

### Developer Sign-Off
- Code Author: __________________
- Date: __________________
- Verified Locally: [ ] Yes [ ] No

### QA Sign-Off
- QA Lead: __________________
- Date: __________________
- All Tests Passed: [ ] Yes [ ] No
- Issues Found: __________________

### Deployment Sign-Off
- DevOps/Lead: __________________
- Date: __________________
- Deployed to Staging: [ ] Yes [ ] No
- Deployed to Production: [ ] Yes [ ] No

---

## Post-Deployment Monitoring

### Monitor These Metrics
- [ ] Login success rate (both SUPERADMIN and OWNER)
- [ ] 404 errors on redirection
- [ ] API error rates for /api/markets and /api/markets/all
- [ ] Session timeout/rehydration issues
- [ ] Network errors in market selection

### Alert Thresholds
- Login errors > 5% → Investigate
- 404 errors > 1% → Check routing
- API timeouts > 10% → Check backend
- Session rehydration failures > 2% → Check localStorage

---

## Final Safety Checks

- [ ] No hardcoded role checks remaining
- [ ] All role helpers used instead of string comparisons
- [ ] Menu configuration is complete and accurate
- [ ] All pages are protected appropriately
- [ ] SUPERADMIN cannot accidentally select a market
- [ ] OWNER must select a market to operate
- [ ] Header displays correctly for both roles
- [ ] Sidebar filters correctly by role
- [ ] Token refresh still works
- [ ] Session persistence works
