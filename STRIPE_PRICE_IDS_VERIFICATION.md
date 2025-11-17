# Stripe Price IDs Verification Checklist

## ✅ Completed Steps

- [x] **Local Environment (`.env.local`)** - All 9 price IDs added
- [x] **Vercel Environment Variables** - All 9 price IDs added

## ⚠️ Remaining Step

- [ ] **Supabase Database** - Still need to update the database (PRIMARY SOURCE)

---

## 🔍 How to Verify Vercel Environment Variables

### Option 1: Check in Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Verify all 9 variables are present:
   - `NEXT_PUBLIC_STRIPE_EXPLORER_ANNUAL_PRICE_ID`
   - `NEXT_PUBLIC_STRIPE_RESEARCHER_ANNUAL_PRICE_ID`
   - `NEXT_PUBLIC_STRIPE_STRATEGIST_ANNUAL_PRICE_ID`
   - `NEXT_PUBLIC_STRIPE_EXPLORER_PRICE_ID`
   - `NEXT_PUBLIC_STRIPE_RESEARCHER_PRICE_ID`
   - `NEXT_PUBLIC_STRIPE_STRATEGIST_PRICE_ID`
   - `NEXT_PUBLIC_STRIPE_EXPLORER_OVERAGE_PRICE_ID`
   - `NEXT_PUBLIC_STRIPE_RESEARCHER_OVERAGE_PRICE_ID`
   - `NEXT_PUBLIC_STRIPE_STRATEGIST_OVERAGE_PRICE_ID`

### Option 2: Test in Production
After your next deployment, the environment variables will be available in production.

---

## 🎯 Next Critical Step: Update Database

**The database is the PRIMARY source of truth.** API routes use the database, not environment variables.

**Action Required:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Run the script: `scripts/update-all-stripe-prices.sql`

This will update all 9 price IDs in the `subscription_plans` table.

---

## 📋 Complete Status

| Location | Status | Notes |
|----------|--------|-------|
| `.env.local` | ✅ Done | All 9 price IDs |
| Vercel Environment Variables | ✅ Done | All 9 price IDs |
| Supabase Database | ⚠️ **TODO** | **CRITICAL** - API uses this |

---

## 🚨 Important Note

**Environment variables are for frontend display.**  
**Database is for backend/API operations.**

Both are needed, but the **database update is critical** for subscriptions to work properly.

