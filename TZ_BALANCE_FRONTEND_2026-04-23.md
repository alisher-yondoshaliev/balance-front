# TEXNIK TOPSHIRIQ (TZ)
## Loyiha: Balance Frontend (Market CRM + Subscription)

Sana: 2026-04-23
Versiya: 1.0
Holat: Draft (Frontend kod bazasi asosida shakllantirilgan)

---

## 1. Loyiha maqsadi
Balance platformasi bozorlarga (market) mo'ljallangan boshqaruv tizimi bo'lib, quyidagi yo'nalishlarni bitta web ilovada birlashtiradi:
- Foydalanuvchi autentifikatsiyasi va role-based kirish
- Marketlar boshqaruvi
- Xodimlar (users/employees) boshqaruvi
- Mijozlar (customers) boshqaruvi
- Kategoriyalar va mahsulotlar boshqaruvi
- Muddatli shartnomalar (contracts) va to'lovlar
- Dashboard analytics
- Obuna (subscription) va to'lov tarixi
- Profil va sozlamalar

Loyiha Frontend qismi Vite + React + TypeScript asosida ishlab chiqiladi va REST API orqali backend bilan ishlaydi.

---

## 2. Scope (qamrov)
### 2.1 In-Scope
- SPA (Single Page Application) frontend
- JWT token asosidagi auth flow
- OTP va reset-password flow
- Google OAuth callback flow
- Role-based route va menyu boshqaruvi
- CRUD operatsiyalar (categories, products, customers, contracts, users, markets)
- Subscription plan ko'rish va to'lov qilish
- File upload (category image)
- Multi-language (i18n) va theme switch

### 2.2 Out-of-Scope
- Backend implementatsiyasi
- To'lov provayderlari real integratsiyasi (faqat API chaqiruv contracti)
- Native mobil ilova

---

## 3. Texnologik stack
- React 19
- TypeScript 6
- Vite 8
- React Router DOM 7
- Zustand (auth/store state)
- Axios (HTTP client + interceptors)
- React Hook Form + Zod
- TanStack Query (qisman/kelgusida)
- MUI + TailwindCSS
- i18next

---

## 4. Arxitektura va qatlamlar
### 4.1 Papkalar va javobgarlik
- src/api: asosiy REST endpoint wrapperlar
- src/services: qo'shimcha service endpointlar (xususan auth flow)
- src/store: global holat (auth, market, theme, language)
- src/router: route tree va route guardlar
- src/pages: sahifalar (feature bo'yicha)
- src/components: reusable UI va feature komponentlar
- src/types: domain contract typelari
- src/config: roles, menu, filter config

### 4.2 Auth va token lifecycle
- Access token request interceptor orqali Authorization headerga qo'shiladi
- 401 holatda refresh token orqali /auth/refresh ga so'rov yuboriladi
- Refresh muvaffaqiyatsiz bo'lsa logout va /login ga redirect qilinadi
- Auth holati local storage'da persist qilinadi (zustand persist)

---

## 5. Rollar va ruxsatlar
Rollar:
- SUPERADMIN
- OWNER
- ADMIN
- MANAGER
- SELLER

Umumiy prinsip:
- Frontend route va menyu darajasida role tekshiradi
- Backend yakuniy security manbai bo'lib qoladi
- Market-scope ma'lumot izolyatsiyasi backendda qat'iy tekshirilishi shart

Menu va route bo'yicha ko'rinadigan asosiy access:
- Dashboard: OWNER, ADMIN, MANAGER
- Markets: SUPERADMIN, OWNER, ADMIN (route), menyuda OWNER/ADMIN/MANAGER konfiguratsiyasi bor
- Users/Employees: SUPERADMIN, OWNER, ADMIN
- Customers: SUPERADMIN, OWNER, ADMIN, MANAGER
- Categories: SUPERADMIN, OWNER, ADMIN (route), menyuda SELLER ham ko'rsatilgan
- Products: SUPERADMIN, OWNER, ADMIN, MANAGER
- Contracts: SUPERADMIN, OWNER, ADMIN
- Subscriptions: SUPERADMIN, OWNER, ADMIN (route), menyuda OWNER

Eslatma: frontend konfiguratsiyalar orasida ayrim rol tafovutlari bor (route vs menu). Yakuniy biznes qoida bo'yicha birxillashtirish talab etiladi.

---

## 6. Funktsional talablar
### 6.1 Auth moduli
- Login
- Register (OTP verifikatsiya orqali)
- Send OTP / Verify OTP
- Me endpoint orqali session restore
- Refresh token
- Change password
- Forgot password (send OTP -> verify OTP -> reset)
- Google OAuth login/callback

### 6.2 Dashboard
- Summary statistikalar
- Revenue ko'rsatkichlari
- Overdue holatlari
- Top debtors

### 6.3 Markets
- My markets ro'yxati
- Barcha marketlar (all)
- Bitta market detallari
- Create/Update/Delete market
- Status update
- Market users ro'yxati

### 6.4 Users/Employees
- Tizim userlari ro'yxati
- Market users ro'yxati (filter/pagination/sort)
- User create/update/delete
- User status update

### 6.5 Customers
- Customers ro'yxati
- Customer detail
- Create/update/delete customer
- Customer contracts ro'yxati

### 6.6 Categories
- Categories ro'yxati (market bo'yicha)
- Category detail
- Create/update/delete
- Category image upload

