'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Button } from '@/components/ui/button-v2'
import { Badge } from '@/components/ui/badge-v2'
import {
  Sparkles,
  FileText,
  Search,
  Layout,
  Settings,
  Book,
  Plus,
  TrendingUp,
  Clock,
  Star,
  ArrowRight,
  ExternalLink,
  Zap,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface DashboardStats {
  totalPrompts: number
  promptsThisMonth: number
  mostUsedPrompt: { id: string; title: string; usage_count: number } | null
  usageStats: {
    promptsCreated: number
    promptsExecuted: number
    apiCalls: number
  }
  subscription: {
    planName: string
    status: string
    trialEnd: string | null
  }
}

interface Activity {
  id: string
  title: string
  type: 'created' | 'updated' | 'used'
  timestamp: string
  usageCount: number
}

interface NewsItem {
  id: string
  title: string
  excerpt: string | null
  category: 'technology' | 'technique' | 'template' | 'update' | 'best_practice'
  image_url: string | null
  link_url: string | null
  published_at: string
  featured: boolean
  tags: string[] | null
}

interface Prompt {
  id: string
  title: string
  usage_count: number
  updated_at: string
}

interface Template {
  id: string
  title: string
  description: string | null
  use_case: string | null
  framework: string | null
  tags: string[] | null
  usage_count: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [mostUsed, setMostUsed] = useState<Prompt[]>([])
  const [news, setNews] = useState<NewsItem[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)

        // Fetch all dashboard data in parallel
        const [statsRes, activityRes, mostUsedRes, newsRes, templatesRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/recent-activity'),
          fetch('/api/dashboard/most-used'),
          fetch('/api/dashboard/news?limit=5'),
          fetch('/api/dashboard/suggested-templates'),
        ])

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }

        if (activityRes.ok) {
          const activityData = await activityRes.json()
          setActivities(activityData.activities || [])
        }

        if (mostUsedRes.ok) {
          const mostUsedData = await mostUsedRes.json()
          setMostUsed(mostUsedData.prompts || [])
        }

        if (newsRes.ok) {
          const newsData = await newsRes.json()
          setNews(newsData.news || [])
        }

        if (templatesRes.ok) {
          const templatesData = await templatesRes.json()
          setTemplates(templatesData.templates || [])
        }

        // Get user name from auth
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.user_metadata?.full_name || user?.email) {
          setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'User')
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      technology: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      technique: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      template: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      update: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      best_practice: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    }
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      technology: 'Technology',
      technique: 'Technique',
      template: 'Template',
      update: 'Update',
      best_practice: 'Best Practice',
    }
    return labels[category] || category
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const isNewUser = (stats?.totalPrompts || 0) < 3

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            {userName ? `Welcome back, ${userName}!` : 'Welcome back!'}
          </h1>
          <p className="text-muted-foreground mt-2">Here's what's happening with your prompts</p>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Prompts</p>
                    <p className="text-2xl font-bold mt-1">{stats.totalPrompts}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">This Month</p>
                    <p className="text-2xl font-bold mt-1">{stats.promptsThisMonth}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Most Used</p>
                    <p className="text-sm font-semibold mt-1 truncate max-w-[120px]">
                      {stats.mostUsedPrompt?.title || 'None'}
                    </p>
                    {stats.mostUsedPrompt && (
                      <p className="text-xs text-muted-foreground">
                        {stats.mostUsedPrompt.usage_count} uses
                      </p>
                    )}
                  </div>
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Plan</p>
                    <p className="text-sm font-semibold mt-1">{stats.subscription?.planName || 'Free'}</p>
                    {stats.subscription?.trialEnd && (
                      <p className="text-xs text-muted-foreground">Trial active</p>
                    )}
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Primary Actions */}
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/prompts/new">
              <Plus className="mr-2 h-5 w-5" />
              Create New Prompt
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/builder">
              <Sparkles className="mr-2 h-5 w-5" />
              Open Prompt Builder
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/prompts?template=true">
              <Layout className="mr-2 h-5 w-5" />
              Browse Templates
            </Link>
          </Button>
        </div>
      </div>

      {/* Getting Started Section (New Users) */}
      {isNewUser && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Welcome to QuiverCore!
            </CardTitle>
            <CardDescription>Get started in 3 simple steps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold">Choose Your Domain</h4>
                  <p className="text-sm text-muted-foreground">
                    Select from Marketing, Technical Writing, Creative Content, and more.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold">Pick a Framework</h4>
                  <p className="text-sm text-muted-foreground">
                    Role-Based, Chain-of-Thought, Few-Shot, and 7 other proven frameworks.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold">Apply Enhancements</h4>
                  <p className="text-sm text-muted-foreground">
                    Use Verbalized Sampling and advanced enhancements for creative outputs.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button asChild>
                  <Link href="/builder">Create Your First Prompt</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/prompts?template=true">Browse Templates</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest prompt activity</CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {activity.type === 'created' ? (
                          <Plus className="h-4 w-4 text-green-600" />
                        ) : activity.type === 'used' ? (
                          <Zap className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-orange-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.type === 'created'
                            ? 'Created'
                            : activity.type === 'used'
                              ? 'Used'
                              : 'Updated'}{' '}
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/prompts/${activity.id}`}>View</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activity. Create your first prompt to get started!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Most Used Prompts */}
        <Card>
          <CardHeader>
            <CardTitle>Most Used Prompts</CardTitle>
            <CardDescription>Your frequently used prompts</CardDescription>
          </CardHeader>
          <CardContent>
            {mostUsed.length > 0 ? (
              <div className="space-y-3">
                {mostUsed.map((prompt) => (
                  <div
                    key={prompt.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Star className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{prompt.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {prompt.usage_count} {prompt.usage_count === 1 ? 'use' : 'uses'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/prompts/${prompt.id}/use`}>Use</Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/prompts/${prompt.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No prompts used yet. Start using prompts to see them here!
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* News & Updates */}
      {news.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>News & Updates</CardTitle>
                <CardDescription>Latest technologies, techniques, and templates</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/news">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {news.map((item) => (
                <Card
                  key={item.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    if (item.link_url) {
                      if (item.link_url.startsWith('http')) {
                        window.open(item.link_url, '_blank')
                      } else {
                        router.push(item.link_url)
                      }
                    }
                  }}
                >
                  {item.image_url && (
                    <div className="aspect-video w-full bg-muted rounded-t-lg overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getCategoryColor(item.category)}>
                        {getCategoryLabel(item.category)}
                      </Badge>
                      {item.featured && (
                        <Badge variant="outline" className="text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-semibold mb-2 line-clamp-2">{item.title}</h4>
                    {item.excerpt && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {item.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}
                      </span>
                      {item.link_url && (
                        <span className="flex items-center gap-1">
                          Read more <ExternalLink className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
          <CardDescription>Fast navigation to key features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Button asChild variant="outline" className="h-auto flex-col py-6">
              <Link href="/builder">
                <Sparkles className="h-6 w-6 mb-2" />
                <span className="text-sm">Builder</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col py-6">
              <Link href="/prompts">
                <FileText className="h-6 w-6 mb-2" />
                <span className="text-sm">Library</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col py-6">
              <Link href="/search">
                <Search className="h-6 w-6 mb-2" />
                <span className="text-sm">Search</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col py-6">
              <Link href="/prompts?template=true">
                <Layout className="h-6 w-6 mb-2" />
                <span className="text-sm">Templates</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col py-6">
              <Link href="/settings">
                <Settings className="h-6 w-6 mb-2" />
                <span className="text-sm">Settings</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col py-6">
              <Link href="/docs" target="_blank">
                <Book className="h-6 w-6 mb-2" />
                <span className="text-sm">Docs</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Suggested Templates */}
      {templates.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Suggested Templates</CardTitle>
                <CardDescription>Popular templates to get you started</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/prompts?template=true">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/prompts/${template.id}`)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold line-clamp-2 flex-1">{template.title}</h4>
                      {template.usage_count > 0 && (
                        <Badge variant="outline" className="ml-2 flex-shrink-0">
                          {template.usage_count} uses
                        </Badge>
                      )}
                    </div>
                    {template.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {template.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      {template.use_case && (
                        <Badge variant="secondary" className="text-xs">
                          {template.use_case}
                        </Badge>
                      )}
                      {template.framework && (
                        <Badge variant="secondary" className="text-xs">
                          {template.framework}
                        </Badge>
                      )}
                    </div>
                    <Button asChild variant="ghost" size="sm" className="w-full mt-3">
                      <Link href={`/prompts/${template.id}`}>Use Template</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage This Month</CardTitle>
              <CardDescription>Your activity statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Prompts Created</span>
                    <span className="text-sm font-semibold">{stats.usageStats.promptsCreated}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Prompts Executed</span>
                    <span className="text-sm font-semibold">
                      {stats.usageStats.promptsExecuted}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">API Calls</span>
                    <span className="text-sm font-semibold">{stats.usageStats.apiCalls}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Your current plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Current Plan</p>
                  <p className="text-lg font-semibold">{stats.subscription?.planName || 'Free'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                  <Badge
                    variant={stats.subscription?.status === 'active' ? 'default' : 'secondary'}
                  >
                    {stats.subscription?.status || 'free'}
                  </Badge>
                </div>
                {stats.subscription?.trialEnd && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Trial Ends</p>
                    <p className="text-sm">
                      {formatDistanceToNow(new Date(stats.subscription.trialEnd), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                )}
                <Button asChild variant="outline" className="w-full">
                  <Link href="/settings">Manage Subscription</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

