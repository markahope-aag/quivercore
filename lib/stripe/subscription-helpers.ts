/**
 * Stripe Subscription Helpers
 * Handles calendar-month billing with prorated first month
 */

import Stripe from 'stripe'
import {
  getFirstOfNextMonth,
  calculateProratedPrice,
  BILLING_CONFIG,
  PLAN_PRICES,
  type PlanTier,
  type BillingPeriod
} from '@/lib/constants/billing-config'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
})

interface CreateSubscriptionParams {
  customerId: string
  priceId: string
  plan: PlanTier
  billingPeriod: BillingPeriod
  metadata?: Record<string, string>
}

interface SubscriptionResult {
  subscription: Stripe.Subscription
  proratedAmount?: number
  nextBillingDate: Date
  fullPrice: number
}

/**
 * Create a new subscription with calendar-month billing
 * - First month is prorated (unless annual)
 * - Billing cycle anchored to 1st of month (monthly plans only)
 * - Annual plans bill on anniversary date
 */
export async function createCalendarSubscription({
  customerId,
  priceId,
  plan,
  billingPeriod,
  metadata = {},
}: CreateSubscriptionParams): Promise<SubscriptionResult> {
  if (plan === 'free') {
    throw new Error('Cannot create subscription for free plan')
  }
  const fullPrice = PLAN_PRICES[billingPeriod][plan as 'explorer' | 'researcher' | 'strategist']

  // For monthly plans, anchor to 1st of month with proration
  if (billingPeriod === 'monthly') {
    const billingCycleAnchor = getFirstOfNextMonth()
    const proratedAmount = calculateProratedPrice(fullPrice)

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      billing_cycle_anchor: billingCycleAnchor,
      proration_behavior: BILLING_CONFIG.prorationBehavior,
      metadata: {
        plan,
        billingPeriod,
        proratedFirstMonth: 'true',
        firstMonthAmount: proratedAmount.toString(),
        ...metadata,
      },
    })

    const nextBillingDate = new Date(billingCycleAnchor * 1000)

    return {
      subscription,
      proratedAmount,
      nextBillingDate,
      fullPrice,
    }
  }

  // For annual plans, use anniversary billing (no calendar anchor needed)
  else {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata: {
        plan,
        billingPeriod,
        ...metadata,
      },
    })

    // Annual plans bill on anniversary (1 year from now)
    const nextBillingDate = new Date()
    nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1)

    return {
      subscription,
      nextBillingDate,
      fullPrice,
    }
  }
}

/**
 * Create checkout session with calendar-month billing
 */
export async function createCheckoutSession({
  customerId,
  priceId,
  plan,
  billingPeriod,
  successUrl,
  cancelUrl,
  metadata = {},
}: CreateSubscriptionParams & {
  successUrl: string
  cancelUrl: string
}): Promise<Stripe.Checkout.Session> {
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      plan,
      billingPeriod,
      ...metadata,
    },
  }

  // For monthly plans, anchor to 1st of next month
  if (billingPeriod === 'monthly') {
    sessionParams.subscription_data = {
      billing_cycle_anchor: getFirstOfNextMonth(),
      proration_behavior: BILLING_CONFIG.prorationBehavior,
      metadata: {
        plan,
        billingPeriod,
        calendarBilling: 'true',
      },
    }
  }

  return await stripe.checkout.sessions.create(sessionParams)
}

/**
 * Calculate upgrade/downgrade proration
 * When changing plans mid-cycle
 */
export async function calculatePlanChangeProration(
  subscriptionId: string,
  newPriceId: string
): Promise<{ proratedAmount: number; nextBillingAmount: number }> {
  // Preview the invoice to see proration
  // Note: Using 'as any' because Stripe SDK types may not include retrieveUpcoming in some versions
  const upcomingInvoice = await (stripe.invoices as any).retrieveUpcoming({
    subscription: subscriptionId,
    subscription_items: [
      {
        id: (await stripe.subscriptions.retrieve(subscriptionId)).items.data[0].id,
        price: newPriceId,
      },
    ],
  })

  const proratedAmount = upcomingInvoice.total / 100 // Convert cents to dollars
  const nextBillingAmount = upcomingInvoice.lines.data[0].amount / 100

  return {
    proratedAmount,
    nextBillingAmount,
  }
}

/**
 * Create one-time payment for overage charges
 */
export async function createOveragePayment({
  customerId,
  amount,
  promptCount,
  plan,
  description,
}: {
  customerId: string
  amount: number // in dollars
  promptCount: number
  plan: PlanTier
  description?: string
}): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.create({
    customer: customerId,
    amount: Math.round(amount * 100), // Convert to cents
    currency: 'usd',
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      type: 'overage',
      plan,
      promptCount: promptCount.toString(),
    },
    description: description || `Overage charge: ${promptCount} prompts for ${plan} plan`,
  })
}

export { stripe }
