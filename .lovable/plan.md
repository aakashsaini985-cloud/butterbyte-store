## Stack (replaces Laravel/MySQL)

- **Frontend:** React 19 + TanStack Start (TypeScript, Tailwind v4, Vite)
- **Backend:** Lovable Cloud (PostgreSQL + Auth + Storage + Server Functions)
- **Excel parsing:** SheetJS (`xlsx`) — runs in browser for admin uploads
- **Animations:** Framer Motion
- **Image hosting:** Excel image URLs are external; we proxy/store on first import to Lovable Cloud Storage for reliability

> Note: Your Excel files use this schema → `Product Name | Product URL | Product Image | Price (INR) | Product Description | Availability`. SKU, size/color variants, MRP, discount, ratings are **not** in the source data — we'll auto-generate SKUs and leave variant/MRP/discount fields empty (editable later in admin).

## Brand & Design

- White background, **black + gold** accents (gold `oklch(0.78 0.13 85)`)
- Display font: **Cormorant Garamond** (serif, luxury); Body: **Inter**
- Premium product cards, hover zoom, smooth page transitions, sticky header w/ mini-cart
- Mobile-first; bottom nav on mobile

## Database Schema (Lovable Cloud / Postgres)

```text
categories          (id, slug, name, gender [men|women], parent_slug, image_url, sort_order)
products            (id, slug, name, brand, sku, category_id, description,
                     mrp, selling_price, discount_pct, stock_qty, availability,
                     is_new, is_bestseller, is_trending, rating_avg, rating_count, created_at)
product_images      (id, product_id, url, sort_order)
product_variants    (id, product_id, size, color, stock_qty)        -- empty until added
profiles            (id [auth.uid], full_name, phone, created_at)
addresses           (id, user_id, name, phone, line1, line2, city, state, pincode, is_default)
wishlist            (user_id, product_id, created_at)               -- composite PK
cart_items          (id, user_id, product_id, variant_id, qty)
orders              (id, user_id, order_no, subtotal, discount, shipping, total,
                     status, payment_method, address_snapshot jsonb, created_at)
order_items         (id, order_id, product_id, name, sku, price, qty, image_url)
coupons             (id, code, type [flat|pct], value, min_order, expires_at, active)
reviews             (id, product_id, user_id, rating, title, body, created_at)
banners             (id, title, subtitle, cta_label, cta_href, image_url, sort_order, active)
user_roles          (id, user_id, role [admin|customer])            -- separate table, has_role() fn
```

All tables get RLS: customers read/write own rows, products/categories/banners public-read, admin writes gated by `has_role(auth.uid(),'admin')`.

## Routes

```text
src/routes/
  __root.tsx
  index.tsx                       Home (hero slider, sections 1–13)
  shop.tsx                        All products + filters
  men.tsx                         Men landing
  women.tsx                       Women landing
  c.$gender.$slug.tsx             Category page (e.g. /c/women/saree)
  p.$slug.tsx                     Product detail
  search.tsx                      Search results
  cart.tsx
  wishlist.tsx
  checkout.tsx                    One-page guest+auth checkout
  order-success.$orderNo.tsx
  login.tsx  signup.tsx  forgot-password.tsx  reset-password.tsx
  _authenticated.tsx              Layout gate
  _authenticated/
    account.tsx                   Profile
    orders.tsx                    Order history
    orders.$orderNo.tsx           Order tracking
    addresses.tsx
  about.tsx contact.tsx privacy.tsx terms.tsx shipping.tsx refund.tsx faq.tsx track-order.tsx
  _admin.tsx                      Admin layout (role gate)
  _admin/
    dashboard.tsx
    products.tsx  products.new.tsx  products.$id.tsx
    categories.tsx
    import.tsx                    Excel uploader (multi-file)
    orders.tsx  orders.$id.tsx
    customers.tsx
    coupons.tsx
    banners.tsx
    pages.tsx                     CMS (about/policies)
```

