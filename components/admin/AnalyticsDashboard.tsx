'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { TrendingUp, Users, FileText } from 'lucide-react'

interface AnalyticsData {
  signupsByMonth: Record<string, number>
  retentionRates: Record<string, number>
  conversionFunnel: {
    totalSignups: number
    createdFirstPrompt: number
    convertedToSubscription: number
    signupToPromptRate: number
    promptToSubscriptionRate: number
  }
  avgPromptsByPlan: Record<string, number>
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/analytics')
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return <div className="text-center py-12">Failed to load analytics</div>
  }

  const signupsArray = Object.entries(data.signupsByMonth).sort()
  const retentionArray = Object.entries(data.retentionRates).sort()

  return (
    <div className="space-y-6">
      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>User journey from signup to subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Signups</span>
                <span className="text-lg font-bold">{data.conversionFunnel.totalSignups}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-full bg-blue-600" style={{ width: '100%' }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created First Prompt</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-green-600">{data.conversionFunnel.signupToPromptRate.toFixed(1)}%</span>
                  <span className="text-lg font-bold">{data.conversionFunnel.createdFirstPrompt}</span>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-full bg-blue-600" style={{ width: `${data.conversionFunnel.signupToPromptRate}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Converted to Subscription</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-green-600">{data.conversionFunnel.promptToSubscriptionRate.toFixed(1)}%</span>
                  <span className="text-lg font-bold">{data.conversionFunnel.convertedToSubscription}</span>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-full bg-green-600" style={{ width: `${data.conversionFunnel.promptToSubscriptionRate}%` }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Growth */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
          <CardDescription>Signups per month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {signupsArray.slice(-12).map(([month, count]) => {
              const maxSignups = Math.max(...Object.values(data.signupsByMonth))
              const percentage = maxSignups > 0 ? (count / maxSignups) * 100 : 0

              return (
                <div key={month} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{month}</span>
                    <span className="font-medium">{count} signups</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-full bg-blue-600 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Retention Rates */}
      <Card>
        <CardHeader>
          <CardTitle>30-Day Retention</CardTitle>
          <CardDescription>Percentage of users still active after 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {retentionArray.slice(-6).map(([month, rate]) => (
              <div key={month} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{month}</span>
                  <span className={`font-medium ${rate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                    {rate.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className={`h-full transition-all ${rate >= 50 ? 'bg-green-600' : 'bg-red-600'}`}
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Engagement by Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Average Prompts by Plan</CardTitle>
          <CardDescription>User engagement by subscription tier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(data.avgPromptsByPlan).map(([plan, avg]) => (
              <div key={plan} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">{plan}</span>
                </div>
                <span className="text-lg font-bold">{avg.toFixed(1)} prompts/user</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
