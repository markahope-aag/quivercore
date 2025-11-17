# Moving Stripe from Test Mode to Production

## ⚠️ Important: Stripe Doesn't Have "Push to Production"

Stripe doesn't have a direct "push to production" feature. You need to:
1. **Recreate** all products and prices in **Live mode**
2. **Update** your environment variables with **production keys**
3. **Update** your database with **production price IDs**
4. **Set up** production webhooks

---

## 📋 Step-by-Step Guide

### Step 1: Switch to Live Mode in Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. **Toggle from "Test mode" to "Live mode"** (toggle in top right)
3. You'll see a warning - this is normal for first-time production setup

---

### Step 2: Get Your Production API Keys

1. In **Live mode**, go to: https://dashboard.stripe.com/apikeys
2. Copy your **Live keys**:
   - **Publishable key:** `pk_live_...` (starts with `pk_live_`)
   - **Secret key:** `sk_live_...` (starts with `sk_live_`)
   - Click "Reveal live key" to see the secret key

**⚠️ CRITICAL:** These are different from your test keys!

---

### Step 3: Recreate Products and Prices in Live Mode

You need to recreate all 9 products/prices in live mode:

#### 3.1 Monthly Subscription Prices (3)

1. Go to: https://dashboard.stripe.com/products
2. Click **"+ Add product"**
3. Create each product:

   **Explorer Monthly:**
   - Name: `Explorer`
   - Description: `Break free from predictable AI - discover what your AI can really create`
   - Pricing: `$29.00 USD` / `Monthly` (recurring)
   - Click "Save product"
   - **Copy the Price ID** (starts with `price_...`)

   **Researcher Monthly:**
   - Name: `Researcher`
   - Description: `Harness Stanford's breakthrough research - systematic creative AI for professionals`
   - Pricing: `$79.00 USD` / `Monthly` (recurring)
   - Click "Save product"
   - **Copy the Price ID**

   **Strategist Monthly:**
   - Name: `Strategist`
   - Description: `Command enterprise-grade AI creativity - asymmetric advantages at scale`
   - Pricing: `$299.00 USD` / `Monthly` (recurring)
   - Click "Save product"
   - **Copy the Price ID**

#### 3.2 Annual Subscription Prices (3)

For each product above, add an **annual price**:

1. Click on the product
2. Click **"+ Add another price"**
3. Set pricing:
   - **Explorer Annual:** `$279.00 USD` / `Yearly` (recurring) - Save 20%
   - **Researcher Annual:** `$758.00 USD` / `Yearly` (recurring) - Save 20%
   - **Strategist Annual:** `$2,870.00 USD` / `Yearly` (recurring) - Save 20%
4. **Copy each Annual Price ID**

#### 3.3 Overage Prices (3)

Create 3 separate products for overage charges:

1. Click **"+ Add product"**
2. Create each:

   **Explorer Overage:**
   - Name: `Explorer Overage`
   - Description: `Per prompt charge for Explorer plan overage`
   - Pricing: `$0.75 USD` / `One time` (not recurring)
   - Click "Save product"
   - **Copy the Price ID**

   **Researcher Overage:**
   - Name: `Researcher Overage`
   - Description: `Per prompt charge for Researcher plan overage`
   - Pricing: `$0.75 USD` / `One time`
   - Click "Save product"
   - **Copy the Price ID**

   **Strategist Overage:**
   - Name: `Strategist Overage`
   - Description: `Per prompt charge for Strategist plan overage`
   - Pricing: `$0.50 USD` / `One time`
   - Click "Save product"
   - **Copy the Price ID**

---

### Step 4: Update Environment Variables

#### 4.1 Update `.env.local` (Keep Test Keys for Local Dev)

**Option A: Keep Test Keys for Local Development**
```env
# Stripe Test Keys (for local development)
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_TEST_WEBHOOK_SECRET

# Stripe Production Keys (for production only - set in Vercel)
# STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
```

**Option B: Use Production Keys Locally (Not Recommended)**
```env
# Stripe Production Keys
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
```