### 6.7 Products
- Product ro'yxati/detail
- Create/update/delete product
- Product status update
- Price plan CRUD

### 6.8 Contracts
- Contract ro'yxati/detail
- Create/update/delete contract
- Contract status update
- Installments olish
- Payment qabul qilish

### 6.9 Subscriptions
- Planlar ro'yxati
- Current subscription
- Subscription history
- Subscription payment

### 6.10 Profile/Settings
- Profil ko'rish/tahrirlash
- Sozlamalar (rolega bog'liq)
- Til va tema almashuvi

---

## 7. Routing talablar
Public:
- /
- /login
- /send-otp
- /verify-otp
- /register
- /auth/google/callback
- /forgot-password
- /forgot-password/verify
- /reset-password

Private:
- /change-password
- /dashboard
- /profile
- /settings
- /markets
- /markets/:id
- /markets/:marketId/users
- /users
- /customers
- /customers/:id
- /products
- /products/:id
- /categories
- /contracts
- /contracts/create
- /contracts/:id
- /subscriptions

Fallback:
- * -> auth holatiga qarab /dashboard yoki /

---

## 8. API spetsifikatsiya (to'liq ro'yxat)
Base URL:
- VITE_API_URL (default: http://localhost:3000/api)

Standart header:
- Content-Type: application/json
- Authorization: Bearer <accessToken> (agar mavjud bo'lsa)

### 8.1 Auth API
1) POST /auth/send-otp
- Body: { email }
- Forgot password holatida: { email, purpose: "reset_password" }
- Response: { otpToken, message }

2) POST /auth/verify-otp
- Body: { email, otp, otpToken }
- Forgot password holatida: { email, otp, otpToken, purpose: "reset_password" }
- Response: register flow uchun emailToken yoki forgot flow uchun resetToken qaytarilishi kutiladi

3) POST /auth/register
- Body: { emailToken, fullName, password }
- Response: { user, accessToken, refreshToken? }

4) POST /auth/login
- Body: { email, password }
- Response: { user, accessToken, refreshToken? }

5) GET /auth/me
- Auth required
- Response: User

6) POST /auth/refresh
- Variant A (service client): Body { refreshToken }
- Variant B (axios interceptor): Authorization: Bearer <refreshToken>
- Response: { accessToken, refreshToken }

7) PATCH /auth/change-password
- Body: { oldPassword, newPassword }
- Response: { message }

8) POST /auth/change-password
- Body: { oldPassword, newPassword }
- Response: { message }
- Eslatma: kod bazada PATCH va POST ikki xil ishlatilgan, backendda bitta standart qabul qilinishi kerak

9) POST /auth/reset-password
- Body: { resetToken, newPassword }
- Response: { message }

10) GET /auth/google
- Browser redirect endpoint (OAuth start)

11) POST /auth/google/callback
- Body: { code }
- Response: { user, accessToken, refreshToken? }

### 8.2 Markets API
1) GET /markets
- Response: Market[]

2) GET /markets/all
- Response: Market[]

3) GET /markets/:id
- Response: Market

4) POST /markets
- Body: { name, address?, phone? }
- Response: Market

5) PATCH /markets/:id
- Body: { name?, address?, phone? }
- Response: Market

6) DELETE /markets/:id
- Response: success/message

7) PATCH /markets/:id/status
- Body: { status }
- Response: Market

8) GET /markets/:marketId/users
- Query: { page?, limit?, search?, status?, role?, sortBy?, order? }
- Response: { data: MarketUser[], meta: { page, limit, total, totalPages } }

9) GET /markets/my-market/info
- Admin own market info endpoint
- Response: market + stats (backend contract bo'yicha)

### 8.3 Users API
1) GET /users
- Response: User[] yoki { data: User[], total }

2) GET /users/:id
- Response: User

3) POST /users
- Body: { email, fullName, role, phone?, password?, marketId? }
- Response: User

