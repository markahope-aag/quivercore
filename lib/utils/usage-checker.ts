/**
 * Usage Limit Checker Utility
 * Checks if users can perform actions based on their subscription tier limits
 */

import { createClient } from '@/lib/supabase/server'
import { logger } from './logger'
import { SubscriptionPlanName } from '@/lib/types/subscriptions'

export type CheckableFeature = 'prompt_builder' | 'storage'

export interface UsageLimitResult {
  allowed: boolean
  current: number
  limit: number
  remaining: number
  percentUsed: number

  // Upgrade information
  upgradeRequired: boolean
  nextTier?: SubscriptionPlanName
  nextTierLimit?: number

  // Add-on information
  addOnsAvailable: boolean
  addOnPrice?: number // Price per block in cents
  addOnSize?: number // Size of one block
  currentAddOns?: number // How many add-on blocks user has
}

interface UserSubscriptionData {
  plan_name: SubscriptionPlanName
  features: any
  current_period_start: string
  current_period_end: string
}

/**
 * Get storage limit for a plan
 */
function getStorageLimit(planName: SubscriptionPlanName): number {
  switch (planName) {
    case 'explorer':
      return 100
    case 'researcher':
      return 250
    case 'strategist':
      return 500
    default:
      return 100
  }
}

/**
 * Get monthly prompt builder limit for a plan
 */
function getBuilderLimit(planName: SubscriptionPlanName): number {
  switch (planName) {
    case 'explorer':
      return 50
    case 'researcher':
      return 150
    case 'strategist':
      return 500
    default:
      return 50
  }
}

/**
 * Get the next tier for upgrades
 */
function getNextTier(currentPlan: SubscriptionPlanName): SubscriptionPlanName | undefined {
  switch (currentPlan) {
    case 'explorer':
      return 'researcher'
    case 'researcher':
      return 'strategist'
    case 'strategist':
      return undefined // Already at top tier
    default:
      return 'researcher'
  }
}

/**
 * Get add-on pricing for a feature
 * Returns { price: cents, size: units }
 */
function getAddOnInfo(feature: CheckableFeature): { price: number; size: number } {
  switch (feature) {
    case 'storage':
      return {
        price: 500, // $5.00 per block
        size: 50, // 50 additional prompts
      }
    case 'prompt_builder':
      return {
        price: 1000, // $10.00 per block
        size: 50, // 50 additional uses
      }
  }
}

/**
 * Get user's add-on blocks for a feature
 * TODO: This will need a new database table for add-on purchases
 */
async function getUserAddOns(
  userId: string,
  feature: CheckableFeature,
  periodStart: string,
  periodEnd: string
): Promise<number> {
  // For now, return 0
  // Will implement add-ons table in future phase
  return 0
}

/**
 * Check if user can perform an action based on usage limits
 *
 * @example
 * const check = await checkUsageLimit({ userId: user.id, feature: 'storage' })
 * if (!check.allowed) {
 *   return { error: 'Storage limit reached', upgradeOptions: check }
 * }
 */
export async function checkUsageLimit({
  userId,
  feature,
}: {
  userId: string
  feature: CheckableFeature
}): Promise<UsageLimitResult> {
  const supabase = await createClient()

  // Get user's subscription
  const { data: subscriptionData } = await supabase.rpc('get_user_subscription', {
    p_user_id: userId,
  })

  if (!subscriptionData || subscriptionData.length === 0) {
    // No subscription - treat as explorer plan
    const subscription: UserSubscriptionData = {
      plan_name: 'explorer',
      features: { monthly_prompts: 50 },
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }
    return await calculateLimit(userId, feature, subscription)
  }

  const subscription: UserSubscriptionData = subscriptionData[0]
  return await calculateLimit(userId, feature, subscription)
}

async function calculateLimit(
  userId: string,
  feature: CheckableFeature,
  subscription: UserSubscriptionData
): Promise<UsageLimitResult> {
  const supabase = await createClient()
  const addOnInfo = getAddOnInfo(feature)

  switch (feature) {
    case 'storage': {
      // Get current storage count
      const { count, error } = await supabase
        .from('prompts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('archived', false)

      if (error) {
        logger.error('Failed to count user prompts', { error, userId })
        throw new Error('Failed to check storage limit')
      }

      const current = count || 0
      const baseLimit = getStorageLimit(subscription.plan_name)
      const addOns = await getUserAddOns(
        userId,
        'storage',
        subscription.current_period_start,
        subscription.current_period_end
      )
      const limit = baseLimit + addOns * addOnInfo.size
      const remaining = Math.max(0, limit - current)
      const percentUsed = (current / limit) * 100

      const nextTier = getNextTier(subscription.plan_name)

      return {
        allowed: current < limit,
        current,
        limit,
        remaining,
        percentUsed,
        upgradeRequired: current >= limit,
        nextTier,
        nextTierLimit: nextTier ? getStorageLimit(nextTier) : undefined,
        addOnsAvailable: true,
        addOnPrice: addOnInfo.price,
        addOnSize: addOnInfo.size,
        currentAddOns: addOns,
      }
    }

    case 'prompt_builder': {
      // Get usage in current billing period
      const { data: usage } = await supabase.rpc('get_user_usage', {
        p_user_id: userId,
        p_metric_type: 'prompt_builder_use',
        p_period_start: subscription.current_period_start,
        p_period_end: subscription.current_period_end,
      })

      const current = usage || 0
      const baseLimit = getBuilderLimit(subscription.plan_name)
      const addOns = await getUserAddOns(
        userId,
        'prompt_builder',
        subscription.current_period_start,
        subscription.current_period_end
      )
      const limit = baseLimit + addOns * addOnInfo.size
      const remaining = Math.max(0, limit - current)
      const percentUsed = (current / limit) * 100

      const nextTier = getNextTier(subscription.plan_name)

      return {
        allowed: current < limit,
        current,
        limit,
        remaining,
        percentUsed,
        upgradeRequired: current >= limit,
        nextTier,
        nextTierLimit: nextTier ? getBuilderLimit(nextTier) : undefined,
        addOnsAvailable: true,
        addOnPrice: addOnInfo.price,
        addOnSize: addOnInfo.size,
        currentAddOns: addOns,
      }
    }
  }
}

/**
 * Quick check if user is approaching a limit (>= 80%)
 */
export async function isApproachingLimit(
  userId: string,
  feature: CheckableFeature
): Promise<boolean> {
  const result = await checkUsageLimit({ userId, feature })
  return result.percentUsed >= 80
}

/**
 * Get usage summary for dashboard display
 */
export async function getUsageSummary(userId: string) {
  const [storage, builder] = await Promise.all([
    checkUsageLimit({ userId, feature: 'storage' }),
    checkUsageLimit({ userId, feature: 'prompt_builder' }),
  ])

  return {
    storage,
    promptBuilder: builder,
  }
}
