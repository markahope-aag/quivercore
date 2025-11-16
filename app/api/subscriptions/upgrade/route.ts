/**
 * API route for upgrading/downgrading subscription
 *
 * POST /api/subscriptions/upgrade
 *
 * Upgrades or downgrades an existing subscription to a new plan.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateSubscriptionPlan } from '@/lib/stripe/subscriptions'
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
    const newPriceId = sanitizeInput(body.priceId || '', 200)

    if (!newPriceId) {
      throw new ApplicationError(
        'Price ID is required',
        ErrorCodes.VALIDATION_ERROR,
        400
      )
    }

    // Get user's current active subscription
    const { data: currentSubscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('stripe_subscription_id, plan_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subError || !currentSubscription) {
      throw new ApplicationError(
        'No active subscription found',
        ErrorCodes.NOT_FOUND,
        404
      )
    }

    if (!currentSubscription.stripe_subscription_id) {
      throw new ApplicationError(
        'No Stripe subscription ID found',
        ErrorCodes.VALIDATION_ERROR,
        400
      )
    }

    // Get the new plan details from database
    const { data: newPlan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('stripe_price_id_monthly', newPriceId)
      .or(`stripe_price_id_yearly.eq.${newPriceId}`)
      .single()

    if (planError || !newPlan) {
      throw new ApplicationError(
        'Invalid plan',
        ErrorCodes.VALIDATION_ERROR,
        400
      )
    }

    logger.debug('Upgrading subscription', {
      userId: user.id,
      oldPlanId: currentSubscription.plan_id,
      newPlanId: newPlan.id,
      stripeSubscriptionId: currentSubscription.stripe_subscription_id,
    })

    // Update the subscription in Stripe
    const updatedSubscription = await updateSubscriptionPlan(
      currentSubscription.stripe_subscription_id,
      newPriceId
    )

    // Update the subscription in our database
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        plan_id: newPlan.id,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('stripe_subscription_id', currentSubscription.stripe_subscription_id)

    if (updateError) {
      logger.error('Failed to update subscription in database', updateError)
      // Don't throw - Stripe webhook will sync this later
    }

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
      message: 'Subscription updated successfully',
    })
  } catch (error: unknown) {
    const appError = handleError(error)
    logger.error('POST /api/subscriptions/upgrade error', appError)
    return NextResponse.json(
      { error: appError.message, code: appError.code },
      { status: appError.statusCode || 500 }
    )
  }
}
