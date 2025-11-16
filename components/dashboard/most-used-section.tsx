'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Button } from '@/components/ui/button-v2'
import { TrendingUp, Play } from 'lucide-react'
import Link from 'next/link'

interface Prompt {
  id: string
  title: string
  usage_count: number
  updated_at: string
}

export function MostUsedPromptsSection() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMostUsed() {
      try {
        const response = await fetch('/api/dashboard/most-used')
        if (!response.ok) throw new Error('Failed to fetch most used prompts')
        const data = await response.json()
        setPrompts(data.prompts || [])
      } catch (error) {
        console.error('Error fetching most used prompts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMostUsed()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Most Used Prompts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-500">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Your Most Used Prompts
        </CardTitle>
        <CardDescription>Your frequently used prompts</CardDescription>
      </CardHeader>
      <CardContent>
        {prompts.length === 0 ? (
          <div className="text-sm text-slate-500 text-center py-8">
            No prompts used yet. Start using your prompts to see them here!
          </div>
        ) : (
          <div className="space-y-3">
            {prompts.map((prompt) => (
              <div
                key={prompt.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                      {prompt.usage_count}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 dark:text-slate-50 truncate">
                      {prompt.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                      <Play className="h-3 w-3" />
                      {prompt.usage_count} {prompt.usage_count === 1 ? 'use' : 'uses'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/prompts/${prompt.id}`}>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
                  <Link href={`/prompts/${prompt.id}/use`}>
                    <Button size="sm">Use</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        {prompts.length > 0 && (
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

