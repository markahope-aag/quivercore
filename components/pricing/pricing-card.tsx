'use client'

import { useState } from 'react'
import { SubscriptionPlan } from '@/lib/types/subscriptions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Loader2, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PricingCardProps {
  plan: SubscriptionPlan
}

export function PricingCard({ plan }: PricingCardProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubscribe = async () => {
    if (!plan.stripe_price_id_monthly) {
      console.error('No price ID for plan:', plan.name)
      return
    }

    setLoading(true)
    try {
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

      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (error) {
      console.error('Checkout error:', error)
      alert(error instanceof Error ? error.message : 'Failed to start checkout')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`
  }

  const formatOverage = (rate: number | null) => {
    if (!rate) return null
    return `$${rate.toFixed(2)}`
  }

  const features = [
    {
      label: 'Monthly Prompts',
      value: plan.features.monthly_prompts === -1 ? 'Unlimited' : `${plan.features.monthly_prompts} prompts/month`,
    },
    {
      label: 'Overage Rate',
      value: formatOverage(plan.features.overage_rate) || 'N/A',
    },
    {
      label: 'Verbalized Sampling',
      value: plan.features.verbalized_sampling?.enabled
        ? `${plan.features.verbalized_sampling.patterns?.length || 0} pattern${(plan.features.verbalized_sampling.patterns?.length || 0) !== 1 ? 's' : ''}`
        : 'Not included',
    },
    {
      label: 'Advanced Enhancements',
      value: plan.features?.advanced_enhancements ? 'Included' : 'Not included',
    },
    {
      label: 'Framework Library',
      value: plan.features.framework_library?.included
        ? plan.features.framework_library.count === -1
          ? 'Unlimited'
          : `${plan.features.framework_library.count || 0} frameworks`
        : 'Not included',
    },
    {
      label: 'Template Library',
      value:
        plan.features.template_library?.access === 'none' || !plan.features.template_library?.access
          ? 'Not included'
          : plan.features.template_library.access === 'unlimited'
            ? 'Unlimited access'
            : `${plan.features.template_library.access} access`,
    },
    {
      label: 'Export Options',
      value: `${plan.features.export_options?.length || 0} format${(plan.features.export_options?.length || 0) !== 1 ? 's' : ''}`,
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
    <Card className={`relative flex flex-col ${isPopular ? 'border-primary shadow-lg scale-105' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground">
            <Sparkles className="mr-1 h-3 w-3" />
            Most Popular
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl">{plan.display_name}</CardTitle>
        <CardDescription className="text-base">{plan.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-6">
        <div className="text-center">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold">{formatPrice(plan.price_monthly)}</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          {plan.features.overage_rate && (
            <p className="text-sm text-muted-foreground mt-1">
              {formatOverage(plan.features.overage_rate)} per additional prompt
            </p>
          )}
        </div>

        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="flex-1">
                <span className="font-medium">{feature.label}:</span>{' '}
                <span className="text-muted-foreground">{feature.value}</span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          onClick={handleSubscribe}
          disabled={loading || !plan.stripe_price_id_monthly}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Subscribe'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

