# Complete Stripe Price IDs Setup Guide

## Where All 9 Price IDs Need to Be Entered

### ✅ 1. Local Environment (`.env.local`) - DONE
All 9 price IDs are now in your `.env.local` file.

---

### ⚠️ 2. Vercel Environment Variables (Production) - REQUIRED

**Location:** [Vercel Dashboard](https://vercel.com) → Your Project → Settings → Environment Variables

**Add all 9 variables:**

```env
# Annual Prices (3)
NEXT_PUBLIC_STRIPE_EXPLORER_ANNUAL_PRICE_ID=price_1SUF2IAjII6lIBnkHoqsYg6i
NEXT_PUBLIC_STRIPE_RESEARCHER_ANNUAL_PRICE_ID=price_1SUF0YAjII6lIBnkrcwhrUFI
NEXT_PUBLIC_STRIPE_STRATEGIST_ANNUAL_PRICE_ID=price_1SUEyEAjII6lIBnkJFoir7pB

# Monthly Prices (3)
NEXT_PUBLIC_STRIPE_EXPLORER_PRICE_ID=price_1STshaAjII6lIBnkmV4yR35n
NEXT_PUBLIC_STRIPE_RESEARCHER_PRICE_ID=price_1STsiuAjII6lIBnkTVHhA54U
NEXT_PUBLIC_STRIPE_STRATEGIST_PRICE_ID=price_1STslRAjII6lIBnkWxwAXEWJ

# Overage Prices (3)
NEXT_PUBLIC_STRIPE_EXPLORER_OVERAGE_PRICE_ID=price_1STsfkAjII6lIBnkpdiBfQRl
NEXT_PUBLIC_STRIPE_RESEARCHER_OVERAGE_PRICE_ID=price_1STskXAjII6lIBnkTfNDe7TH
NEXT_PUBLIC_STRIPE_STRATEGIST_OVERAGE_PRICE_ID=price_1STsn1AjII6lIBnk60vPpusj
```

**Important:**
- Add them for **Production**, **Preview**, and **Development** environments
- Redeploy after adding

---

### ⚠️ 3. Database (Supabase) - PRIMARY SOURCE - REQUIRED

**Location:** [Supabase Dashboard](https://app.supabase.com) → Your Project → SQL Editor

**This is the PRIMARY source of truth.** The API routes use the database, not environment variables.

**Run this SQL script to update all 9 price IDs:**

```sql
-- ============================================
-- Update ALL 9 Stripe Price IDs in Database
-- ============================================

-- Monthly Prices (3)
UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_1STshaAjII6lIBnkmV4yR35n'
WHERE name = 'explorer';

UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_1STsiuAjII6lIBnkTVHhA54U'
WHERE name = 'researcher';

UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_1STslRAjII6lIBnkWxwAXEWJ'
WHERE name = 'strategist';

-- Annual Prices (3)
UPDATE subscription_plans
SET stripe_price_id_yearly = 'price_1SUF2IAjII6lIBnkHoqsYg6i'
WHERE name = 'explorer';

UPDATE subscription_plans
SET stripe_price_id_yearly = 'price_1SUF0YAjII6lIBnkrcwhrUFI'
WHERE name = 'researcher';

UPDATE subscription_plans
SET stripe_price_id_yearly = 'price_1SUEyEAjII6lIBnkJFoir7pB'
WHERE name = 'strategist';

-- Overage Prices (3)
UPDATE subscription_plans
SET stripe_price_id_overage = 'price_1STsfkAjII6lIBnkpdiBfQRl'
WHERE name = 'explorer';

UPDATE subscription_plans
SET stripe_price_id_overage = 'price_1STskXAjII6lIBnkTfNDe7TH'
WHERE name = 'researcher';

UPDATE subscription_plans
SET stripe_price_id_overage = 'price_1STsn1AjII6lIBnk60vPpusj'
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

## 📋 Summary Checklist

| Location | Status | Action Required |
|----------|--------|-----------------|
| ✅ `.env.local` | **DONE** | All 9 price IDs added |
| ⚠️ **Vercel Environment Variables** | **TODO** | Add all 9 variables for Production/Preview/Development |
| ⚠️ **Supabase Database** | **TODO** | Run SQL script to update all 3 columns (monthly, yearly, overage) |

---

## 🎯 Priority Order

1. **Database (Supabase)** - **HIGHEST PRIORITY**
   - This is the primary source of truth
   - API routes use the database
   - Required for subscriptions to work

2. **Vercel Environment Variables** - **HIGH PRIORITY**
   - Required for production deployment
   - Frontend components may use these
   - Needed for pricing page to display correctly

3. **Local Environment** - **DONE** ✅
   - Already completed

---

## 📝 Notes

- **Database is primary:** The `subscription_plans` table is the main source of truth. API routes query the database for price IDs.
- **Environment variables are secondary:** Used by some frontend components (like `pricing-page-content-v3.tsx`).
- **Both are needed:** Database for backend/API, environment variables for frontend display.

---

## 🚀 Quick Start

1. **Copy the SQL script above** → Run in Supabase SQL Editor
2. **Copy the 9 environment variables above** → Add to Vercel Dashboard
3. **Redeploy** your Vercel project after adding environment variables

