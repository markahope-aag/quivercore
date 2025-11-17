# How to Put Stripe in Test Mode

## 🔄 Switching to Test Mode

Stripe has two modes: **Test mode** (sandbox) and **Live mode** (production). To test your integration safely, you need to use Test mode.

---

## Step 1: Switch to Test Mode in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Look for the **mode toggle** in the top right corner
3. Click to switch from **"Live mode"** to **"Test mode"**
4. The dashboard will refresh and show test data

**Visual Indicator:**
- **Test mode:** Toggle shows "Test mode" (usually gray/blue)
- **Live mode:** Toggle shows "Live mode" (usually black)

---

## Step 2: Get Your Test Mode API Keys

1. In **Test mode**, go to: https://dashboard.stripe.com/test/apikeys
2. Copy your **Test keys**:
   - **Publishable key:** `pk_test_...` (starts with `pk_test_`)
   - **Secret key:** `sk_test_...` (starts with `sk_test_`)
   - Click "Reveal test key" to see the secret key

**Important:** Test keys are different from live keys!

---

## Step 3: Update Environment Variables

### Option A: Use Test Keys Locally (Recommended for Development)

Update your `.env.local` file:

```env
# Stripe Test Keys (for local development)
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_TEST_WEBHOOK_SECRET

# Test Price IDs (from test mode products)
NEXT_PUBLIC_STRIPE_EXPLORER_ANNUAL_PRICE_ID=price_1ST... (test mode price ID)
NEXT_PUBLIC_STRIPE_RESEARCHER_ANNUAL_PRICE_ID=price_1ST... (test mode price ID)
# ... etc
```

### Option B: Use Test Keys in Vercel (For Testing Production Environment)

1. Go to [Vercel Dashboard](https://vercel.com) → Your Project → Settings → Environment Variables
2. Update or add:
   - `STRIPE_SECRET_KEY=sk_test_...`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`
   - `STRIPE_WEBHOOK_SECRET=whsec_...` (test webhook secret)
3. Update all 9 price IDs with **test mode price IDs**
4. Redeploy after updating

---

## Step 4: Use Test Mode Price IDs

Test mode has its own products and price IDs (different from production).

### Get Test Mode Price IDs

1. In **Test mode**, go to: https://dashboard.stripe.com/test/products
2. Click on each product
3. Copy the **Price ID** (starts with `price_...`)
4. These will be different from your production price IDs

### Update Database with Test Price IDs

Run this SQL in Supabase SQL Editor (replace with your test price IDs):

```sql
-- Update with Test Mode Price IDs
UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_1ST...' -- Your test monthly price ID
WHERE name = 'explorer';

-- Repeat for all plans and price types
```

---

## Step 5: Set Up Test Mode Webhooks

1. In **Test mode**, go to: https://dashboard.stripe.com/test/webhooks
2. Click **"+ Add endpoint"**
3. Enter your webhook URL:
   - Local: Use Stripe CLI (see below)
   - Production: `https://your-domain.com/api/subscriptions/webhook`
4. Select events to listen to
5. Copy the **webhook signing secret** (starts with `whsec_...`)
6. Add to your environment variables

### For Local Testing with Stripe CLI

```bash
# Install Stripe CLI if you haven't
# https://stripe.com/docs/stripe-cli

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/subscriptions/webhook
```

This will give you a `whsec_...` secret to use locally.

---

## 📋 Test Mode Checklist

- [ ] Switched to Test mode in Stripe Dashboard
- [ ] Got test API keys (`sk_test_...` and `pk_test_...`)
- [ ] Updated `.env.local` with test keys
- [ ] Got test mode price IDs from Stripe Dashboard
- [ ] Updated database with test price IDs (optional - can keep production IDs)
- [ ] Set up test webhook endpoint
- [ ] Added test webhook secret to environment variables
- [ ] Tested subscription checkout with test card

---

## 🧪 Testing with Test Cards

Stripe provides test card numbers that work in Test mode:

### Successful Payment
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/34)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

### Other Test Cards
- **Declined:** `4000 0000 0000 0002`
- **Requires Authentication:** `4000 0025 0000 3155`
- **Insufficient Funds:** `4000 0000 0000 9995`

See full list: https://stripe.com/docs/testing

---

## ⚠️ Important Notes

1. **Test mode is safe:** No real money is charged
2. **Test keys are different:** `sk_test_...` vs `sk_live_...`
3. **Test price IDs are different:** Test mode products have different IDs
4. **Can't mix modes:** Don't use test keys with live price IDs or vice versa
5. **Test data is separate:** Test mode customers/subscriptions don't appear in Live mode

---

## 🔄 Switching Back to Live Mode

When ready for production:

1. Switch to **Live mode** in Stripe Dashboard
2. Get **Live API keys** (`sk_live_...` and `pk_live_...`)
3. Update environment variables with live keys
4. Use **production price IDs** (the ones you just configured)
5. Set up **production webhooks**
6. Redeploy Vercel

---

## 🎯 Quick Reference

| Item | Test Mode | Live Mode |
|------|-----------|-----------|
| **Dashboard URL** | https://dashboard.stripe.com/test | https://dashboard.stripe.com |
| **API Keys** | `sk_test_...` / `pk_test_...` | `sk_live_...` / `pk_live_...` |
| **Price IDs** | `price_1ST...` (test products) | `price_1SU...` (live products) |
| **Webhooks** | Test endpoint secret | Production endpoint secret |
| **Charges** | No real money | Real money |

---

## 🆘 Troubleshooting

**Issue: "Invalid API key"**
- Make sure you're using `sk_test_...` keys in test mode
- Verify keys match the mode you're in (test vs live)

**Issue: "Price not found"**
- Make sure you're using test price IDs when in test mode
- Verify products exist in Test mode dashboard

**Issue: "Webhook signature verification failed"**
- Make sure you're using the test webhook secret
- Verify webhook URL is correct

---

## 💡 Best Practice

**Recommended Setup:**
- **Local Development:** Use test keys in `.env.local`
- **Vercel Preview/Development:** Use test keys
- **Vercel Production:** Use live keys

This way you can test safely without affecting production.

