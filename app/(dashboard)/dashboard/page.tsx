'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Button } from '@/components/ui/button-v2'
import { Badge } from '@/components/ui/badge-v2'
import {
  FileText,
  Plus,
  Sparkles,
  Search,
  Layout,
  Settings,
  Book,
  TrendingUp,
  Clock,
  Star,
  ExternalLink,
  ArrowRight,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { HeroSection } from '@/components/dashboard/hero-section'
import { RecentActivitySection } from '@/components/dashboard/recent-activity-section'
import { QuickAccessSection } from '@/components/dashboard/quick-access-section'
import { UsageStatsSection } from '@/components/dashboard/usage-stats-section'
import { MostUsedPromptsSection } from '@/components/dashboard/most-used-prompts-section'
import { NewsAndUpdatesSection } from '@/components/dashboard/news-updates-section'
import { GettingStartedSection } from '@/components/dashboard/getting-started-section'
import { SuggestedTemplatesSection } from '@/components/dashboard/suggested-templates-section'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<any>(null)
  const [mostUsed, setMostUsed] = useState<any>(null)
  const [news, setNews] = useState<any>(null)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        
        // Fetch all dashboard data in parallel
        const [statsRes, activityRes, mostUsedRes, newsRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/recent-activity'),
          fetch('/api/dashboard/most-used'),
          fetch('/api/dashboard/news'),
        ])

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }

        if (activityRes.ok) {
          const activityData = await activityRes.json()
          setRecentActivity(activityData)
        }

        if (mostUsedRes.ok) {
          const mostUsedData = await mostUsedRes.json()
          setMostUsed(mostUsedData)
        }

        if (newsRes.ok) {
          const newsData = await newsRes.json()
          setNews(newsData)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const isNewUser = (stats?.totalPrompts || 0) < 3

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <HeroSection stats={stats} />

      {/* Getting Started Section (for new users) */}
      {isNewUser && <GettingStartedSection />}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity */}
          <RecentActivitySection activities={recentActivity?.activities || []} />

          {/* Most Used Prompts */}
          <MostUsedPromptsSection prompts={mostUsed?.prompts || []} />

          {/* News & Updates */}
          <NewsAndUpdatesSection news={news?.news || []} />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Access */}
          <QuickAccessSection />

          {/* Usage Stats */}
          <UsageStatsSection stats={stats} />

          {/* Suggested Templates */}
          <SuggestedTemplatesSection />
        </div>
      </div>
    </div>
  )
}
