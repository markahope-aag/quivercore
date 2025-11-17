/**
 * Usage Tracking Utility
 * Tracks user feature usage for subscription limits and analytics
 */

import { createClient } from '@/lib/supabase/server'
import { logger } from './logger'

export type MetricType =
  | 'prompt_execution'
  | 'prompt_created'
  | 'api_call'
  | 'prompt_builder_use'
  | 'storage_count'
  | 'template_accessed'
  | 'export_used'

interface TrackUsageParams {
  userId: string
  metricType: MetricType
  count?: number // Defaults to 1
  metadata?: Record<string, unknown>
}

interface UsagePeriod {
  periodStart: string
  periodEnd: string
}

/**
 * Get the current billing period for a user
 */
async function getUserBillingPeriod(userId: string): Promise<UsagePeriod> {
  const supabase = await createClient()

  // Get user's subscription
  const { data: subscription, error } = await supabase
    .from('user_subscriptions')
    .select('current_period_start, current_period_end')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !subscription) {
    // No subscription - use current month as period
    const now = new Date()
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    return {
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
    }
  }

  return {
    periodStart: subscription.current_period_start,
    periodEnd: subscription.current_period_end,
  }
}

/**
 * Track a usage event
 *
 * @example
 * await trackUsage({
 *   userId: user.id,
 *   metricType: 'prompt_builder_use',
 *   metadata: { framework: 'chain-of-thought', vs_pattern: 'broad_spectrum' }
 * })
 */
export async function trackUsage({
  userId,
  metricType,
  count = 1,
  metadata,
}: TrackUsageParams): Promise<void> {
  try {
    const supabase = await createClient()
    const period = await getUserBillingPeriod(userId)

    // Insert usage record
    const { error } = await supabase.from('usage_tracking').insert({
      user_id: userId,
      metric_type: metricType,
      count,
      period_start: period.periodStart,
      period_end: period.periodEnd,
      metadata: metadata || null,
    })

    if (error) {
      logger.error('Failed to track usage', { error, userId, metricType })
      // Don't throw - usage tracking failures shouldn't break the app
    }
  } catch (error) {
    logger.error('Exception in trackUsage', { error, userId, metricType })
    // Don't throw - usage tracking failures shouldn't break the app
  }
}

/**
 * Track prompt builder usage
 * This counts toward the monthly limit
 */
export async function trackPromptBuilderUse(
  userId: string,
  metadata?: { framework?: string; enhancement?: string; vs_pattern?: string }
): Promise<void> {
  await trackUsage({
    userId,
    metricType: 'prompt_builder_use',
    metadata,
  })
}

/**
 * Track storage usage snapshot
 * Useful for analytics and tracking storage growth
 */
export async function trackStorageCount(userId: string, count: number): Promise<void> {
  await trackUsage({
    userId,
    metricType: 'storage_count',
    count,
  })
}

/**
 * Track template access
 * Useful for analytics on which templates are popular
 */
export async function trackTemplateAccess(
  userId: string,
  templateId: string
): Promise<void> {
  await trackUsage({
    userId,
    metricType: 'template_accessed',
    metadata: { template_id: templateId },
  })
}

/**
 * Track export usage
 * Useful for analytics on export format preferences
 */
export async function trackExportUse(
  userId: string,
  format: 'json' | 'text' | 'markdown' | 'csv'
): Promise<void> {
  await trackUsage({
    userId,
    metricType: 'export_used',
    metadata: { format },
  })
}
