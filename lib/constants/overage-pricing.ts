/**
 * Overage Pricing Configuration
 * Defines per-prompt overage rates for each plan tier
 */

export const OVERAGE_RATES = {
  explorer: 0.75, // $0.75 per prompt
  researcher: 0.75, // $0.75 per prompt
  strategist: 0.50, // $0.50 per prompt
} as const

export type PlanTier = keyof typeof OVERAGE_RATES

export function getOverageRate(plan: PlanTier): number {
  return OVERAGE_RATES[plan]
}

export function calculateOverageCost(plan: PlanTier, promptCount: number): number {
  return OVERAGE_RATES[plan] * promptCount
}

export function formatOveragePrice(plan: PlanTier): string {
  return `$${OVERAGE_RATES[plan].toFixed(2)}`
}
