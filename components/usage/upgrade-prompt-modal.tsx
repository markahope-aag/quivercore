'use client'

/**
 * Upgrade Prompt Modal
 * Shown when user hits a usage limit, offers upgrade or overage payment options
 */

import { Button } from '@/components/ui/button-v2'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TrendingUp, CreditCard, X, Zap } from 'lucide-react'
import Link from 'next/link'
import { formatOveragePrice } from '@/lib/constants/overage-pricing'

interface UpgradePromptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feature: string
  current: number
  limit: number
  currentPlan: 'explorer' | 'researcher' | 'strategist'
  nextTier?: string
  nextTierLimit?: number
  nextTierPrice?: number
  onPayOverage?: () => void
}

export function UpgradePromptModal({
  open,
  onOpenChange,
  feature,
  current,
  limit,
  currentPlan,
  nextTier,
  nextTierLimit,
  nextTierPrice,
  onPayOverage,
}: UpgradePromptModalProps) {
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
  const overageRate = formatOveragePrice(currentPlan)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="p-2 bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-yellow-900 dark:to-yellow-950 rounded-lg">
              <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            Monthly Limit Reached
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            You've used all {limit} prompts in your {capitalize(currentPlan)} plan. Choose how to continue:
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Current Usage Stats */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border-2 border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Current Usage
              </span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {current} / {limit}
              </span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-600 to-red-500 w-full" />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {/* Option 1: Pay for Overage (Quick Solution) */}
            <div className="border-2 border-emerald-200 dark:border-emerald-800 rounded-lg p-4 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950 dark:to-slate-900">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg mt-0.5">
                  <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Pay As You Go
                    </h3>
                    <span className="text-xs font-semibold px-2 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-full">
                      Quick Option
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Pay {overageRate} per prompt until next month
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mb-3">
                    Your limits reset on the 1st of each month
                  </p>
                  <Button
                    size="sm"
                    onClick={() => {
                      onPayOverage?.()
                      onOpenChange(false)
                    }}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600"
                  >
                    Pay {overageRate} for This Prompt
                  </Button>
                </div>
              </div>
            </div>

            {/* Option 2: Upgrade (Best Value) */}
            {nextTier && nextTierLimit && (
              <div className="border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-slate-900">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mt-0.5">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        Upgrade to {capitalize(nextTier)}
                      </h3>
                      <span className="text-xs font-semibold px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                        Best Value
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Get {nextTierLimit} prompts/month + advanced features
                    </p>
                    {nextTierPrice && (
                      <p className="text-xs text-slate-500 dark:text-slate-500 mb-3">
                        ${nextTierPrice}/month - saves you money long-term
                      </p>
                    )}
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="w-full border-2 border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-950"
                    >
                      <Link href="/pricing" onClick={() => onOpenChange(false)}>
                        View {capitalize(nextTier)} Plan
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
