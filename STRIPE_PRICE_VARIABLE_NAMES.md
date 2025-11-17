# Stripe Price ID Variable Names

## The 9 Stripe Price IDs - Variable Names

### 📊 Database Column Names (Primary Storage)

All 9 price IDs are stored in the `subscription_plans` table using these **3 database columns**:

| Column Name | Purpose | Count | Plans |
|------------|---------|-------|-------|
| `stripe_price_id_monthly` | Monthly subscription prices | 3 | explorer, researcher, strategist |
| `stripe_price_id_yearly` | Annual subscription prices | 3 | explorer, researcher, strategist |
| `stripe_price_id_overage` | Overage prices (per prompt over limit) | 3 | explorer, researcher, strategist |

**Total: 3 columns × 3 plans = 9 price IDs**

---

### 🔧 Environment Variable Names (Optional - Used in Some Components)

#### Currently Used in Code:
- `NEXT_PUBLIC_STRIPE_EXPLORER_PRICE_ID` (used in `pricing-page-content-v3.tsx`)
- `NEXT_PUBLIC_STRIPE_RESEARCHER_PRICE_ID` (used in `pricing-page-content-v3.tsx`)
- `NEXT_PUBLIC_STRIPE_STRATEGIST_PRICE_ID` (used in `pricing-page-content-v3.tsx`)

#### You Just Added:
- `NEXT_PUBLIC_STRIPE_EXPLORER_ANNUAL_PRICE_ID` ✅
- `NEXT_PUBLIC_STRIPE_RESEARCHER_ANNUAL_PRICE_ID` ✅
- `NEXT_PUBLIC_STRIPE_STRATEGIST_ANNUAL_PRICE_ID` ✅

#### Potential (Not Currently Used):
- `NEXT_PUBLIC_STRIPE_EXPLORER_MONTHLY_PRICE_ID`
- `NEXT_PUBLIC_STRIPE_RESEARCHER_MONTHLY_PRICE_ID`
- `NEXT_PUBLIC_STRIPE_STRATEGIST_MONTHLY_PRICE_ID`
- `NEXT_PUBLIC_STRIPE_EXPLORER_OVERAGE_PRICE_ID`
- `NEXT_PUBLIC_STRIPE_RESEARCHER_OVERAGE_PRICE_ID`
- `NEXT_PUBLIC_STRIPE_STRATEGIST_OVERAGE_PRICE_ID`

---

## 📋 Complete Variable Name Reference

### Database (Supabase) - Primary Source

```sql
-- Monthly Prices (3)
subscription_plans.stripe_price_id_monthly WHERE name = 'explorer'
subscription_plans.stripe_price_id_monthly WHERE name = 'researcher'
subscription_plans.stripe_price_id_monthly WHERE name = 'strategist'

-- Annual Prices (3)
subscription_plans.stripe_price_id_yearly WHERE name = 'explorer'
subscription_plans.stripe_price_id_yearly WHERE name = 'researcher'
subscription_plans.stripe_price_id_yearly WHERE name = 'strategist'

-- Overage Prices (3)
subscription_plans.stripe_price_id_overage WHERE name = 'explorer'
subscription_plans.stripe_price_id_overage WHERE name = 'researcher'
subscription_plans.stripe_price_id_overage WHERE name = 'strategist'
```

### Environment Variables (`.env.local` / Vercel)

**Currently Active:**
```env
# Annual Prices (you just added these)
NEXT_PUBLIC_STRIPE_EXPLORER_ANNUAL_PRICE_ID=price_1SUF2IAjII6lIBnkHoqsYg6i
NEXT_PUBLIC_STRIPE_RESEARCHER_ANNUAL_PRICE_ID=price_1SUF0YAjII6lIBnkrcwhrUFI
NEXT_PUBLIC_STRIPE_STRATEGIST_ANNUAL_PRICE_ID=price_1SUEyEAjII6lIBnkJFoir7pB

# Used by pricing-page-content-v3.tsx (needs to match annual or monthly)
NEXT_PUBLIC_STRIPE_EXPLORER_PRICE_ID=<value>
NEXT_PUBLIC_STRIPE_RESEARCHER_PRICE_ID=<value>
NEXT_PUBLIC_STRIPE_STRATEGIST_PRICE_ID=<value>
```

**Note:** The code in `pricing-page-content-v3.tsx` uses `NEXT_PUBLIC_STRIPE_EXPLORER_PRICE_ID` (without "ANNUAL"), but you added `NEXT_PUBLIC_STRIPE_EXPLORER_ANNUAL_PRICE_ID`. You may need to add aliases or update the code.

---

## 🎯 Summary

| Location | Variable Pattern | Count |
|----------|-----------------|-------|
| **Database Columns** | `stripe_price_id_monthly`, `stripe_price_id_yearly`, `stripe_price_id_overage` | 3 columns |
| **Database Values** | One per plan per column | 9 values |
| **Env Vars (Active)** | `NEXT_PUBLIC_STRIPE_*_PRICE_ID` | 6 variables |
| **Env Vars (Potential)** | `NEXT_PUBLIC_STRIPE_*_MONTHLY/ANNUAL/OVERAGE_PRICE_ID` | 9 variables |

---

## ⚠️ Important Note

**Primary Source:** The database (`subscription_plans` table) is the **primary source of truth** for all 9 price IDs. Environment variables are optional and only used by some frontend components.

**Best Practice:** Store all 9 price IDs in the database, and use environment variables only if needed for specific frontend components.

