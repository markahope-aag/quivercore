'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Button } from '@/components/ui/button-v2'
import { Badge } from '@/components/ui/badge-v2'
import { TrendingUp, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface Prompt {
  id: string
  title: string
  usage_count: number
  updated_at: string
  description?: string
  tags?: string[]
}

export function MostUsedPromptsSection() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMostUsed() {
      try {
        const response = await fetch('/api/dashboard/most-used')
        if (!response.ok) throw new Error('Failed to load most used prompts')
        const data = await response.json()
        setPrompts(data.prompts || [])
      } catch (error) {
        console.error('Error loading most used prompts:', error)
      } finally {
        setLoading(false)
      }
    }
    loadMostUsed()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Most Used Prompts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  if (prompts.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-600" />
          Your Most Used Prompts
        </CardTitle>
        <CardDescription>Your frequently used prompts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              className="flex items-start justify-between gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <Link
                  href={`/prompts/${prompt.id}`}
                  className="font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                >
                  {prompt.title}
                </Link>
                {prompt.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {prompt.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {prompt.usage_count} uses
                  </Badge>
                  {prompt.tags && prompt.tags.length > 0 && (
                    <span className="text-xs text-slate-500">
                      {prompt.tags.slice(0, 2).join(', ')}
                    </span>
                  )}
                </div>
              </div>
              <Link href={`/prompts/${prompt.id}/use`}>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Link href="/prompts">
            <Button variant="outline" className="w-full">
              View All Prompts
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

