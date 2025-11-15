# Stripe Sandbox Setup Guide

## Step-by-Step Connection Guide

This guide walks you through connecting your Stripe sandbox (test mode) to QuiverCore.

---

## Step 1: Get Your Stripe API Keys

1. **Go to Stripe Dashboard:**
   - Visit: https://dashboard.stripe.com/test/apikeys
   - Make sure you're in **Test mode** (toggle in top right)

2. **Copy Your Keys:**
   - **Publishable key:** `pk_test_...` (starts with `pk_test_`)
   - **Secret key:** `sk_test_...` (starts with `sk_test_`)
   - Click "Reveal test key" to see the secret key

3. **Get Webhook Secret (we'll do this in Step 5):**
   - We'll set up webhooks and get the secret later

---

## Step 2: Add Environment Variables

### Local Development (.env.local)

Create or update `.env.local` in your project root:

```env
# Stripe Test Keys (Sandbox)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Your existing variables...
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
```

**Important:**
- `STRIPE_SECRET_KEY` - Server-side only (never exposed to client)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Client-side (safe to expose)
- `STRIPE_WEBHOOK_SECRET` - We'll get this after setting up webhooks

### Vercel/Production

1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add the same three variables
4. Make sure to add them for all environments (Production, Preview, Development)

---

## Step 3: Create Products and Prices in Stripe

You need to create products and prices that match your subscription plans.

### Option A: Using Stripe Dashboard

1. **Go to Products:** https://dashboard.stripe.com/test/products
2. **Create 3 Products:**

   **Product 1: Explorer**
   - Name: `Explorer`
   - Description: `Break free from predictable AI - discover what your AI can really create`
   - Pricing: `$29.00 USD` / `Monthly`
   - Click "Save product"
   - **Copy the Price ID** (starts with `price_...`)

   **Product 2: Researcher**
   - Name: `Researcher`
   - Description: `Harness Stanford's breakthrough research - systematic creative AI for professionals`
   - Pricing: `$79.00 USD` / `Monthly`
   - Click "Save product"
   - **Copy the Price ID**

   **Product 3: Strategist**
   - Name: `Strategist`
   - Description: `Command enterprise-grade AI creativity - asymmetric advantages at scale`
   - Pricing: `$299.00 USD` / `Monthly`
   - Click "Save product"
   - **Copy the Price ID**

### Option B: Using Stripe CLI (Faster)

```bash
# Install Stripe CLI if you haven't: https://stripe.com/docs/stripe-cli
stripe login

# Create Explorer plan
stripe products create --name="Explorer" --description="Break free from predictable AI"
stripe prices create --product=prod_XXX --unit-amount=2900 --currency=usd --recurring[interval]=month

# Create Researcher plan
stripe products create --name="Researcher" --description="Harness Stanford's breakthrough research"
stripe prices create --product=prod_XXX --unit-amount=7900 --currency=usd --recurring[interval]=month

# Create Strategist plan
stripe products create --name="Strategist" --description="Command enterprise-grade AI creativity"
stripe prices create --product=prod_XXX --unit-amount=29900 --currency=usd --recurring[interval]=month
```

---

## Step 4: Update Database with Price IDs

After creating prices in Stripe, update your database:

### Option A: Using Supabase SQL Editor

1. Go to your Supabase Dashboard → SQL Editor
2. Run this SQL (replace `price_...` with your actual Price IDs):

```sql
-- Update Explorer plan
UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_YOUR_EXPLORER_PRICE_ID'
WHERE name = 'explorer';

-- Update Researcher plan
UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_YOUR_RESEARCHER_PRICE_ID'
WHERE name = 'researcher';

-- Update Strategist plan
UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_YOUR_STRATEGIST_PRICE_ID'
WHERE name = 'strategist';
```

### Option B: Using a Migration File

I can create a migration file for you to run.

---

## Step 5: Set Up Webhooks (Local Development)

For local development, use Stripe CLI to forward webhooks:

1. **Install Stripe CLI:**
   ```bash
   # Windows: Download from https://github.com/stripe/stripe-cli/releases
   # Or use: winget install stripe.stripe-cli
   ```

2. **Login to Stripe:**
   ```bash
   stripe login
   ```

3. **Forward Webhooks to Local Server:**
   ```bash
   stripe listen --forward-to localhost:3000/api/subscriptions/webhook
   ```

4. **Copy the Webhook Secret:**
   - The CLI will output: `Ready! Your webhook signing secret is whsec_...`
   - Add this to your `.env.local` as `STRIPE_WEBHOOK_SECRET`

5. **Keep the CLI Running:**
   - Leave this terminal window open while developing
   - It forwards webhook events to your local server

---

## Step 6: Set Up Webhooks (Production)

For production (Vercel):

1. **Get Your Production URL:**
   - Deploy your app to Vercel
   - Get your production URL: `https://your-app.vercel.app`

2. **Create Webhook Endpoint in Stripe:**
   - Go to: https://dashboard.stripe.com/test/webhooks
   - Click "Add endpoint"
   - Endpoint URL: `https://your-app.vercel.app/api/subscriptions/webhook`
   - Select events to listen to:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`
   - Click "Add endpoint"

3. **Copy Webhook Secret:**
   - Click on the webhook endpoint you just created
   - Click "Reveal" next to "Signing secret"
   - Copy the `whsec_...` value
   - Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

---

## Step 7: Test the Connection

### Test 1: Verify API Keys

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Check if keys are loaded:**
   - The app should start without errors
   - Check console for any Stripe-related errors

### Test 2: Test Checkout Session Creation

You can test by creating a checkout session:

```bash
# Using curl (replace with your actual price ID)
curl -X POST http://localhost:3000/api/subscriptions/create-checkout \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"priceId": "price_YOUR_TEST_PRICE_ID"}'
```

Or test from the browser console (after logging in):
```javascript
fetch('/api/subscriptions/create-checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ priceId: 'price_YOUR_TEST_PRICE_ID' })
}).then(r => r.json()).then(console.log)
```

### Test 3: Test Webhook (Local)

1. **Start webhook forwarding:**
   ```bash
   stripe listen --forward-to localhost:3000/api/subscriptions/webhook
   ```

2. **Trigger a test event:**
   ```bash
   stripe trigger customer.subscription.created
   ```

3. **Check your server logs:**
   - You should see the webhook being processed
   - Check your database - a subscription should be created

---

## Step 8: Test Payment Flow

### Using Stripe Test Cards

When testing checkout, use these test card numbers:

**Success:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**Requires Authentication:**
- Card: `4000 0025 0000 3155`

**Declined:**
- Card: `4000 0000 0000 9995`

---

## Troubleshooting

### Issue: "STRIPE_SECRET_KEY is not configured"
**Solution:** Make sure `.env.local` exists and has `STRIPE_SECRET_KEY=sk_test_...`

### Issue: Webhook signature verification fails
**Solution:** 
- Make sure `STRIPE_WEBHOOK_SECRET` matches the secret from `stripe listen`
- For production, use the webhook secret from Stripe Dashboard

### Issue: "Price not found" when creating checkout
**Solution:**
- Verify the price ID exists in Stripe Dashboard
- Check that `stripe_price_id_monthly` is set in database
- Make sure you're using test mode price IDs (they start with `price_`)

### Issue: Webhook not receiving events
**Solution:**
- For local: Make sure `stripe listen` is running
- For production: Verify webhook URL is correct in Stripe Dashboard
- Check that webhook endpoint is accessible (not behind auth)

---

## Next Steps

Once connected:
1. ✅ Test creating a checkout session
2. ✅ Test completing a payment
3. ✅ Verify webhook creates subscription in database
4. ✅ Test subscription status endpoint
5. ✅ Build pricing page UI

---

## Quick Reference

**Stripe Dashboard:**
- Test Mode: https://dashboard.stripe.com/test
- API Keys: https://dashboard.stripe.com/test/apikeys
- Products: https://dashboard.stripe.com/test/products
- Webhooks: https://dashboard.stripe.com/test/webhooks

**Environment Variables Needed:**
```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Test Card Numbers:**
- Success: `4242 4242 4242 4242`
- 3D Secure: `4000 0025 0000 3155`
- Declined: `4000 0000 0000 9995`

