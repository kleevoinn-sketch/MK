# KLEEVO Online Store

Online store for KLEEVO home & car cleaning products by S.M ENTERPRISES — 7 products, 500 ml, prepaid via UPI QR.

**Tech:** TanStack Start, React 19, Tailwind CSS 4, Supabase (Postgres/Auth/Storage), Razorpay, Vercel (Nitro server).

**Run locally:** `pnpm install` then `pnpm dev` (http://localhost:3000).

**Roadmap:** see `PLAN.md` — order admin page, order notifications, final QA.

## Setup
1. Copy `.env.example` values into Vercel environment variables (Project → Settings → Environment Variables) (and add the secret ones: `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_*`).
2. Create an admin: add a user in Supabase Auth, then run `insert into private.admin_users(user_id) values ('<that user id>');`.
3. Sign in at `/admin`, set real stock for each product (all start at 0, so nothing is purchasable until you do).
4. Razorpay: add webhook `https://<your-site>/api/razorpay-webhook` (events `payment.captured`, `payment.failed`), then switch on *Razorpay online payment* in admin Settings.
