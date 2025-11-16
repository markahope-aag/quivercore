/**
 * Stripe subscription management
 * 
 * Functions for creating, updating, and managing Stripe subscriptions.
 * 
 * @module lib/stripe/subscriptions
 */

import { getStripeServer } from './client'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateStripeCustomer } from './customers'
import type Stripe from 'stripe'

/**
 * Create a checkout session for a subscription
 * 
 * @param userId - Supabase user ID
 * @param priceId - Stripe price ID for the subscription plan
 * @param successUrl - URL to redirect to on successful payment
 * @param cancelUrl - URL to redirect to on canceled payment
 * @returns Checkout session with client secret
 */
export async function createCheckoutSession(
  userId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ sessionId: string; clientSecret: string }> {
  const stripe = getStripeServer()
  const supabase = await createClient()

  // Get user email
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  // Get or create Stripe customer
  const customerId = await getOrCreateStripeCustomer(
    userId,
    user.email || '',
    user.user_metadata?.name || undefined
  )

  // Get plan details from database
  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('stripe_price_id_monthly', priceId)
    .or(`stripe_price_id_yearly.eq.${priceId}`)
    .single()

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      supabase_user_id: userId,
      plan_id: plan?.id || '',
    },
    subscription_data: {
      metadata: {
        supabase_user_id: userId,
        plan_id: plan?.id || '',
      },
    },
  })

  return {
    sessionId: session.id,
    clientSecret: session.client_secret || '',
    url: session.url || '', // Checkout session URL for redirect
  }
}

/**
 * Create a billing portal session
 * 
 * @param userId - Supabase user ID
 * @param returnUrl - URL to return to after managing billing
 * @returns Billing portal session URL
 */
export async function createBillingPortalSession(
  userId: string,
  returnUrl: string
): Promise<string> {
  const stripe = getStripeServer()
  const supabase = await createClient()

  // Get user's Stripe customer ID
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .not('stripe_customer_id', 'is', null)
    .single()

  if (!subscription?.stripe_customer_id) {
    throw new Error('No Stripe customer found for user')
  }

  // Create billing portal session
  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: returnUrl,
  })

  return session.url
}

/**
 * Cancel a subscription
 * 
 * @param subscriptionId - Stripe subscription ID
 * @param cancelImmediately - If true, cancel immediately; if false, cancel at period end
 * @returns Canceled subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelImmediately: boolean = false
): Promise<Stripe.Subscription> {
  const stripe = getStripeServer()

  if (cancelImmediately) {
    return stripe.subscriptions.cancel(subscriptionId)
  } else {
    return stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })
  }
}

/**
 * Update subscription to a new plan
 * 
 * @param subscriptionId - Stripe subscription ID
 * @param newPriceId - New Stripe price ID
 * @returns Updated subscription
 */
export async function updateSubscriptionPlan(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripeServer()

  // Get current subscription
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  // Update subscription with new price
  return stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    cancel_at_period_end: false, // Reset cancellation if it was set
  })
}

/**
 * Retrieve a subscription by ID
 * 
 * @param subscriptionId - Stripe subscription ID
 * @returns Subscription object
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripeServer()
  return stripe.subscriptions.retrieve(subscriptionId)
}

