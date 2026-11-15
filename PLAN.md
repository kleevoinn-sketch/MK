# Plan
1. ✅ Catalogue, product pages, cart, UPI QR checkout, order confirmation
2. ✅ Supabase schema + RLS + stock-safe order functions (applied to the Supabase project)
3. ✅ Server-side order pricing, Razorpay (create / verify / webhook), customer accounts, admin dashboard, policy pages, SEO files
4. ⏳ Set env vars on Vercel, create first admin user, enter real stock, install deps & run `pnpm build` / `pnpm typecheck` (not run in the build session)
5. ⏳ Test Razorpay in test mode end-to-end; add the webhook URL `/api/razorpay-webhook` in the Razorpay dashboard
6. ⏳ Email / WhatsApp notifications (needs a provider and credentials; table `notifications` is ready)
7. ⏳ Invoices (PDF), banners/review-moderation screens in admin, add/delete product + image upload UI (storage bucket `product-images` exists)
