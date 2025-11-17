'use client'

/**
 * Limit Reached Modal
 * Displays when user hits their monthly prompt limit
 * Offers two options: Pay overage or Upgrade plan
 */

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button-v2'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card-v2'
import { AlertCircle, CreditCard, TrendingUp, ArrowRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LimitReachedModalProps {
  isOpen: boolean
  onClose: () => void
  currentUsage: number
  limit: number
  planTier: 'explorer' | 'researcher' | 'strategist'
  overageRate: number
  onPayOverage: () => void
  onUpgrade: () => void
}

const PLAN_DETAILS = {
  explorer: {
    name: 'Explorer',
    nextTier: 'researcher',
    nextTierName: 'Researcher',
    nextTierLimit: 150,
    nextTierPrice: 79,
  },
  researcher: {
    name: 'Researcher',
    nextTier: 'strategist',
    nextTierName: 'Strategist',
    nextTierLimit: 500,
    nextTierPrice: 299,
  },
  strategist: {
    name: 'Strategist',
    nextTier: null,
    nextTierName: null,
    nextTierLimit: null,
    nextTierPrice: null,
  },
}

export function LimitReachedModal({
  isOpen,
  onClose,
  currentUsage,
  limit,
  planTier,
  overageRate,
  onPayOverage,
  onUpgrade,
}: LimitReachedModalProps) {
  const [selectedOption, setSelectedOption] = useState<'overage' | 'upgrade' | null>(null)
  const planDetails = PLAN_DETAILS[planTier]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <DialogTitle className="text-2xl">Monthly Limit Reached</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            You've used all {limit} prompts in your {planDetails.name} plan this month. Choose how you'd like to continue:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Current Usage Display */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Current Usage
              </span>
              <Badge variant="outline" className="bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-700">
                {currentUsage} / {limit} prompts
              </Badge>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all"
                style={{ width: '100%' }}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Your limits will reset on the 1st of next month
            </p>
          </div>

          {/* Option 1: Pay Overage */}
          <Card
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              selectedOption === 'overage' && 'border-2 border-emerald-500 shadow-lg'
            )}
            onClick={() => setSelectedOption('overage')}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                    <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                      Pay As You Go
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      One-time payment for immediate access
                    </p>
                  </div>
                </div>
                {selectedOption === 'overage' && (
                  <Check className="h-6 w-6 text-emerald-500" />
                )}
              </div>

              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between py-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Price per prompt:
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ${overageRate.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Today's charge:
                  </span>
                  <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                    ${overageRate.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>Continue creating without interruption</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>Billed once at month's end for all overages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>Track your running total in real-time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>No commitment or subscription change</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Option 2: Upgrade (only if not on highest tier) */}
          {planDetails.nextTier && (
            <Card
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                selectedOption === 'upgrade' && 'border-2 border-blue-500 shadow-lg'
              )}
              onClick={() => setSelectedOption('upgrade')}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                        Upgrade to {planDetails.nextTierName}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Better value for consistent usage
                      </p>
                    </div>
                  </div>
                  {selectedOption === 'upgrade' && (
                    <Check className="h-6 w-6 text-blue-500" />
                  )}
                </div>

                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between py-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Monthly price:
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      ${planDetails.nextTierPrice}/month
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      New monthly limit:
                    </span>
                    <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                      {planDetails.nextTierLimit} prompts
                    </span>
                  </div>
                </div>

                <div className="mt-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <span>Higher monthly limits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <span>Advanced features & customization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <span>Better long-term value</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <span>Priority support & updates</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                if (selectedOption === 'overage') {
                  onPayOverage()
                } else if (selectedOption === 'upgrade') {
                  onUpgrade()
                }
              }}
              disabled={!selectedOption}
              rightIcon={selectedOption && <ArrowRight className="h-4 w-4" />}
            >
              {selectedOption === 'overage' && 'Continue Creating'}
              {selectedOption === 'upgrade' && 'Upgrade Plan'}
              {!selectedOption && 'Select an option'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
