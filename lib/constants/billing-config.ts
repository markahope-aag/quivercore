/**
 * Billing Configuration
 * Defines calendar-month billing with prorated first month
 */

export const BILLING_CONFIG = {
  /**
   * Billing cycle anchored to the 1st of each month
   * Users who sign up mid-month pay prorated amount for first month,
   * then full price on the 1st of subsequent months
   */
  cycleAnchor: 1, // 1st of month

  /**
   * Usage limits reset on the 1st of each month for all users
   * regardless of signup date
   */
  usageResetDay: 1,

  /**
   * Proration behavior for first month
   */
  prorationBehavior: 'create_prorations' as const,
} as const

export const PLAN_LIMITS = {
  explorer: {
    prompts: 50,
    storage: 100, // MB or number of prompts
  },
  researcher: {
    prompts: 150,
    storage: 300,
  },
  strategist: {
    prompts: 500,
    storage: 1000,
  },
} as const

export const PLAN_PRICES = {
  monthly: {
    explorer: 29,
    researcher: 79,
    strategist: 299,
  },
  annual: {
    explorer: 279, // Save $69
    researcher: 758, // Save $190
    strategist: 2870, // Save $718
  },
} as const

export type PlanTier = 'explorer' | 'researcher' | 'strategist' | 'free'
export type BillingPeriod = 'monthly' | 'annual'

/**
 * Get the first day of next month as Unix timestamp
 */
export function getFirstOfNextMonth(): number {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return Math.floor(nextMonth.getTime() / 1000)
}

/**
 * Get the first day of current month as Unix timestamp
 */
export function getFirstOfCurrentMonth(): number {
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  return Math.floor(firstOfMonth.getTime() / 1000)
}

/**
 * Check if today is the 1st of the month
 */
export function isFirstOfMonth(): boolean {
  return new Date().getDate() === 1
}

/**
 * Get days remaining in current month
 */
export function getDaysRemainingInMonth(): number {
  const now = new Date()
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return lastDay - now.getDate() + 1 // +1 to include today
}

/**
 * Get total days in current month
 */
export function getDaysInCurrentMonth(): number {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
}

/**
 * Calculate prorated amount for first month
 * @param fullPrice - Full monthly price in dollars
 * @returns Prorated price in dollars (rounded to 2 decimals)
 */
export function calculateProratedPrice(fullPrice: number): number {
  const daysRemaining = getDaysRemainingInMonth()
  const daysInMonth = getDaysInCurrentMonth()
  const proratedAmount = fullPrice * (daysRemaining / daysInMonth)
  return Math.round(proratedAmount * 100) / 100 // Round to 2 decimals
}

/**
 * Get next billing date (always 1st of next month for new signups)
 */
export function getNextBillingDate(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 1)
}

/**
 * Format billing date for display
 */
export function formatBillingDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}
