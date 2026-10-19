# Jamae's Craftopia — user flow review

**Updated:** 2026-10-19  
**Scope:** Customer and admin flows, frontend behavior and related APIs, exercised with Chromium against local PostgreSQL.

## Browser walkthrough

| Flow | Result | Verified behavior |
| --- | --- | --- |
| Product discovery and cart | Pass | Opened a product, added it to cart, and saw the cart item. |
| Item offers and fees | Pass | Admin discount, GST, COD fee, and other per-item charge saved; cart validation returned the saved product pricing. |
| Contact | Pass | Submitted a contact message and saw confirmation. |
| Checkout gate | Pass | Anonymous checkout showed the sign-in prompt. |
| Email OTP signup | Pass | Wrong OTP was rejected; valid test OTP created a session and account. |
| Address persistence and COD checkout | Pass | Saved an address, reloaded it from the backend, then placed a COD order and reached confirmation. |
| Admin access and shell | Pass | Customer was redirected away from admin; admin sign-in opened `/admin`; storefront footer was absent there. |
| Admin operations | Pass | Browsed dashboard, orders, products, users, coupons, and payment settings; saved product fees/discount and created a coupon. |

The full Playwright run completed **8/8 tests** with `npx playwright test`. Local PostgreSQL was synchronized and seeded with 6 categories, 14 products, and development customer/admin accounts. Local credentials are `test@example.com` / `Test@123` and `admin@example.com` / `Test@123`.

## Work completed

- Customer addresses are persisted through authenticated `/api/addresses` endpoints; browser storage is not the source of truth.
- Signup verifies the email OTP before creating the user. Local E2E uses a fixed test-only code; production requires email delivery configuration.
- Admin pages have role-gated routes and APIs, a separate responsive admin shell, and role-aware login redirect.
- Admins can set per-product discounts, GST percentage, COD fee, and other charge. The server recalculates prices/fees during cart validation and order creation, summing applicable per-item charges.
- UPI QR amount is expressed in INR (not paise), the redundant pay button was removed, and the app-open action is limited to mobile/foldable clients. Instructions explain scanning and sending payment proof.
- The UPI destination and WhatsApp number can be configured in Admin → Payment settings; the customer UI no longer falls back to the placeholder WhatsApp URL.

## Remaining requirements and limitations

### Merchant UPI details must be supplied

No verified business VPA is present in the project configuration. An admin must enter the real merchant UPI ID and WhatsApp number in Payment settings (or configure `MERCHANT_UPI_ID` and `WHATSAPP_CONTACT_NUMBER`) before shoppers can see the QR/proof link. The QR uses a configured destination; the app cannot safely infer the merchant account from the previous customer-entered UPI value.

### Online UPI order confirmation is manual

The UPI screen provides transfer instructions and WhatsApp proof collection. It does not yet create a pending online order and connect a verified UTR to an order record. The supported backend order completion flow remains COD; a real payment-provider integration or a pending-order/manual-verification workflow is needed before UPI can complete an order end to end.

### Signup email delivery outside local E2E

Production signup needs a working `RESEND_API_KEY` and `EMAIL_FROM`. Local development logs the code on the server when delivery is not configured; the code is never returned in the public API response.

### Test data accumulates

The browser checkout test creates local orders and addresses; admin coupon tests add coupons. Keep the compose database isolated from production data and reset/clean it when desired.

## Backend checks reviewed

- Order creation authenticates the session, calculates current product prices and fees on the server, validates stock, and reserves stock transactionally.
- Order reads and cancellation enforce session ownership. Admin APIs verify the ADMIN role.
- Coupon validation and product promotions read persisted database configuration.
- Address routes scope reads and changes to the signed-in user and update the default address transactionally.
- Contact and custom-order forms show success only after accepted API responses.

## Test and setup files

- Browser flows: `tests/e2e/customer-flows.spec.js`, `tests/e2e/admin-flows.spec.js`
- Browser setup: `playwright.config.js`
- Database schema and seed: `prisma/schema.prisma`, `prisma/seed.js`
- Run tests: `npx playwright test`
- Local database: `docker compose up -d postgres`, `npm run db:push`, `npm run db:seed`

The walkthrough used a local database and development-only email OTP. No live email or payment provider was used.
