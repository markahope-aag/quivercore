'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Badge } from '@/components/ui/badge-v2'
import { Zap, FileText, Code, Crown } from 'lucide-react'
import Link from 'next/link'

interface UsageStats {
  prompt_execution: number
  prompt_created: number
  api_call: number
}

interface Subscription {
  status: string
  subscription_plans: {
    display_name: string
    monthly_price: number
    features: any
  } | null
}

export function UsageStatsSection() {
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch('/api/dashboard/stats')
        if (!response.ok) throw new Error('Failed to load stats')
        const data = await response.json()
        setUsageStats(data.usageStats)
        setSubscription(data.subscription)
      } catch (error) {
        console.error('Error loading usage stats:', error)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage & Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage & Subscription</CardTitle>
        <CardDescription>Your activity this month</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Usage Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Executions</span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">
              {usageStats?.prompt_execution || 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Created</span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">
              {usageStats?.prompt_created || 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-slate-600 dark:text-slate-400">API Calls</span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">
              {usageStats?.api_call || 0}
            </span>
          </div>
        </div>

        {/* Subscription Status */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Plan</span>
            {subscription ? (
              <Badge variant="outline" className="gap-1">
                <Crown className="h-3 w-3" />
                {subscription.subscription_plans?.display_name || 'Active'}
              </Badge>
            ) : (
              <Badge variant="outline">Free</Badge>
            )}
          </div>
          <Link href="/settings">
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline w-full text-left mt-2">
              Manage Subscription →
            </button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