#### 4.2 Update Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com) → Your Project → Settings → Environment Variables
2. **Update existing variables** or add new ones:

```env
# Production Stripe Keys
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY

# Production Price IDs (9 total)
NEXT_PUBLIC_STRIPE_EXPLORER_ANNUAL_PRICE_ID=price_YOUR_LIVE_ANNUAL_PRICE_ID
NEXT_PUBLIC_STRIPE_RESEARCHER_ANNUAL_PRICE_ID=price_YOUR_LIVE_ANNUAL_PRICE_ID
NEXT_PUBLIC_STRIPE_STRATEGIST_ANNUAL_PRICE_ID=price_YOUR_LIVE_ANNUAL_PRICE_ID
NEXT_PUBLIC_STRIPE_EXPLORER_PRICE_ID=price_YOUR_LIVE_MONTHLY_PRICE_ID
NEXT_PUBLIC_STRIPE_RESEARCHER_PRICE_ID=price_YOUR_LIVE_MONTHLY_PRICE_ID
NEXT_PUBLIC_STRIPE_STRATEGIST_PRICE_ID=price_YOUR_LIVE_MONTHLY_PRICE_ID
NEXT_PUBLIC_STRIPE_EXPLORER_OVERAGE_PRICE_ID=price_YOUR_LIVE_OVERAGE_PRICE_ID
NEXT_PUBLIC_STRIPE_RESEARCHER_OVERAGE_PRICE_ID=price_YOUR_LIVE_OVERAGE_PRICE_ID
NEXT_PUBLIC_STRIPE_STRATEGIST_OVERAGE_PRICE_ID=price_YOUR_LIVE_OVERAGE_PRICE_ID
```

3. Make sure to set them for **Production** environment
4. **Redeploy** after updating

---

### Step 5: Update Database with Production Price IDs

