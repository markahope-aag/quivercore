# Stripe Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get Your Stripe Keys

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Make sure you're in **Test mode** (toggle in top right)
3. Copy:
   - **Publishable key:** `pk_test_...`
   - **Secret key:** Click "Reveal" and copy `sk_test_...`

### Step 2: Add to Environment Variables

Create/update `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
```

### Step 3: Test Connection

```bash
npm run test:stripe
```

This will verify your keys work and show you what products/prices you have.

### Step 4: Create Products in Stripe

Go to: https://dashboard.stripe.com/test/products

Create 3 products with these prices:
- **Explorer:** $29/month
- **Researcher:** $79/month  
- **Strategist:** $299/month

**Important:** Copy each Price ID (starts with `price_...`)

### Step 5: Update Database

Run this SQL in Supabase SQL Editor (replace with your actual Price IDs):

```sql
UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_YOUR_EXPLORER_PRICE_ID'
WHERE name = 'explorer';

UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_YOUR_RESEARCHER_PRICE_ID'
WHERE name = 'researcher';

UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_YOUR_STRATEGIST_PRICE_ID'
WHERE name = 'strategist';
```

### Step 6: Test Webhook (Local)

In a new terminal:

```bash
stripe listen --forward-to localhost:3000/api/subscriptions/webhook
```

Copy the `whsec_...` secret and add to `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

### Step 7: Test!

1. Start dev server: `npm run dev`
2. The app should now be connected to Stripe!

---

## ✅ Verification Checklist

- [ ] Stripe keys added to `.env.local`
- [ ] `npm run test:stripe` passes
- [ ] Products created in Stripe Dashboard
- [ ] Price IDs updated in database
- [ ] Webhook forwarding set up (local)
- [ ] Webhook secret added to `.env.local`

---

## 🧪 Test Cards

Use these in checkout:
- **Success:** `4242 4242 4242 4242`
- **3D Secure:** `4000 0025 0000 3155`
- **Declined:** `4000 0000 0000 9995`

Any future expiry, any CVC, any ZIP.

---

## 📚 Full Documentation

See `STRIPE_SETUP_GUIDE.md` for detailed instructions.

