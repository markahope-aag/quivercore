'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, memo } from 'react'
import { Star, Edit, Trash2, Copy, TestTube } from 'lucide-react'
import { Card } from '@/components/ui/card-v2'
import { Button } from '@/components/ui/button-v2'
import { Badge } from '@/components/ui/badge-v2'
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
    <Card className="flex items-center gap-4 p-4 border-2 border-slate-200 bg-white shadow-sm hover:shadow-md transition-all dark:border-slate-600 dark:bg-slate-800">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggleFavorite}
        className="flex-shrink-0 hover:bg-slate-50 dark:hover:bg-slate-700"
      >
        <Star
          className={`h-4 w-4 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : 'text-slate-400'}`}
        />
      </Button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <Link href={`/prompts/${prompt.id}`} className="hover:underline">
              <h3 className="font-semibold line-clamp-1">{sanitizeForDisplay(prompt.title)}</h3>
            </Link>
            {prompt.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                {sanitizeForDisplay(prompt.description)}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {prompt.use_case && (
                <Badge variant="secondary" className="text-xs border-2 border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  {sanitizeForDisplay(prompt.use_case)}
                </Badge>
              )}
              {prompt.framework && (
                <Badge variant="default" className="text-xs bg-blue-50 text-blue-700 border-2 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30">
                  {sanitizeForDisplay(prompt.framework)}
                </Badge>
              )}
              {prompt.enhancement_technique && (
                <Badge variant="secondary" className="text-xs border-2 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300">
                  {sanitizeForDisplay(prompt.enhancement_technique)}
                </Badge>
              )}
              {prompt.tags?.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs border-2 border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-700">
                  {sanitizeForDisplay(tag)}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="text-right text-sm text-slate-600 dark:text-slate-400">
          <div>Used {prompt.usage_count} time{prompt.usage_count !== 1 ? 's' : ''}</div>
          <div>{format(new Date(prompt.created_at), 'MMM d, yyyy')}</div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="border-2 border-slate-200 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700">
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
    </Card>
  )
})

