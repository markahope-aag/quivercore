/**
 * Stripe client initialization
 * 
 * Provides server-side and client-side Stripe clients for subscription management.
 * 
 * @module lib/stripe/client
 */

import Stripe from 'stripe'

// Server-side Stripe client (uses secret key)
let stripeServer: Stripe | null = null

/**
 * Get or create server-side Stripe client
 * 
 * @returns Stripe instance for server-side operations
 * @throws Error if STRIPE_SECRET_KEY is not configured
 */
export function getStripeServer(): Stripe {
  if (stripeServer) {
    return stripeServer
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error(
      'STRIPE_SECRET_KEY is not configured. ' +
      'Please add it to your environment variables.'
    )
  }

  stripeServer = new Stripe(secretKey, {
    apiVersion: '2025-10-29.clover',
    typescript: true,
  })

  return stripeServer
}

/**
 * Get Stripe publishable key for client-side use
 * 
 * @returns Stripe publishable key
 * @throws Error if NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured
 */
export function getStripePublishableKey(): string {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  if (!publishableKey) {
    throw new Error(
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured. ' +
      'Please add it to your environment variables.'
    )
  }
  return publishableKey
}

/**
 * Get Stripe webhook secret for verifying webhook signatures
 * 
 * @returns Stripe webhook secret
 * @throws Error if STRIPE_WEBHOOK_SECRET is not configured
 */
export function getStripeWebhookSecret(): string {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    throw new Error(
      'STRIPE_WEBHOOK_SECRET is not configured. ' +
      'Please add it to your environment variables.'
    )
  }
  return webhookSecret
}

