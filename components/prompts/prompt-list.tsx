'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PromptCard } from './prompt-card'
import { Prompt } from '@/lib/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface PromptListProps {
  initialPrompts: Prompt[]
}

export function PromptList({ initialPrompts }: PromptListProps) {
  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts)

  useEffect(() => {
    setPrompts(initialPrompts)
  }, [initialPrompts])

  if (prompts.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center">
              <Plus className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">No prompts yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Get started by creating your first prompt. Organize AI prompts, email templates, and code snippets all in one place.
              </p>
            </div>
            <Button asChild className="mt-4">
              <Link href="/prompts/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Prompt
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
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

