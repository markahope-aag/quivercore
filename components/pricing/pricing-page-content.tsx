'use client'

import { useEffect, useState } from 'react'
import { PricingCard } from './pricing-card-v2'
import { PricingPageSkeleton } from './pricing-page-skeleton-v2'
import { SubscriptionPlan } from '@/lib/types/subscriptions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export function PricingPageContent() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPlans() {
      try {
        const response = await fetch('/api/subscriptions/plans')
        if (!response.ok) {
          throw new Error('Failed to fetch plans')
        }
        const data = await response.json()
        // Only show the 3 paid plans: explorer, researcher, strategist
        const allPlans = data.plans || []
        const allowedPlans = ['explorer', 'researcher', 'strategist']
        const seen = new Set<string>()
        const paidPlans = allPlans
          .filter((plan: SubscriptionPlan) => {
            // Only include the 3 paid plans
            if (!allowedPlans.includes(plan.name)) return false
            // Remove duplicates by name
            if (seen.has(plan.name)) return false
            seen.add(plan.name)
            return true
          })
          .sort((a: SubscriptionPlan, b: SubscriptionPlan) => a.price_monthly - b.price_monthly)
        setPlans(paidPlans)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load plans')
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

  if (loading) {
    return <PricingPageSkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No subscription plans available.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto items-stretch">
      {plans.map((plan, index) => (
        <PricingCard key={plan.id} plan={plan} index={index} />
      ))}
    </div>
  )
}

