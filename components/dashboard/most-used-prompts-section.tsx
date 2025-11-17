'use client'

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
}

interface MostUsedPromptsSectionProps {
  prompts: Prompt[]
}

export function MostUsedPromptsSection({ prompts }: MostUsedPromptsSectionProps) {
  if (prompts.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Most Used Prompts</CardTitle>
            <CardDescription>Your frequently used prompts</CardDescription>
          </div>
          <Link href="/prompts">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              className="flex items-center justify-between gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate max-w-full">
                    {prompt.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {prompt.usage_count} uses
                    </Badge>
                  </div>
                </div>
              </div>
              <Link href={`/prompts/${prompt.id}`}>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


