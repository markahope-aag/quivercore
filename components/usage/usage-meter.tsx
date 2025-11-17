'use client'

/**
 * Usage Meter Component
 * Displays usage progress with visual meter and upgrade options
 */

import { Button } from '@/components/ui/button-v2'
import { Card, CardContent } from '@/components/ui/card-v2'
import { Check, TrendingUp, Package } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface UsageMeterProps {
  feature: string
  current: number
  limit: number
  percentUsed: number
  upgradeAvailable?: boolean
  nextTier?: string
  nextTierLimit?: number
  addOnsAvailable?: boolean
  addOnPrice?: number
  addOnSize?: number
  className?: string
}

export function UsageMeter({
  feature,
  current,
  limit,
  percentUsed,
  upgradeAvailable,
  nextTier,
  nextTierLimit,
  addOnsAvailable,
  addOnPrice,
  addOnSize,
  className,
}: UsageMeterProps) {
  const isNearLimit = percentUsed >= 80 && percentUsed < 100
  const isAtLimit = percentUsed >= 100

  return (
    <Card className={cn('border-2', className)}>
      <CardContent className="pt-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {feature}
          </span>
          <span
            className={cn(
              'text-sm font-bold',
              isAtLimit && 'text-red-600 dark:text-red-400',
              isNearLimit && 'text-yellow-600 dark:text-yellow-400',
              !isNearLimit && !isAtLimit && 'text-slate-600 dark:text-slate-400'
            )}
          >
            {current} / {limit}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-500 ease-out rounded-full',
              isAtLimit && 'bg-gradient-to-r from-red-600 to-red-500',
              isNearLimit && !isAtLimit && 'bg-gradient-to-r from-yellow-500 to-yellow-400',
              !isNearLimit && !isAtLimit && 'bg-gradient-to-r from-emerald-600 to-emerald-500'
            )}
            style={{ width: `${Math.min(100, percentUsed)}%` }}
          />
        </div>

        {/* Status Text */}
        {isAtLimit && (
          <p className="text-xs text-red-700 dark:text-red-400 font-medium">
            ⚠️ Limit reached - upgrade or pay as you go to continue
          </p>
        )}
        {isNearLimit && !isAtLimit && (
          <p className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">
            ⚡ {Math.round(100 - percentUsed)}% remaining - consider your options
          </p>
        )}
        {!isNearLimit && !isAtLimit && (
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            <Check className="inline h-3 w-3 mr-1" />
            {Math.round(100 - percentUsed)}% available
          </p>
        )}

        {/* Upgrade Options (only show if at/near limit) */}
        {(isAtLimit || isNearLimit) && (upgradeAvailable || addOnsAvailable) && (
          <div className="pt-2 space-y-2 border-t border-slate-200 dark:border-slate-700">
            {upgradeAvailable && nextTier && nextTierLimit && (
              <Button
                asChild
                size="sm"
                variant="default"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
              >
                <Link href="/pricing">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Upgrade to {nextTier.charAt(0).toUpperCase() + nextTier.slice(1)} ({nextTierLimit}{' '}
                  {feature.toLowerCase()})
                </Link>
              </Button>
            )}

            {addOnsAvailable && addOnPrice && addOnSize && (
              <Button
                asChild
                size="sm"
                variant="outline"
                className="w-full border-2 border-emerald-300 hover:bg-emerald-50 dark:border-emerald-700 dark:hover:bg-emerald-950"
              >
                <Link href="/settings?tab=add-ons">
                  <Package className="mr-2 h-4 w-4" />
                  Buy +{addOnSize} for ${(addOnPrice / 100).toFixed(2)}
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Compact version for dashboard
 */
export function UsageMeterCompact({
  feature,
  current,
  limit,
  percentUsed,
  className,
}: Omit<UsageMeterProps, 'upgradeAvailable' | 'nextTier' | 'nextTierLimit' | 'addOnsAvailable' | 'addOnPrice' | 'addOnSize'>) {
  const isNearLimit = percentUsed >= 80 && percentUsed < 100
  const isAtLimit = percentUsed >= 100

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-300">{feature}</span>
        <span
          className={cn(
            'font-semibold',
            isAtLimit && 'text-red-600',
            isNearLimit && 'text-yellow-600',
            !isNearLimit && !isAtLimit && 'text-emerald-600'
          )}
        >
          {current}/{limit}
        </span>
      </div>

      <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-300',
            isAtLimit && 'bg-red-500',
            isNearLimit && !isAtLimit && 'bg-yellow-500',
            !isNearLimit && !isAtLimit && 'bg-emerald-500'
          )}
          style={{ width: `${Math.min(100, percentUsed)}%` }}
        />
      </div>
    </div>
  )
}
