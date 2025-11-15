/**
 * Stripe customer management
 * 
 * Functions for creating and managing Stripe customers.
 * 
 * @module lib/stripe/customers
 */

import { getStripeServer } from './client'
import { createClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

/**
 * Create or retrieve a Stripe customer for a user
 * 
 * @param userId - Supabase user ID
 * @param email - User's email address
 * @param name - User's name (optional)
 * @returns Stripe customer ID
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  const supabase = await createClient()
  const stripe = getStripeServer()

  // Check if user already has a Stripe customer ID
  const { data: existingSubscription } = await supabase
    .from('user_subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .not('stripe_customer_id', 'is', null)
    .limit(1)
    .single()

  if (existingSubscription?.stripe_customer_id) {
    return existingSubscription.stripe_customer_id
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      supabase_user_id: userId,
    },
  })

  // Store customer ID in database (we'll update this when subscription is created)
  // For now, we'll return it and it will be stored when subscription is created

  return customer.id
}

/**
 * Retrieve a Stripe customer by ID
 * 
 * @param customerId - Stripe customer ID
 * @returns Stripe customer object
 */
export async function getStripeCustomer(
  customerId: string
): Promise<Stripe.Customer> {
  const stripe = getStripeServer()
  return stripe.customers.retrieve(customerId) as Promise<Stripe.Customer>
}

/**
 * Update a Stripe customer
 * 
 * @param customerId - Stripe customer ID
 * @param updates - Customer fields to update
 * @returns Updated Stripe customer object
 */
export async function updateStripeCustomer(
  customerId: string,
  updates: Stripe.CustomerUpdateParams
): Promise<Stripe.Customer> {
  const stripe = getStripeServer()
  return stripe.customers.update(customerId, updates)
}

