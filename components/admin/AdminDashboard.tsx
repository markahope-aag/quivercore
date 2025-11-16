'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Users, FileText, TrendingUp, Database, Activity } from 'lucide-react'

interface SystemStats {
  totalUsers: number
  totalPrompts: number
  totalTemplates: number
  activeUsers30d: number
  avgPromptsPerUser: number
}

interface User {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
}

interface PromptStats {
  total: number
  byDomain: Record<string, number>
  byFramework: Record<string, number>
  templates: number
}

export function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [promptStats, setPromptStats] = useState<PromptStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    setLoading(true)
    try {
      const [statsRes, usersRes, promptsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/prompts'),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users || [])
      }

      if (promptsRes.ok) {
        const promptsData = await promptsRes.json()
        setPromptStats(promptsData)
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Loading admin data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* System Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeUsers30d || 0} active in last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPrompts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.avgPromptsPerUser?.toFixed(1) || 0} avg per user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTemplates || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalTemplates && stats?.totalPrompts
                ? ((stats.totalTemplates / stats.totalPrompts) * 100).toFixed(1)
                : 0}% of prompts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Prompt Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Prompt Analytics</CardTitle>
          <CardDescription>Distribution of prompts across domains and frameworks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* By Domain */}
            <div>
              <h4 className="text-sm font-medium mb-3">By Domain</h4>
              <div className="space-y-2">
                {promptStats?.byDomain && Object.entries(promptStats.byDomain).length > 0 ? (
                  Object.entries(promptStats.byDomain)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([domain, count]) => (
                      <div key={domain} className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">{domain}</span>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-slate-500">No data available</p>
                )}
              </div>
            </div>

            {/* By Framework */}
            <div>
              <h4 className="text-sm font-medium mb-3">By Framework</h4>
              <div className="space-y-2">
                {promptStats?.byFramework && Object.entries(promptStats.byFramework).length > 0 ? (
                  Object.entries(promptStats.byFramework)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([framework, count]) => (
                      <div key={framework} className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">{framework}</span>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-slate-500">No data available</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
          <CardDescription>Latest user registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.slice(0, 10).map((user) => (
              <div key={user.id} className="flex items-center justify-between border-b border-slate-200 pb-3 last:border-0 dark:border-slate-700">
                <div>
                  <p className="text-sm font-medium">{user.email}</p>
                  <p className="text-xs text-slate-500">
                    Joined: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">
                    {user.last_sign_in_at
                      ? `Last active: ${new Date(user.last_sign_in_at).toLocaleDateString()}`
                      : 'Never logged in'}
                  </p>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <p className="text-sm text-slate-500">No users found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
