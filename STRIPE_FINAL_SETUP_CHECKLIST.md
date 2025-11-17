# Stripe Setup - Final Checklist

## ✅ What You've Done

- [x] Enabled Stripe (test/live keys)
- [x] Updated `.env.local` with Stripe keys
- [x] Updated Vercel environment variables with Stripe keys

## ⚠️ Remaining Steps

### 1. Update Price IDs (If Switching to Test Mode)

**If you're using Test Mode:**
- You need **test price IDs** (different from production)
- Get them from: https://dashboard.stripe.com/test/products
- Update database with test price IDs OR
- Update environment variables with test price IDs

**If you're using Live Mode:**
- You already have production price IDs configured ✅
- No changes needed

### 2. Update Webhook Secret

**Test Mode:**
- Go to: https://dashboard.stripe.com/test/webhooks
- Get the webhook signing secret (`whsec_...`)
- Add to `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_...`
- Add to Vercel environment variables

**Live Mode:**
- Go to: https://dashboard.stripe.com/webhooks
- Get the production webhook signing secret
- Add to Vercel environment variables

### 3. Redeploy Vercel (If Needed)

If you updated environment variables after your last deployment:
- Go to Vercel Dashboard → Your Project → Deployments
- Click "Redeploy" on the latest deployment
- OR push a new commit to trigger automatic deployment

### 4. Update Database (If Using Test Mode)

If you're testing with test mode price IDs:
- Go to Supabase Dashboard → SQL Editor
- Update `subscription_plans` table with test price IDs
- Or keep production price IDs if you're just testing the flow

### 5. Test the Connection

Verify everything works:

```bash
# Test Stripe connection (if you have this script)
npm run test:stripe
```

Or manually test:
- Try creating a subscription checkout
- Use test card: `4242 4242 4242 4242`
- Verify webhook events are received
- Check that subscriptions are created in database

---

## 📋 Complete Checklist

### Environment Variables
- [x] Stripe keys in `.env.local`
- [x] Stripe keys in Vercel
- [ ] Webhook secret in `.env.local` (if testing locally)
- [ ] Webhook secret in Vercel

### Price IDs
- [ ] Test price IDs (if using test mode) OR
- [x] Production price IDs (if using live mode) - Already configured

### Database
- [x] Production price IDs in database (already done)
- [ ] Test price IDs in database (only if switching to test mode)

### Deployment
- [ ] Vercel redeployed (if env vars updated after last deploy)

### Testing
- [ ] Test subscription checkout
- [ ] Verify webhook events
- [ ] Check database records

---

## 🎯 Quick Decision Tree

**Are you using Test Mode or Live Mode?**

### If Test Mode:
1. ✅ Keys updated (done)
2. ⚠️ Get test price IDs from Stripe Dashboard
3. ⚠️ Update database with test price IDs (optional - can keep production IDs)
4. ⚠️ Get test webhook secret
5. ⚠️ Update webhook secret in env vars
6. ⚠️ Redeploy Vercel

### If Live Mode:
1. ✅ Keys updated (done)
2. ✅ Production price IDs already configured
3. ⚠️ Get production webhook secret
4. ⚠️ Update webhook secret in Vercel
5. ⚠️ Redeploy Vercel (if needed)
6. ⚠️ Test with real payment (carefully!)

---

## 🔍 How to Check What Mode You're In

**Check your environment variables:**
- Test mode: `STRIPE_SECRET_KEY=sk_test_...`
- Live mode: `STRIPE_SECRET_KEY=sk_live_...`

**Check Stripe Dashboard:**
- Look at the toggle in top right
- Test mode shows "Test mode"
- Live mode shows "Live mode"

---

## ⚠️ Most Common Missing Step

**Webhook Secret** is often forgotten but required for:
- Subscription creation events
- Payment success/failure events
- Subscription updates

Make sure you have `STRIPE_WEBHOOK_SECRET` set in Vercel!

---

## 🚀 Next Steps Summary

1. **Get webhook secret** from Stripe Dashboard (test or live, depending on your mode)
2. **Add webhook secret** to Vercel environment variables
3. **Redeploy Vercel** if you updated environment variables
4. **Test** subscription checkout flow
5. **Verify** webhook events are received

---

## 🆘 Quick Troubleshooting

**"Webhook signature verification failed"**
→ Missing or incorrect `STRIPE_WEBHOOK_SECRET`

**"Price not found"**
→ Price IDs don't match the mode (test vs live)

**"Invalid API key"**
→ Keys don't match the mode (test vs live)

**Subscriptions not creating**
→ Check webhook endpoint is configured in Stripe Dashboard

