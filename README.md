# Lachava Telangana Pickles

Next.js storefront for veg & non-veg pickles — Razorpay checkout, admin orders & products.

## Local setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Admin:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Deploy on Vercel (required for live admin)

Admin **will not work** on the live site until these environment variables are set in Vercel:

1. [Vercel Dashboard](https://vercel.com) → your project → **Settings** → **Environment Variables**
2. Add for **Production** (and Preview if needed):

| Variable | Example | Required |
|----------|---------|----------|
| `ADMIN_USERNAME` | `lachava` | Yes (admin login) |
| `ADMIN_PASSWORD` | strong password | Yes (admin login) |
| `SESSION_SECRET` | long random string | Yes (admin sessions) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_live_...` | Yes (checkout) |
| `RAZORPAY_KEY_SECRET` | secret from Razorpay | Yes (checkout) |
| `MONGODB_URI` | MongoDB Atlas URL | Recommended (orders/products) |
| `NEXT_PUBLIC_DTDC_WHATSAPP_NUMBER` | `919949525111` | Optional |
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.vercel.app` | Optional |

3. **Redeploy** after saving (Deployments → … → Redeploy).

Without `ADMIN_USERNAME` and `ADMIN_PASSWORD`, login shows: *Admin is not configured on the server*.

## Checkout flow

1. Customer adds products to cart and checks out  
2. Pays via Razorpay (UPI, cards, net banking)  
3. Order is marked **paid** automatically in `/admin/orders`  
4. Admin sends to DTDC and notifies customer when dispatched  

## Brand assets

- `public/logo.png` — navbar & social preview  
- `public/favicon.ico` — browser tab (from `favicon.png`)

## Repo

https://github.com/rishiteerdamsolutions-cyber/lachavapickles
