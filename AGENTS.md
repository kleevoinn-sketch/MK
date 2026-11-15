# KLEEVO storefront

E-commerce site for KLEEVO cleaning products (manufactured by S.M ENTERPRISES). TanStack Start + React 19 + Tailwind 4 on Netlify; data in **Supabase** (Postgres + Auth + Storage), payments via Razorpay (+ manual UPI QR fallback). The old Netlify Database/Drizzle code in `db/` is no longer used by the app.

## Key files
- `src/data/products.ts` — catalogue (prices, MRP, label text: description, how-to-use, caution), brand contacts, `img()` helper (Netlify Image CDN), `inr()` formatter.
- `src/lib/cart.tsx` — cart context (localStorage) + payment ref/review flags (sessionStorage).
- `src/lib/supabase.server.ts` — server-only REST helpers (service role). No SDK; plain `fetch`. Never import from client code.
- `src/lib/orders.ts` — `placeOrder` (UPI QR) / `getOrder`; calls the DB function `create_order`, which prices the cart, checks stock and applies coupons. Never trust client prices.
- `src/lib/razorpay.ts` + `razorpay.server.ts` + `netlify/functions/razorpay-webhook.mts` — Razorpay order creation, signature + server-side status verification, idempotent `finalizePayment`, webhook.
- `src/lib/admin.ts` + `src/routes/admin.tsx` — admin API/dashboard. Every call re-checks `is_kleevo_admin()` in the DB.
- `src/lib/account.ts`, `auth.ts`, routes `/login`, `/account` — customer accounts, order history, cancellation requests, saved addresses.
- `src/lib/catalogue.ts` — live price/MRP/stock from the DB, overlaid onto `src/data/products.ts` in the root loader.
- Database: Supabase project `pahainqxjjdywujrzpss`. Schema/RLS/functions were applied as migrations `storefront_schema` and `seed_catalogue`; run `supabase db pull` to export them into `supabase/migrations/`. Stock is deducted once by `confirm_order()` and restored by `restock_order()`.
- Routes: `/` (catalogue, how to order, about, certifications, usage/caution, contact), `/products/$productId`, `/cart`, `/checkout/payment` (UPI QR + UTR entry), `/checkout/confirm`, `/checkout/delivery` (address form, places order), `/order/$orderNumber`.
- Components in `src/components/` (Header with slide-out menu modelled on the reference image, Footer, ProductCard, CheckoutSteps, PriceDetails, Toast, brand icons).
- `public/img/products` — real bottle photos cropped from the shop video (glass-cleaner is a code-rendered illustration (real label scan + logo on a drawn bottle) until a real photo is supplied); `public/img/labels` — original label scans; logo, certifications and UPI QR in `public/img`.

## Notes
- Two payment paths: Razorpay (automatic, needs env keys + `razorpay_enabled` in admin Settings) and manual UPI QR (customer enters UTR; admin clicks *Mark payment verified*). Stock is reduced only when an order is confirmed.
- Admins: create the user in Supabase Auth, then `insert into private.admin_users(user_id) values ('<uuid>')` in the SQL editor. No hardcoded credentials.
- Env vars: see `.env.example`.
- Checkout is gated in order: payment → confirm → delivery.
- See `PLAN.md` for remaining work.
