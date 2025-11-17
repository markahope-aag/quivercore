# Stripe Recurring Billing Configuration

## ✅ Answer: YES - Prices MUST Be Set as Recurring in Stripe

**Stripe handles all recurring billing automatically.** Your app does NOT manage recurring billing manually.

---

## 🔍 How It Works

### 1. Stripe Handles Recurring Billing

When you create a checkout session with `mode: 'subscription'` (as your app does), Stripe:
- Automatically charges the customer each billing period (monthly/yearly)
- Sends webhook events when billing occurs
- Manages subscription lifecycle (renewals, cancellations, etc.)

### 2. Your App Listens to Webhooks

Your app (`app/api/subscriptions/webhook/route.ts`) listens for:
- `customer.subscription.created` - When subscription is first created
- `customer.subscription.updated` - When subscription changes
- `customer.subscription.deleted` - When subscription is canceled
- `invoice.payment_succeeded` - When payment is successful
- `invoice.payment_failed` - When payment fails

These events keep your database in sync with Stripe's subscription state.

---

## 📋 How to Configure Prices in Stripe

### Monthly Subscription Prices

**MUST be set as:**
- **Recurring:** ✅ Yes
- **Billing period:** Monthly
- **Price:** $29.00, $79.00, $299.00 (for your plans)

**Example in Stripe Dashboard:**
```
Product: Explorer
Price: $29.00 USD
Billing: Recurring
Interval: Monthly
```

### Annual Subscription Prices

**MUST be set as:**
- **Recurring:** ✅ Yes
- **Billing period:** Yearly
- **Price:** $279.00, $758.00, $2,870.00 (for your plans)

**Example in Stripe Dashboard:**
```
Product: Explorer
Price: $279.00 USD
Billing: Recurring
Interval: Yearly
```

### Overage Prices

**MUST be set as:**
- **Recurring:** ❌ No (One-time)
- **Billing period:** One-time
- **Price:** $0.75, $0.75, $0.50 (per prompt)

**Example in Stripe Dashboard:**
```
Product: Explorer Overage
Price: $0.75 USD
Billing: One-time (not recurring)
```

---

## 🔧 Your App's Code

Looking at `lib/stripe/subscriptions.ts`:

```typescript
// Line 54-75: Creates subscription checkout
const session = await stripe.checkout.sessions.create({
  customer: customerId,
  mode: 'subscription',  // ← This tells Stripe to handle recurring billing
  line_items: [
    {
      price: priceId,  // ← Must be a recurring price ID
      quantity: 1,
    },
  ],
  // ...
})
```

**Key Point:** The `mode: 'subscription'` requires the price to be **recurring**. If you use a one-time price, Stripe will error.

---

## ⚠️ What Happens If Prices Are NOT Recurring?

If you set monthly prices as **one-time** instead of **recurring**:

1. ❌ Stripe will NOT automatically charge customers each month
2. ❌ Customers will only be charged once
3. ❌ Subscription will not renew
4. ❌ Your app will think they have an active subscription, but Stripe won't charge them
5. ❌ You'll lose revenue and have billing issues

---

## ✅ Correct Configuration Summary

| Price Type | Recurring? | Interval | Example |
|------------|-----------|----------|---------|
| **Monthly Subscription** | ✅ **YES** | Monthly | $29/month |
| **Annual Subscription** | ✅ **YES** | Yearly | $279/year |
| **Overage** | ❌ **NO** | One-time | $0.75 per prompt |

---

## 🎯 Action Items

When creating products in Stripe (test or production):

1. **Monthly Plans:**
   - ✅ Set as **Recurring**
   - ✅ Set interval to **Monthly**
   - ✅ Enter monthly price

2. **Annual Plans:**
   - ✅ Set as **Recurring**
   - ✅ Set interval to **Yearly**
   - ✅ Enter annual price

3. **Overage:**
   - ❌ Set as **One-time** (not recurring)
   - ❌ No interval needed

---

## 📝 Code Reference

Your app expects recurring prices because:
- `lib/stripe/subscriptions.ts` uses `mode: 'subscription'`
- Webhook handlers listen for subscription lifecycle events
- Database tracks `current_period_start` and `current_period_end` (managed by Stripe)

**Bottom Line:** Stripe manages all recurring billing. Your app just syncs the status via webhooks.

