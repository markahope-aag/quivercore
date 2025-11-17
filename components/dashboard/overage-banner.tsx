'use client'

/**
 * Overage Banner Component
 * Shows running overage total when user exceeds monthly limit
 */

import * as React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OverageBannerProps {
  overagePrompts: number
  overageCharges: number
  overageRate: number
  compact?: boolean
}

export function OverageBanner({
  overagePrompts,
  overageCharges,
  overageRate,
  compact = false,
}: OverageBannerProps) {
  if (overagePrompts === 0) return null

  if (compact) {
    return (
      <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-orange-900 dark:text-orange-100">
              Overage Active
            </p>
            <div className="flex items-center justify-between gap-2 mt-1">
              <span className="text-xs text-orange-700 dark:text-orange-300">
                {overagePrompts} prompts
              </span>
              <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                ${overageCharges.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              Billed on {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Alert className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
          <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div className="flex-1">
          <AlertDescription className="text-sm">
            <p className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
              Overage Billing Active
            </p>
            <div className="space-y-1.5 text-orange-700 dark:text-orange-300">
              <div className="flex items-center justify-between">
                <span>Prompts over limit:</span>
                <span className="font-semibold">{overagePrompts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Rate:</span>
                <span className="font-semibold">${overageRate.toFixed(2)}/prompt</span>
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-orange-200 dark:border-orange-800">
                <span className="font-semibold">Current total:</span>
                <span className="font-bold text-lg text-orange-600 dark:text-orange-400">
                  ${overageCharges.toFixed(2)}
                </span>
              </div>
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-3">
              You'll be billed on {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} along with your regular subscription.
            </p>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  )
}