Each route gets its own `head()` (title, description, og:*). Canonical at leaves only.

## Excel Import Flow

Admin → `/admin/import` → drag-drop one or many `.xlsx`. Per file:

1. Parse client-side with SheetJS.
2. Derive **category** from filename (e.g. `Women's Saree.xlsx` → gender=women, category=Saree). Auto-create category if missing.
3. For each row:
   - Generate slug from Product Name, SKU = `BB-<CAT>-<n>`.
   - Map: Product Name → name, Price (INR) → selling_price (mrp = selling_price × 1.25 default, discount auto-calc), Product Image → product_images[0].url, Description → description, Availability → stock_status.
   - Upsert by slug (re-import = update).
4. Server fn `bulkImportProducts` (admin-only) inserts in batches.
5. Show import report (created / updated / skipped + errors).

Re-runnable, idempotent. Same uploader works for future Men's Excel files — category derived from filename.

## Seeded Data on First Build

- Import all 8 Women's Excel files automatically via a one-time seed server fn (run on first admin login, or via a "Seed catalog" button on `/admin/import`).
- Generate 9 Men's categories with **3–6 placeholder products each** (placeholder image + sensible names like "Classic White Shirt", "Slim Fit Jeans"), so the storefront feels populated immediately.
- Seed 6 hero banners, 1 admin user (first signup auto-promoted), sample coupon `WELCOME10`.

## Homepage Composition (13 sections)

1. Hero slider (Framer Motion, 6 slides, autoplay, swipe, CTAs)
2. Shop by Gender (Men / Women split-card)
3. Featured Categories (8 tiles)
4. Women's Collection rail (horizontal scroll)
5. Men's Collection rail
6. New Arrivals grid
7. Best Sellers grid
8. Trending Now grid
9. Customer Reviews carousel
10. Brand Story (editorial split layout)
11. Instagram-style 6-tile gallery
12. Newsletter signup
13. Trust badges (Free Shipping / COD / 7-Day Return / Secure Checkout)

## Features Built

- **Filters:** category, size, color, price range, discount, availability, sort (new/bestsellers/price)
- **Search:** AJAX dropdown w/ suggestions (name, category, SKU); full results page
- **Cart/Wishlist:** persisted in DB for logged-in, localStorage for guests (merged on login)
- **Checkout:** guest or logged-in, address form, coupon, COD-only stub (records order with `payment_method='cod_stub'`); payment-gateway hooks left ready
- **Auth:** email/password + Google sign-in (via Lovable broker); forgot/reset password flow
- **Account area:** profile, orders, tracking, addresses
- **Admin:** dashboard KPIs, full product CRUD, category mgmt, Excel import, orders w/ status updates, customers list, coupons, banners, CMS pages
- **SEO:** per-route head(), JSON-LD Product schema on PDP, sitemap.xml, robots.txt
- **Static pages:** all listed legal/info pages with editable content via CMS table

## What's NOT in this build (call-outs)

- **Real payment processing** — stubbed. Razorpay/Stripe wiring is a follow-up.
- **Size/color variants & MRP/discount** — not in your Excel; fields exist, editable in admin.
- **Real product ratings/reviews** — table exists, seeded with a few demo reviews; live review submission included.
- **Men's real catalog** — placeholders until you upload Men's Excel files (same import flow works).

## Build Order

1. Cloud + schema + RLS + seed scripts
2. Design system tokens, layout shell, header/footer, mobile bottom nav
3. Homepage with hero + all 13 sections
4. Category + product detail + filters + search
5. Cart, wishlist, auth, checkout (COD stub)
6. Account area (profile/orders/addresses)
7. Admin panel + Excel import + seed women's catalog + placeholder men's
8. Static/legal pages + SEO polish (sitemap, JSON-LD, meta)

This is a large build — I'll ship it end-to-end, then we iterate on visual polish and any gaps you spot.