4) PATCH /users/:id
- Body: { fullName?, email?, role?, phone? }
- Response: User

5) DELETE /users/:id
- Response: success/message

6) PATCH /users/:id/status
- Body: { status }
- Response: User

### 8.4 Customers API
1) GET /customers
- Query: { marketId }
- Response: Customer[] yoki paged wrapper

2) GET /customers/:id
- Response: Customer

3) POST /customers
- Body: { fullName, phone, address?, passportSeria?, birthDate?, note? }
- Response: Customer

4) PATCH /customers/:id
- Body: yuqoridagi maydonlar optional
- Response: Customer

5) DELETE /customers/:id
- Response: success/message

6) GET /customers/:id/contracts
- Response: Contract[]

### 8.5 Categories API
1) GET /categories
- Query: CategoriesQueryParams (marketId va filterlar)
- Response: Category[] yoki { data: Category[] }

2) GET /categories/:id
- Response: Category yoki { data: Category }

3) POST /categories
- Body: { marketId, name, imageUrl? }
- Response: Category

4) PATCH /categories/:id
- Body: { name?, imageUrl? }
- Response: Category

5) DELETE /categories/:id
- Response: success/message

### 8.6 Upload API
1) POST /uploads/category-image
- Content-Type: multipart/form-data
- Body: form-data field: file
- Response: { message, imageUrl, fileName }

### 8.7 Products API
1) GET /products
- Query: { marketId }
- Response: Product[]

2) GET /products/:id
- Response: Product

3) POST /products
- Body: { categoryId, name, description?, imageUrl?, stock, basePrice }
- Response: Product

4) PATCH /products/:id
- Body: product fieldlari optional
- Response: Product

5) PATCH /products/:id/status
- Body: { status }
- Response: Product

6) DELETE /products/:id
- Response: success/message

7) POST /products/:id/price-plans
- Body: { termMonths, interestRate, totalPrice, monthlyPrice }
- Response: PricePlan

8) PATCH /products/:id/price-plans/:planId
- Body: price plan fieldlari optional
- Response: PricePlan

9) DELETE /products/:id/price-plans/:planId
- Response: success/message

### 8.8 Contracts API
1) GET /contracts
- Query: { marketId }
- Response: Contract[]

2) GET /contracts/:id
- Response: Contract

3) POST /contracts
- Body: {
  customerId,
  staffId,
  termMonths,
  downPayment,
  items: [{ productId, quantity }],
  note?
}
- Response: Contract

4) PATCH /contracts/:id
- Body: { termMonths?, downPayment?, note? }
- Response: Contract

5) DELETE /contracts/:id
- Response: success/message

6) PATCH /contracts/:id/status
- Body: { status }
- Response: Contract

7) POST /contracts/:id/pay
- Body: { amount, paymentMethod }
- Response: Contract (updated)

8) GET /contracts/:id/installments
- Response: Installment[]

### 8.9 Dashboard API
1) GET /dashboard/summary
- Query: { marketId }
- Response: {
  totalCustomers,
  activeContracts,
  totalRevenue,
  pendingPayments,
  recentTransactions[]
}

2) GET /dashboard/revenue
- Query: { marketId }
- Response: { revenue }

3) GET /dashboard/top-debtors
- Query: { marketId }
- Response: DebtorInfo[]

4) GET /dashboard/overdue
- Query: { marketId }
- Response: { overdueCount, overdueAmount }

### 8.10 Subscriptions API
1) GET /subscriptions/plans
- Response: SubscriptionPlan[]

2) GET /subscriptions/current
- Response: CurrentSubscription

3) GET /subscriptions/history
- Response: { items: SubscriptionHistory[] }

4) POST /subscriptions/pay
- Body: { planId, paymentMethod }
- Response: success/payment result

---

## 9. Ma'lumot modellari (asosiy)
- User: id, email, fullName, phone?, role, status, marketId?, createdAt, updatedAt
- Market: id, name, address?, phone?, status, ownerId, createdAt, updatedAt
- Customer: id, fullName, phone, address?, passportSeria?, birthDate?, note?, marketId, status
- Category: id, name, marketId, status
- Product: id, categoryId, marketId, name, stock, status, pricePlans[]
- PricePlan: id, productId, termMonths, interestRate, totalPrice, monthlyPrice
- Contract: id, customerId, marketId, status, items[], installments[]
- Installment: id, contractId, dueDate, amount, paidAmount, status
- Subscription: plan info + status + dates

---

