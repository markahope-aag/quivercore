/**
 * API route for handling prompt overage payments
 *
 * POST /api/prompts/overage
 *
 * Processes overage payment and allows user to create prompt beyond limit.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleError, ErrorCodes, ApplicationError } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'
import { recordOverageCharge } from '@/lib/usage/usage-tracking'
import { createOveragePayment } from '@/lib/stripe/subscription-helpers'
import type { PlanTier } from '@/lib/constants/billing-config'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new ApplicationError('Unauthorized', ErrorCodes.UNAUTHORIZED, 401)
    }

    const body = await request.json()
    const { promptCount = 1 } = body

    // Get user's subscription to determine plan tier
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id, plan_id, subscription_plans(name)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!subscription?.stripe_customer_id) {
      throw new ApplicationError(
        'No active subscription found',
        ErrorCodes.VALIDATION_ERROR,
        400
      )
    }

    const planData = subscription.subscription_plans
    const plan = Array.isArray(planData) ? planData[0] : planData
    const planTier: PlanTier = (plan?.name?.toLowerCase() as PlanTier) || 'explorer'

    // Record the overage charge
    const { success, chargeAmount } = await recordOverageCharge(user.id, planTier, promptCount)

    if (!success) {
      throw new ApplicationError(
        'Failed to record overage charge',
        ErrorCodes.DATABASE_ERROR,
        500
      )
    }

    // Create Stripe payment intent for overage
    const paymentIntent = await createOveragePayment({
      customerId: subscription.stripe_customer_id,
      amount: chargeAmount,
      promptCount,
      plan: planTier,
      description: `Overage: ${promptCount} additional prompt${promptCount > 1 ? 's' : ''} for ${planTier} plan`,
    })

    logger.info('Overage payment created', {
      userId: user.id,
      planTier,
      promptCount,
      chargeAmount,
      paymentIntentId: paymentIntent.id,
    })

    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: chargeAmount,
      },
      promptCount,
      chargeAmount,
    })
  } catch (error: unknown) {
    const appError = handleError(error)
    logger.error('POST /api/prompts/overage error', appError)
    return NextResponse.json(
      { error: appError.message, code: appError.code },
      { status: appError.statusCode || 500 }
    )
  }
}
