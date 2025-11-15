/**
 * API route for getting current subscription
 * 
 * GET /api/subscriptions/current
 * 
 * Returns the current active subscription for the authenticated user.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserEffectiveSubscription } from '@/lib/utils/subscriptions'
import { handleError, ErrorCodes, ApplicationError } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new ApplicationError('Unauthorized', ErrorCodes.UNAUTHORIZED, 401)
    }

    const subscription = await getUserEffectiveSubscription(user.id)

    return NextResponse.json(subscription)
  } catch (error: unknown) {
    const appError = handleError(error)
    logger.error('GET /api/subscriptions/current error', appError)
    return NextResponse.json(
      { error: appError.message, code: appError.code },
      { status: appError.statusCode || 500 }
    )
  }
}

