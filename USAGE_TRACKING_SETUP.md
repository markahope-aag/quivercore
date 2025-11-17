# Usage Tracking & Monthly Reset Implementation

## Overview

Complete implementation of calendar-month billing with automatic usage tracking and monthly resets on the 1st of each month.

## Components Implemented

### 1. Webhook Handling (`lib/stripe/webhooks.ts`)

**New Event Handler: `invoice.payment_succeeded`**
- Triggers when Stripe successfully charges a customer
- Records payment in `billing_history` table
- **Automatically resets usage limits** for new billing period
- Creates/updates `usage_tracking` record for current month

```typescript
case 'invoice.payment_succeeded':
  await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
  break
```

**What It Does:**
1. Extracts subscription and customer info from invoice
2. Records successful payment in billing history
3. Resets `prompts_used` to 0
4. Resets `overage_prompts` to 0
5. Resets `overage_charges` to 0
6. Sets new `reset_date` to 1st of current month

### 2. Usage Tracking System (`lib/usage/usage-tracking.ts`)

**Core Functions:**

**`getOrCreateUsageTracking(userId, planTier)`**
- Gets current month's usage record or creates new one
- Automatically initializes with plan limits

**`incrementPromptUsage(userId, planTier, count)`**
- Increments prompt usage counter
- Returns whether it's an overage
- Updates overage count if over limit

**`recordOverageCharge(userId, planTier, promptCount)`**
- Records overage payment
- Calculates charge based on plan's overage rate
- Updates `overage_prompts` and `overage_charges`

**`hasAvailablePrompts(userId, planTier, count)`**
- Checks if user has prompts available
- Returns remaining count
- Indicates if next usage would be overage

**`resetMonthlyUsage()`**
- Resets ALL active users' usage on 1st of month
- Called by cron job
- Returns stats (users reset, errors)

**`getUserUsageSummary(userId)`**
- Gets current usage for dashboard display
- Returns storage and prompt usage with percentages

### 3. Cron Job (`app/api/cron/reset-usage/route.ts`)

**Endpoint:** `GET /api/cron/reset-usage`

**Vercel Cron Schedule:** `0 0 1 * *` (Midnight UTC on 1st of month)

**Security:**
- Requires `CRON_SECRET` environment variable in production
- Must include `Authorization: Bearer {CRON_SECRET}` header

**What It Does:**
1. Verifies it's the 1st of the month (warns if not)
2. Gets all active subscriptions
3. Resets usage for each user
4. Returns summary (users reset, errors)

### 4. Vercel Configuration (`vercel.json`)

```json
{
  "crons": [
    {
      "path": "/api/cron/reset-usage",
      "schedule": "0 0 1 * *"
    }
  ]
}
```

**Schedule Format:**
- `0 0 1 * *` = Minute 0, Hour 0, Day 1, Every Month, Every Day of Week
- Runs at 00:00 UTC on the 1st of every month

## Database Schema

### `usage_tracking` Table

```sql
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  month_year TEXT NOT NULL, -- Format: 'YYYY-MM'
  prompts_used INTEGER DEFAULT 0,
  prompts_limit INTEGER NOT NULL,
  storage_used INTEGER DEFAULT 0,
  storage_limit INTEGER NOT NULL,
  overage_prompts INTEGER DEFAULT 0,
  overage_charges NUMERIC(10,2) DEFAULT 0,
  reset_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, month_year)
);

CREATE INDEX idx_usage_tracking_user_month ON usage_tracking(user_id, month_year);
CREATE INDEX idx_usage_tracking_month ON usage_tracking(month_year);
```

## Flow Diagrams

### New Subscription Flow

```
User Signs Up (Jan 15)
    ↓
Stripe Charges Prorated Amount ($15.90)
    ↓
Webhook: invoice.payment_succeeded
    ↓
handleInvoicePaymentSucceeded()
    ├─ Record in billing_history
    └─ Create usage_tracking record
        ├─ month_year: '2025-01'
        ├─ prompts_used: 0
        ├─ prompts_limit: 50
        └─ reset_date: '2025-01-01'
    ↓
User Can Create Prompts (50 available until Feb 1)
```

### Monthly Reset Flow

```
Feb 1, 00:00 UTC
    ↓
Vercel Cron Triggers
    ↓
GET /api/cron/reset-usage
    ↓
resetMonthlyUsage()
    ├─ Get all active subscriptions
    ├─ For each user:
    │   └─ Upsert usage_tracking
    │       ├─ month_year: '2025-02'
    │       ├─ prompts_used: 0
    │       ├─ overage_prompts: 0
    │       └─ overage_charges: 0
    └─ Return summary
    ↓
Stripe Charges Monthly Amount ($29)
    ↓
Webhook: invoice.payment_succeeded
    ↓
Usage already reset by cron
(Webhook ensures it's reset even if cron fails)
```

### Overage Flow

```
User at 50/50 prompts
    ↓
Tries to create prompt
    ↓
hasAvailablePrompts()
    └─ wouldBeOverage: true
    ↓
Show UpgradePromptModal
    ├─ Option 1: Pay $0.75 for this prompt
    └─ Option 2: Upgrade to Researcher
    ↓
User Chooses: Pay $0.75
    ↓
createOveragePayment()
    ├─ Stripe charges $0.75
    └─ recordOverageCharge()
        ├─ overage_prompts: 1
        └─ overage_charges: 0.75
    ↓
incrementPromptUsage()
    └─ prompts_used: 51
    ↓
Prompt Created Successfully
```

