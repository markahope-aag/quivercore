# Billing System Documentation

## Overview

QuiverCore uses **calendar-month billing** with prorated first month charges for all monthly subscriptions. This provides a consistent, predictable billing experience for users.

## Billing Model

### Monthly Plans
- **Billing Cycle**: Anchored to the **1st of each month**
- **First Month**: Prorated based on signup date
- **Subsequent Months**: Full price charged on the 1st
- **Usage Limits**: Reset on the 1st of each month for all users

### Annual Plans
- **Billing Cycle**: Anniversary-based (12 months from signup)
- **No Proration**: Full year charged upfront
- **Usage Limits**: Annual allowance, no monthly reset

## Pricing Structure

### Monthly Plans
| Plan       | Monthly Price | Prompts/Month | Storage |
|------------|---------------|---------------|---------|
| Explorer   | $29          | 50            | 100 MB  |
| Researcher | $79          | 150           | 300 MB  |
| Strategist | $299         | 500           | 1000 MB |

### Annual Plans (20% Savings)
| Plan       | Annual Price | Monthly Equivalent | Savings |
|------------|--------------|-------------------|---------|
| Explorer   | $279         | $23.25/mo         | $69     |
| Researcher | $758         | $63.17/mo         | $190    |
| Strategist | $2,870       | $239.17/mo        | $718    |

### Overage Pricing
When users exceed monthly limits, they have two options:

1. **Pay As You Go** (Overage):
   - Explorer: $0.75/prompt
   - Researcher: $0.75/prompt
   - Strategist: $0.50/prompt
   - One-time charge, doesn't affect subscription
   - Clears when limits reset on 1st of month

2. **Upgrade Plan**:
   - Immediate access to higher limits
   - Better long-term value
   - Prorated for remainder of month

## Proration Examples

### Example 1: Mid-Month Signup (Explorer Plan)
- Signup Date: **January 15th**
- Days Remaining: 17 days (including Jan 15th)
- Days in January: 31 days
- Monthly Price: $29

**Calculation:**
```
Prorated Amount = $29 × (17 ÷ 31) = $15.90
```

**Billing Timeline:**
- Jan 15: Charged **$15.90** (prorated)
- Feb 1: Charged **$29.00** (full month)
- Mar 1: Charged **$29.00** (full month)
- And so on...

### Example 2: Last Day of Month Signup
- Signup Date: **January 31st**
- Days Remaining: 1 day
- Days in January: 31 days
- Monthly Price: $29

**Calculation:**
```
Prorated Amount = $29 × (1 ÷ 31) = $0.94
```

**Billing Timeline:**
- Jan 31: Charged **$0.94** (prorated)
- Feb 1: Charged **$29.00** (full month)

### Example 3: First Day of Month Signup
- Signup Date: **February 1st**
- Days Remaining: 28 days (leap year: 29)
- Days in February: 28 days
- Monthly Price: $29

**Calculation:**
```
Prorated Amount = $29 × (28 ÷ 28) = $29.00
```

**Billing Timeline:**
- Feb 1: Charged **$29.00** (full month, no proration needed)
- Mar 1: Charged **$29.00** (full month)

## Usage Limit Reset

### Monthly Plans
- **Reset Date**: 1st of every month at 00:00 UTC
- **Consistent for All Users**: Regardless of signup date
- **Overage Tracking**: Cleared on reset

### Annual Plans
- **Reset Date**: Anniversary of signup date
- **Example**: Signed up June 15, 2024 → Resets June 15, 2025

## Plan Changes (Upgrades/Downgrades)

### Mid-Cycle Upgrade
When a user upgrades mid-cycle:
1. Calculate unused time on current plan
2. Calculate prorated cost for new plan
3. Charge/credit difference immediately
4. Continue on 1st-of-month billing cycle

**Example: Upgrade on Jan 15 (Explorer → Researcher)**
- Current Plan: Explorer ($29/mo), paid $15.90 prorated on Jan 15
- Remaining days in January: 17 days
- New Plan: Researcher ($79/mo)

```
Unused Explorer Credit = $15.90 × (17 ÷ 17) = $15.90
Researcher Prorated = $79 × (17 ÷ 31) = $43.32
Immediate Charge = $43.32 - $15.90 = $27.42
```

