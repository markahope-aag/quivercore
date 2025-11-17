'use client'

/**
 * Pricing Card v3 - Content-Rich Presentation
 * Based on new pricing strategy with detailed descriptions
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button-v2'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Badge } from '@/components/ui/badge'
import { Check, Loader2, Sparkles, ArrowRight, Star } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PricingFeature {
  text: string
  highlight?: boolean
}

interface PricingCardV3Props {
  planName: 'explorer' | 'researcher' | 'strategist'
  price: number // in dollars
  subtitle: string
  features: PricingFeature[]
  perfectFor: string
  socialProof?: string
  isPopular?: boolean
  currentPlan?: boolean
  stripePriceId?: string
  billingPeriod?: 'monthly' | 'annual'
  index: number
}

export function PricingCardV3({
  planName,
  price,
  subtitle,
  features,
  perfectFor,
  socialProof,
  isPopular,
  currentPlan,
  stripePriceId,
  billingPeriod = 'monthly',
  index,
}: PricingCardV3Props) {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    if (!stripePriceId) {
      toast.error('Price ID not configured')
      return
    }

    setLoading(true)
    try {
      // TODO: Implement subscription logic
      toast.info('Subscription flow coming soon!')
    } catch (error) {
      console.error('Subscription error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to process request')
    } finally {
      setLoading(false)
    }
  }

  const displayName = planName.charAt(0).toUpperCase() + planName.slice(1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="h-full"
    >
      <Card
        className={cn(
          'relative flex h-full flex-col transition-all duration-300 hover:shadow-xl',
          currentPlan && 'border-2 border-emerald-500 shadow-lg',
          isPopular && !currentPlan && 'border-2 border-blue-500 shadow-lg scale-105'
        )}
      >
        {/* Badges */}
        {currentPlan && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <Badge className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white border-0 shadow-md">
              <Check className="mr-1 h-3 w-3" />
              Current Plan
            </Badge>
          </div>
        )}
        {isPopular && !currentPlan && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <Badge className="bg-gradient-to-r from-blue-600 to-blue-500 text-white border-0 shadow-md">
              <Star className="mr-1 h-3 w-3" />
              Most Popular
            </Badge>
          </div>
        )}

        <CardHeader className="text-center pb-4">
          <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">
            {displayName} Plan
          </CardTitle>
          <div className="pt-4">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bold text-slate-900 dark:text-white">
                ${price.toLocaleString()}
              </span>
              <span className="text-lg text-slate-500 dark:text-slate-400">
                /{billingPeriod === 'annual' ? 'year' : 'month'}
              </span>
            </div>
            {billingPeriod === 'annual' && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                ${Math.round(price / 12).toLocaleString()}/month billed annually
              </p>
            )}
          </div>
          <CardDescription className="text-base mt-4 font-medium text-slate-700 dark:text-slate-300">
            {subtitle}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 space-y-6">
          {/* Features List */}
          <ul className="space-y-3">
            {features.map((feature, idx) => {
              const isLastItem = idx === features.length - 1
              // Check for any emoji at the start (broader Unicode ranges)
              const hasEmoji = /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(feature.text)

              return (
                <li key={idx} className={cn(
                  "flex items-start",
                  isLastItem && hasEmoji ? "" : "gap-3"
                )}>
                  {!(isLastItem && hasEmoji) && (
                    <Check className="h-5 w-5 mt-0.5 shrink-0 text-emerald-500" />
                  )}
                  <span className={cn(
                    "text-sm",
                    feature.highlight
                      ? "font-semibold text-slate-900 dark:text-white"
                      : "text-slate-600 dark:text-slate-400"
                  )}>
                    {feature.text}
                  </span>
                </li>
              )
            })}
          </ul>

          {/* Perfect For */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              Perfect for:
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {perfectFor}
            </p>
          </div>

          {/* Social Proof */}
          {socialProof && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-lg font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {socialProof}
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-6 flex-col gap-3">
          <Button
            className="w-full"
            size="lg"
            onClick={handleSubscribe}
            disabled={loading || currentPlan}
            rightIcon={!loading && !currentPlan && <ArrowRight className="h-4 w-4" />}
            variant={currentPlan ? 'outline' : 'default'}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : currentPlan ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Current Plan
              </>
            ) : planName === 'strategist' ? (
              'Book Demo'
            ) : (
              'Start Free Trial'
            )}
          </Button>

          {/* Risk Reduction Badges */}
          {!currentPlan && (
            <div className="w-full flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3 text-emerald-500" />
                14-day free trial
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3 text-emerald-500" />
                Cancel anytime
              </span>
            </div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}
