'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PromptCard } from './prompt-card'
import { PromptListItem } from './prompt-list-item'
import { Prompt } from '@/lib/types/database'
import { Card, CardContent } from '@/components/ui/card-v2'
import { Button } from '@/components/ui/button-v2'
import { Plus } from 'lucide-react'

interface PromptListProps {
  initialPrompts: Prompt[]
  viewMode?: 'grid' | 'list'
}

export function PromptList({ initialPrompts, viewMode = 'grid' }: PromptListProps) {
  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts)

  useEffect(() => {
    setPrompts(initialPrompts)
  }, [initialPrompts])

  if (prompts.length === 0) {
    return (
      <Card className="border-2 border-slate-200 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-800">
        <CardContent className="py-16 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <Plus className="w-12 h-12 text-slate-400 dark:text-slate-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">No prompts yet</h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Get started by creating your first prompt. Organize AI prompts, email templates, and code snippets all in one place.
              </p>
            </div>
            <Button asChild variant="default" className="mt-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md hover:from-blue-700 hover:to-blue-600 hover:shadow-lg">
              <Link href="/builder">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Prompt
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-2">
        {prompts.map((prompt) => (
          <PromptListItem key={prompt.id} prompt={prompt} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {prompts.map((prompt) => (
        <PromptCard key={prompt.id} prompt={prompt} />
      ))}
    </div>
  )
}

