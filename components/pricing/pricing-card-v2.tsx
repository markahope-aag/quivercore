/**
 * Professional Pricing Card Component
 * Enterprise-grade pricing cards with animations and proper states
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { SubscriptionPlan } from '@/lib/types/subscriptions'
import { Button } from '@/components/ui/button-v2'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Badge } from '@/components/ui/badge'
import { Check, Loader2, Sparkles, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PricingCardProps {
  plan: SubscriptionPlan
  index: number
  currentPlanName?: string | null
}

export function PricingCard({ plan, index, currentPlanName }: PricingCardProps) {
  const [loading, setLoading] = useState(false)

  // Plan hierarchy for upgrade/downgrade logic
  const planHierarchy: Record<string, number> = {
    'explorer': 1,
    'researcher': 2,
    'strategist': 3,
  }

  const isCurrentPlan = currentPlanName === plan.name
  const currentPlanLevel = currentPlanName ? planHierarchy[currentPlanName] || 0 : 0
  const targetPlanLevel = planHierarchy[plan.name] || 0
  const isUpgrade = currentPlanLevel > 0 && targetPlanLevel > currentPlanLevel
  const isDowngrade = currentPlanLevel > 0 && targetPlanLevel < currentPlanLevel

  const handleSubscribe = async () => {
    if (!plan.stripe_price_id_monthly) {
      toast.error('No price ID configured for this plan')
      return
    }

    setLoading(true)
    try {
      // If user has a subscription, use upgrade endpoint
      if (currentPlanName && (isUpgrade || isDowngrade)) {
        const response = await fetch('/api/subscriptions/upgrade', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId: plan.stripe_price_id_monthly,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to update subscription')
        }

        const { message } = await response.json()
        toast.success(message || 'Subscription updated successfully!')

        // Reload the page to show updated plan
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        // New subscription - use checkout
        const response = await fetch('/api/subscriptions/create-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId: plan.stripe_price_id_monthly,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create checkout session')
        }

        const { url } = await response.json()

        if (!url) {
          throw new Error('No checkout URL returned')
        }

        toast.success('Redirecting to checkout...')
        window.location.href = url
      }
    } catch (error) {
      console.error('Subscription error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to process request')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`
  }

  const features = [
    {
      label: 'Prompt Storage',
      value: 'Unlimited',
    },
    {
      label: 'AI Prompt Builder',
      value: plan.features?.monthly_prompts === -1 ? 'Unlimited uses' : `${plan.features?.monthly_prompts || 0} uses/month`,
    },
    {
      label: 'In-App Testing',
      value: 'With your API keys',
    },
    {
      label: 'Verbalized Sampling',
      value: plan.features?.verbalized_sampling?.enabled
        ? `${plan.features.verbalized_sampling.patterns?.length || 0} pattern${(plan.features.verbalized_sampling.patterns?.length || 0) !== 1 ? 's' : ''}`
        : 'Not included',
    },
    {
      label: 'Advanced Enhancements',
      value: plan.features?.advanced_enhancements ? 'Included' : 'Not included',
    },
    {
      label: 'Framework Library',
      value: plan.features?.framework_library?.included
        ? plan.features.framework_library.count === -1
          ? 'Unlimited'
          : `${plan.features.framework_library.count || 0} frameworks`
        : 'Not included',
    },
    {
      label: 'Template Library',
      value:
        plan.features?.template_library?.access === 'none' || !plan.features?.template_library?.access
          ? 'Not included'
          : plan.features.template_library.access === 'unlimited'
            ? 'Unlimited access'
            : `${plan.features.template_library.access} access`,
    },
    {
      label: 'Export Options',
      value: `${plan.features?.export_options?.length || 0} format${(plan.features?.export_options?.length || 0) !== 1 ? 's' : ''}`,
    },
    {
      label: 'Analytics',
      value: plan.features?.analytics_dashboard === 'none' || !plan.features?.analytics_dashboard ? 'Not included' : plan.features.analytics_dashboard,
    },
    {
      label: 'Support',
      value: plan.features?.support || 'Not specified',
    },
  ]

  const isPopular = plan.name === 'researcher'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="h-full"
    >
      <Card
        className={cn(
          'relative flex h-full flex-col transition-all duration-300',
          isCurrentPlan && 'border-2 border-emerald-500 shadow-lg',
          isPopular && !isCurrentPlan && 'border-2 border-blue-500 shadow-lg scale-105'
        )}
      >
        {isCurrentPlan && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <Badge className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white border-0 shadow-md">
              <Check className="mr-1 h-3 w-3" />
              Current Plan
            </Badge>
          </div>
        )}
        {isPopular && !isCurrentPlan && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <Badge className="bg-gradient-to-r from-blue-600 to-blue-500 text-white border-0 shadow-md">
              <Sparkles className="mr-1 h-3 w-3" />
              Most Popular
            </Badge>
          </div>
        )}

        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold">{plan.display_name}</CardTitle>
          <CardDescription className="text-base mt-2">{plan.description}</CardDescription>
        </CardHeader>

        <CardContent className="flex-1 space-y-6">
          <div className="text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bold text-slate-900 dark:text-white">
                {formatPrice(plan.price_monthly)}
              </span>
              <span className="text-lg text-slate-500 dark:text-slate-400">/month</span>
            </div>
          </div>

          <ul className="space-y-3">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {feature.label}:
                  </span>{' '}
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {feature.value}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>

        <CardFooter className="pt-6">
          <Button
            className="w-full"
            size="lg"
            onClick={handleSubscribe}
            disabled={loading || !plan.stripe_price_id_monthly || isCurrentPlan}
            rightIcon={!loading && !isCurrentPlan && <ArrowRight className="h-4 w-4" />}
            variant={isCurrentPlan ? 'outline' : 'default'}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : isCurrentPlan ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Current Plan
              </>
            ) : isUpgrade ? (
              'Upgrade'
            ) : isDowngrade ? (
              'Downgrade'
            ) : (
              'Subscribe'
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