## Environment Variables Required

```bash
# Existing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# New - Add to .env.local and Vercel
CRON_SECRET=your-random-secret-here
```

**Generate CRON_SECRET:**
```bash
openssl rand -base64 32
```

## Vercel Deployment Setup

### 1. Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables:
- `CRON_SECRET` = (generated secret)

### 2. Deploy

```bash
git add .
git commit -m "Add usage tracking with monthly reset"
git push
```

### 3. Verify Cron Job

After deployment:
1. Go to Vercel Dashboard → Your Project → Crons
2. You should see: `/api/cron/reset-usage` scheduled for `0 0 1 * *`
3. Click "Run" to test manually

### 4. Configure Stripe Webhooks

Add to Stripe Webhooks (if not already):
- `invoice.payment_succeeded`
- `invoice.paid` (legacy support)

## Testing

### Test Monthly Reset Manually

```bash
curl -X POST https://your-domain.com/api/cron/reset-usage \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Expected Response:**
```json
{
  "success": true,
  "usersReset": 5,
  "errors": 0,
  "timestamp": "2025-01-16T12:00:00.000Z"
}
```

### Test Usage Tracking

```typescript
// In your prompt creation endpoint
import { hasAvailablePrompts, incrementPromptUsage } from '@/lib/usage/usage-tracking'

// Before creating prompt
const { remaining, wouldBeOverage } = await hasAvailablePrompts(userId, 'explorer', 1)

if (wouldBeOverage) {
  // Show upgrade modal
  return { requiresOveragePayment: true, overageRate: 0.75 }
}

// After successful creation
await incrementPromptUsage(userId, 'explorer', 1)
```

### Test Overage Payment

```typescript
import { recordOverageCharge } from '@/lib/usage/usage-tracking'
import { createOveragePayment } from '@/lib/stripe/subscription-helpers'

// User chose to pay overage
const { chargeAmount } = await recordOverageCharge(userId, 'explorer', 1)

// Create Stripe payment
const paymentIntent = await createOveragePayment({
  customerId: stripeCustomerId,
  amount: chargeAmount,
  promptCount: 1,
  plan: 'explorer',
})

// After payment succeeds, increment usage
await incrementPromptUsage(userId, 'explorer', 1)
```

## Monitoring

### Check Usage Stats

```sql
-- Current month usage for all users
SELECT
  u.email,
  ut.prompts_used,
  ut.prompts_limit,
  ut.overage_prompts,
  ut.overage_charges,
  ut.reset_date
FROM usage_tracking ut
JOIN auth.users u ON ut.user_id = u.id
WHERE ut.month_year = '2025-01'
ORDER BY ut.prompts_used DESC;
```

### Check Cron Job Logs

In Vercel Dashboard → Logs:
- Filter by: `/api/cron/reset-usage`
- Look for: "Monthly usage reset completed"

### Check Stripe Events

In Stripe Dashboard → Developers → Events:
- Filter by: `invoice.payment_succeeded`
- Verify events are being sent to your webhook

## Troubleshooting

### Issue: Usage Not Resetting on 1st

**Check:**
1. Vercel Cron is configured and running
2. `CRON_SECRET` is set correctly
3. Check Vercel logs for errors
4. Verify Stripe webhooks are firing

**Manual Fix:**
```bash
# Manually trigger reset
curl -X POST https://your-domain.com/api/cron/reset-usage \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Issue: Overage Charges Not Recording

**Check:**
1. `usage_tracking` table exists
2. User has current month record
3. Check logs in `recordOverageCharge()`

**Manual Fix:**
```sql
-- Check if record exists
SELECT * FROM usage_tracking
WHERE user_id = 'user-uuid'
AND month_year = '2025-01';

-- If missing, create it
INSERT INTO usage_tracking (user_id, month_year, prompts_used, prompts_limit, ...)
VALUES (...);
```

### Issue: Webhook Not Triggering Reset

**Fallback:**
The cron job serves as primary reset mechanism. Webhook is backup to ensure reset happens even if invoice comes before cron runs.

Both methods are safe to run multiple times (upsert logic prevents duplicates).

## Future Enhancements

1. **Email Notifications**
   - Send email when user reaches 80% usage
   - Send email when limits reset

2. **Usage Analytics**
   - Track usage trends over time
   - Predict when users will hit limits
   - Recommend upgrades proactively

3. **Grace Period**
   - Allow X prompts over limit before requiring payment
   - Configurable per plan

4. **Usage Rollover**
   - Allow unused prompts to roll over (e.g., max 10%)
   - Premium feature for higher tiers

## Summary

✅ **Webhook handling** for `invoice.payment_succeeded`
✅ **Database updates** on successful payments
✅ **Usage tracking** with monthly reset logic
✅ **Cron job** scheduled for 1st of each month
✅ **Overage pricing** integration
✅ **Complete documentation**

**Next Steps:**
1. Add `CRON_SECRET` to Vercel environment variables
2. Deploy to Vercel
3. Test cron job manually
4. Monitor first automatic reset on Feb 1st
