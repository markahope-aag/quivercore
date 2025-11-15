'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, memo } from 'react'
import { Star, Edit, Trash2, Copy, TestTube } from 'lucide-react'
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
import { sanitizeForDisplay } from '@/lib/utils/sanitize'

interface PromptListItemProps {
  prompt: Prompt
}

export const PromptListItem = memo(function PromptListItem({ prompt }: PromptListItemProps) {
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(prompt.is_favorite)

  const handleToggleFavorite = async () => {
    const newFavorite = !isFavorite
    setIsFavorite(newFavorite)

    try {
      const response = await fetch(`/api/prompts/${prompt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: newFavorite }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(error.error || 'Failed to update favorite')
      }
    } catch (error) {
      setIsFavorite(!newFavorite)
      console.error('Failed to toggle favorite:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this prompt?')) {
      return
    }

    try {
      const response = await fetch(`/api/prompts/${prompt.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(error.error || 'Failed to delete prompt')
      }

      router.refresh()
    } catch (error) {
      console.error('Failed to delete prompt:', error)
      alert('Failed to delete prompt. Please try again.')
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content)
  }

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
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

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <Link href={`/prompts/${prompt.id}`} className="hover:underline">
              <h3 className="font-semibold line-clamp-1">{sanitizeForDisplay(prompt.title)}</h3>
            </Link>
            {prompt.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {sanitizeForDisplay(prompt.description)}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {prompt.use_case && (
                <Badge variant="default" className="text-xs bg-blue-500">
                  {sanitizeForDisplay(prompt.use_case)}
                </Badge>
              )}
              {prompt.framework && (
                <Badge variant="default" className="text-xs bg-purple-500">
                  {sanitizeForDisplay(prompt.framework)}
                </Badge>
              )}
              {prompt.enhancement_technique && (
                <Badge variant="default" className="text-xs bg-green-600">
                  {sanitizeForDisplay(prompt.enhancement_technique)}
                </Badge>
              )}
              {prompt.tags?.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {sanitizeForDisplay(tag)}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="text-right text-sm text-muted-foreground">
          <div>Used {prompt.usage_count} time{prompt.usage_count !== 1 ? 's' : ''}</div>
          <div>{format(new Date(prompt.created_at), 'MMM d, yyyy')}</div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
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
      </div>
    </div>
  )
})

