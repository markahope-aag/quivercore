/**
 * API route for creating Stripe checkout session
 * 
 * POST /api/subscriptions/create-checkout
 * 
 * Creates a checkout session for a subscription plan.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession } from '@/lib/stripe/subscriptions'
import { handleError, ErrorCodes, ApplicationError } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'
import { sanitizeInput } from '@/lib/utils/sanitize'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new ApplicationError('Unauthorized', ErrorCodes.UNAUTHORIZED, 401)
    }

    const body = await request.json()
    const priceId = sanitizeInput(body.priceId || '', 200)

    if (!priceId) {
      throw new ApplicationError(
        'Price ID is required',
        ErrorCodes.VALIDATION_ERROR,
        400
      )
    }

    // Get the base URL for redirect URLs
    const origin = request.headers.get('origin') || 'http://localhost:3000'
    const successUrl = `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${origin}/billing/cancel`

    logger.debug('Creating checkout session', {
      userId: user.id,
      priceId,
    })

    const { sessionId, clientSecret } = await createCheckoutSession(
      user.id,
      priceId,
      successUrl,
      cancelUrl
    )

    return NextResponse.json({
      sessionId,
      clientSecret,
    })
  } catch (error: unknown) {
    const appError = handleError(error)
    logger.error('POST /api/subscriptions/create-checkout error', appError)
    return NextResponse.json(
      { error: appError.message, code: appError.code },
      { status: appError.statusCode || 500 }
    )
  }
}

