/**
 * Subscription-related types
 * 
 * @module lib/types/subscriptions
 */

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing'
  | 'incomplete'
  | 'incomplete_expired'

export type SubscriptionPlanName = 'free' | 'explorer' | 'researcher' | 'strategist'

export type VSPattern = 'broad_spectrum' | 'rarity_hunt' | 'balanced_categories'

export type ExportOption = 'text' | 'json' | 'markdown' | 'csv'

export type AnalyticsDashboard = 'none' | 'basic' | 'performance' | 'full'

export type SupportLevel = 'community' | 'email' | 'priority'

export type OnboardingType = 'self-service' | 'guided' | 'custom'

export type UsageAnalytics = 'none' | 'personal' | 'team'

export interface SubscriptionPlan {
  id: string
  name: SubscriptionPlanName
  display_name: string
  description: string | null
  price_monthly: number // in cents
  price_yearly: number | null // in cents
  stripe_price_id_monthly: string | null
  stripe_price_id_yearly: string | null
  features: SubscriptionFeatures
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SubscriptionFeatures {
  monthly_prompts: number // -1 for unlimited
  overage_rate: number | null // Price per additional prompt in USD (e.g., 0.75)
  verbalized_sampling: {
    enabled: boolean
    patterns: VSPattern[]
  }
  advanced_enhancements: boolean
  framework_library: {
    included: boolean
    count: number
    description: string
  }
  template_library: {
    access: 'none' | 'view' | 'full' | 'unlimited'
    create: boolean
    share: boolean
  }
  export_options: ExportOption[]
  analytics_dashboard: AnalyticsDashboard
  collaboration: boolean
  api_access: boolean
  support: SupportLevel
  onboarding: OnboardingType
  custom_branding: boolean
  sso_integration: boolean
  usage_analytics: UsageAnalytics
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  status: SubscriptionStatus
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  canceled_at: string | null
  trial_end: string | null
  created_at: string
  updated_at: string
}

export interface UsageTracking {
  id: string
  user_id: string
  metric_type: 'prompt_execution' | 'prompt_created' | 'api_call'
  count: number
  period_start: string
  period_end: string
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface BillingHistory {
  id: string
  user_id: string
  subscription_id: string | null
  stripe_invoice_id: string | null
  amount: number // in cents
  currency: string
  status: 'paid' | 'pending' | 'failed' | 'refunded' | 'void'
  invoice_url: string | null
  paid_at: string | null
  created_at: string
}

export interface SubscriptionWithPlan extends UserSubscription {
  plan: SubscriptionPlan
}

export interface UsageSummary {
  metric_type: string
  current_period_count: number
  limit: number // -1 for unlimited
  period_start: string
  period_end: string
  overage_count?: number // Prompts over the limit
  overage_cost?: number // Cost for overage in cents
}

export interface PlanTargetCustomer {
  targetCustomer: string
  valueProposition: string
}
