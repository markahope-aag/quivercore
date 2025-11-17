# Stripe Price IDs Setup Guide

## Where to Add Stripe Price IDs

You've added annual price IDs to `.env.local`. Here's where else they need to go:

### 1. ✅ Local Environment (`.env.local`) - DONE
You've already added:
- `NEXT_PUBLIC_STRIPE_EXPLORER_ANNUAL_PRICE_ID`
- `NEXT_PUBLIC_STRIPE_RESEARCHER_ANNUAL_PRICE_ID`
- `NEXT_PUBLIC_STRIPE_STRATEGIST_ANNUAL_PRICE_ID`

### 2. ⚠️ Vercel Environment Variables (Production)

**Required for production deployment:**

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:
   ```
   NEXT_PUBLIC_STRIPE_EXPLORER_ANNUAL_PRICE_ID=price_1SUF2IAjII6lIBnkHoqsYg6i
   NEXT_PUBLIC_STRIPE_RESEARCHER_ANNUAL_PRICE_ID=price_1SUF0YAjII6lIBnkrcwhrUFI
   NEXT_PUBLIC_STRIPE_STRATEGIST_ANNUAL_PRICE_ID=price_1SUEyEAjII6lIBnkJFoir7pB
   ```
5. Make sure to add them for **Production**, **Preview**, and **Development** environments
6. Redeploy after adding

### 3. ⚠️ Database (Supabase) - Update `stripe_price_id_yearly`

The database stores price IDs in the `subscription_plans` table. You need to update the `stripe_price_id_yearly` column.

**Run this SQL in Supabase SQL Editor:**

```sql
-- Update Annual Price IDs in Database
UPDATE subscription_plans
SET stripe_price_id_yearly = 'price_1SUF2IAjII6lIBnkHoqsYg6i'
WHERE name = 'explorer';

UPDATE subscription_plans
SET stripe_price_id_yearly = 'price_1SUF0YAjII6lIBnkrcwhrUFI'
WHERE name = 'researcher';

UPDATE subscription_plans
SET stripe_price_id_yearly = 'price_1SUEyEAjII6lIBnkJFoir7pB'
WHERE name = 'strategist';

-- Verify the updates
SELECT name, display_name, price_yearly, stripe_price_id_yearly
FROM subscription_plans
WHERE name IN ('explorer', 'researcher', 'strategist');
```

### 4. ⚠️ Monthly Price IDs (If You Have Them)

If you also created monthly prices in Stripe, you need to:

**A. Add to `.env.local`:**
```env
NEXT_PUBLIC_STRIPE_EXPLORER_MONTHLY_PRICE_ID=price_YOUR_MONTHLY_PRICE_ID
NEXT_PUBLIC_STRIPE_RESEARCHER_MONTHLY_PRICE_ID=price_YOUR_MONTHLY_PRICE_ID
NEXT_PUBLIC_STRIPE_STRATEGIST_MONTHLY_PRICE_ID=price_YOUR_MONTHLY_PRICE_ID
```

**B. Add to Vercel** (same as step 2 above)

**C. Update database:**
```sql
UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_YOUR_MONTHLY_PRICE_ID'
WHERE name = 'explorer';
-- Repeat for researcher and strategist
```

## Current Status

✅ **Local Environment** - Annual price IDs added
⚠️ **Vercel** - Need to add annual price IDs
⚠️ **Database** - Need to update `stripe_price_id_yearly` column
❓ **Monthly Prices** - Do you have monthly price IDs? If yes, add those too

## Quick Checklist

- [x] Annual price IDs in `.env.local`
- [ ] Annual price IDs in Vercel environment variables
- [ ] Annual price IDs in Supabase database (`stripe_price_id_yearly`)
- [ ] Monthly price IDs (if you have them) in `.env.local`
- [ ] Monthly price IDs (if you have them) in Vercel
- [ ] Monthly price IDs (if you have them) in Supabase database (`stripe_price_id_monthly`)

## Note on Environment Variable Names

The code uses different variable names in different places:
- `pricing-page-content-v3.tsx` uses: `NEXT_PUBLIC_STRIPE_EXPLORER_PRICE_ID` (no monthly/annual suffix)
- Your variables are: `NEXT_PUBLIC_STRIPE_EXPLORER_ANNUAL_PRICE_ID` (with annual suffix)

You may need to either:
1. Update the code to use the annual/monthly variable names, OR
2. Add aliases like `NEXT_PUBLIC_STRIPE_EXPLORER_PRICE_ID` pointing to the annual price

Let me know if you want me to check which approach the code expects!

