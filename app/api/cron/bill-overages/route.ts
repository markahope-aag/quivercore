/**
 * Monthly Overage Billing Cron Job
 * Runs on the 1st of each month to bill all users' overage charges
 *
 * Schedule: 0 2 1 * * (2 AM on the 1st of each month)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'
import { createOverageInvoice } from '@/lib/stripe/overage-billing'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    // In production, verify the cron secret
    if (process.env.NODE_ENV === 'production') {
      if (!cronSecret) {
        logger.error('CRON_SECRET not configured')
        return NextResponse.json({ error: 'Cron secret not configured' }, { status: 500 })
      }
      if (authHeader !== `Bearer ${cronSecret}`) {
        logger.error('Invalid cron authorization')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    logger.info('Starting monthly overage billing')

    const supabase = await createClient()

    // Get previous month year (since we're running on 1st of new month)
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const monthYear = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`

    logger.info('Billing overages for month', { monthYear })

    // Get all users with overage charges for last month
    const { data: usageRecords, error: usageError } = await supabase
      .from('monthly_usage_tracking')
      .select('*, user_subscriptions!inner(stripe_customer_id, subscription_plans(name))')
      .eq('month_year', monthYear)
      .gt('overage_prompts', 0)
      .gt('overage_charges', 0)

    if (usageError) {
      logger.error('Failed to fetch usage records', usageError)
      throw usageError
    }

    if (!usageRecords || usageRecords.length === 0) {
      logger.info('No overage charges to bill')
      return NextResponse.json({
        success: true,
        message: 'No overage charges to bill',
        usersBilled: 0,
        totalAmount: 0,
      })
    }

    logger.info(`Found ${usageRecords.length} users with overage charges`)

    let usersBilled = 0
    let totalAmount = 0
    const errors: any[] = []

    // Process each user's overage charges
    for (const record of usageRecords) {
      try {
        const customerId = (record as any).user_subscriptions?.stripe_customer_id
        const planName = (record as any).user_subscriptions?.subscription_plans?.name

        if (!customerId) {
          logger.warn('No Stripe customer ID for user', { userId: record.user_id })
          errors.push({ userId: record.user_id, error: 'No Stripe customer ID' })
          continue
        }

        // Create invoice for overage charges
        const invoice = await createOverageInvoice({
          customerId,
          userId: record.user_id,
          overagePrompts: record.overage_prompts,
          overageCharges: record.overage_charges,
          monthYear,
          planTier: planName?.toLowerCase() || 'explorer',
        })

        usersBilled++
        totalAmount += record.overage_charges

        logger.info('Overage invoice created', {
          userId: record.user_id,
          invoiceId: invoice.id,
          amount: record.overage_charges,
          prompts: record.overage_prompts,
        })
      } catch (error) {
        logger.error('Failed to bill user overage', {
          userId: record.user_id,
          error,
        })
        errors.push({
          userId: record.user_id,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    logger.info('Monthly overage billing completed', {
      usersBilled,
      totalAmount,
      errors: errors.length,
    })

    return NextResponse.json({
      success: true,
      usersBilled,
      totalAmount,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    logger.error('Cron job error - bill overages', error)
    return NextResponse.json(
      {
        error: 'Failed to bill overages',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
