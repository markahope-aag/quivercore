/**
 * API route for Stripe webhooks
 * 
 * POST /api/subscriptions/webhook
 * 
 * Handles Stripe webhook events for subscription management.
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature, processWebhookEvent } from '@/lib/stripe/webhooks'
import { logger } from '@/lib/utils/logger'

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    logger.error('Missing Stripe signature in webhook request')
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    )
  }

  try {
    // Get raw body as text (Next.js App Router provides this automatically)
    const body = await request.text()

    // Verify webhook signature
    const event = verifyWebhookSignature(body, signature)

    logger.debug('Processing webhook event', {
      type: event.type,
      id: event.id,
    })

    // Process the event
    await processWebhookEvent(event)

    return NextResponse.json({ received: true })
  } catch (error: unknown) {
    logger.error('Webhook error', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    )
  }
}

// Use Node.js runtime for webhook (required for raw body access)
export const runtime = 'nodejs'

