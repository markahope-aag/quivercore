/**
 * API route for canceling subscription
 * 
 * POST /api/subscriptions/cancel
 * 
 * Cancels the user's current subscription.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cancelSubscription } from '@/lib/stripe/subscriptions'
import { handleError, ErrorCodes, ApplicationError } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new ApplicationError('Unauthorized', ErrorCodes.UNAUTHORIZED, 401)
    }

    const body = await request.json()
    const { subscriptionId, cancelImmediately = false } = body

    if (!subscriptionId) {
      throw new ApplicationError(
        'Subscription ID is required',
        ErrorCodes.VALIDATION_ERROR,
        400
      )
    }

    // Verify subscription belongs to user
    const { data: userSubscription } = await supabase
      .from('user_subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .eq('stripe_subscription_id', subscriptionId)
      .single()

    if (!userSubscription) {
      throw new ApplicationError(
        'Subscription not found',
        ErrorCodes.NOT_FOUND,
        404
      )
    }

    logger.debug('Canceling subscription', {
      userId: user.id,
      subscriptionId,
      cancelImmediately,
    })

    await cancelSubscription(subscriptionId, cancelImmediately)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const appError = handleError(error)
    logger.error('POST /api/subscriptions/cancel error', appError)
    return NextResponse.json(
      { error: appError.message, code: appError.code },
      { status: appError.statusCode || 500 }
    )
  }
}

