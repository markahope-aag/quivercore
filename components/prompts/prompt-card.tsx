'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Star, Edit, Trash2, Copy, TestTube } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Prompt } from '@/lib/types/database'
import { format } from 'date-fns'

interface PromptCardProps {
  prompt: Prompt
}

export function PromptCard({ prompt }: PromptCardProps) {
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(prompt.is_favorite)

  const handleToggleFavorite = async () => {
    const newFavorite = !isFavorite
    setIsFavorite(newFavorite)

    try {
      await fetch(`/api/prompts/${prompt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: newFavorite }),
      })
    } catch (error) {
      setIsFavorite(!newFavorite) // Revert on error
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this prompt?')) {
      return
    }

    try {
      await fetch(`/api/prompts/${prompt.id}`, {
        method: 'DELETE',
      })
      router.refresh()
    } catch (error) {
      console.error('Failed to delete prompt:', error)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content)
  }

  const typeLabels: Record<string, string> = {
    ai_prompt: 'AI Prompt',
    email_template: 'Email Template',
    snippet: 'Snippet',
    other: 'Other',
  }

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-1">
              <Link href={`/prompts/${prompt.id}`} className="hover:underline">
                {prompt.title}
              </Link>
            </CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {prompt.description || 'No description'}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFavorite}
            className="flex-shrink-0"
          >
            <Star
              className={`h-4 w-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{typeLabels[prompt.type] || prompt.type}</Badge>
            {prompt.category && (
              <Badge variant="secondary">{prompt.category}</Badge>
            )}
          </div>
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {prompt.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {prompt.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{prompt.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Used {prompt.usage_count} time{prompt.usage_count !== 1 ? 's' : ''} • {format(new Date(prompt.created_at), 'MMM d, yyyy')}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="flex-1"
        >
          <Link href={`/prompts/${prompt.id}`}>
            View
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              ⋮
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCopy}>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/prompts/${prompt.id}?test=true`}>
                <TestTube className="mr-2 h-4 w-4" />
                Test
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/prompts/${prompt.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  )
}

