# Subscription Implementation Plan
**Date:** 2025-01-15  
**Status:** Planning Phase

---

## Overview

This document outlines everything needed to implement subscription-based monetization for QuiverCore. The implementation will use **Stripe** as the payment provider (industry standard) and integrate with the existing Supabase authentication system.

---

## 🎯 Core Requirements

### 1. Subscription Plans & Tiers

**Recommended Plans:**
- **Free** - Limited features, basic usage
- **Pro** ($9-19/month) - Full features, higher limits
- **Team** ($49-99/month) - Collaboration features, team management
- **Enterprise** (Custom) - Custom limits, dedicated support

**Feature Differentiation:**
- Number of prompts allowed
- Number of prompt executions per month
- Access to advanced enhancements
- API access
- Team collaboration
- Priority support
- Custom integrations

---

## 📊 Database Schema

### New Tables Needed

#### 1. `subscription_plans`
```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- 'free', 'pro', 'team', 'enterprise'
  display_name TEXT NOT NULL, -- 'Free', 'Pro', 'Team', 'Enterprise'
  description TEXT,
  price_monthly INTEGER, -- in cents, NULL for free
  price_yearly INTEGER, -- in cents, NULL for free
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  features JSONB NOT NULL, -- { "max_prompts": 10, "max_executions": 100, ... }
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. `user_subscriptions`
```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due', 'trialing', 'incomplete'
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_stripe_subscription_id ON user_subscriptions(stripe_subscription_id);
```

#### 3. `usage_tracking`
```sql
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL, -- 'prompt_execution', 'prompt_created', 'api_call'
  count INTEGER DEFAULT 1,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL, -- Start of billing period
  period_end TIMESTAMP WITH TIME ZONE NOT NULL, -- End of billing period
  metadata JSONB, -- Additional context
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX idx_usage_tracking_period ON usage_tracking(user_id, period_start, period_end);
CREATE INDEX idx_usage_tracking_metric_type ON usage_tracking(metric_type);
```

#### 4. `billing_history`
```sql
CREATE TABLE billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id),
  stripe_invoice_id TEXT,
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL, -- 'paid', 'pending', 'failed', 'refunded'
  invoice_url TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_billing_history_user_id ON billing_history(user_id);
