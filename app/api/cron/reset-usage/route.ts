/**
 * Cron Job: Reset Monthly Usage
 *
 * GET /api/cron/reset-usage
 *
 * Resets usage limits for all users on the 1st of each month.
 * Should be called by Vercel Cron or external scheduler.
 *
 * Setup in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/reset-usage",
 *     "schedule": "0 0 1 * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { resetMonthlyUsage } from '@/lib/usage/usage-tracking'
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

    // Check if it's actually the 1st of the month
    const today = new Date().getDate()
    if (today !== 1) {
      logger.warn('Reset usage called on day other than 1st', { day: today })
      // Still allow it in case of manual trigger or missed run
    }

    logger.info('Starting monthly usage reset')

    const result = await resetMonthlyUsage()

    logger.info('Monthly usage reset completed', result)

    return NextResponse.json({
      success: result.success,
      usersReset: result.usersReset,
      annualSkipped: result.annualSkipped,
      errors: result.errors,
      timestamp: new Date().toISOString(),
      message: `Reset ${result.usersReset} monthly subscriptions, skipped ${result.annualSkipped} annual subscriptions`,
    })
  } catch (error: unknown) {
    logger.error('Cron job error - reset usage', error)
    return NextResponse.json(
      {
        error: 'Failed to reset usage',
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
