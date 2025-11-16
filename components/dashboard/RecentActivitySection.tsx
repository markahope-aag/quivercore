'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Button } from '@/components/ui/button-v2'
import { Clock, Plus, Edit, FileText } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface Activity {
  id: string
  title: string
  type: 'created' | 'updated'
  timestamp: string
  metadata?: {
    usage_count?: number
    is_template?: boolean
  }
}

export function RecentActivitySection() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadActivities() {
      try {
        const response = await fetch('/api/dashboard/recent-activity')
        if (!response.ok) throw new Error('Failed to load activities')
        const data = await response.json()
        setActivities(data.activities || [])
      } catch (error) {
        console.error('Error loading activities:', error)
      } finally {
        setLoading(false)
      }
    }
    loadActivities()
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <Plus className="h-4 w-4 text-green-600" />
      case 'updated':
        return <Edit className="h-4 w-4 text-blue-600" />
      default:
        return <FileText className="h-4 w-4 text-slate-600" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
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
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest prompt activity</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p>No recent activity</p>
            <Link href="/prompts/new">
              <Button variant="outline" className="mt-4">
                Create Your First Prompt
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/prompts/${activity.id}`}
                      className="font-medium text-slate-900 dark:text-white hover:underline truncate"
                    >
                      {activity.title}
                    </Link>
                    {activity.metadata?.is_template && (
                      <span className="text-xs text-slate-500">Template</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                    <Clock className="h-3 w-3" />
                    <span>
                      {activity.type === 'created' ? 'Created' : 'Updated'}{' '}
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                    {activity.metadata?.usage_count && activity.metadata.usage_count > 0 && (
                      <>
                        <span>•</span>
                        <span>{activity.metadata.usage_count} uses</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {activities.length > 0 && (
          <div className="mt-4">
            <Link href="/prompts">
              <Button variant="outline" className="w-full">
                View All Prompts
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