Next billing: Feb 1st at $79/month

### Mid-Cycle Downgrade
When a user downgrades mid-cycle:
1. Change takes effect at **end of current billing period**
2. No immediate charge/refund
3. New plan rate starts on Feb 1st

**Example: Downgrade on Jan 15 (Researcher → Explorer)**
- Current Plan: Researcher ($79/mo)
- Downgrade Request: Jan 15
- Change Effective: Feb 1st
- New Rate: $29/month starting Feb 1

## Implementation Details

### Stripe Configuration

**Monthly Plans:**
```typescript
{
  billing_cycle_anchor: getFirstOfNextMonth(), // Unix timestamp
  proration_behavior: 'create_prorations',
}
```

**Annual Plans:**
```typescript
{
  // No billing_cycle_anchor (uses anniversary)
}
```

### Key Functions

**Proration Calculation:**
```typescript
function calculateProratedPrice(fullPrice: number): number {
  const daysRemaining = getDaysRemainingInMonth()
  const daysInMonth = getDaysInCurrentMonth()
  return Math.round((fullPrice * (daysRemaining / daysInMonth)) * 100) / 100
}
```

**Get First of Next Month:**
```typescript
function getFirstOfNextMonth(): number {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return Math.floor(nextMonth.getTime() / 1000) // Unix timestamp
}
```

## Database Schema

### user_subscriptions table
```sql
- stripe_subscription_id
- stripe_customer_id
- plan_tier (explorer | researcher | strategist)
- billing_period (monthly | annual)
- status (active | canceled | past_due)
- current_period_start
- current_period_end
- cancel_at_period_end
- billing_cycle_anchor (for monthly: always 1st, for annual: signup date)
```

### usage_tracking table
```sql
- user_id
- month_year (e.g., '2024-01')
- prompts_used
- prompts_limit
- storage_used
- storage_limit
- overage_prompts
- overage_charges
- reset_date
```

## User Communication

### At Signup
"Your first month is prorated. You'll be charged **$X.XX** today for the remainder of January, then **$29** on the 1st of each month."

### During Trial
"Your 14-day free trial ends on **January 28th**. You'll then be charged **$5.90** for the remaining 3 days of January, and **$29** starting February 1st."

### On Pricing Page
"All monthly plans bill on the 1st of each month. Your first month is prorated based on your signup date."

### When Hitting Limit
"You've reached your monthly limit of 50 prompts. Your limits reset on **February 1st**. Choose an option:
- Pay **$0.75** per additional prompt until reset
- Upgrade to Researcher for 150 prompts/month"

## Testing Scenarios

### Test Cases
1. ✅ Signup on 1st of month (no proration)
2. ✅ Signup on last day of month (minimal proration)
3. ✅ Signup mid-month (standard proration)
4. ✅ Upgrade mid-cycle
5. ✅ Downgrade mid-cycle
6. ✅ Cancel subscription
7. ✅ Reach usage limit before reset
8. ✅ Annual to monthly conversion
9. ✅ Overage payment processing

### Stripe Test Mode
Use Stripe test clock to simulate:
- Month transitions
- Billing cycle anchors
- Proration calculations
- Usage resets

## Support FAQs

**Q: Why was I charged a different amount in my first month?**
A: Your first month is prorated based on when you signed up. You only pay for the days remaining in that month.

**Q: When do my usage limits reset?**
A: For monthly plans, limits reset on the 1st of every month. For annual plans, they reset on your signup anniversary.

**Q: What happens if I upgrade mid-month?**
A: You'll be charged the prorated difference immediately and continue on the 1st-of-month billing cycle.

**Q: Can I change my billing date?**
A: For monthly plans, all users are billed on the 1st to keep usage tracking consistent. Annual plans bill on your signup anniversary.

## References

- **Stripe Docs**: [Billing Cycle Anchor](https://stripe.com/docs/billing/subscriptions/billing-cycle)
- **Proration**: [Subscription Proration](https://stripe.com/docs/billing/subscriptions/prorations)
- **Implementation**: See `lib/constants/billing-config.ts` and `lib/stripe/subscription-helpers.ts`
