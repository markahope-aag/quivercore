'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card-v2'
import { Button } from '@/components/ui/button-v2'
import { Badge } from '@/components/ui/badge-v2'
import { Plus, Sparkles, FileText, TrendingUp, Crown } from 'lucide-react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

interface Stats {
  totalPrompts: number
  promptsThisMonth: number
  mostUsedPrompt: { id: string; title: string; usage_count: number } | null
  subscription: {
    status: string
    subscription_plans: { display_name: string } | null
  } | null
  usageStats: {
    prompt_execution: number
    prompt_created: number
    api_call: number
  }
}

export function HeroSection() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState<string>('')

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch('/api/dashboard/stats')
        if (!response.ok) throw new Error('Failed to load stats')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }

    // Get user name from profile
    async function loadUser() {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) {
          setUserName(user.email.split('@')[0])
        }
      } catch (error) {
        console.error('Error loading user:', error)
      }
    }

    loadStats()
    loadUser()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Welcome back{userName ? `, ${userName}` : ''}! 👋
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Here's what's happening with your prompts today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Prompts</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {stats?.totalPrompts || 0}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">This Month</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {stats?.promptsThisMonth || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Most Used</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1 truncate">
                  {stats?.mostUsedPrompt?.title || 'None yet'}
                </p>
                {stats?.mostUsedPrompt && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {stats.mostUsedPrompt.usage_count} uses
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Plan</p>
                <div className="mt-1">
                  {stats?.subscription ? (
                    <Badge variant="outline" className="text-sm">
                      <Crown className="h-3 w-3 mr-1" />
                      {stats.subscription.subscription_plans?.display_name || 'Active'}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-sm">Free</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Primary Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/prompts/new">
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Create New Asset
          </Button>
        </Link>
        <Link href="/builder">
          <Button size="lg" variant="outline" className="gap-2">
            <Sparkles className="h-5 w-5" />
            Open Builder
          </Button>
        </Link>
        <Link href="/prompts?template=true">
          <Button size="lg" variant="outline" className="gap-2">
            <FileText className="h-5 w-5" />
            Browse Templates
          </Button>
        </Link>
      </div>
    </div>
  )
}

