'use client'

import { useState, useEffect } from 'react'
import { PromptCard } from './prompt-card'
import { Prompt } from '@/lib/types/database'
import { Card, CardContent } from '@/components/ui/card'

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
        <CardContent className="py-10 text-center text-muted-foreground">
          No prompts found. Create your first prompt to get started.
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