## 10. Validatsiya va biznes qoidalar
- Email format valid bo'lishi shart
- Password minimal uzunlik va complexity backend policy bo'yicha
- OTP 6 xonali (yoki backend policy)
- Monetary maydonlar > 0 bo'lishi kerak (amount, basePrice, monthlyPrice, downPayment)
- termMonths > 0 va integer
- quantity > 0 va integer
- Upload fayl MIME type va size limiti bilan tekshiriladi
- Role va market scope backend tomonidan qat'iy tasdiqlanadi
- SELLER rolida customers/contracts/users endpointlari bloklanadi

---

## 11. Xatoliklarni qayta ishlash
Frontend standart handling:
- 400 Bad Request: validatsiya xatosi
- 401 Unauthorized: token expired/invalid -> refresh urinish
- 403 Forbidden: role yoki market access rad etildi
- 404 Not Found: resource topilmadi
- 409 Conflict: duplicate holatlar
- 422 Unprocessable Entity: business validation
- 500 Internal Server Error

UI talablar:
- Har bir API xatoligida foydalanuvchiga aniq xabar
- Retry imkoniyati (muvofiq joylarda)
- Loading, Empty, Error state har bir data-table/list sahifada bo'lishi shart

---

## 12. Xavfsizlik talablar
- Access token faqat Authorization header orqali yuboriladi
- Refresh token handling birxil standartda bo'lishi kerak
- CORS backendda to'g'ri sozlangan bo'lishi shart
- Role-based va market-scope checklar server tarafda majburiy
- Sensitive data log qilinmasligi kerak (productionda console loglar olib tashlanadi)

---

## 13. Performance va UX talablar
- Sahifa birinchi yuklanish optimizatsiyasi (code-splitting tavsiya)
- API timeout: 10s
- Jadval sahifalarda pagination/filter/sort
- Responsiv dizayn (desktop + mobil)
- i18n switch va theme switch global ishlashi

---

## 14. Logging va monitoring
- Developmentda endpoint-level debug loglar mavjud
- Productionga chiqarishda:
  - console.debug/info minimumga tushiriladi
  - error logging markazlashtiriladi (Sentry yoki o'xshash)
  - API latency monitoring joriy qilinadi

---

## 15. Test talablari (minimum)
### 15.1 Unit test
- Store (auth logic)
- Helper/formatter funksiyalar
- Role check utility

### 15.2 Integration test
- Auth flow (login/refresh/logout)
- CRUD flow (customers/products/contracts)
- Upload flow

### 15.3 E2E test
- Public -> login -> dashboard
- Role-based route cheklovlari
- Contract create + payment
- Subscription plan tanlash va payment

---

## 16. Acceptance criteria
1) Foydalanuvchi login qilganda dashboardga muvaffaqiyatli kiradi.
2) Token muddati tugaganda avtomatik refresh ishlaydi.
3) Rolga mos bo'lmagan route ochilganda foydalanuvchi redirect qilinadi.
4) Markets, Users, Customers, Categories, Products, Contracts, Subscriptions modullari CRUD darajasida ishlaydi.
5) Dashboard endpointlari statistikani to'g'ri ko'rsatadi.
6) Category image upload muvaffaqiyatli saqlanadi va preview qilinadi.
7) Forgot password flow oxirigacha ishlaydi.
8) Google OAuth callback orqali autentifikatsiya tugallanadi.
9) Error holatlari UI'da to'g'ri ko'rsatiladi.
10) Loyiha build va lint bosqichlaridan o'tadi.

---

## 17. Konfiguratsiya
Majburiy ENV:
- VITE_API_URL=http://localhost:3000/api

NPM scriptlar:
- npm run dev
- npm run build
- npm run lint
- npm run preview

---

## 18. Aniqlashtirish talab qilinadigan nuqtalar
1) /auth/change-password uchun yakuniy method POSTmi yoki PATCHmi?
2) /auth/refresh endpoint contracti: body orqali refreshTokenmi yoki Bearer headermi?
3) Route va menu role mappinglaridagi tafovutlar qaysi qoida bo'yicha standartlashtiriladi?
4) /users va /markets/:id/users response formatlari yagona bo'ladimi?
5) Subscriptions payment response strukturasining yakuniy shakli qanday?

---

## 19. Yetkazib berish artefaktlari
- Frontend source code
- API contract mapping dokumenti
- Test checklist
- Build/deploy qo'llanma
- Release notes

---

## 20. Xulosa
Ushbu TZ mavjud frontend kod bazasi asosida loyiha modullari, role mantiqi va barcha API endpointlarni to'liq qamrab oldi. Backend contract birxillashtirilgach, ushbu hujjat final baseline sifatida ishlatiladi va development, QA hamda release jarayonlarida asosiy referens hujjat bo'ladi.
