/**
 * Stripe Overage Billing Functions
 * Handles end-of-month overage invoice creation
 */

import { getStripeServer } from './client'
import { createClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'
import type { PlanTier } from '@/lib/constants/billing-config'

interface CreateOverageInvoiceParams {
  customerId: string
  userId: string
  overagePrompts: number
  overageCharges: number
  monthYear: string
  planTier: PlanTier
}

/**
 * Create an invoice for overage charges
 * Called at the end of each month for users with overages
 */
export async function createOverageInvoice({
  customerId,
  userId,
  overagePrompts,
  overageCharges,
  monthYear,
  planTier,
}: CreateOverageInvoiceParams): Promise<Stripe.Invoice> {
  const stripe = getStripeServer()
  const supabase = await createClient()

  // Convert charges to cents
  const amountInCents = Math.round(overageCharges * 100)

  // Create an invoice item for the overage charge
  await stripe.invoiceItems.create({
    customer: customerId,
    amount: amountInCents,
    currency: 'usd',
    description: `Overage charges for ${monthYear}: ${overagePrompts} additional prompts on ${planTier} plan`,
    metadata: {
      user_id: userId,
      month_year: monthYear,
      overage_prompts: overagePrompts.toString(),
      plan_tier: planTier,
      charge_type: 'monthly_overage',
    },
  })

  // Create and finalize the invoice
  const invoice = await stripe.invoices.create({
    customer: customerId,
    auto_advance: true, // Automatically finalize and attempt payment
    collection_method: 'charge_automatically',
    description: `Overage charges for ${monthYear}`,
    metadata: {
      user_id: userId,
      month_year: monthYear,
      charge_type: 'monthly_overage',
    },
  })

  // Finalize the invoice (this will attempt to charge the customer)
  const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id, {
    auto_advance: true,
  })

  // Record in billing_history
  await supabase.from('billing_history').insert({
    user_id: userId,
    subscription_id: null, // Overage is not tied to a specific subscription record
    stripe_invoice_id: finalizedInvoice.id,
    amount: amountInCents,
    currency: 'usd',
    status: finalizedInvoice.status === 'paid' ? 'paid' : 'pending',
    invoice_url: finalizedInvoice.hosted_invoice_url || null,
    description: `Overage: ${overagePrompts} prompts (${monthYear})`,
    paid_at: finalizedInvoice.status === 'paid' ? new Date().toISOString() : null,
  })

  return finalizedInvoice
}

/**
 * Handle overage invoice payment webhook
 * Called when an overage invoice is paid
 */
export async function handleOverageInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const supabase = await createClient()

  // Check if this is an overage invoice
  if (invoice.metadata?.charge_type !== 'monthly_overage') {
    return
  }

  const userId = invoice.metadata.user_id
  const monthYear = invoice.metadata.month_year

  if (!userId || !monthYear) {
    console.error('Missing metadata in overage invoice:', invoice.id)
    return
  }

  // Update billing history
  await supabase
    .from('billing_history')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
    })
    .eq('stripe_invoice_id', invoice.id)

  // Reset overage charges for that month (they've been billed)
  await supabase
    .from('monthly_usage_tracking')
    .update({
      overage_charges: 0,
      overage_prompts: 0,
    })
    .eq('user_id', userId)
    .eq('month_year', monthYear)
}
