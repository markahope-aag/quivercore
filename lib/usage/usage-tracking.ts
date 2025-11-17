/**
 * Usage Tracking System
 * Handles prompt usage tracking with monthly resets on the 1st
 */

import { createClient } from '@/lib/supabase/server'
import { PLAN_LIMITS, type PlanTier } from '@/lib/constants/billing-config'
import { getOverageRate } from '@/lib/constants/overage-pricing'

export interface UsageStats {
  userId: string
  monthYear: string
  promptsUsed: number
  promptsLimit: number
  storageUsed: number
  storageLimit: number
  overagePrompts: number
  overageCharges: number
  resetDate: string
  planTier: PlanTier
}

/**
 * Get current month-year string (YYYY-MM format)
 */
export function getCurrentMonthYear(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Get first day of current month
 */
export function getFirstOfCurrentMonth(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

/**
 * Initialize or get usage tracking for current month
 * Creates a new record if one doesn't exist for this month
 */
export async function getOrCreateUsageTracking(
  userId: string,
  planTier: PlanTier
): Promise<UsageStats | null> {
  const supabase = await createClient()
  const monthYear = getCurrentMonthYear()
  const limits = PLAN_LIMITS[planTier]

  // Try to get existing usage record
  const { data: existing } = await supabase
    .from('monthly_usage_tracking')
    .select('*')
    .eq('user_id', userId)
    .eq('month_year', monthYear)
    .single()

  if (existing) {
    return {
      userId: existing.user_id,
      monthYear: existing.month_year,
      promptsUsed: existing.prompts_used || 0,
      promptsLimit: existing.prompts_limit || limits.prompts,
      storageUsed: existing.storage_used || 0,
      storageLimit: existing.storage_limit || limits.storage,
      overagePrompts: existing.overage_prompts || 0,
      overageCharges: existing.overage_charges || 0,
      resetDate: existing.reset_date,
      planTier,
    }
  }

  // Create new usage record for this month
  const { data: created, error } = await supabase
    .from('monthly_usage_tracking')
    .insert({
      user_id: userId,
      month_year: monthYear,
      prompts_used: 0,
      prompts_limit: limits.prompts,
      storage_used: 0,
      storage_limit: limits.storage,
      overage_prompts: 0,
      overage_charges: 0,
      reset_date: getFirstOfCurrentMonth().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating usage tracking:', error)
    return null
  }

  return {
    userId: created.user_id,
    monthYear: created.month_year,
    promptsUsed: 0,
    promptsLimit: limits.prompts,
    storageUsed: 0,
    storageLimit: limits.storage,
    overagePrompts: 0,
    overageCharges: 0,
    resetDate: created.reset_date,
    planTier,
  }
}

/**
 * Increment prompt usage
 * Returns true if within limit, false if at/over limit
 */
export async function incrementPromptUsage(
  userId: string,
  planTier: PlanTier,
  count: number = 1
): Promise<{ success: boolean; isOverage: boolean; currentUsage: number }> {
  const supabase = await createClient()
  const usage = await getOrCreateUsageTracking(userId, planTier)

  if (!usage) {
    return { success: false, isOverage: false, currentUsage: 0 }
  }

  const newUsage = usage.promptsUsed + count
  const isOverage = newUsage > usage.promptsLimit

  // Update usage
  const { error } = await supabase
    .from('monthly_usage_tracking')
    .update({
      prompts_used: newUsage,
      overage_prompts: isOverage ? newUsage - usage.promptsLimit : 0,
    })
    .eq('user_id', userId)
    .eq('month_year', usage.monthYear)

  if (error) {
    console.error('Error incrementing prompt usage:', error)
    return { success: false, isOverage, currentUsage: usage.promptsUsed }
  }

  return {
    success: true,
    isOverage,
    currentUsage: newUsage,
  }
}

/**
 * Record overage charge
 */
export async function recordOverageCharge(
  userId: string,
  planTier: PlanTier,
  promptCount: number
): Promise<{ success: boolean; chargeAmount: number }> {
  const supabase = await createClient()
  const usage = await getOrCreateUsageTracking(userId, planTier)

  if (!usage) {
    return { success: false, chargeAmount: 0 }
  }

  const overageRate = getOverageRate(planTier)
  const chargeAmount = overageRate * promptCount

  // Update overage charges
  const { error } = await supabase
    .from('monthly_usage_tracking')
    .update({
      overage_prompts: usage.overagePrompts + promptCount,
      overage_charges: usage.overageCharges + chargeAmount,
    })
    .eq('user_id', userId)
    .eq('month_year', usage.monthYear)

  if (error) {
    console.error('Error recording overage charge:', error)
    return { success: false, chargeAmount: 0 }
  }

  return {
    success: true,
    chargeAmount,
  }
}

/**
 * Check if user has available prompts
 */
export async function hasAvailablePrompts(
  userId: string,
  planTier: PlanTier,
  count: number = 1
): Promise<{ available: boolean; remaining: number; wouldBeOverage: boolean }> {
  const usage = await getOrCreateUsageTracking(userId, planTier)

  if (!usage) {
    return { available: false, remaining: 0, wouldBeOverage: false }
  }

  const remaining = Math.max(0, usage.promptsLimit - usage.promptsUsed)
  const wouldBeOverage = usage.promptsUsed + count > usage.promptsLimit

  return {
    available: true, // Always available with overage option
    remaining,
    wouldBeOverage,
  }
}

/**
 * Reset usage for all users on the 1st of the month
 * Called by cron job or manually
 *
 * IMPORTANT: Only resets MONTHLY plans. Annual plans reset on their anniversary date.
 */
export async function resetMonthlyUsage(): Promise<{
  success: boolean
  usersReset: number
  annualSkipped: number
  errors: number
}> {
  const supabase = await createClient()
  const monthYear = getCurrentMonthYear()
  const resetDate = getFirstOfCurrentMonth()

  // Get all active subscriptions with plan details
  const { data: subscriptions } = await supabase
    .from('user_subscriptions')
    .select('user_id, plan_id, subscription_plans(billing_period, prompt_limit, storage_limit)')
    .eq('status', 'active')

  if (!subscriptions || subscriptions.length === 0) {
    return { success: true, usersReset: 0, annualSkipped: 0, errors: 0 }
  }

  let usersReset = 0
  let annualSkipped = 0
  let errors = 0

  // Reset usage for each user with MONTHLY plan only
  for (const subscription of subscriptions) {
    const plan = (subscription as any).subscription_plans

    if (!plan) {
      errors++
      continue
    }

    // Skip annual plans - they reset on their anniversary date
    if (plan.billing_period === 'annual' || plan.billing_period === 'yearly') {
      annualSkipped++
      continue
    }

    // Only reset monthly plans
    // Upsert usage tracking for new month
    const { error } = await supabase.from('monthly_usage_tracking').upsert(
      {
        user_id: subscription.user_id,
        month_year: monthYear,
        prompts_used: 0,
        prompts_limit: plan.prompt_limit || 50,
        storage_used: 0,
        storage_limit: plan.storage_limit || 100,
        overage_prompts: 0,
        overage_charges: 0,
        reset_date: resetDate.toISOString(),
      },
      {
        onConflict: 'user_id,month_year',
      }
    )

    if (error) {
      console.error('Error resetting usage for user:', subscription.user_id, error)
      errors++
    } else {
      usersReset++
    }
  }

  return {
    success: errors === 0,
    usersReset,
    annualSkipped,
    errors,
  }
}

/**
 * Get usage summary for dashboard
 */
export async function getUserUsageSummary(userId: string): Promise<{
  storage: { current: number; limit: number; percentUsed: number }
  promptBuilder: { current: number; limit: number; percentUsed: number }
} | null> {
  const supabase = await createClient()
  const monthYear = getCurrentMonthYear()

  const { data: usage } = await supabase
    .from('monthly_usage_tracking')
    .select('*')
    .eq('user_id', userId)
    .eq('month_year', monthYear)
    .single()

  if (!usage) {
    return null
  }

  return {
    storage: {
      current: usage.storage_used || 0,
      limit: usage.storage_limit || 100,
      percentUsed: ((usage.storage_used || 0) / (usage.storage_limit || 100)) * 100,
    },
    promptBuilder: {
      current: usage.prompts_used || 0,
      limit: usage.prompts_limit || 50,
      percentUsed: ((usage.prompts_used || 0) / (usage.prompts_limit || 50)) * 100,
    },
  }
}
