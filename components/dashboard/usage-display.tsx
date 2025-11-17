'use client'

/**
 * Usage Display Component
 * Shows current prompt usage with progress bar
 */

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card-v2'
import { Progress } from '@/components/ui/progress'
import { Zap, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UsageDisplayProps {
  current: number
  limit: number
  planTier: 'explorer' | 'researcher' | 'strategist' | 'free'
  compact?: boolean
}

const PLAN_NAMES = {
  explorer: 'Explorer',
  researcher: 'Researcher',
  strategist: 'Strategist',
  free: 'Free',
}

export function UsageDisplay({ current, limit, planTier, compact = false }: UsageDisplayProps) {
  const percentUsed = (current / limit) * 100
  const remaining = Math.max(0, limit - current)
  const isNearLimit = percentUsed >= 80
  const isAtLimit = percentUsed >= 100

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <Zap className={cn(
              'h-3.5 w-3.5',
              isAtLimit ? 'text-orange-500' : isNearLimit ? 'text-yellow-500' : 'text-blue-500'
            )} />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Prompts
            </span>
          </div>
          <span className={cn(
            'font-semibold',
            isAtLimit ? 'text-orange-600 dark:text-orange-400' : 'text-slate-600 dark:text-slate-400'
          )}>
            {current} / {limit}
          </span>
        </div>
        <Progress
          value={Math.min(percentUsed, 100)}
          className={cn(
            'h-1.5',
            isAtLimit && 'bg-orange-200 dark:bg-orange-900'
          )}
          indicatorClassName={cn(
            isAtLimit ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
            isNearLimit ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
            'bg-gradient-to-r from-blue-500 to-blue-600'
          )}
        />
        {isAtLimit ? (
          <div className="flex items-start gap-1.5 rounded-md bg-orange-50 dark:bg-orange-950/30 px-2 py-1.5">
            <AlertCircle className="h-3 w-3 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
            <p className="text-xs text-orange-700 dark:text-orange-300 leading-tight">
              Limit reached. Pay overage or upgrade.
            </p>
          </div>
        ) : isNearLimit ? (
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            {remaining} prompts remaining
          </p>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {remaining} remaining this month
          </p>
        )}
      </div>
    )
  }

  return (
    <Card className={cn(
      'border-2 transition-all',
      isAtLimit ? 'border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20' :
      isNearLimit ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/20' :
      'border-slate-200 dark:border-slate-700'
    )}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              'p-1.5 rounded-lg',
              isAtLimit ? 'bg-orange-100 dark:bg-orange-900' :
              isNearLimit ? 'bg-yellow-100 dark:bg-yellow-900' :
              'bg-blue-100 dark:bg-blue-900'
            )}>
              <Zap className={cn(
                'h-4 w-4',
                isAtLimit ? 'text-orange-600 dark:text-orange-400' :
                isNearLimit ? 'text-yellow-600 dark:text-yellow-400' :
                'text-blue-600 dark:text-blue-400'
              )} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Prompt Usage
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {PLAN_NAMES[planTier]} Plan
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={cn(
              'text-lg font-bold',
              isAtLimit ? 'text-orange-600 dark:text-orange-400' : 'text-slate-900 dark:text-white'
            )}>
              {current}/{limit}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {Math.round(percentUsed)}% used
            </p>
          </div>
        </div>

        <Progress
          value={Math.min(percentUsed, 100)}
          className="h-2"
          indicatorClassName={cn(
            isAtLimit ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
            isNearLimit ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
            'bg-gradient-to-r from-blue-500 to-blue-600'
          )}
        />

        {isAtLimit ? (
          <div className="flex items-start gap-2 rounded-lg bg-orange-100 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800 p-3">
            <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                Monthly limit reached
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-300 mt-0.5">
                Pay per prompt or upgrade your plan to continue.
              </p>
            </div>
          </div>
        ) : isNearLimit ? (
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            <span className="font-semibold">{remaining} prompts</span> remaining this month
          </p>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <span className="font-semibold">{remaining} prompts</span> remaining until reset
          </p>
        )}

        <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
          Resets on the 1st of each month
        </p>
      </CardContent>
    </Card>
  )
}
