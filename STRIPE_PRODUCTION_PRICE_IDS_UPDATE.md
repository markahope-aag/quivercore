# Production Stripe Price IDs - Update Summary

## ✅ Completed

- [x] **Local Environment (`.env.local`)** - Production price IDs added

## ⚠️ Next Steps Required

### 1. Update Vercel Environment Variables

**Location:** [Vercel Dashboard](https://vercel.com) → Your Project → Settings → Environment Variables

**Update all 9 variables with production price IDs:**

```env
# Annual Prices (3)
NEXT_PUBLIC_STRIPE_EXPLORER_ANNUAL_PRICE_ID=price_1SUFUbAZ6yhLwOTGbiOtd2Gl
NEXT_PUBLIC_STRIPE_RESEARCHER_ANNUAL_PRICE_ID=price_1SUFVxAZ6yhLwOTGvoxZ04fr
NEXT_PUBLIC_STRIPE_STRATEGIST_ANNUAL_PRICE_ID=price_1SUFX6AZ6yhLwOTGWeyejbY6

# Monthly Prices (3)
NEXT_PUBLIC_STRIPE_EXPLORER_PRICE_ID=price_1SUFkfAZ6yhLwOTGN7L5YXHm
NEXT_PUBLIC_STRIPE_RESEARCHER_PRICE_ID=price_1SUFi4AZ6yhLwOTG0r1uE1Ye
NEXT_PUBLIC_STRIPE_STRATEGIST_PRICE_ID=price_1SUFdZAZ6yhLwOTGU8XvfjLo

# Overage Prices (3)
NEXT_PUBLIC_STRIPE_EXPLORER_OVERAGE_PRICE_ID=price_1SUFqXAZ6yhLwOTGT5NR2tTm
NEXT_PUBLIC_STRIPE_RESEARCHER_OVERAGE_PRICE_ID=price_1SUFgfAZ6yhLwOTGUVpsY9NN
NEXT_PUBLIC_STRIPE_STRATEGIST_OVERAGE_PRICE_ID=price_1SUFbpAZ6yhLwOTGV6oi1ghD
```

**Important:**
- Make sure these are set for **Production** environment
- **Redeploy** after updating

---

### 2. Update Supabase Database

**Location:** [Supabase Dashboard](https://app.supabase.com) → Your Project → SQL Editor

**Run the SQL script:** `scripts/update-production-stripe-prices.sql`

This will update all 9 production price IDs in the `subscription_plans` table.

---

## 📋 Production Price IDs Reference

| Plan | Monthly | Annual | Overage |
|------|---------|--------|---------|
| **Explorer** | `price_1SUFkfAZ6yhLwOTGN7L5YXHm` | `price_1SUFUbAZ6yhLwOTGbiOtd2Gl` | `price_1SUFqXAZ6yhLwOTGT5NR2tTm` |
| **Researcher** | `price_1SUFi4AZ6yhLwOTG0r1uE1Ye` | `price_1SUFVxAZ6yhLwOTGvoxZ04fr` | `price_1SUFgfAZ6yhLwOTGUVpsY9NN` |
| **Strategist** | `price_1SUFdZAZ6yhLwOTGU8XvfjLo` | `price_1SUFX6AZ6yhLwOTGWeyejbY6` | `price_1SUFbpAZ6yhLwOTGV6oi1ghD` |

---

## 🎯 Checklist

- [x] Production price IDs added to `.env.local`
- [ ] Production price IDs updated in Vercel environment variables
- [ ] Production price IDs updated in Supabase database
- [ ] Vercel redeployed after environment variable updates
- [ ] Test subscription checkout in production

---

## ⚠️ Important Notes

1. **These are LIVE/Production price IDs** - They will charge real money
2. **Make sure you're using production Stripe keys** (`sk_live_...` and `pk_live_...`) in Vercel
3. **Test thoroughly** before going live with real customers
4. **Database is primary source** - API routes use the database, not environment variables

---

## 🚀 After Updates

1. **Test in Production:**
   - Try creating a test subscription
   - Verify webhook events are received
   - Check that subscriptions are created correctly

2. **Monitor:**
   - Check Stripe Dashboard for successful payments
   - Monitor application logs
   - Verify database records

