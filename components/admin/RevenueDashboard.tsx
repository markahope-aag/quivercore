'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Users } from 'lucide-react'

interface RevenueData {
  mrr: number
  arr: number
  totalRevenue: number
  activeSubscriptions: number
  churnRate: number
  churnedCount: number
  revenueByPlan: Record<string, { count: number; mrr: number }>
  revenueByMonth: Record<string, number>
}

export function RevenueDashboard() {
  const [data, setData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRevenueData()
  }, [])

  const fetchRevenueData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/revenue')
      if (response.ok) {
        const revenueData = await response.json()
        setData(revenueData)
      }
    } catch (error) {
      console.error('Failed to fetch revenue data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Loading revenue data...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400">Failed to load revenue data</p>
      </div>
    )
  }

  const monthlyRevenueArray = Object.entries(data.revenueByMonth).sort()
  const lastMonthRevenue = monthlyRevenueArray.length > 0 ? monthlyRevenueArray[monthlyRevenueArray.length - 1][1] : 0
  const previousMonthRevenue = monthlyRevenueArray.length > 1 ? monthlyRevenueArray[monthlyRevenueArray.length - 2][1] : 0
  const revenueGrowth = previousMonthRevenue > 0 ? ((lastMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.mrr)}</div>
            <p className="text-xs text-muted-foreground">
              {data.activeSubscriptions} active subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Recurring Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.arr)}</div>
            <p className="text-xs text-muted-foreground">
              MRR × 12
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">30-Day Churn Rate</CardTitle>
            {data.churnRate > 5 ? (
              <TrendingDown className="h-4 w-4 text-red-600" />
            ) : (
              <TrendingUp className="h-4 w-4 text-green-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.churnRate > 5 ? 'text-red-600' : 'text-green-600'}`}>
              {data.churnRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {data.churnedCount} canceled subscriptions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Plan</CardTitle>
          <CardDescription>Monthly recurring revenue breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(data.revenueByPlan).map(([plan, planData]) => (
              <div key={plan} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{plan}</p>
                    <p className="text-xs text-muted-foreground">{planData.count} subscribers</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{formatCurrency(planData.mrr)}/mo</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(planData.mrr * 12)}/yr
                  </p>
                </div>
              </div>
            ))}
            {Object.keys(data.revenueByPlan).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No active subscriptions</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {monthlyRevenueArray.slice(-12).map(([month, revenue]) => {
              const maxRevenue = Math.max(...Object.values(data.revenueByMonth))
              const percentage = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0

              return (
                <div key={month} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{month}</span>
                    <span className="font-medium">{formatCurrency(revenue)}</span>
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
            {monthlyRevenueArray.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No revenue data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Growth Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Growth Metrics</CardTitle>
          <CardDescription>Month-over-month comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Last Month</p>
              <p className="text-2xl font-bold">{formatCurrency(lastMonthRevenue)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Previous Month</p>
              <p className="text-2xl font-bold">{formatCurrency(previousMonthRevenue)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Growth Rate</p>
              <p className={`text-2xl font-bold ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