CREATE INDEX idx_billing_history_subscription_id ON billing_history(subscription_id);
```

---

## 🔧 Implementation Components

### 1. Stripe Integration

**Required Packages:**
```bash
npm install stripe @stripe/stripe-js
npm install --save-dev @types/stripe
```

**Environment Variables:**
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

**Files to Create:**
- `lib/stripe/client.ts` - Stripe client initialization
- `lib/stripe/webhooks.ts` - Webhook handler utilities
- `lib/stripe/subscriptions.ts` - Subscription management functions
- `lib/stripe/customers.ts` - Customer management functions

### 2. API Routes

**New API Endpoints:**
- `POST /api/subscriptions/create-checkout` - Create Stripe checkout session
- `POST /api/subscriptions/create-portal` - Create billing portal session
- `POST /api/subscriptions/webhook` - Handle Stripe webhooks
- `GET /api/subscriptions/current` - Get current subscription
- `GET /api/subscriptions/plans` - Get available plans
- `POST /api/subscriptions/cancel` - Cancel subscription
- `GET /api/subscriptions/usage` - Get usage statistics
- `POST /api/subscriptions/upgrade` - Upgrade/downgrade subscription

### 3. Subscription Management UI

**New Pages:**
- `app/(dashboard)/billing/page.tsx` - Billing dashboard
- `app/(dashboard)/billing/plans/page.tsx` - Pricing/plans page
- `app/(dashboard)/billing/history/page.tsx` - Billing history
- `app/(dashboard)/settings/subscription/page.tsx` - Subscription settings

**New Components:**
- `components/billing/PlanCard.tsx` - Display subscription plan
- `components/billing/SubscriptionStatus.tsx` - Show current subscription
- `components/billing/UsageMeter.tsx` - Display usage limits
- `components/billing/BillingHistory.tsx` - List of invoices
- `components/billing/UpgradePrompt.tsx` - Upgrade CTA component

### 4. Feature Gating & Usage Limits

**New Utilities:**
- `lib/utils/subscriptions.ts` - Subscription checking utilities
- `lib/utils/usage-limits.ts` - Usage limit enforcement
- `lib/middleware/subscription-check.ts` - Middleware for subscription checks

**Usage Enforcement Points:**
- Prompt creation (check max prompts limit)
- Prompt execution (check execution limit)
- Advanced enhancements (check plan access)
- API access (check API access permission)

### 5. Database Migrations

**Migration Files:**
- `supabase/migrations/20250115_create_subscription_tables.sql`
- `supabase/migrations/20250115_seed_subscription_plans.sql`
- `supabase/migrations/20250115_add_rls_policies_subscriptions.sql`

---

## 📋 Implementation Steps

### Phase 1: Foundation (Week 1)
1. ✅ Install Stripe packages
2. ✅ Create database schema (tables, indexes, RLS policies)
3. ✅ Set up Stripe account and get API keys
4. ✅ Create Stripe client utilities
5. ✅ Seed subscription plans in database

### Phase 2: Core Subscription Logic (Week 2)
1. ✅ Create subscription management functions
2. ✅ Implement checkout session creation
3. ✅ Implement billing portal session
4. ✅ Create subscription status checking utilities
5. ✅ Add usage tracking functions

### Phase 3: API Routes (Week 2-3)
1. ✅ Create checkout API route
2. ✅ Create billing portal API route
3. ✅ Create webhook handler (critical!)
4. ✅ Create subscription status API
5. ✅ Create usage API
6. ✅ Add subscription cancellation/upgrade routes

### Phase 4: UI Components (Week 3-4)
1. ✅ Create pricing/plans page
2. ✅ Create billing dashboard
3. ✅ Create subscription status component
4. ✅ Create usage meters
5. ✅ Create upgrade prompts
6. ✅ Add billing history view

### Phase 5: Feature Gating (Week 4)
1. ✅ Add subscription checks to prompt creation
2. ✅ Add subscription checks to prompt execution
3. ✅ Add subscription checks to advanced features
4. ✅ Create upgrade prompts for limited features
5. ✅ Add usage limit warnings

### Phase 6: Testing & Polish (Week 5)
1. ✅ Test subscription flows end-to-end
2. ✅ Test webhook handling
3. ✅ Test usage tracking
4. ✅ Test feature gating
5. ✅ Add error handling and edge cases
6. ✅ Add loading states and UX polish

---

## 🔐 Security Considerations

1. **Webhook Security:**
   - Verify webhook signatures from Stripe
   - Use webhook secret from environment variables
   - Validate all webhook events

2. **RLS Policies:**
   - Users can only view their own subscriptions
   - Users can only view their own usage data
   - Users can only view their own billing history

3. **API Security:**
   - All subscription routes require authentication
   - Validate user ownership before operations
   - Rate limit subscription operations

4. **Data Protection:**
   - Never expose Stripe secret keys to client
   - Store sensitive data encrypted
   - Log subscription events for audit

---

## 💰 Pricing Strategy

### Confirmed Pricing Tiers

**Free Plan:**
- 10 prompts/month
- Basic frameworks (3 core)
- No VS enhancements
- No advanced enhancements
- No template library
- Text export only
- Community support

**Explorer Plan: $29/month**
- 50 prompts/month ($0.75 overage)
- Basic VS (Broad Spectrum only)
- Core frameworks (5)
- Template library (view only)
- Text export
- Basic analytics
- Community support
- Target: Individual content creators, freelancers, small business owners

**Researcher Plan: $79/month**
- 150 prompts/month ($0.75 overage)
- Full VS suite (all patterns)
- All advanced enhancements
- All frameworks (10)
- Template library (full access, create & share)
- Text, JSON, Markdown export
- Performance analytics
- Email support
- Guided onboarding
- Target: Marketing agencies, consultants, professional writers

**Strategist Plan: $299/month**
- 500 prompts/month ($0.50 overage)
- Full VS suite (all patterns)
- All advanced enhancements
- All frameworks (10)
- Unlimited template library
- All export options (text, JSON, Markdown, CSV)
- Full analytics dashboard
- Team collaboration
- API access
- Priority support
- Custom branding
- SSO integration
- Team usage analytics
- Custom onboarding
- Target: Enterprise teams, large agencies, organizations

---

## 📈 Usage Metrics to Track

1. **Prompt Executions** - Count API calls to `/api/prompts/execute`
2. **Prompts Created** - Count new prompts created
3. **Storage Usage** - Track total prompts stored
4. **API Calls** - Track external API usage (if offering API access)
5. **Feature Usage** - Track which features are used most

---

## 🧪 Testing Requirements

1. **Unit Tests:**
   - Subscription status checking
   - Usage limit calculations
   - Feature gating logic

2. **Integration Tests:**
   - Stripe checkout flow
   - Webhook handling
   - Subscription upgrades/downgrades

3. **E2E Tests:**
   - Complete subscription signup flow
   - Usage limit enforcement
   - Billing portal access

---

## 🚀 Deployment Checklist

- [ ] Stripe account created and configured
- [ ] Stripe API keys added to environment variables
- [ ] Webhook endpoint configured in Stripe dashboard
- [ ] Database migrations run
- [ ] Subscription plans seeded
- [ ] All API routes tested
- [ ] Webhook handling tested
- [ ] Feature gating tested
- [ ] Usage tracking verified
- [ ] Billing UI tested
- [ ] Error handling in place
- [ ] Monitoring/logging configured

---

## 📚 Resources

- [Stripe Subscriptions Documentation](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Customer Portal](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)

---

## 🎯 Success Metrics

- Subscription conversion rate
- Monthly recurring revenue (MRR)
- Churn rate
- Average revenue per user (ARPU)
- Feature usage by plan tier
- Upgrade/downgrade patterns

---

**Next Steps:** Start with Phase 1 - Foundation setup

