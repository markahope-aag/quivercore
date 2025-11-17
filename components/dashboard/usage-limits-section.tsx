'use client'

/**
 * Usage Limits Section
 * Shows usage meters for storage and prompt builder on the dashboard
 */

import { useEffect, useState } from 'react'
import { UsageMeterCompact } from '@/components/usage/usage-meter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { BarChart3, Package } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface UsageLimitData {
  current: number
  limit: number
  percentUsed: number
}

interface UsageSummary {
  storage: UsageLimitData
  promptBuilder: UsageLimitData
}

export function UsageLimitsSection() {
  const [usage, setUsage] = useState<UsageSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await fetch('/api/usage/summary')
        if (res.ok) {
          const data = await res.json()
          setUsage(data)
        }
      } catch (error) {
        console.error('Failed to fetch usage:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsage()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Usage Limits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!usage) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Usage Limits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
            <Package className="h-4 w-4" />
            <span className="font-medium">Storage</span>
          </div>
          <UsageMeterCompact
            feature="Prompt Storage"
            current={usage.storage.current}
            limit={usage.storage.limit}
            percentUsed={usage.storage.percentUsed}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
            <BarChart3 className="h-4 w-4" />
            <span className="font-medium">This Month</span>
          </div>
          <UsageMeterCompact
            feature="AI Builder Uses"
            current={usage.promptBuilder.current}
            limit={usage.promptBuilder.limit}
            percentUsed={usage.promptBuilder.percentUsed}
          />
        </div>
      </CardContent>
    </Card>
  )
}
