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

  // Determine storage limit based on plan
  const getStorageLimit = () => {
    switch (plan.name) {
      case 'explorer':
        return '100 prompts/templates'
      case 'researcher':
        return '250 prompts/templates'
      case 'strategist':
        return '500 prompts/templates'
      default:
        return '100 prompts/templates'
    }
  }

  const getCuratedTemplates = () => {
    switch (plan.name) {
      case 'explorer':
        return '30 curated templates'
      case 'researcher':
        return '40+ templates + 2 new/month'
      case 'strategist':
        return '50+ templates + custom'
      default:
        return '30 templates'
    }
  }

  const getAnalyticsLevel = () => {
    switch (plan.name) {
      case 'explorer':
        return 'Basic usage analytics'
      case 'researcher':
        return 'Advanced analytics + insights'
      case 'strategist':
        return 'Full analytics + ROI tracking'
      default:
        return 'Basic analytics'
    }
  }

  const getOnboarding = () => {
    switch (plan.name) {
      case 'explorer':
        return 'Self-service'
      case 'researcher':
        return 'Guided + best practices'
      case 'strategist':
        return 'White-glove + success manager'
      default:
        return 'Self-service'
    }
  }

  const features = [
    {
      label: 'Your Prompt Storage',
      value: getStorageLimit(),
    },
    {
      label: 'AI Prompt Builder',
      value: plan.features?.monthly_prompts === -1 ? '500 prompts/month' : `${plan.features?.monthly_prompts || 0} prompts/month`,
    },
    {
      label: 'Verbalized Sampling',
      value: 'All 3 patterns',
    },
    {
      label: 'Frameworks Available',
      value: 'All 10 frameworks',
    },
    {
      label: 'Advanced Enhancements',
      value: 'All enhancements included',
    },
    {
      label: 'Curated Templates',
      value: getCuratedTemplates(),
    },
    {
      label: 'Analytics Dashboard',
      value: getAnalyticsLevel(),
    },
    {
      label: 'Support',
      value: plan.features?.support || 'Community',
    },
    {
      label: 'Onboarding',
      value: getOnboarding(),
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

