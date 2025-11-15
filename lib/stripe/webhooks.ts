/**
 * Stripe webhook handlers
 * 
 * Functions for processing Stripe webhook events.
 * 
 * @module lib/stripe/webhooks
 */

import { getStripeServer, getStripeWebhookSecret } from './client'
import { createClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

/**
 * Verify webhook signature
 * 
 * @param payload - Raw request body
 * @param signature - Stripe signature header
 * @returns Webhook event object
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const stripe = getStripeServer()
  const webhookSecret = getStripeWebhookSecret()

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}

/**
 * Handle subscription created event
 * 
 * @param subscription - Stripe subscription object
 */
export async function handleSubscriptionCreated(
  subscription: Stripe.Subscription
): Promise<void> {
  const supabase = await createClient()
  const userId = subscription.metadata.supabase_user_id
  const planId = subscription.metadata.plan_id

  if (!userId || !planId) {
    console.error('Missing metadata in subscription:', subscription.id)
    return
  }

  // Get plan from database
  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('id')
    .eq('id', planId)
    .single()

  if (!plan) {
    console.error('Plan not found:', planId)
    return
  }

  // Create or update subscription in database
  const { error } = await supabase.from('user_subscriptions').upsert({
    user_id: userId,
    plan_id: plan.id,
    status: subscription.status as any,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
  })

  if (error) {
    console.error('Error creating subscription:', error)
    throw error
  }
}

/**
 * Handle subscription updated event
 * 
 * @param subscription - Stripe subscription object
 */
export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<void> {
  const supabase = await createClient()

  // Update subscription in database
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: subscription.status as any,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
      trial_end: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error updating subscription:', error)
    throw error
  }
}

/**
 * Handle subscription deleted event
 * 
 * @param subscription - Stripe subscription object
 */
export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  const supabase = await createClient()

  // Update subscription status to canceled
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}

/**
 * Handle invoice paid event
 * 
 * @param invoice - Stripe invoice object
 */
export async function handleInvoicePaid(
  invoice: Stripe.Invoice
): Promise<void> {
  const supabase = await createClient()

  // Get subscription ID (can be string or expanded object)
  const subscriptionId =
    typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription?.id

  if (!subscriptionId) {
    return // Not a subscription invoice
  }

  const customerId =
    typeof invoice.customer === 'string'
      ? invoice.customer
      : invoice.customer?.id

  if (!customerId) {
    return
  }

  // Get user subscription
  const { data: userSubscription } = await supabase
    .from('user_subscriptions')
    .select('id, user_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (!userSubscription) {
    return
  }

  // Record billing history
  const { error } = await supabase.from('billing_history').insert({
    user_id: userSubscription.user_id,
    subscription_id: userSubscription.id,
    stripe_invoice_id: invoice.id,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    status: invoice.status === 'paid' ? 'paid' : 'pending',
    invoice_url: invoice.hosted_invoice_url || null,
    paid_at: invoice.status === 'paid' ? new Date().toISOString() : null,
  })

  if (error) {
    console.error('Error recording billing history:', error)
  }
}

/**
 * Process webhook event
 * 
 * @param event - Stripe webhook event
 */
export async function processWebhookEvent(
  event: Stripe.Event
): Promise<void> {
  switch (event.type) {
    case 'customer.subscription.created':
      await handleSubscriptionCreated(
        event.data.object as Stripe.Subscription
      )
      break

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(
        event.data.object as Stripe.Subscription
      )
      break

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(
        event.data.object as Stripe.Subscription
      )
      break

    case 'invoice.paid':
      await handleInvoicePaid(event.data.object as Stripe.Invoice)
      break

    case 'invoice.payment_failed':
      // Handle payment failure - update subscription status
      const failedInvoice = event.data.object as Stripe.Invoice
      const failedSubscriptionId =
        typeof (failedInvoice as any).subscription === 'string'
          ? (failedInvoice as any).subscription
          : (failedInvoice as any).subscription?.id
      
      if (failedSubscriptionId) {
        const supabase = await createClient()
        await supabase
          .from('user_subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_subscription_id', failedSubscriptionId)
      }
      break

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }
}

