/**
 * API route for creating Stripe billing portal session
 * 
 * POST /api/subscriptions/create-portal
 * 
 * Creates a billing portal session for managing subscription.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createBillingPortalSession } from '@/lib/stripe/subscriptions'
import { handleError, ErrorCodes, ApplicationError } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new ApplicationError('Unauthorized', ErrorCodes.UNAUTHORIZED, 401)
    }

    // Get the base URL for return URL
    const origin = request.headers.get('origin') || 'http://localhost:3000'
    const returnUrl = `${origin}/billing`

    logger.debug('Creating billing portal session', {
      userId: user.id,
    })

    const portalUrl = await createBillingPortalSession(user.id, returnUrl)

    return NextResponse.json({
      url: portalUrl,
    })
  } catch (error: unknown) {
    const appError = handleError(error)
    logger.error('POST /api/subscriptions/create-portal error', appError)
    return NextResponse.json(
      { error: appError.message, code: appError.code },
      { status: appError.statusCode || 500 }
    )
  }
}

