/**
 * Subscription utility functions
 * 
 * Provides functions for checking subscription status, features, and limits.
 * 
 * @module lib/utils/subscriptions
 */

import { createClient } from '@/lib/supabase/server'
import type {
  SubscriptionPlan,
  SubscriptionWithPlan,
  SubscriptionFeatures,
  SubscriptionPlanName,
} from '@/lib/types/subscriptions'

/**
 * Get user's current active subscription
 * 
 * @param userId - User ID to check
 * @returns Current subscription with plan details, or null if no active subscription
 */
export async function getUserSubscription(
  userId: string
): Promise<SubscriptionWithPlan | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(
      `
      *,
      plan:subscription_plans(*)
    `
    )
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .gte('current_period_end', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return null
  }

  return {
    ...data,
    plan: data.plan as SubscriptionPlan,
  } as SubscriptionWithPlan
}

/**
 * Get free plan (default for users without subscription)
 * 
 * @returns Free subscription plan
 */
export async function getFreePlan(): Promise<SubscriptionPlan> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('name', 'free')
    .eq('is_active', true)
    .single()

  if (error || !data) {
    // Fallback free plan if not in database
    return {
      id: 'free',
      name: 'free',
      display_name: 'Free',
      description: 'Limited free tier',
      price_monthly: 0,
      price_yearly: null,
      stripe_price_id_monthly: null,
      stripe_price_id_yearly: null,
      stripe_price_id_overage: null,
      features: {
        monthly_prompts: 10,
        overage_rate: null,
        verbalized_sampling: { enabled: false, patterns: [] },
        advanced_enhancements: false,
        framework_library: { included: true, count: 3, description: 'Basic frameworks' },
        template_library: { access: 'none', create: false, share: false },
        export_options: ['text'],
        analytics_dashboard: 'none',
        collaboration: false,
        api_access: false,
        support: 'community',
        onboarding: 'self-service',
        custom_branding: false,
        sso_integration: false,
        usage_analytics: 'none',
      },
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  return data as SubscriptionPlan
}

/**
 * Get user's effective subscription (active subscription or free plan)
 * 
 * @param userId - User ID to check
 * @returns Subscription with plan details (active subscription or free plan)
 */
export async function getUserEffectiveSubscription(
  userId: string
): Promise<SubscriptionWithPlan> {
  const activeSubscription = await getUserSubscription(userId)

  if (activeSubscription) {
    return activeSubscription
  }

  // Return free plan as default
  const freePlan = await getFreePlan()
  return {
    id: 'free',
    user_id: userId,
    plan_id: freePlan.id,
    status: 'active',
    stripe_subscription_id: null,
    stripe_customer_id: null,
    current_period_start: null,
    current_period_end: null,
    cancel_at_period_end: false,
    canceled_at: null,
    trial_end: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    plan: freePlan,
  }
}

/**
 * Check if user has access to a specific feature
 * 
 * @param features - Subscription features object
 * @param featurePath - Dot-separated path to feature (e.g., 'vs_enhancement.enabled')
 * @returns True if feature is enabled/available
 */
export function hasFeatureAccess(
  features: SubscriptionFeatures,
  featurePath: string
): boolean {
  const parts = featurePath.split('.')
  let current: any = features

  for (const part of parts) {
    if (current === null || current === undefined) {
      return false
    }
    current = current[part]
  }

  return Boolean(current)
}

/**
 * Check if user can use a specific VS enhancement pattern
 * 
 * @param features - Subscription features
 * @param pattern - VS pattern name (e.g., 'broad_spectrum', 'rarity_hunt', 'balanced_categories')
 * @returns True if pattern is available
 */
export function canUseVSPattern(
  features: SubscriptionFeatures,
  pattern: string
): boolean {
  if (!features.verbalized_sampling.enabled) {
    return false
  }

  return features.verbalized_sampling.patterns.includes(pattern as any)
}

/**
 * Check if user can use advanced enhancements
 * 
 * @param features - Subscription features
 * @returns True if advanced enhancements are available
 */
export function canUseAdvancedEnhancements(
  features: SubscriptionFeatures
): boolean {
  return features.advanced_enhancements === true
}

/**
 * Check if user can create templates
 * 
 * @param features - Subscription features
 * @returns True if template creation is allowed
 */
export function canCreateTemplates(
  features: SubscriptionFeatures
): boolean {
  return features.template_library.create === true
}

/**
 * Check if user can share templates
 * 
 * @param features - Subscription features
 * @returns True if template sharing is allowed
 */
export function canShareTemplates(
  features: SubscriptionFeatures
): boolean {
  return features.template_library.share === true
}

/**
 * Check if user has access to template library
 * 
 * @param features - Subscription features
 * @returns True if template library access is available
 */
export function hasTemplateLibraryAccess(
  features: SubscriptionFeatures
): boolean {
  return features.template_library.access !== 'none'
}

/**
 * Check if user can use a specific export format
 * 
 * @param features - Subscription features
 * @param format - Export format ('text', 'json', 'markdown', 'csv')
 * @returns True if export format is available
 */
export function canExportFormat(
  features: SubscriptionFeatures,
  format: string
): boolean {
  return features.export_options.includes(format as any)
}

/**
 * Check if user has API access
 * 
 * @param features - Subscription features
 * @returns True if API access is enabled
 */
export function hasAPIAccess(
  features: SubscriptionFeatures
): boolean {
  return features.api_access === true
}

/**
 * Check if user has collaboration features
 * 
 * @param features - Subscription features
 * @returns True if collaboration is enabled
 */
export function hasCollaboration(
  features: SubscriptionFeatures
): boolean {
  return features.collaboration === true
}

/**
 * Get monthly prompt limit
 * 
 * @param features - Subscription features
 * @returns Monthly prompt limit (-1 for unlimited)
 */
export function getMonthlyPromptLimit(
  features: SubscriptionFeatures
): number {
  return features.monthly_prompts
}

/**
 * Get overage rate (cost per additional prompt)
 * 
 * @param features - Subscription features
 * @returns Overage rate in USD, or null if not applicable
 */
export function getOverageRate(
  features: SubscriptionFeatures
): number | null {
  return features.overage_rate
}

/**
 * Get subscription plan by name
 * 
 * @param planName - Plan name ('starter', 'professional', 'enterprise')
 * @returns Subscription plan or null if not found
 */
export async function getPlanByName(
  planName: SubscriptionPlanName
): Promise<SubscriptionPlan | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('name', planName)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return null
  }

  return data as SubscriptionPlan
}

/**
 * Get all active subscription plans
 * 
 * @returns Array of active subscription plans
 */
export async function getAllPlans(): Promise<SubscriptionPlan[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('price_monthly', { ascending: true })

  if (error || !data) {
    return []
  }

  return data as SubscriptionPlan[]
}

/**
 * Get user's plan tier name
 * 
 * @param userId - User ID to check
 * @returns Plan tier name ('explorer', 'researcher', 'strategist', or 'free')
 */
export async function getUserPlanTier(
  userId: string
): Promise<'explorer' | 'researcher' | 'strategist' | 'free'> {
  const subscription = await getUserEffectiveSubscription(userId)
  const planName = subscription.plan.name

  // Map plan names to tier names
  if (planName === 'explorer' || planName === 'researcher' || planName === 'strategist') {
    return planName
  }

  // Default to 'free' for any other plan or no subscription
  return 'free'
}

