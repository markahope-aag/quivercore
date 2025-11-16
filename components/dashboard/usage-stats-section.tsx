'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Badge } from '@/components/ui/badge-v2'
import { Zap, FileText, Code, Crown } from 'lucide-react'
import Link from 'next/link'

interface UsageStatsSectionProps {
  stats: {
    usage?: {
      promptExecutions?: number
      promptsCreated?: number
      apiCalls?: number
    }
    subscription?: {
      status: string
      subscription_plans: {
        display_name: string
        features?: any
      } | null
    } | null
  } | null
}

export function UsageStatsSection({ stats }: UsageStatsSectionProps) {
  const usage = stats?.usage || {}
  const subscription = stats?.subscription

  return (
    <div className="space-y-4">
      {/* Usage Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Usage This Month</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Executions</span>
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {usage.promptExecutions || 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Created</span>
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {usage.promptsCreated || 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-slate-600 dark:text-slate-400">API Calls</span>
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {usage.apiCalls || 0}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Status */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {subscription.subscription_plans?.display_name || 'Free'}
              </p>
              {subscription.status === 'trialing' && (
                <Badge variant="outline" className="mt-1 text-xs">
                  Trial Active
                </Badge>
              )}
            </div>
            <Link href="/settings">
              <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                Manage Subscription →
              </button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
