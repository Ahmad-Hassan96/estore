# Women's Clothing E-Store

A production-ready women's unstitched clothing e-store built with Next.js 14, Supabase, and Vercel. Cash on Delivery only — zero payment gateway fees.

## Stack

- **Frontend:** Next.js 14 (App Router, TypeScript, Tailwind CSS)
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **Hosting:** Vercel
- **Cart:** Zustand (persisted in localStorage)
- **Payments:** Cash on Delivery (no Stripe, no fees)

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/clothing-store.git
cd clothing-store
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase keys:

```bash
cp .env.example .env.local
```

Get values from: **Supabase Dashboard → Settings → API**

### 3. Database Setup

Run the migration in **Supabase Dashboard → SQL Editor:**

```
supabase/migrations/001_initial.sql
```

### 4. Make Yourself Admin

After signing up on the site:

1. Go to **Supabase Dashboard → Authentication → Users**
2. Copy your User UUID
3. Run in SQL Editor:

```sql
update profiles set role = 'admin' where id = 'YOUR-USER-UUID';
```

Now visit `/admin` to manage products and orders.

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

```bash
# Link to your Vercel project
npx vercel link

# Add environment variables
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
npx vercel env add SUPABASE_SERVICE_ROLE_KEY

# Deploy
npx vercel --prod
```

Or connect your GitHub repo in the Vercel dashboard for automatic deploys.

## Project Structure

```
src/
├── app/
│   ├── (store)/          # Storefront pages
│   │   ├── shop/         # Product listing
│   │   ├── product/[slug]/ # Product detail
│   │   ├── cart/         # Cart
│   │   └── checkout/     # COD checkout
│   ├── (auth)/           # Login / Register
│   ├── account/          # Order history
│   ├── admin/            # Admin panel
│   └── api/orders/       # Order creation API
├── components/
│   ├── store/            # Navbar, ProductCard, CartDrawer...
│   └── admin/            # ProductForm
└── lib/
    ├── supabase/         # Client & server clients
    ├── cart-store.ts     # Zustand cart
    ├── types.ts          # TypeScript types
    └── utils.ts          # Helpers, constants
```

## Features

- Women's unstitched collection (Lawn, Cotton, Chiffon, Silk, Linen, Khaddar, Karandi)
- 2-piece & 3-piece filtering
- Cash on Delivery checkout (no payment gateway)
- Guest checkout (no account required to order)
- Admin panel: manage products, update order statuses
- Image upload to Supabase Storage
- Free shipping above PKR 5,000
- Pakistani cities & provinces in checkout
- Responsive — mobile first

## Phase 2 Roadmap

- Men's collection (schema already supports it)
- WhatsApp order notifications
- Email confirmations (Resend)
- Discount codes
- Product reviews

## Cost

**$0/month** on free tiers of Vercel + Supabase + GitHub.
