# All Stripe Price IDs in QuiverCore

Your app requires **9 Stripe Price IDs** total:

## 📊 Breakdown: 3 Plans × 3 Price Types = 9 IDs

### 1. Monthly Subscription Prices (3 IDs)
For monthly recurring subscriptions:
- **Explorer Monthly**: `stripe_price_id_monthly` for explorer plan
- **Researcher Monthly**: `stripe_price_id_monthly` for researcher plan
- **Strategist Monthly**: `stripe_price_id_monthly` for strategist plan

**Database Column**: `subscription_plans.stripe_price_id_monthly`

### 2. Annual Subscription Prices (3 IDs)
For annual recurring subscriptions (you just added these):
- **Explorer Annual**: `price_1SUF2IAjII6lIBnkHoqsYg6i` ✅
- **Researcher Annual**: `price_1SUF0YAjII6lIBnkrcwhrUFI` ✅
- **Strategist Annual**: `price_1SUEyEAjII6lIBnkJFoir7pB` ✅

**Database Column**: `subscription_plans.stripe_price_id_yearly`

### 3. Overage Prices (3 IDs)
For charging users when they exceed their monthly prompt limit:
- **Explorer Overage**: `stripe_price_id_overage` for explorer plan
- **Researcher Overage**: `stripe_price_id_overage` for researcher plan
- **Strategist Overage**: `stripe_price_id_overage` for strategist plan

**Database Column**: `subscription_plans.stripe_price_id_overage`

---

## 📋 Complete List

| Plan | Monthly Price ID | Annual Price ID | Overage Price ID |
|------|-----------------|-----------------|------------------|
| **Explorer** | `stripe_price_id_monthly` | `price_1SUF2IAjII6lIBnkHoqsYg6i` ✅ | `stripe_price_id_overage` |
| **Researcher** | `stripe_price_id_monthly` | `price_1SUF0YAjII6lIBnkrcwhrUFI` ✅ | `stripe_price_id_overage` |
| **Strategist** | `stripe_price_id_monthly` | `price_1SUEyEAjII6lIBnkJFoir7pB` ✅ | `stripe_price_id_overage` |

---

## 🔍 Where They're Stored

### Database (Supabase)
All 9 are stored in the `subscription_plans` table:
- `stripe_price_id_monthly` (3 values)
- `stripe_price_id_yearly` (3 values) 
- `stripe_price_id_overage` (3 values)

### Environment Variables (Optional)
Some components use environment variables, but the primary source is the database.

---

## ✅ Current Status

- ✅ **Annual Price IDs**: Added to `.env.local`
- ❓ **Monthly Price IDs**: Need to check if you have these in Stripe
- ❓ **Overage Price IDs**: Need to check if you have these in Stripe

---

## 🎯 Next Steps

1. **Check Stripe Dashboard** for your monthly and overage price IDs
2. **Update Database** with all 9 price IDs
3. **Add to Vercel** environment variables (if using env vars)

Would you like me to help you find the monthly and overage price IDs in your Stripe account?

