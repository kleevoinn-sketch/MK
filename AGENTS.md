# KLEEVO storefront

E-commerce site for KLEEVO cleaning products (manufactured by S.M ENTERPRISES). TanStack Start + React 19 + Tailwind 4 on Netlify; orders stored in Netlify Database (Postgres via Drizzle `@beta`).

## Key files
- `src/data/products.ts` — catalogue (prices, MRP, label text: description, how-to-use, caution), brand contacts, `img()` helper (Netlify Image CDN), `inr()` formatter.
- `src/lib/cart.tsx` — cart context (localStorage) + payment ref/review flags (sessionStorage).
- `src/lib/orders.ts` — `placeOrder` / `getOrder` server functions. Prices are recomputed server-side from the catalogue; never trust client prices.
- `db/schema.ts`, `db/index.ts`, `drizzle.config.ts` — schema; migrations in `netlify/database/migrations` (generate with `npx drizzle-kit generate --name <name>`, never apply manually).
- Routes: `/` (catalogue, how to order, about, certifications, usage/caution, contact), `/products/$productId`, `/cart`, `/checkout/payment` (UPI QR + UTR entry), `/checkout/confirm`, `/checkout/delivery` (address form, places order), `/order/$orderNumber`.
- Components in `src/components/` (Header with slide-out menu modelled on the reference image, Footer, ProductCard, CheckoutSteps, PriceDetails, Toast, brand icons).
- `public/img/products` — AI-generated 500 ml bottle shots matching the labels; `public/img/labels` — original label scans; logo, certifications and UPI QR in `public/img`.

## Notes
- Payment is manual: customer pays via QR and enters the UTR; orders are saved with status `payment_verification`. There is no automatic payment verification.
- Checkout is gated in order: payment → confirm → delivery.
- See `PLAN.md` for remaining work.
