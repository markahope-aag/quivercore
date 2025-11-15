/**
 * API route for getting subscription plans
 * 
 * GET /api/subscriptions/plans
 * 
 * Returns all active subscription plans.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAllPlans } from '@/lib/utils/subscriptions'
import { handleError } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    const plans = await getAllPlans()

    return NextResponse.json({ plans })
  } catch (error: unknown) {
    const appError = handleError(error)
    logger.error('GET /api/subscriptions/plans error', appError)
    return NextResponse.json(
      { error: appError.message, code: appError.code },
      { status: appError.statusCode || 500 }
    )
  }
}

