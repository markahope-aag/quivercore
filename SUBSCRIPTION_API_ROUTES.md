# Subscription API Routes Documentation

## Overview

All subscription API routes are located in `app/api/subscriptions/` and follow Stripe's official subscription integration guide.

---

## API Endpoints

### 1. Create Checkout Session
**POST** `/api/subscriptions/create-checkout`

Creates a Stripe checkout session for subscribing to a plan.

**Request Body:**
```json
{
  "priceId": "price_1234567890" // Stripe price ID
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "clientSecret": "cs_test_..."
}
```

**Usage:**
```typescript
const response = await fetch('/api/subscriptions/create-checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ priceId: 'price_1234567890' })
})
const { sessionId, clientSecret } = await response.json()
```

---

### 2. Create Billing Portal Session
**POST** `/api/subscriptions/create-portal`

Creates a Stripe billing portal session for managing subscription.

**Request Body:** None (uses authenticated user)

**Response:**
```json
{
  "url": "https://billing.stripe.com/session/..."
}
```

**Usage:**
```typescript
const response = await fetch('/api/subscriptions/create-portal', {
  method: 'POST'
})
const { url } = await response.json()
window.location.href = url
```

---

### 3. Webhook Handler
**POST** `/api/subscriptions/webhook`

Handles Stripe webhook events. Must be configured in Stripe Dashboard.

**Headers Required:**
- `stripe-signature`: Stripe webhook signature

**Events Handled:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

**Response:**
```json
{
  "received": true
}
```

**Configuration:**
1. In Stripe Dashboard, go to Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/subscriptions/webhook`
3. Select events to listen to (see above)
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET` environment variable

---

### 4. Get Current Subscription
**GET** `/api/subscriptions/current`

Returns the current active subscription for the authenticated user.

**Response:**
```json
{
  "id": "sub_...",
  "user_id": "user_...",
  "plan_id": "plan_...",
  "status": "active",
  "stripe_subscription_id": "sub_...",
  "stripe_customer_id": "cus_...",
  "current_period_start": "2025-01-01T00:00:00Z",
  "current_period_end": "2025-02-01T00:00:00Z",
  "plan": {
    "id": "plan_...",
    "name": "explorer",
    "display_name": "Explorer",
    "price_monthly": 2900,
    "features": { ... }
  }
}
```

**Usage:**
```typescript
const response = await fetch('/api/subscriptions/current')
const subscription = await response.json()
```

---

### 5. Get Subscription Plans
**GET** `/api/subscriptions/plans`

Returns all active subscription plans.

**Response:**
```json
{
  "plans": [
    {
      "id": "plan_...",
      "name": "explorer",
      "display_name": "Explorer",
      "description": "...",
      "price_monthly": 2900,
      "features": { ... }
    },
    ...
  ]
}
```

**Usage:**
```typescript
const response = await fetch('/api/subscriptions/plans')
const { plans } = await response.json()
```

---

### 6. Cancel Subscription
**POST** `/api/subscriptions/cancel`

Cancels the user's current subscription.

**Request Body:**
```json
{
  "subscriptionId": "sub_1234567890",
  "cancelImmediately": false // Optional, defaults to false (cancel at period end)
}
```

**Response:**
```json
{
  "success": true
}
```

**Usage:**
```typescript
const response = await fetch('/api/subscriptions/cancel', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subscriptionId: 'sub_1234567890',
    cancelImmediately: false
  })
})
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Status Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication

All endpoints (except webhook) require authentication via Supabase session cookie.

---

## Environment Variables Required

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Next Steps

1. **Set up Stripe Products and Prices:**
   - Create products in Stripe Dashboard
   - Create prices for each plan (Explorer, Researcher, Strategist)
   - Update `stripe_price_id_monthly` in `subscription_plans` table

2. **Configure Webhook:**
   - Add webhook endpoint in Stripe Dashboard
   - Set `STRIPE_WEBHOOK_SECRET` environment variable
   - Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/subscriptions/webhook`

3. **Build UI Components:**
   - Pricing page
   - Billing dashboard
   - Subscription status component

