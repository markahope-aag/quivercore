'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { TrendingUp, Users, FileText, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

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
  engagement: {
    avgAssetsPerUser: number
    avgAssetsPerActiveUser: number
    activeUsers7d: number
    activeUsers30d: number
    usersWithAssets: number
    totalAssets: number
    assetDistribution: Record<string, number>
    sessionFrequency: {
      last24h: number
      last7d: number
      last30d: number
      last90d: number
      never: number
    }
    avgAssetsByPlan: Record<string, number>
  }
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

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

  // Ensure engagement data exists with defaults
  const engagement = data.engagement || {
    avgAssetsPerUser: 0,
    avgAssetsPerActiveUser: 0,
    activeUsers7d: 0,
    activeUsers30d: 0,
    usersWithAssets: 0,
    totalAssets: 0,
    assetDistribution: {
      '1': 0,
      '2-5': 0,
      '6-10': 0,
      '11-20': 0,
      '21+': 0,
    },
    sessionFrequency: {
      last24h: 0,
      last7d: 0,
      last30d: 0,
      last90d: 0,
      never: 0,
    },
    avgAssetsByPlan: {},
  }

  // Prepare chart data
  const signupsChartData = Object.entries(data.signupsByMonth || {})
    .sort()
    .slice(-12)
    .map(([month, count]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      signups: count,
    }))

  const retentionChartData = Object.entries(data.retentionRates || {})
    .sort()
    .slice(-6)
    .map(([month, rate]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      retention: Number(rate.toFixed(1)),
    }))

  const promptsByPlanData = Object.entries(data.avgPromptsByPlan || {}).map(([plan, avg]) => ({
    plan,
    avg: Number(avg.toFixed(1)),
  }))

  // Calculate growth rates
  const signupsGrowth = signupsChartData.length >= 2
    ? ((signupsChartData[signupsChartData.length - 1].signups - signupsChartData[signupsChartData.length - 2].signups) /
        signupsChartData[signupsChartData.length - 2].signups) *
      100
    : 0

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.conversionFunnel.totalSignups}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {signupsGrowth >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={signupsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(signupsGrowth).toFixed(1)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.conversionFunnel.promptToSubscriptionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.conversionFunnel.convertedToSubscription} converted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagement.activeUsers7d}</div>
            <p className="text-xs text-muted-foreground mt-1">Active in last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagement.activeUsers30d}</div>
            <p className="text-xs text-muted-foreground mt-1">Active in last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* User Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
          <CardDescription>Monthly signups over the last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={signupsChartData}>
              <defs>
                <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis
                dataKey="month"
                className="text-xs"
                stroke="#64748b"
                tick={{ fill: '#64748b' }}
              />
              <YAxis
                className="text-xs"
                stroke="#64748b"
                tick={{ fill: '#64748b' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="signups"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorSignups)"
                name="New Signups"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>User journey from signup to subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { stage: 'Signups', value: data.conversionFunnel.totalSignups },
              { stage: 'Created Prompt', value: data.conversionFunnel.createdFirstPrompt },
              { stage: 'Subscribed', value: data.conversionFunnel.convertedToSubscription },
            ]}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis dataKey="stage" className="text-xs" stroke="#64748b" tick={{ fill: '#64748b' }} />
              <YAxis className="text-xs" stroke="#64748b" tick={{ fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Signup → Prompt</p>
              <p className="text-lg font-semibold text-green-600">
                {data.conversionFunnel.signupToPromptRate.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Prompt → Subscription</p>
              <p className="text-lg font-semibold text-blue-600">
                {data.conversionFunnel.promptToSubscriptionRate.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overall Conversion</p>
              <p className="text-lg font-semibold">
                {((data.conversionFunnel.convertedToSubscription / data.conversionFunnel.totalSignups) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Retention Rates */}
        <Card>
          <CardHeader>
            <CardTitle>30-Day Retention</CardTitle>
            <CardDescription>Percentage of users still active after 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={retentionChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="month" className="text-xs" stroke="#64748b" tick={{ fill: '#64748b' }} />
                <YAxis className="text-xs" stroke="#64748b" tick={{ fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="retention"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                  name="Retention %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>

      {/* Engagement Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagement.activeUsers7d}</div>
            <p className="text-xs text-muted-foreground mt-1">Active in last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagement.activeUsers30d}</div>
            <p className="text-xs text-muted-foreground mt-1">Active in last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Assets per User</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagement.avgAssetsPerUser.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {engagement.usersWithAssets} users with assets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagement.totalAssets}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg {engagement.avgAssetsPerActiveUser.toFixed(1)} per active user
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Distribution</CardTitle>
            <CardDescription>Number of users by asset count</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={Object.entries(engagement.assetDistribution).map(([range, count]) => ({
                  range,
                  users: count,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="range" className="text-xs" stroke="#64748b" tick={{ fill: '#64748b' }} />
                <YAxis className="text-xs" stroke="#64748b" tick={{ fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="users" fill="#10b981" radius={[8, 8, 0, 0]} name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Session Frequency */}
        <Card>
          <CardHeader>
            <CardTitle>Session Frequency</CardTitle>
            <CardDescription>Users by last sign-in recency</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Last 24h', value: engagement.sessionFrequency.last24h },
                    { name: 'Last 7 days', value: engagement.sessionFrequency.last7d },
                    { name: 'Last 30 days', value: engagement.sessionFrequency.last30d },
                    { name: 'Last 90 days', value: engagement.sessionFrequency.last90d },
                    { name: 'Never', value: engagement.sessionFrequency.never },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    engagement.sessionFrequency.last24h,
                    engagement.sessionFrequency.last7d,
                    engagement.sessionFrequency.last30d,
                    engagement.sessionFrequency.last90d,
                    engagement.sessionFrequency.never,
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Engagement by Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Average Assets by Plan</CardTitle>
          <CardDescription>User engagement by subscription tier</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={promptsByPlanData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis dataKey="plan" className="text-xs" stroke="#64748b" tick={{ fill: '#64748b' }} />
              <YAxis className="text-xs" stroke="#64748b" tick={{ fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="avg" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Avg Assets/User" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
