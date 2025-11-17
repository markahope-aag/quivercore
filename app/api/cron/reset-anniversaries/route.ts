/**
 * Cron Job: Reset Annual Plan Anniversaries
 *
 * GET /api/cron/reset-anniversaries
 *
 * Checks for annual plan anniversaries and resets usage limits.
 * Should be called daily by Vercel Cron or external scheduler.
 *
 * Setup in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/reset-anniversaries",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { resetAnnualAnniversaries } from '@/lib/usage/usage-tracking'
import { logger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    // In production, verify the cron secret
    if (process.env.NODE_ENV === 'production') {
      if (!cronSecret) {
        logger.error('CRON_SECRET not configured')
        return NextResponse.json(
          { error: 'Cron secret not configured' },
          { status: 500 }
        )
      }

      if (authHeader !== `Bearer ${cronSecret}`) {
        logger.error('Invalid cron authorization')
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    logger.info('Starting annual anniversary reset check')

    const result = await resetAnnualAnniversaries()

    logger.info('Annual anniversary reset check completed', result)

    return NextResponse.json({
      success: result.success,
      usersReset: result.usersReset,
      anniversariesChecked: result.anniversariesChecked,
      errors: result.errors,
      timestamp: new Date().toISOString(),
      message: `Checked ${result.anniversariesChecked} annual plans, reset ${result.usersReset} anniversaries`,
    })
  } catch (error: unknown) {
    logger.error('Cron job error - reset anniversaries', error)
    return NextResponse.json(
      {
        error: 'Failed to reset anniversaries',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Allow POST as well for manual triggers
export async function POST(request: NextRequest) {
  return GET(request)
}