1. Go to [Supabase Dashboard](https://app.supabase.com) → Your Project → SQL Editor
2. Run this SQL script (replace with your **production** price IDs):

```sql
-- ============================================
-- Update ALL 9 Production Stripe Price IDs
-- ============================================

-- Monthly Prices (3) - REPLACE WITH YOUR LIVE PRICE IDs
UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_YOUR_LIVE_EXPLORER_MONTHLY'
WHERE name = 'explorer';

UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_YOUR_LIVE_RESEARCHER_MONTHLY'
WHERE name = 'researcher';

UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_YOUR_LIVE_STRATEGIST_MONTHLY'
WHERE name = 'strategist';

-- Annual Prices (3) - REPLACE WITH YOUR LIVE PRICE IDs
UPDATE subscription_plans
SET stripe_price_id_yearly = 'price_YOUR_LIVE_EXPLORER_ANNUAL'
WHERE name = 'explorer';

UPDATE subscription_plans
SET stripe_price_id_yearly = 'price_YOUR_LIVE_RESEARCHER_ANNUAL'
WHERE name = 'researcher';

UPDATE subscription_plans
SET stripe_price_id_yearly = 'price_YOUR_LIVE_STRATEGIST_ANNUAL'
WHERE name = 'strategist';

-- Overage Prices (3) - REPLACE WITH YOUR LIVE PRICE IDs
UPDATE subscription_plans
SET stripe_price_id_overage = 'price_YOUR_LIVE_EXPLORER_OVERAGE'
WHERE name = 'explorer';

UPDATE subscription_plans
SET stripe_price_id_overage = 'price_YOUR_LIVE_RESEARCHER_OVERAGE'
WHERE name = 'researcher';

UPDATE subscription_plans
SET stripe_price_id_overage = 'price_YOUR_LIVE_STRATEGIST_OVERAGE'
WHERE name = 'strategist';

-- Verify all updates
SELECT 
  name,
  display_name,
  stripe_price_id_monthly,
  stripe_price_id_yearly,
  stripe_price_id_overage,
  CASE 
    WHEN stripe_price_id_monthly IS NOT NULL 
     AND stripe_price_id_yearly IS NOT NULL 
     AND stripe_price_id_overage IS NOT NULL 
    THEN '✅ Complete'
    ELSE '⚠️ Missing some price IDs'
  END as status
FROM subscription_plans
WHERE name IN ('explorer', 'researcher', 'strategist')
ORDER BY price_monthly;
```

---

### Step 6: Set Up Production Webhooks

1. In **Live mode** Stripe Dashboard, go to: https://dashboard.stripe.com/webhooks
2. Click **"+ Add endpoint"**
3. Enter your production webhook URL:
   ```
   https://your-production-domain.com/api/subscriptions/webhook
   ```
   (Replace with your actual Vercel production URL)
4. Select events to listen to:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `checkout.session.completed`
5. Click **"Add endpoint"**
6. **Copy the webhook signing secret** (starts with `whsec_...`)
7. Add to Vercel environment variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_PRODUCTION_WEBHOOK_SECRET
   ```

---

## 📋 Production Checklist

- [ ] Switched to Live mode in Stripe Dashboard
- [ ] Got production API keys (`sk_live_...` and `pk_live_...`)
- [ ] Created all 3 monthly subscription products in Live mode
- [ ] Created all 3 annual subscription prices in Live mode
- [ ] Created all 3 overage products in Live mode
- [ ] Copied all 9 production price IDs
- [ ] Updated Vercel environment variables with production keys
- [ ] Updated Vercel environment variables with production price IDs
- [ ] Updated Supabase database with production price IDs
- [ ] Set up production webhook endpoint
- [ ] Added production webhook secret to Vercel
- [ ] Redeployed Vercel project
- [ ] Tested subscription checkout in production

---

## ⚠️ Important Notes

1. **Test vs Production Keys:**
   - Test keys: `sk_test_...` and `pk_test_...`
   - Production keys: `sk_live_...` and `pk_live_...`
   - **Never mix them!**

2. **Price IDs are Different:**
   - Test price IDs: `price_1ST...` (from your test mode)
   - Production price IDs: `price_1...` (new IDs from live mode)
   - **You must update all 9 price IDs in the database**

3. **Keep Test Mode for Development:**
   - Consider keeping test keys in `.env.local` for local development
   - Use production keys only in Vercel for production environment

4. **Webhook Secrets are Different:**
   - Test webhook secret: `whsec_...` (from test mode)
   - Production webhook secret: `whsec_...` (new secret from live mode)
   - **You need a new webhook secret for production**

---

## 🚀 After Setup

1. **Test in Production:**
   - Try creating a test subscription (use Stripe test card: `4242 4242 4242 4242`)
   - Verify webhook events are received
   - Check that subscriptions are created in your database

2. **Monitor:**
   - Check Stripe Dashboard for successful payments
   - Monitor your application logs for webhook events
   - Verify database records are created correctly

---

## 📝 Quick Reference

**Test Mode URLs:**
- Dashboard: https://dashboard.stripe.com/test
- API Keys: https://dashboard.stripe.com/test/apikeys
- Products: https://dashboard.stripe.com/test/products
- Webhooks: https://dashboard.stripe.com/test/webhooks

**Live Mode URLs:**
- Dashboard: https://dashboard.stripe.com
- API Keys: https://dashboard.stripe.com/apikeys
- Products: https://dashboard.stripe.com/products
- Webhooks: https://dashboard.stripe.com/webhooks

---

## ⚠️ Security Reminders

- **Never commit production keys to Git**
- **Never expose `sk_live_...` keys in client-side code**
- **Use environment variables for all keys**
- **Rotate keys if they're ever exposed**

---

## 🆘 Troubleshooting

**Issue: "Invalid API key"**
- Make sure you're using `sk_live_...` keys in production
- Verify keys are set in Vercel environment variables
- Redeploy after adding keys

**Issue: "Price not found"**
- Verify you're using production price IDs (not test IDs)
- Check that price IDs are updated in the database
- Ensure products exist in Live mode

**Issue: "Webhook signature verification failed"**
- Make sure you're using the production webhook secret
- Verify webhook URL is correct (production domain)
- Check that webhook secret is in Vercel environment variables

